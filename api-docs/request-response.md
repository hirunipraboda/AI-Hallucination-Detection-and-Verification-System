# Request & Response Flow

This document details the end-to-end data lifecycle from the moment a user submits text in the TruthLens mobile application until the final report is displayed.

---

## 📍 Standard Execution Flow

1. **User Input:**
   - The user pastes an AI-generated response into the TruthLens mobile app and taps "Analyze".

2. **Pre-Flight Health Check:**
   - The frontend `analysisService.js` makes a silent `GET /api/health` request to the backend using Axios.
   - This ensures the device is on the correct Wi-Fi network or stable tunnel before sending the large payload.

3. **API Dispatch:**
   - If healthy, the frontend sends a `POST /api/analyses` request containing the `{ originalText }` payload.

4. **Backend Processing (Controller Level):**
   - The Express route forwards the payload to `createAnalysis()`.
   - The internal rule-based engine executes `splitIntoSentences()`, `extractClaimsStructured()`, and `detectIssuesEnhanced()`.
   - A final confidence score is generated based on uncertainty penalties and missing citations.

5. **Database Persistence:**
   - The processed data (claims, flagged sentences, calculated score) is saved to the **MongoDB Atlas** database via Mongoose.

6. **Response to Client:**
   - The backend returns a `201 Created` status along with the fully populated Analysis object.
   - The frontend parses the object, updates the global state, and navigates the user to the `ReportDetailScreen`.

---

## ⚠️ Error Handling & Fallback Flow

To ensure the mobile app never gracefully crashes, TruthLens implements a robust error handling flowchart:

1. **Network Failure / 503 Tunnel Unavailable:**
   - If the pre-flight health check fails or the backend connection drops, the Axios client throws a structured exception.
   - **Frontend Capture:** The `catch` block identifies the `Network Error` or `503` status.
   - **Action:** Instead of proceeding silently, it throws an explicit Error indicating the exact IP/Tunnel that failed.
   - **User Impact:** An Alert pops up notifying the user: "Cannot connect to 192.168.8.105. Check your Wi-Fi/Hotspot."
   
2. **Offline Preview Mode (Fallback):**
   - If the user explicitly accepts they are offline, the app switches to **Preview Mode**.
   - Analysis is conducted using lightweight frontend utility functions (acting as a basic mock of the backend engine).
   - The results are displayed instantly but **are not saved** to history.

3. **Backend Validation Errors:**
   - If the backend detects an empty payload (`400 Bad Request`), the API immediately kicks back a `{ success: false, message: "originalText is required" }` object.
   - The frontend highlights the input box in red and halts the submission flow.
