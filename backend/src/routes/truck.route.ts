
import { Router, Request, Response } from "express";

import {
    createTruckSchema,
    updateTruckSchema,
    truckIdSchema
} from "../schemas/truck.schema";

import {
    createTruck,
    getAllTrucks,
    getTruckById,
    updateTruck,
    deleteTruck
} from "../services/truckService";

const router = Router();

// CREATE TRUCK
router.post("/", async (req: Request, res: Response) => {
    try {
        const validation = createTruckSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                message: "Invalid truck data",
                errors: validation.error.flatten()
            });
        }

        const truck = await createTruck(validation.data);

        return res.status(201).json({
            message: "Truck created successfully",
            truck
        });

    } catch (error: any) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "Truck code already exists"
            });
        }

        console.error("Create truck error:", error);

        return res.status(500).json({
            message: "Failed to create truck"
        });
    }
});

// GET ALL TRUCKS
router.get("/", async (_req: Request, res: Response) => {
    try {
        const trucks = await getAllTrucks();

        return res.status(200).json({
            count: trucks.length,
            trucks
        });

    } catch (error) {
        console.error("Get trucks error:", error);

        return res.status(500).json({
            message: "Failed to fetch trucks"
        });
    }
});

// GET TRUCK BY ID
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const id = truckIdSchema.safeParse(req.params.id);

        if (!id.success) {
            return res.status(400).json({
                message: "Invalid truck ID"
            });
        }

        const truck = await getTruckById(id.data);

        if (!truck) {
            return res.status(404).json({
                message: "Truck not found"
            });
        }

        return res.status(200).json({ truck });

    } catch (error) {
        console.error("Get truck error:", error);

        return res.status(500).json({
            message: "Failed to fetch truck"
        });
    }
});

// UPDATE TRUCK
router.patch("/:id", async (req: Request, res: Response) => {
    try {
        const id = truckIdSchema.safeParse(req.params.id);

        if (!id.success) {
            return res.status(400).json({
                message: "Invalid truck ID"
            });
        }

        const validation = updateTruckSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                message: "Invalid update data",
                errors: validation.error.flatten()
            });
        }

        const truck = await updateTruck(id.data, validation.data);

        if (!truck) {
            return res.status(404).json({
                message: "Truck not found"
            });
        }

        return res.status(200).json({
            message: "Truck updated successfully",
            truck
        });

    } catch (error: any) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "Truck code already exists"
            });
        }

        console.error("Update truck error:", error);

        return res.status(500).json({
            message: "Failed to update truck"
        });
    }
});

// DELETE TRUCK
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const id = truckIdSchema.safeParse(req.params.id);

        if (!id.success) {
            return res.status(400).json({
                message: "Invalid truck ID"
            });
        }

        const existingTruck = await getTruckById(id.data);

        if (!existingTruck) {
            return res.status(404).json({
                message: "Truck not found"
            });
        }

        if (existingTruck.status === "active") {
            return res.status(409).json({
                message: "Active truck cannot be deleted"
            });
        }

        const truck = await deleteTruck(id.data);

        if (!truck) {
            return res.status(409).json({
                message: "Truck could not be deleted"
            });
        }

        return res.status(200).json({
            message: "Truck deleted successfully",
            truck
        });

    } catch (error) {
        console.error("Delete truck error:", error);

        return res.status(500).json({
            message: "Failed to delete truck"
        });
    }
});

export default router;
