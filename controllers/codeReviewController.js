const genAI = require("../config/gemini");
const vm = require("vm");

exports.reviewCode = async (req, res) => {
  try {
    const { code } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Execute the code in a sandbox with timeout
    let codeOutput;
    let executionError;
    try {
      const sandbox = {
        console: {
          log: (output) => {
            codeOutput = output;
          },
        },
      };
      const script = new vm.Script(code);
      const context = vm.createContext(sandbox);
      script.runInContext(context, { timeout: 5000 }); // 5 second timeout
    } catch (error) {
      executionError = error.message;
    }

    // Store VM execution results
    const vmResults = {
      output: codeOutput || null,
      error: executionError || null,
      executionTime: null, // Can add execution time if needed
    };

    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `Review this code:\n${code}\n
            ${
              executionError
                ? `Code execution error: ${executionError}`
                : `Code output: ${codeOutput}`
            }
            
            Create a JSON response with these exact fields:
            {
              "errors": ["error1", "error2"],
              "suggestions": ["suggestion1", "suggestion2"],
              "grade": 85,
              "sarcasticComments": "your comments here",
              "timeComplexity": "O(n)",
              "spaceComplexity": "O(1)",
              "executionResult": {
                "output": "actual output or null",
                "error": "error message or null"
              }
            }
            
            Include detailed time and space complexity analysis.
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
        output: codeOutput || null,
        error: executionError || null,
        executionTime: null,
      },
    });
  }
};
