function calculateConsensus(results) {

    let trueCount = results.filter(r => r === true).length;

    return trueCount / results.length;
}

module.exports = calculateConsensus;
