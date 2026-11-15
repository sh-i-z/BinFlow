
const express = require("express");

const app = express();

const PORT = 3000;

// Middleware to read JSON request bodies
app.use(express.json());

// First API endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to BinFlow!",
        status: "Backend is running"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`BinFlow server running at http://localhost:${PORT}`);
});
