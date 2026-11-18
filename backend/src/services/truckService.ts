
import { pool } from "../config/db";
import type { Truck } from "../models/Truck";

const normalizeTruck = (row: any): Truck => ({
    ...row,
    id: Number(row.id),
    capacity_kg: Number(row.capacity_kg),
    depot_latitude: Number(row.depot_latitude),
    depot_longitude: Number(row.depot_longitude),
    shift_duration_minutes: Number(row.shift_duration_minutes)
});

// CREATE TRUCK
export const createTruck = async (data: any) => {
    const result = await pool.query(
        `INSERT INTO trucks (
            truck_code,
            capacity_kg,
            depot_latitude,
            depot_longitude,
            shift_duration_minutes,
            status
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
            data.truck_code,
            data.capacity_kg,
            data.depot_latitude,
            data.depot_longitude,
            data.shift_duration_minutes,
            data.status
        ]
    );

    return normalizeTruck(result.rows[0]);
};

// GET ALL TRUCKS
export const getAllTrucks = async () => {
    const result = await pool.query(
        `SELECT * FROM trucks ORDER BY id ASC`
    );

    return result.rows.map(normalizeTruck);
};

// GET TRUCK BY ID
export const getTruckById = async (id: number) => {
    const result = await pool.query(
        `SELECT * FROM trucks WHERE id = $1`,
        [id]
    );

    return result.rows.length
        ? normalizeTruck(result.rows[0])
        : null;
};

// UPDATE TRUCK
export const updateTruck = async (
    id: number,
    data: Record<string, unknown>
) => {
    const allowedFields = [
        "truck_code",
        "capacity_kg",
        "depot_latitude",
        "depot_longitude",
        "shift_duration_minutes",
        "status"
    ];

    const entries = Object.entries(data).filter(
        ([key]) => allowedFields.includes(key)
    );

    const values = entries.map(([, value]) => value);

    const setClause = entries.map(
        ([key], index) => `${key} = $${index + 1}`
    );

    setClause.push("updated_at = CURRENT_TIMESTAMP");

    const result = await pool.query(
        `UPDATE trucks
         SET ${setClause.join(", ")}
         WHERE id = $${values.length + 1}
         RETURNING *`,
        [...values, id]
    );

    return result.rows.length
        ? normalizeTruck(result.rows[0])
        : null;
};

// DELETE TRUCK
export const deleteTruck = async (id: number) => {
    const result = await pool.query(
        `DELETE FROM trucks
         WHERE id = $1
         AND status != 'active'
         RETURNING *`,
        [id]
    );

    return result.rows.length
        ? normalizeTruck(result.rows[0])
        : null;
};
