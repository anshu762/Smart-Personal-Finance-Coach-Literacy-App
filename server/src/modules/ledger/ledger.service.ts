import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/error.middleware";
import type {
  CreateEntryInput,
  ListEntriesQuery,
  UpdateEntryInput,
} from "./ledger.schema";

const DAY_MS = 86_400_000;

const entrySelect = {
  id: true,
  type: true,
  category: true,
  amount: true,
  note: true,
  date: true,
  createdAt: true,
} satisfies Prisma.EntrySelect;

export type PublicEntry = Prisma.EntryGetPayload<{
  select: typeof entrySelect;
}>;

function decodeCursor(cursor: string) {
  try {
    const [date, createdAt, id] = Buffer.from(cursor, "base64url")
      .toString("utf8")
      .split("_");
    const dateMs = Number(date);
    const createdAtMs = Number(createdAt);
    if (!Number.isFinite(dateMs) || !Number.isFinite(createdAtMs) || !id) {
      throw new Error("Malformed cursor");
    }
    return {
      date: new Date(dateMs),
      createdAt: new Date(createdAtMs),
      id,
    };
  } catch {
    throw new AppError(400, "Invalid pagination cursor", "INVALID_CURSOR");
  }
}

function encodeCursor(entry: { date: Date; createdAt: Date; id: string }) {
  return Buffer.from(
    `${entry.date.getTime()}_${entry.createdAt.getTime()}_${entry.id}`,
    "utf8",
  ).toString("base64url");
}

export async function createEntry(userId: string, input: CreateEntryInput) {
  const entry = await prisma.entry.create({
    data: {
      userId,
      type: input.type,
      category: input.category,
      amount: input.amount,
      note: input.note ?? null,
      date: new Date(input.date),
    },
    select: entrySelect,
  });
  return entry;
}

export interface LedgerListResult {
  items: PublicEntry[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function listEntries(
  userId: string,
  query: ListEntriesQuery,
): Promise<LedgerListResult> {
  const take = query.limit + 1;

  const where: Prisma.EntryWhereInput = { userId };

  if (query.type) where.type = query.type;
  if (query.category) where.category = query.category;
  if (query.from || query.to) {
    where.date = {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(query.to) } : {}),
    };
  }

  const cursor = query.cursor ? decodeCursor(query.cursor) : null;
  if (cursor) {
    where.OR = [
      { date: { lt: cursor.date } },
      { date: cursor.date, createdAt: { lt: cursor.createdAt } },
      {
        date: cursor.date,
        createdAt: cursor.createdAt,
        id: { lt: cursor.id },
      },
    ];
  }

  const rows = await prisma.entry.findMany({
    where,
    take,
    orderBy: [
      { date: "desc" },
      { createdAt: "desc" },
      { id: "desc" },
    ],
    select: entrySelect,
  });

  const hasMore = rows.length === take;
  const items = hasMore ? rows.slice(0, take - 1) : rows;
  const nextCursor = hasMore ? encodeCursor(items[items.length - 1]) : null;

  return { items, nextCursor, hasMore };
}

async function findOwnedEntry(userId: string, id: string) {
  const entry = await prisma.entry.findFirst({
    where: { id, userId },
    select: entrySelect,
  });
  if (!entry) {
    throw new AppError(404, "Entry not found", "ENTRY_NOT_FOUND");
  }
  return entry;
}

export async function updateEntry(
  userId: string,
  id: string,
  input: UpdateEntryInput,
) {
  await findOwnedEntry(userId, id);

  const entry = await prisma.entry.update({
    where: { id },
    data: {
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
      ...(input.note !== undefined ? { note: input.note } : {}),
    },
    select: entrySelect,
  });
  return entry;
}

export async function deleteEntry(userId: string, id: string) {
  await findOwnedEntry(userId, id);
  await prisma.entry.delete({ where: { id } });
  return { id };
}

async function bucketStats(userId: string, start: number, end: number) {
  const rows = await prisma.entry.groupBy({
    by: ["type"],
    where: {
      userId,
      date: { gte: new Date(start), lt: new Date(end) },
    },
    _sum: { amount: true },
  });

  return {
    income: rows.find((row) => row.type === "INCOME")?._sum.amount ?? 0,
    expense: rows.find((row) => row.type === "EXPENSE")?._sum.amount ?? 0,
  };
}

export interface LedgerSummary {
  today: { income: number; expense: number };
  thisWeek: { income: number; expense: number };
  thisMonth: { income: number; expense: number };
  categories: { category: string; total: number }[];
}

export async function getSummary(
  userId: string,
  tzOffsetMinutes: number,
): Promise<LedgerSummary> {
  const now = Date.now();
  const offsetMs = tzOffsetMinutes * 60_000;
  const localNow = now + offsetMs;

  const localDayStart = Math.floor(localNow / DAY_MS) * DAY_MS;
  const todayStart = localDayStart - offsetMs;

  const weekStart = todayStart - 6 * DAY_MS;

  const localNowDate = new Date(localNow);
  const localMonthStart = Date.UTC(
    localNowDate.getUTCFullYear(),
    localNowDate.getUTCMonth(),
    1,
  );
  const monthStart = localMonthStart - offsetMs;

  const todayEnd = todayStart + DAY_MS;

  const [today, thisWeek, thisMonth] = await Promise.all([
    bucketStats(userId, todayStart, todayEnd),
    bucketStats(userId, weekStart, todayEnd),
    bucketStats(userId, monthStart, todayEnd),
  ]);

  const categoryRows = await prisma.entry.groupBy({
    by: ["category"],
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: new Date(monthStart), lt: new Date(todayEnd) },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 6,
  });

  return {
    today,
    thisWeek,
    thisMonth,
    categories: categoryRows.map((row) => ({
      category: row.category,
      total: row._sum.amount ?? 0,
    })),
  };
}