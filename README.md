🧠 TruthLens – AI Hallucination Detection & Verification System

📌 Overview

TruthLens is an AI-powered system designed to detect, analyze, and verify hallucinations in AI-generated responses. It helps users identify unreliable or false information by combining claim extraction, fact verification, source credibility analysis, and confidence scoring.

The system improves trust in AI outputs by providing transparency, explanations, and user feedback mechanisms.


🚀 Features

🔍 1. AI Response Analysis

* Extracts key claims from AI-generated text
* Identifies suspicious or potentially hallucinated content
* Categorizes claims (factual, statistical, historical, general)

✅ 2. Fact Verification Engine

* Cross-checks claims with trusted external sources
* Labels results as:

  * Verified
  * Contradicted
  * Unverifiable

🌐 3. Source Credibility Evaluation

* Evaluates reliability of sources based on:

  * Authority
  * Recency
  * Trustworthiness

📊 4. Confidence & Hallucination Scoring

* Generates:

  * Confidence Score
  * Hallucination Risk Score
* Combines analysis + verification + credibility results

💡 5. Explanation & Transparency Module

* Provides reasons for flagged content
* Highlights problematic sentences
* Improves user trust and understanding

📝 6. Feedback & Learning System

* Users can rate and report results
* Helps improve system accuracy over time

---

🏗️ System Architecture

* **Frontend:** React Native (Mobile App)
* **Backend:** Node.js + Express
* **Database:** MongoDB Atlas
* **APIs Used:** External fact-checking & AI APIs


 📂 Project Structure

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



⚙️ Installation & Setup

🔧 Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the server:

```bash
npm start
```



📱 Frontend Setup (React Native)

```bash
cd mobile-app
npm install
npx expo start
```



🔗 API Endpoints (Sample)

Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`

Analysis

* `POST /api/analyses` → Create analysis
* `GET /api/analyses` → Get all analyses
* `GET /api/analyses/:id` → Get single analysis
* `PUT /api/analyses/:id` → Update
* `DELETE /api/analyses/:id` → Delete



🧪 Testing

Use **Postman** to test APIs:

* Base URL: `http://localhost:5000`
* Add Authorization token for protected routes
* Test CRUD operations on `/api/analyses`



📊 Example Workflow

1. User inputs AI-generated response
2. System extracts claims
3. Claims are verified using external sources
4. Credibility of sources is evaluated
5. Confidence & hallucination scores are generated
6. Explanation is displayed to the user



🎯 Objectives

* Detect hallucinations in AI responses
* Improve trust in AI systems
* Provide transparent explanations
* Enable user-driven feedback and improvement



🛠️ Technologies Used

* Node.js & Express
* MongoDB Atlas
* React Native
* REST APIs
* Natural Language Processing (NLP)



👥 Contributors

* Gunarathna A.A.S.R
* Thevinya H.S.Y
* Jayasinghe J.A.D.T.N
* Bandara B.W.V.C.V
* Udumulla H.P
* Luke L.S




📜 License

This project is developed for academic and research purposes.



⭐ Future Enhancements

* Real-time verification
* Integration with more trusted data sources
* Advanced AI-based claim classification
* Web dashboard for analytics


