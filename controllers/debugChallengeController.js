const genAI = require("../config/gemini");

exports.getChallenge = async (req, res) => {
  try {
    const { level } = req.params;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `Generate a ${level} level JavaScript programming challenge.
            Create a JSON response with these exact fields:
            {
              "code": "JavaScript code with common bugs or issues",
              "bugs": ["List JavaScript-specific bugs and issues"],
              "optimizationHints": ["JavaScript-specific optimization hints"],
              "context": "Brief explanation of the JavaScript concepts involved"
            }
            
            Focus on JavaScript-specific:
            - ES6+ features
            - JavaScript runtime behavior
            - Common JavaScript bugs
            - JavaScript optimization techniques`,
            },
          ],
        },
      ],
    };

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const response = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!response) {
      throw new Error("Failed to parse AI response");
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: "Failed to generate JavaScript challenge",
    });
  }
};
