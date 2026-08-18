import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_CATEGORIES = [
  "Groceries",
  "Dining",
  "Transport",
  "Entertainment",
  "Shopping",
  "Subscriptions",
  "Utilities",
  "Income",
];

const ARTICLES = [
  {
    title: "Taming Subscription Fatigue",
    summary:
      "Small monthly fees add up fast. Learn how to audit and cut recurring costs.",
    body: "Subscriptions quietly drain budgets...",
    tag: "subscriptions",
  },
  {
    title: "The 50/30/20 Budget Rule",
    summary:
      "A simple framework to split your income into needs, wants, and savings.",
    body: "Allocate 50% of income to needs...",
    tag: "budgeting",
  },
  {
    title: "Build a Rainy Day Fund",
    summary:
      "Why an emergency fund keeps you out of debt when surprises hit.",
    body: "Aim to save three to six months of expenses...",
    tag: "savings",
  },
];

const QUIZ_QUESTIONS = {
  "Taming Subscription Fatigue": [
    {
      text: "Which of these is the best first step to cut subscription costs?",
      options: [
        "Audit all recurring charges",
        "Cancel the cheapest one immediately",
        "Ignore unused subscriptions",
        "Only track annual plans",
      ],
      correctIndex: 0,
    },
    {
      text: "How often should you review your subscriptions?",
      options: ["Never", "Yearly", "Every 6 months", "After every purchase"],
      correctIndex: 2,
    },
  ],
  "The 50/30/20 Budget Rule": [
    {
      text: "What share of income goes to needs in the 50/30/20 rule?",
      options: ["30%", "50%", "20%", "80%"],
      correctIndex: 1,
    },
    {
      text: "The 20% bucket is reserved for:",
      options: ["Wants", "Rent", "Savings and debt payoff", "Entertainment"],
      correctIndex: 2,
    },
  ],
};

async function main() {
  await prisma.article.deleteMany();

  for (const article of ARTICLES) {
    const created = await prisma.article.create({ data: article });

    const questions = QUIZ_QUESTIONS[article.title];
    if (questions) {
      await prisma.quiz.create({
        data: {
          articleId: created.id,
          questions: { create: questions },
        },
      });
    }
  }

  console.log("Seeded articles and quizzes.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });