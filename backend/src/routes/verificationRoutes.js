const router = require("express").Router();
const controller = require("../controllers/verificationController");

router.post("/", controller.createVerification);
router.get("/search", controller.searchVerification);
router.get("/likely-true", controller.getLikelyTrueVerifications);
router.get("/likely-false", controller.getLikelyFalseVerifications);
router.get("/", controller.getVerifications);
router.put("/:id", controller.refreshVerification);
router.delete("/:id", controller.deleteVerification);

module.exports = router;
