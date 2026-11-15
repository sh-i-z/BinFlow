import { z } from "zod";

export const binSchema = z.object({
    name: z.string().min(1, "Bin name is required"),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    fill_level: z.number().min(0).max(100)
});

export const updateBinSchema = z.object({
    fill_level: z.number().min(0).max(100)
});

export type BinInput = z.infer<typeof binSchema>;