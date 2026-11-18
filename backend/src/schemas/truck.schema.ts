
import { z } from "zod";

export const createTruckSchema = z.object({
    truck_code: z.string()
        .trim()
        .min(1, "Truck code is required")
        .max(20),

    capacity_kg: z.coerce.number()
        .positive()
        .default(1000),

    depot_latitude: z.coerce.number()
        .min(-90)
        .max(90),

    depot_longitude: z.coerce.number()
        .min(-180)
        .max(180),

    shift_duration_minutes: z.coerce.number()
        .int()
        .positive()
        .default(480),

    status: z.enum([
        "available",
        "active",
        "maintenance"
    ]).default("available")
});

export const updateTruckSchema = createTruckSchema
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        "At least one field is required"
    );

export const truckIdSchema = z.coerce.number()
    .int()
    .positive();
