import { z } from "zod";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  ALL_CATEGORIES,
} from "./categories";

const amountSchema = z
  .number({ invalid_type_error: "Amount must be a number" })
  .positive("Amount must be greater than 0")
  .max(999_999_999, "Amount is too large");

const noteSchema = z
  .string()
  .trim()
  .max(280, "Note must be 280 characters or fewer")
  .optional();

function dateNotInFuture(value: string) {
  const date = new Date(value);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  return date.getTime() <= todayEnd.getTime();
}

const dateSchema = z
  .string({ required_error: "Date is required" })
  .datetime({ offset: true })
  .refine(dateNotInFuture, "Date cannot be in the future");

const entryBase = {
  amount: amountSchema,
  date: dateSchema,
  note: noteSchema,
};

export const createEntrySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("INCOME"),
    category: z.enum(INCOME_CATEGORIES, {
      errorMap: () => ({ message: "Choose a valid income category" }),
    }),
    ...entryBase,
  }),
  z.object({
    type: z.literal("EXPENSE"),
    category: z.enum(EXPENSE_CATEGORIES, {
      errorMap: () => ({ message: "Choose a valid expense category" }),
    }),
    ...entryBase,
  }),
]);

export const updateEntrySchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]).optional(),
    category: z
      .string()
      .trim()
      .min(1, "Category is required")
      .optional(),
    amount: amountSchema.optional(),
    date: dateSchema.optional(),
    note: noteSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field to update is required",
    path: ["entry"],
  })
  .refine(
    (data) => {
      if (!data.category) return true;
      const allowed =
        data.type === "INCOME"
          ? INCOME_CATEGORIES
          : data.type === "EXPENSE"
            ? EXPENSE_CATEGORIES
            : ALL_CATEGORIES;
      return (allowed as readonly string[]).includes(data.category);
    },
    { message: "Invalid category for entry type", path: ["category"] },
  );

const listDateSchema = z
  .string({ required_error: "Invalid date filter" })
  .datetime({ offset: true })
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date");

export const listEntriesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z
    .string()
    .trim()
    .refine((value) => (ALL_CATEGORIES as readonly string[]).includes(value), {
      message: "Unknown category",
    })
    .optional(),
  from: listDateSchema.optional(),
  to: listDateSchema.optional(),
});

export const summaryQuerySchema = z.object({
  tzOffset: z.coerce
    .number()
    .int()
    .min(-720)
    .max(840)
    .default(0),
});

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
export type ListEntriesQuery = z.infer<typeof listEntriesQuerySchema>;