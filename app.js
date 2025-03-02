const express = require("express");
const cors = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();

require("dotenv").config();
// Enable CORS
app.use(cors());
app.use(express.json());

// Initialize Gemini AI with API key validation
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ... existing code ...

// 1. Endpoint to deliberately "ruin" good code
app.post("/api/ruin-code", async (req, res) => {
  try {
    const { code } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `Given this code:\n${code}\n
            Create a JSON response with these exact fields:
            {
              "buggyCode": "your buggy version here",
              "unoptimizedCode": "your unoptimized version here",
              "optimizedCode": "your optimized version here",
              "sarcasticReview": "your review here"
            }`,
            },
          ],
        },
      ],
    };

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const response = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!response) {
      throw new Error("Failed to parse AI response");
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: "Failed to process the code",
    });
  }
});

// 2. Generate practice debugging challenges
app.get("/api/debug-challenge/:level", async (req, res) => {
  try {
    const { level } = req.params;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `Generate a ${level} level programming challenge.
            Create a JSON response with these exact fields:
            {
              "code": "your challenge code here",
              "bugs": ["bug1", "bug2"],
              "optimizationHints": ["hint1", "hint2"]
            }`,
            },
          ],
        },
      ],
    };

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const response = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!response) {
      throw new Error("Failed to parse AI response");
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: "Failed to generate challenge",
    });
  }
});

// 3. Code review and grading endpoint
app.post("/api/review-code", async (req, res) => {
  try {
    const { code } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `Review this code:\n${code}\n
            Create a JSON response with these exact fields:
            {
              "errors": ["error1", "error2"],
              "suggestions": ["suggestion1", "suggestion2"],
              "grade": 85,
              "sarcasticComments": "your comments here"
            }`,
            },
          ],
        },
      ],
    };

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const response = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!response) {
      throw new Error("Failed to parse AI response");
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: "Failed to review the code",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
