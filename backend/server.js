require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/verifications", require("./src/routes/verificationRoutes"));



async function main() {
    await connectDB();

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

main().catch(console.error);
