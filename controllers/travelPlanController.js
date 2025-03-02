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
              text: `Analyze eco-friendly travel options between ${from} and ${to} with a ${budgetTier} budget tier.
              
              Create a detailed JSON response with these exact fields:
              {
                "routes": [
                  {
                    "type": "transportation type",
                    "details": {
                      "departure": "nearest departure point",
                      "arrival": "nearest arrival point",
                      "estimatedTime": "duration in hours",
                      "estimatedCost": "cost range in currency",
                      "carbonFootprint": "CO2 emissions in kg",
                      "connections": ["any required connections"],
                      "greenInitiatives": ["eco-friendly features of this route"]
                    },
                    "ecoRating": "1-10 scale",
                    "budgetRating": "1-10 scale",
                    "comfortRating": "1-10 scale",
                    "sustainabilityFeatures": ["specific eco-friendly aspects"]
                  }
                ],
                "ecoFriendlyOptions": {
                  "primaryRecommendation": {
                    "route": "most eco-friendly complete route",
                    "reasoning": "explanation of choice"
                  },
                  "alternativeOptions": [
                    {
                      "route": "alternative eco route",
                      "tradeoffs": "comparison with primary option"
                    }
                  ]
                },
                "sustainabilityMetrics": {
                  "carbonSavings": "CO2 saved vs. conventional route",
                  "greenScore": "overall sustainability score",
                  "offsettingOptions": ["carbon offset suggestions"]
                },
                "localGreenTransport": {
                  "origin": ["sustainable last-mile options at start"],
                  "destination": ["sustainable last-mile options at end"]
                },
                "ecoAccommodations": {
                  "suggestions": ["green certified hotels/hostels"],
                  "features": ["sustainability practices"]
                },
                "sustainableTravelTips": {
                  "packing": ["eco-friendly packing suggestions"],
                  "practices": ["sustainable travel behaviors"],
                  "localSupport": ["ways to support local eco-initiatives"]
                },
                "seasonalConsiderations": {
                  "weather": "impact on travel sustainability",
                  "events": ["relevant eco-events/festivals"],
                  "timing": "best time for sustainable travel"
                }
              }

              Consider:
              1. Prioritize routes with lowest environmental impact
              2. Include innovative green transport options (e.g., solar trains, electric buses)
              3. Factor in the complete carbon footprint including last-mile transport
              4. Consider seasonal eco-tourism opportunities
              5. Account for budget tier constraints while maximizing sustainability
              6. Include green accommodations and local sustainable practices
              Provide realistic estimates and current eco-initiatives.`,
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

    res.json({
      success: true,
      data: response,
      query: {
        from,
        to,
        budgetTier,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to analyze eco-friendly travel options",
      details: error.message,
      query: {
        from: req.body.from,
        to: req.body.to,
        budgetTier: req.body.budgetTier,
      },
    });
  }
};
