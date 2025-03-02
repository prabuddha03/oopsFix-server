const genAI = require("../config/gemini");

exports.getEcoTravelTips = async (req, res) => {
  try {
    const { destination, season, travelStyle } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `Provide eco-friendly travel tips for ${destination} during ${season} season for ${travelStyle} style travel.
              
              Create a detailed JSON response with these exact fields:
              {
                "packingGuide": {
                  "essentials": ["sustainable packing items"],
                  "clothing": ["eco-friendly clothing suggestions"],
                  "equipment": ["green travel gear"],
                  "avoidItems": ["items to avoid for sustainability"]
                },
                "transportationTips": {
                  "localTransport": ["sustainable transport options"],
                  "navigationApps": ["eco-friendly navigation tools"],
                  "carbonReduction": ["ways to minimize transport emissions"]
                },
                "accommodationPractices": {
                  "energySaving": ["energy conservation tips"],
                  "waterConservation": ["water saving practices"],
                  "wasteReduction": ["waste minimization strategies"]
                },
                "localEngagement": {
                  "ecoFriendlyActivities": ["sustainable activities"],
                  "communitySupport": ["ways to support local eco-initiatives"],
                  "culturalRespect": ["responsible tourism practices"]
                },
                "seasonalAdvice": {
                  "weatherConsiderations": "climate-specific tips",
                  "localProducts": ["seasonal eco-friendly products"],
                  "events": ["sustainable events during visit"]
                },
                "foodAndDining": {
                  "sustainableOptions": ["eco-friendly dining choices"],
                  "localProduce": ["seasonal local food options"],
                  "wasteReduction": ["food waste prevention tips"]
                },
                "emergencyPreparedness": {
                  "sustainableAlternatives": ["eco-friendly emergency items"],
                  "localResources": ["green emergency services"]
                },
                "digitalTools": {
                  "apps": ["useful eco-travel applications"],
                  "resources": ["sustainable travel websites/guides"]
                }
              }

              Focus on:
              1. Practical and actionable tips
              2. Season-specific advice
              3. Local environmental considerations
              4. Cultural sensitivity
              5. Budget-conscious options
              Provide current and relevant information.`,
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
      query: { destination, season, travelStyle },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get eco-friendly travel tips",
      details: error.message,
      query: { destination, season, travelStyle },
    });
  }
};
