import { z } from "zod";
import { ACTIVITY_TYPE_KEYS } from "@/lib/activityTypes";

const MAX_DATA_BYTES = 200_000;

export const activitySchema = z.object({
  title: z.string().trim().min(1, "Γράψε έναν τίτλο").max(120),
  tag: z.string().trim().max(120).default(""),
  type: z.enum(ACTIVITY_TYPE_KEYS),
  data: z
    .record(z.string(), z.unknown())
    .refine((d) => JSON.stringify(d).length <= MAX_DATA_BYTES, "Η δραστηριότητα είναι πολύ μεγάλη"),
  subjectId: z.string().min(1).nullable().optional(),
});
