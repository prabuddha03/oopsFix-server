const genAI = require("../config/gemini");
const vm = require("vm");

exports.reviewCode = async (req, res) => {
  try {
    const { code } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Execute the JavaScript code in a sandbox with timeout
    let codeOutput = [];
    let executionError;
    try {
      const sandbox = {
        console: {
          log: (...args) => {
            // Handle multiple arguments and different types
            const output = args
              .map((arg) =>
                typeof arg === "object" ? JSON.stringify(arg) : String(arg)
              )
              .join(" ");
            codeOutput.push(output);
          },
        },
      };

      const script = new vm.Script(code);
      const context = vm.createContext(sandbox);
      script.runInContext(context, { timeout: 5000 });
    } catch (error) {
      executionError = error.message;
    }

    // Store VM execution results
    const vmResults = {
      output: codeOutput.length > 0 ? codeOutput.join("\n") : null,
      error: executionError || null,
      executionTime: null,
    };

    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `Review this JavaScript code:\n${code}\n
            ${
              executionError
                ? `Code execution error: ${executionError}`
                : `Code output: ${
                    codeOutput.length > 0 ? codeOutput.join("\n") : "No output"
                  }`
            }
            
            Create a JSON response with these exact fields:
            {
              "errors": ["List JavaScript-specific errors and bad practices"],
              "suggestions": ["Suggest JavaScript best practices and improvements"],
              "grade": 85,
              "sarcasticComments": "your comments here",
              "timeComplexity": "O(n)",
              "spaceComplexity": "O(1)",
              "executionResult": {
                "output": "actual output or null",
                "error": "error message or null"
              }
            }
            
            Focus on JavaScript-specific:
            - ES6+ features and best practices
            - JavaScript performance considerations
            - JavaScript memory management
            - Common JavaScript pitfalls
            Include time and space complexity analysis.
            If there are nested loops or recursive calls, explain their impact.
            Consider memory usage of data structures and variables.`,
            },
          ],
        },
      ],
    };

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const response = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (!response) {
        throw new Error("Failed to parse AI response");
      }

      // Combine AI response with VM execution results
      const finalResponse = {
        ...response,
        executionResult: response.executionResult, // AI's analysis of execution
        vmResults: vmResults, // Actual VM execution results
      };

      res.json(finalResponse);
    } catch (aiError) {
      // If AI fails, return VM results with error info
      res.status(500).json({
        error: "AI analysis failed",
        details: aiError.message,
        vmResults: vmResults, // Still return VM execution results
      });
    }
  } catch (error) {
    // If everything fails, still try to return VM results
    res.status(500).json({
      error: error.message,
      details: "Failed to review the code",
      vmResults: {
        output: codeOutput.length > 0 ? codeOutput.join("\n") : null,
        error: executionError || null,
        executionTime: null,
      },
    });
  }
};
