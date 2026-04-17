const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function verifyWithOpenAI(claim) {
    try {
        const systemPrompt = `You are a strict and objective fact-checker assistant. 
Your task is to verify a given claim based on your own knowledge.
You must classify the claim as exactly one of: "Likely True", "Likely False", or "Unverifiable".
Return your answer strictly as a JSON object with the following schema:
{
  "outcome": "Likely True" | "Likely False" | "Unverifiable",
  "reasoning": "A concise explanation of maximum 3 sentences explaining why."
}`;

        const chatResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Claim: ${claim}` }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1
        });

        const resultJson = JSON.parse(chatResponse.choices[0].message.content);

        return {
            outcome: resultJson.outcome,
            reasoning: resultJson.reasoning
        };

    } catch (error) {
        console.error("OpenAI Error:", error);
        return {
            outcome: "Unverifiable",
            reasoning: "An error occurred while verifying with OpenAI."
        };
    }
}

module.exports = {
    verifyWithOpenAI
};
