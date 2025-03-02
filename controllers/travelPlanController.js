const genAI = require("../config/gemini");

exports.analyzeTravelOptions = async (req, res) => {
  try {
    const { from, to, budgetTier } = req.body;

    // Validate inputs
    if (!from || !to || !budgetTier) {
      throw new Error(
        "Missing required fields: from, to, and budgetTier are required"
      );
    }

    // Validate budget tier
    const validBudgetTiers = ["low", "mid", "high"];
    if (!validBudgetTiers.includes(budgetTier.toLowerCase())) {
      throw new Error("Invalid budget tier. Must be 'low', 'mid', or 'high'");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `Analyze travel options from ${from} to ${to} for ${budgetTier} budget. Return only a valid JSON object without any markdown formatting or additional text, following this exact structure:
              {
                "routes": [
                  {
                    "type": "transport mode",
                    "details": {
                      "departure": "nearest station/airport",
                      "arrival": "destination point",
                      "duration": "hours",
                      "cost": "price range",
                      "carbonFootprint": "CO2 in kg"
                    },
                    "ecoRating": "1-10",
                    "budgetRating": "1-10"
                  }
                ],
                "bestOptions": {
                  "mostEcoFriendly": "greenest route",
                  "bestValue": "budget-friendly route",
                  "fastest": "quickest route"
                },
                "localTransport": {
                  "origin": ["green transport at start"],
                  "destination": ["green transport at end"]
                }
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
    const jsonStr = jsonMatch ? jsonMatch[0] : null;

    if (!jsonStr) {
      throw new Error("Failed to extract JSON from response");
    }

    const response = JSON.parse(jsonStr);

    res.json({
      success: true,
      data: response,
      query: { from, to, budgetTier },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to analyze travel options",
      details: error.message,
      query: req.body,
    });
  }
};
