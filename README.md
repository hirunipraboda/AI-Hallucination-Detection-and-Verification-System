# 🧠 TruthLens – AI Hallucination Detection & Verification System

## 📌 Overview

TruthLens is an AI-powered system designed to detect, analyze, and verify hallucinations in AI-generated responses. It helps users identify unreliable or false information by combining claim extraction, fact verification, source credibility analysis, and confidence scoring.

The system enhances trust in AI by providing transparency, explanations, and user feedback mechanisms.

---

## 🌐 Live Deployment

🚀 **Backend API (Render):**
👉 https://ai-hallucination-detection-and.onrender.com

📱 **Mobile App:**
Built using React Native and connected to the deployed backend.

---

## 🚀 Features

### 🔍 AI Response Analysis

* Extracts key claims from AI-generated text
* Detects suspicious or hallucinated content
* Categorizes claims (factual, statistical, historical, general)

### ✅ Fact Verification Engine

* Verifies claims using external trusted sources
* Outputs:

  * Verified
  * Contradicted
  * Unverifiable

### 🌐 Source Credibility Evaluation

* Evaluates sources based on:

  * Authority
  * Recency
  * Trustworthiness

### 📊 Confidence & Hallucination Scoring

* Generates:

  * Confidence Score
  * Hallucination Risk Score

### 💡 Explanation & Transparency

* Shows why content was flagged
* Highlights risky sentences
* Improves user understanding

### 📝 Feedback System

* Users can rate and report outputs
* Helps improve system performance

---

## 🏗️ System Architecture

* **Frontend:** React Native
* **Backend:** Node.js + Express (Deployed on Render)
* **Database:** MongoDB Atlas
* **APIs:** External verification & AI APIs

---

## 📂 Project Structure

```
TruthLens/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── config/
│   ├── api-integrations/
│   └── database/
│
├── mobile-app/
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── services/
│   │   └── utils/
│   └── assets/
│
├── docs/
├── ui-design/
└── README.md
```

---

## ⚙️ Setup Instructions

### 🔧 Backend (Local Development)

```bash
cd backend
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run:

```bash
npm start
```

---

### 🌍 Using Deployed Backend (Render)

No need to run backend locally.
Just use:

```
https://ai-hallucination-detection-and.onrender.com
```

👉 Example:

```
GET /api/analyses
```

---

### 📱 Frontend (React Native)

```bash
cd mobile-app
npm install
npx expo start
```

⚠️ Make sure API base URL is set to your Render URL in your frontend config.

---

## 🔗 API Endpoints

### Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`

### Analysis

* `POST /api/analyses`
* `GET /api/analyses`
* `GET /api/analyses/:id`
* `PUT /api/analyses/:id`
* `DELETE /api/analyses/:id`

---

## 🧪 Testing

Use **Postman**:

* Base URL:

  ```
  https://ai-hallucination-detection-and.onrender.com
  ```
* Add JWT token for protected routes
* Test all CRUD operations

---

## 📊 Workflow

1. User submits AI-generated text
2. System extracts claims
3. Claims are verified
4. Source credibility is evaluated
5. Scores are generated
6. Explanation is displayed

---

## 🎯 Objectives

* Detect AI hallucinations
* Improve AI trustworthiness
* Provide explainable AI outputs
* Enable user feedback

---

## 🛠️ Technologies Used

* Node.js
* Express.js
* MongoDB Atlas
* React Native
* REST APIs
* NLP Techniques

---

## 👥 Contributors

* Gunarathna A.A.S.R
* Thevinya H.S.Y
* Jayasinghe J.A.D.T.N
* Bandara B.W.V.C.V
* Udumulla H.P
* Luke L.S

---

## ⭐ Future Improvements

* Real-time verification
* More trusted data sources
* Advanced AI models
* Web dashboard

---

## 📜 License

This project is for academic purposes.


