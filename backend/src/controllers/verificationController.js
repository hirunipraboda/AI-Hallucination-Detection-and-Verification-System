const crypto = require('crypto');
const verifyClaim = require("../services/verificationService");
const repo = require("../repositories/verificationRepository");

exports.createVerification = async (req, res) => {

    const { claim } = req.body;
    const responseId = crypto.randomUUID();

    const result = await verifyClaim(claim);

    const saved = await repo.createVerification({
        responseId,
        ...result
    });

    res.json(saved);
};

exports.getVerifications = async (req, res) => {

    const data = await repo.getAllVerifications();
    res.json(data);
};

exports.getLikelyTrueVerifications = async (req, res) => {

    const data = await repo.getLikelyTrueVerifications();
    res.json(data);
};

exports.getLikelyFalseVerifications = async (req, res) => {

    const data = await repo.getLikelyFalseVerifications();
    res.json(data);
};

exports.refreshVerification = async (req, res) => {

    const { id } = req.params;
    const { claim } = req.body;

    const newResult = await verifyClaim(claim);

    await repo.updateVerification(id, newResult);

    res.json({ message: "Verification refreshed" });
};

exports.deleteVerification = async (req, res) => {
    try {
        const { id } = req.params;
        await repo.deleteVerification(id);
        res.json({ message: "Deleted" });
    } catch (error) {
        console.error("Error in deleteVerification:", error);
        res.status(500).json({ error: "Failed to delete verification" });
    }
};

exports.searchVerification = async (req, res) => {

    const data = await repo.searchVerification(req.query);
    res.json(data);
};
