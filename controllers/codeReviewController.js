const genAI = require('../config/gemini');

exports.reviewCode = async (req, res) => {
  try {
    const { code } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = {
      contents: [{
        parts: [{
          text: `Review this code:\n${code}\n
            Create a JSON response with these exact fields:
            {
              "errors": ["error1", "error2"],
              "suggestions": ["suggestion1", "suggestion2"],
              "grade": 85,
              "sarcasticComments": "your comments here"
            }`
        }]
      }]
    };

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const response = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    
    if (!response) {
      throw new Error('Failed to parse AI response');
    }
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      details: "Failed to review the code"
    });
  }
};