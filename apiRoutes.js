const express = require("express");
const router = express.Router();
const ruinCodeController = require("./controllers/ruinCodeController");
const debugChallengeController = require("./controllers/debugChallengeController");
const codeReviewController = require("./controllers/codeReviewController");
const travelPlanController = require("./controllers/travelPlanController");
const ecoAccommodationController = require("./controllers/ecoAccommodationController");
const ecoTravelTipsController = require("./controllers/ecoTravelTipsController");

// Apply rate limiting
router.post("/ruin-code", ruinCodeController.ruinCode);
router.get("/debug-challenge/:level", debugChallengeController.getChallenge);
router.post("/review-code", codeReviewController.reviewCode);

// Eco-friendly Travel Planning Routes
router.post("/travel-plan/analyze", travelPlanController.analyzeTravelOptions);

// Eco Accommodation Routes
router.post("/accommodations/eco-friendly", ecoAccommodationController.findEcoAccommodations);

// Eco Travel Tips Routes
router.post("/travel-tips/eco-friendly", ecoTravelTipsController.getEcoTravelTips);

module.exports = router;
