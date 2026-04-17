const axios = require("axios");

async function checkWikipedia(claim) {
    try {
        const response = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(claim)}`
        );
        return response.data.extract;
    } catch (error) {
        return null;
    }
}

async function checkNews(claim) {
    try {
        const res = await axios.get(
            `https://newsapi.org/v2/everything?q=${encodeURIComponent(claim)}&apiKey=${process.env.NEWS_API_KEY}`
        );
        return res.data.articles.length > 0;
    } catch (e) {
        return false;
    }
}

async function checkFactCheckAPI(claim) {
    try {
        const res = await axios.get(
            `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(claim)}&key=${process.env.FACT_CHECK_API_KEY}`
        );
        let allReviews = [];
        if (res.data.claims && res.data.claims.length > 0) {
            for (const c of res.data.claims) {
                if (c.claimReview && c.claimReview.length > 0) {
                    allReviews.push(...c.claimReview);
                }
            }
        }
        return allReviews;
    } catch (e) {
        return [];
    }
}

module.exports = {
    checkWikipedia,
    checkNews,
    checkFactCheckAPI
};
