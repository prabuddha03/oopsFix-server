const genAI = require("../config/gemini");

exports.findEcoAccommodations = async (req, res) => {
  try {
    const { destination, budgetTier, duration } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `Find eco-friendly accommodations in ${destination} for a ${budgetTier} budget tier and ${duration} stay duration.
              
              Create a detailed JSON response with these exact fields:
              {
                "accommodations": [
                  {
                    "name": "accommodation name",
                    "type": "hotel/hostel/guesthouse/etc",
                    "priceRange": "cost per night range",
                    "location": "area within destination",
                    "ecoCredentials": {
                      "certifications": ["eco certifications held"],
                      "rating": "sustainability rating 1-10",
                      "greenPractices": [
                        "specific environmental initiatives"
                      ]
                    },
                    "sustainableFeatures": {
                      "energy": ["energy-saving features"],
                      "water": ["water conservation methods"],
                      "waste": ["waste management practices"],
                      "food": ["sustainable food practices"]
                    },
                    "localImpact": {
                      "communityInitiatives": ["community support programs"],
                      "localEmployment": "percentage of local staff",
                      "culturalPreservation": ["cultural preservation efforts"]
                    },
                    "amenities": ["eco-friendly amenities available"],
                    "nearbyGreenAttractions": ["sustainable attractions nearby"]
                  }
                ],
                "destinationInfo": {
                  "sustainabilityScore": "area sustainability rating 1-10",
                  "ecoDistricts": ["environmentally conscious areas"],
                  "greenTransportAccess": ["nearby sustainable transport options"]
                },
                "seasonalConsiderations": {
                  "bestTime": "optimal booking period",
                  "energyEfficiency": "seasonal energy usage patterns",
                  "localEvents": ["relevant eco-events during stay"]
                }
              }

              Focus on:
              1. Verified eco-certifications
              2. Concrete sustainability practices
              3. Local community impact
              4. Budget-appropriate options
              5. Location-specific green initiatives
              Provide current and accurate information.`,
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
      query: { destination, budgetTier, duration },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to find eco-friendly accommodations",
      details: error.message,
      query: { destination, budgetTier, duration },
    });
  }
};
