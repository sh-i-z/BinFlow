import type { Bin } from "../types/bin";

const API_URL = "http://localhost:3000";

export const getBins = async (): Promise<Bin[]> => {
    const response = await fetch(`${API_URL}/bins`);

    if (!response.ok) {
        throw new Error("Failed to fetch bins");
    }

    return response.json() as Promise<Bin[]>;
};