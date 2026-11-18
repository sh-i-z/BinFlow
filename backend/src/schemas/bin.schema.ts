
import { z } from "zod";

// Create a new bin
export const binSchema = z.object({
    name: z.string()
        .trim()
        .min(1, "Bin name is required")
        .max(100),

    latitude: z.number()
        .min(-90)
        .max(90),

    longitude: z.number()
        .min(-180)
        .max(180),

    fill_level: z.number()
        .min(0)
        .max(100),

    max_waste_capacity_kg: z.number()
        .positive("Bin capacity must be greater than 0")
        .default(100)
});

// Update bin details
export const updateBinSchema = z.object({
    name: z.string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

    latitude: z.number()
        .min(-90)
        .max(90)
        .optional(),

    longitude: z.number()
        .min(-180)
        .max(180)
        .optional(),

    fill_level: z.number()
        .min(0)
        .max(100)
        .optional(),

    max_waste_capacity_kg: z.number()
        .positive()
        .optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided"
);

// TypeScript types
export type BinInput = z.infer<typeof binSchema>;
export type UpdateBinInput = z.infer<typeof updateBinSchema>;
