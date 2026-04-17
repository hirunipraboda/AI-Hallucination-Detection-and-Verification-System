function normalizeClaim(claim) {

    return claim
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .trim();
}

module.exports = normalizeClaim;
