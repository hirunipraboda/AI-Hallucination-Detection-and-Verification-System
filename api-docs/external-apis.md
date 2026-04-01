# External APIs

This document outlines the external APIs integrated (or planned for integration) within the TruthLens ecosystem to enhance its hallucination detection capabilities.

*(Note: Currently, TruthLens utilizes a fast, internal rule-based heuristic engine (`analysisController.js`) to provide immediate, offline-capable analysis. The external APIs listed below represent the advanced NLP implementation phase).*

---

## 1. OpenAI API (GPT-4)
* **Status:** Integration Phase
* **Purpose:** Perform deep semantic analysis, intent recognition, and contextual hallucination detection on complex AI-generated text.
* **Usage in System:** When the internal rule-based engine flags a sentence with low confidence, the text payload is forwarded to OpenAI to classify the specific type of hallucination (e.g., factual drift, logical contradiction).
* **Example Request:**
  ```json
  POST https://api.openai.com/v1/chat/completions
  {
    "model": "gpt-4",
    "messages": [
      {
         "role": "system", 
         "content": "You are a hallucination detection API. Extract factual claims and confidence scores from the following text."
      },
      {
         "role": "user", 
         "content": "Python was created by Guido van Rossum."
      }
    ]
  }
  ```
* **Example Response:**
  ```json
  {
    "choices": [
      {
        "message": {
          "content": "{\"claims\": [{\"text\": \"Python was created by Guido van Rossum\", \"confidence\": 0.99, \"isFact\": true}]}"
        }
      }
    ]
  }
  ```

---

## 2. Google Fact Check Tools API
* **Status:** Planned
* **Purpose:** Cross-reference extracted numerical and historical claims against a database of verified internet sources.
* **Usage in System:** If the OpenAI API or internal engine extracts a specific "statistical" or "historical" claim, this API is queried to find matching articles that prove or debunk the statement.
* **Example Request:**
  ```text
  GET https://factchecktools.googleapis.com/v1alpha1/claims:search?query=Guido+van+Rossum+Python&key=YOUR_API_KEY
  ```
* **Example Response:**
  ```json
  {
    "claims": [
      {
        "text": "Guido van Rossum created Python.",
        "claimReview": [
          {
            "publisher": { "name": "Wikipedia" },
            "textualRating": "True"
          }
        ]
      }
    ]
  }
  ```
