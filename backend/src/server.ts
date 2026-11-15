import express from "express";
import binRoutes from "./routes/bin.route";

const app = express();
const PORT = 3000;

app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to BinFlow!",
        status: "Backend is running"
    });
});

// Bin routes
app.use("/bins", binRoutes);

app.listen(PORT, () => {
    console.log(`BinFlow server running at http://localhost:${PORT}`);
});
