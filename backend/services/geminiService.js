const { GoogleGenAI } = require('@google/genai');

/**
 * Service to interact with Gemini API to analyze PDF text
 */
exports.analyzeText = async (text) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured in the environment');
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const prompt = `
    Analyze the following text from a document. 
    1. Extract up to 5 key claims or factual statements made in the text.
    2. For each claim, evaluate if it seems accurate, disputed, or contradictory based on general knowledge. Create mock verification sources.
    3. Generate an overall confidence score (0-100) and hallucination risk level (Low, Medium, High).
    
    Format your response EXACTLY as a valid JSON object matching this structure:
    {
      "claims": [
        { "_id": "generated-id", "claimText": "exact sentence from text", "startIndex": 0, "endIndex": 10 }
      ],
      "verificationResults": [
        { 
          "claimId": "associated-id", 
          "status": "verified|disputed|contradicted", 
          "summary": "short explanation", 
          "sources": [{ "name": "source name", "credibility": 80, "url": "http...", "evidence": "supporting text from source" }] 
        }
      ],
      "scores": {
        "confidence": 85,
        "risk": "Low|Medium|High",
        "factors": {
          "verificationRate": 80,
          "sourceCredibility": 75,
          "sourceConsensus": 90,
          "claimSpecificity": 70
        }
      }
    }
    
    TEXT TO ANALYZE:
    ${text.substring(0, 15000)} // Limit to reasonable length
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const responseText = response.text;

        // Extract JSON from potential markdown blocks ```json ... ```
        let jsonStr = responseText;
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        } else {
            // Try just ```
            const match = responseText.match(/```\n([\s\S]*?)\n```/);
            if (match) jsonStr = match[1];
        }

        return JSON.parse(jsonStr.trim());
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error('Failed to analyze text using AI');
    }
};
