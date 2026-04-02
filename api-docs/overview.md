# TruthLens API Overview

## 🔍 System Description
**TruthLens** is an AI Hallucination Detection System designed to analyze AI-generated text, extract verifiable claims, and identify potential hallucinations, contradictions, or unsupported statements.

## ⚙️ Purpose of Backend APIs
The Node.js backend serves as the core processing engine and data persistence layer. It provides endpoints for:
1. Receiving text from the mobile application.
2. Processing the text through the hallucination detection engine.
3. Storing the analysis results, confidence scores, and flagged sentences in the database.
4. Serving historical analysis records back to the user interface.

## 🛠️ Technologies Used
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (via Mongoose)
- **Architecture:** RESTful API

## 🌐 Base URL Format
Depending on the deployment environment, the API is accessed via:

- **Local Network (LAN):** `http://<LAPTOP_IP>:5000/api` (e.g., `http://192.168.8.105:5000/api`)
- **Public Tunnel (Hotspot):** `https://<tunnel-id>.loca.lt/api`
- **Emulator:** `http://10.0.2.2:5000/api`

## 🔗 Frontend to Backend Connection
The React Native (Expo) frontend connects to the backend using the **Axios** HTTP client. 
A centralized service (`analysisService.js`) manages the base URL configuration. Before dispatching heavy analysis workloads, the frontend performs a pre-flight health check (`GET /api/health`) to ensure the backend is reachable over the active network interface.
