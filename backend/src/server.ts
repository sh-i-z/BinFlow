import express from "express";
import binRoutes from "./routes/bin.route";
import simulatorRoutes from "./routes/simulator.route";
import { pool } from "./config/db";
import { startSimulation } from "./simulator/simulationEngine";
import hexagonRoutes from "./routes/hexagon.route";
import dispatchRoutes from "./routes/dispatch.route";
import truckRouteRoutes from "./routes/truckRoute.route";
import truckRoutes from "./routes/truck.route";
import cors from "cors";

const app = express();
app.use(cors());
const PORT = Number(process.env.PORT) || 3000;

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
app.use("/hexagons", hexagonRoutes);
app.use("/dispatch", dispatchRoutes);
app.use("/routes", truckRouteRoutes);
app.use("/trucks", truckRoutes);

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

    startSimulation(7000, 2.5);
});
