import { z } from "zod";
import { PARAMETERS, PERIODS } from "@/backend/parameters";

const parameterNames = Object.keys(PARAMETERS) as [string, ...string[]];

// GET /api/measurements?stations=1,2,3&parameter=PM2.5&period=2021
// Toți parametrii vin din URL ca text, deci îi transformăm și îi verificăm aici.
export const measurementsQuerySchema = z.object({
  // "1,2,3" → [1, 2, 3]; între 1 și 3 stații, fiecare un număr întreg pozitiv
  stations: z
    .string()
    .transform((text) => text.split(",").map(Number))
    .pipe(z.array(z.number().int().positive()).min(1).max(3)),
  parameter: z.enum(parameterNames),
  period: z.enum(PERIODS),
});
