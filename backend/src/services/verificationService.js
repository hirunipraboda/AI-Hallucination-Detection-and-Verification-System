const normalizeClaim = require("./normalizationService");
const { checkFactCheckAPI } = require("../utils/knowledgeApiService");


async function verifyClaim(claim) {
    const normalized = normalizeClaim(claim);
    const allReviews = await checkFactCheckAPI(normalized);

    let outcome = "Unverifiable";
    let url = null;
    let detected_Issues = [];

    if (allReviews && allReviews.length > 0) {
        url = allReviews[0].url || null;
        let trueCount = 0;
        let falseCount = 0;

        for (const review of allReviews) {
            let rating = review.textualRating || "";
            let lowerRating = rating.toLowerCase();

            if (lowerRating.includes("true") || lowerRating.includes("correct") || lowerRating.includes("accurate") || lowerRating.includes("adevarat") || lowerRating.includes("verno")) {
                trueCount++;
            } else if (lowerRating.includes("false") || lowerRating.includes("fals") || lowerRating.includes("incorrect") || lowerRating.includes("inaccurate") || lowerRating.includes("fake")) {
                falseCount++;
                if (detected_Issues.length < 5) detected_Issues.push(`Fact Check API Rating: ${rating}`);
            } else {
                // Typical debunks that don't explicitly use "false" 
                falseCount++;
                if (detected_Issues.length < 5) detected_Issues.push(`Fact Check API Summary: ${rating}`);
            }
        }

        if (trueCount > falseCount) {
            outcome = "Likely True";
        } else if (falseCount > trueCount) {
            outcome = "Likely False";
        } else {
            // Assume false if mixed/ambiguous but heavily fact-checked
            outcome = falseCount > 0 ? "Likely False" : "Unverifiable";
        }
    }

    return {
        claim: claim,
        verificationOutcome: outcome,
        detected_Issues: detected_Issues,
        factCheckUrl: url,
        checkedAt: new Date()
    };
}

module.exports = verifyClaim;
