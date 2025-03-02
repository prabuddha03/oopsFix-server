const express = require("express");
const router = express.Router();
const ruinCodeController = require("./controllers/ruinCodeController");
const debugChallengeController = require("./controllers/debugChallengeController");
const codeReviewController = require("./controllers/codeReviewController");

router.post("/ruin-code", ruinCodeController.ruinCode);
router.get("/debug-challenge/:level", debugChallengeController.getChallenge);
router.post("/review-code", codeReviewController.reviewCode);

module.exports = router;
