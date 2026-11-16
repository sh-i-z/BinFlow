import express from "express";
import binRoutes from "./routes/bin.route";
import simulatorRoutes from "./routes/simulator.route";
import { pool } from "./config/db";
import { startSimulation } from "./simulator/simulationEngine";

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
app.use("/bins", simulatorRoutes);

pool.query("SELECT NOW()")
    .then((result) => {
        console.log("PostgreSQL connected!");
        console.log("Database time:", result.rows[0]);
    })
    .catch((error) => {
        console.error("Database connection failed:", error.message);
    });

app.listen(PORT, () => {
    console.log(`BinFlow server running at http://localhost:${PORT}`);

    // startSimulation(5000, 5);
});
