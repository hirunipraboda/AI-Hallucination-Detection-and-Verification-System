# MongoDB Design & Architecture

This document explains the architectural decisions behind utilizing MongoDB for the **AI Response Analysis** module in TruthLens.

---

## 1. Why MongoDB?

MongoDB (NoSQL) was explicitly chosen for this system due to the highly dynamic and unstructured nature of AI-generated text. 

* **Schema Flexibility:** Parsing AI responses yields unpredictable numbers of claims, flagged sentences, and varying reason arrays. A NoSQL document store adapts natively to this fluid data without requiring rigid table migrations.
* **JSON Native:** The entire pipeline—from the React Native frontend, through the Node.js/Express API, to the database layer—communicates exclusively in JSON. MongoDB stores BSON (Binary JSON), completely eliminating the computational overhead of Object-Relational Mapping (ORM) translations.

---

## 2. Document Structure

Data is stored as hierarchical JSON objects representing a complete analysis unit. 

### Example Structure:
```json
{
  "_id": { "$oid": "60d5ecb8b392d7001f3e9a12" },
  "originalResponse": "Python was created by Guido van Rossum.",
  "confidenceScore": 90,
  "confidenceLabel": "HIGH",
  "claims": [
    {
      "text": "Python was created by Guido van Rossum.",
      "type": "factual",
      "confidence": 0.6
    }
  ]
}
```

---

## 3. Embedding vs. Referencing

### Chosen Approach: Embedding
TruthLens relies entirely on the **Embedded Document** pattern for the analysis module. 

Instead of creating a separate `Claims` collection and linking documents together (Referencing), all extracted claims and flagged statements are stored directly inside arrays within the parent `Analysis` document.

### Justification
1. **Atomic Reads:** When a user opens an analysis report, the application *always* needs the original response alongside its claims and flagged sentences. Embedding guarantees that everything is retrieved in exactly one lightning-fast database read.
2. **Lifecycle Coupling:** A claim has no logical existence outside of the context of the AI response that hallucinated it. If an analysis is deleted from history, all nested claims are automatically deleted with it, avoiding orphaned data and cascading delete logic.
3. **No Joins Required:** Mobile applications demand high-speed APIs. Embedding bypasses the need for `$lookup` aggregation pipelines entirely.

---

## 4. Data Flow 

The lifecycle of text data moving into the database follows a strict pipeline:

1. **User Input:** Raw AI text is submitted from the mobile interface.
2. **Analysis Engine:** The Express backend splits the text and algorithms extract `Claims` and identify `FlaggedStatements`.
3. **Document Assembly:** The calculated payload (Scores, Labels, and Embedded Arrays) is assembled into a single BSON document.
4. **Storage:** Passed to Mongoose and committed to MongoDB Atlas as one unified `Analysis` record.

---

## 5. Advantages of this Design

* **Flexibility for AI Models:** If new detection metrics (like sentiment or bias) are added in the future, fields can be dynamically appended to the JSON object without locking or restructuring database tables.
* **Rapid Rendering:** Embedding perfectly matches the UI requirement of the React Native `ReportDetailScreen`, which expects a single, deeply nested JavaScript object to populate its UI components instantly.
* **Scalability:** Since each document is fully self-contained (no external references), data can be effortlessly sharded across multiple MongoDB clusters as user traffic scales.
