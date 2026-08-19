import { z } from "zod";

const goalAmountSchema = z
  .number({ invalid_type_error: "Amount must be a number" })
  .positive("Amount must be greater than 0")
  .max(999_999_999, "Amount is too large");

const titleSchema = z
  .string({ required_error: "Title is required" })
  .trim()
  .min(1, "Give your goal a title")
  .max(80, "Title must be 80 characters or fewer");

function endOfToday(): Date {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
}

const deadlineSchema = z
  .string({ invalid_type_error: "Invalid deadline" })
  .datetime({ offset: true })
  .refine(
    (value) => new Date(value).getTime() > endOfToday().getTime(),
    "Deadline must be a future date",
  );

export const createGoalSchema = z.object({
  title: titleSchema,
  targetAmount: goalAmountSchema,
  deadline: deadlineSchema.optional(),
});

export const updateGoalSchema = z
  .object({
    title: titleSchema.optional(),
    targetAmount: goalAmountSchema.optional(),
    deadline: z.union([deadlineSchema, z.null()]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field to update is required",
    path: ["goal"],
  });

export const addFundsSchema = z.object({
  amount: goalAmountSchema,
  confirm: z.boolean().default(false),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type AddFundsInput = z.infer<typeof addFundsSchema>;