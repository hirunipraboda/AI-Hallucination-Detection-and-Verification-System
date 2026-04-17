const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

async function createVerification(data) {

    const db = getDB();

    return await db
        .collection("verification_results")
        .insertOne(data);
}

async function getAllVerifications() {

    const db = getDB();

    return await db
        .collection("verification_results")
        .find()
        .toArray();
}

async function getLikelyTrueVerifications() {

    const db = getDB();

    return await db
        .collection("verification_results")
        .find({ verificationOutcome: "Likely True" })
        .toArray();
}

async function getLikelyFalseVerifications() {

    const db = getDB();

    return await db
        .collection("verification_results")
        .find({ verificationOutcome: "Likely False" })
        .toArray();
}

async function deleteVerification(id) {

    const db = getDB();

    return await db
        .collection("verification_results")
        .deleteOne({ _id: new ObjectId(id) });
}

async function updateVerification(id, data) {

    const db = getDB();

    return await db
        .collection("verification_results")
        .updateOne(
            { _id: new ObjectId(id) },
            { $set: data }
        );
}

async function searchVerification(query) {

    const db = getDB();

    let filter = {};

    if (query.text) {
        filter.claim = { $regex: query.text, $options: "i" };
    }

    if (query.outcome) {
        filter.verificationOutcome = query.outcome;
    }

    if (query.date) {
        filter.checkedAt = {
            $gte: new Date(query.date)
        };
    }

    return await db
        .collection("verification_results")
        .find(filter)
        .toArray();
}

module.exports = {
    createVerification,
    getAllVerifications,
    getLikelyTrueVerifications,
    getLikelyFalseVerifications,
    deleteVerification,
    updateVerification,
    searchVerification
};
