const genAI = require("../config/gemini");

const fallbackResponse = `function calculateSum(arr) {
  let sum = 0;
  for(let i = 0; i <= arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}`;

exports.ruinCode = async (req, res) => {
  try {
    const { code } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `Given this JavaScript code:\n${code}\n
            Return only the JavaScript code with subtle bugs and inefficiencies.
            Add JavaScript-specific issues like:
            - Off-by-one errors
            - Type coercion bugs
            - Scope issues
            - Memory leaks
            - Callback hell
            - Async handling problems
            
            Return only the code, no explanations or comments.`,
            },
          ],
        },
      ],
    };

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean the response to get only the code
    const cleanedCode = responseText
      .replace(/```javascript|```js|```/g, "")
      .trim();

    res.json({ code: cleanedCode });
  } catch (error) {
    res.json({ code: fallbackResponse });
  }
};
