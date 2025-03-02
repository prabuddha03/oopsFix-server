const genAI = require('../config/gemini');

const fallbackResponse = {
  buggyCode: `function calculateSum(arr) {
    let sum = 0;
    for(let i = 0; i <= arr.length; i++) {
      sum += arr[i];
    }
    return sum;
  }`,
  unoptimizedCode: `function calculateSum(arr) {
    return arr.toString().split(',').map(Number).reduce((a,b) => a+b);
  }`,
  sarcasticReview: "Ah, efficiency! Who needs it? Your code was too fast anyway. 🐌"
};

exports.ruinCode = async (req, res) => {
  try {
    const { code } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = {
      contents: [{
        parts: [{
          text: `Given this code:\n${code}\n
            Create a short, sarcastic JSON response with:
            {
              "buggyCode": "add subtle bugs that break the code",
              "unoptimizedCode": "make it inefficient but working",
              "sarcasticReview": "brief sarcastic comment under 50 words"
            }`
        }]
      }]
    };

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const response = jsonMatch ? JSON.parse(jsonMatch[0]) : fallbackResponse;
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      details: "Failed to process the code"
    });
  }
};