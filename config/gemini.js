const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI with API key validation
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

module.exports = genAI;
