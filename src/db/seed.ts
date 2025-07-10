import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { users, categories, budgetItems, transactions } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // Create a test user
    const newUser: typeof users.$inferInsert = {
      id: "user_123",
      name: "John Doe",
      email: "john@example.com",
    };

    await db.insert(users).values(newUser);
    console.log("✅ User created:", newUser.name);

    // Create income categories
    const incomeCategories: (typeof categories.$inferInsert)[] = [
      {
        userId: newUser.id,
        name: "Salary",
        type: "income",
      },
      {
        userId: newUser.id,
        name: "Side Hustle",
        type: "income",
      },
    ];

    const insertedIncomeCategories = await db
      .insert(categories)
      .values(incomeCategories)
      .returning();
    console.log(
      "✅ Income categories created:",
      insertedIncomeCategories.length,
    );

    // Create expense categories
    const expenseCategories: (typeof categories.$inferInsert)[] = [
      {
        userId: newUser.id,
        name: "Housing",
        type: "expense",
      },
      {
        userId: newUser.id,
        name: "Food",
        type: "expense",
      },
      {
        userId: newUser.id,
        name: "Transportation",
        type: "expense",
      },
      {
        userId: newUser.id,
        name: "Entertainment",
        type: "expense",
      },
    ];

    const insertedExpenseCategories = await db
      .insert(categories)
      .values(expenseCategories)
      .returning();
    console.log(
      "✅ Expense categories created:",
      insertedExpenseCategories.length,
    );

    // Create budget items for current month (January 2025)
    const currentMonth = 1;
    const currentYear = 2025;

    const budgetItemsData: (typeof budgetItems.$inferInsert)[] = [
      // Income items
      {
        userId: newUser.id,
        categoryId: insertedIncomeCategories[0].id, // Salary
        name: "Monthly Salary",
        plannedAmount: "5000.00",
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: newUser.id,
        categoryId: insertedIncomeCategories[1].id, // Side Hustle
        name: "Freelance Work",
        plannedAmount: "800.00",
        month: currentMonth,
        year: currentYear,
      },
      // Expense items
      {
        userId: newUser.id,
        categoryId: insertedExpenseCategories[0].id, // Housing
        name: "Rent",
        plannedAmount: "1200.00",
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: newUser.id,
        categoryId: insertedExpenseCategories[0].id, // Housing
        name: "Utilities",
        plannedAmount: "150.00",
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: newUser.id,
        categoryId: insertedExpenseCategories[1].id, // Food
        name: "Groceries",
        plannedAmount: "400.00",
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: newUser.id,
        categoryId: insertedExpenseCategories[1].id, // Food
        name: "Dining Out",
        plannedAmount: "200.00",
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: newUser.id,
        categoryId: insertedExpenseCategories[2].id, // Transportation
        name: "Gas",
        plannedAmount: "120.00",
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: newUser.id,
        categoryId: insertedExpenseCategories[3].id, // Entertainment
        name: "Streaming Services",
        plannedAmount: "45.00",
        month: currentMonth,
        year: currentYear,
      },
    ];

    const insertedBudgetItems = await db
      .insert(budgetItems)
      .values(budgetItemsData)
      .returning();
    console.log("✅ Budget items created:", insertedBudgetItems.length);

    // Create some sample transactions
    const transactionsData: (typeof transactions.$inferInsert)[] = [
      // Income transactions
      {
        userId: newUser.id,
        budgetItemId: insertedBudgetItems[0].id, // Monthly Salary
        amount: "5000.00",
        description: "January Salary Deposit",
        date: new Date("2025-01-01"),
        type: "income",
      },
      {
        userId: newUser.id,
        budgetItemId: insertedBudgetItems[1].id, // Freelance Work
        amount: "400.00",
        description: "Website Project Payment",
        date: new Date("2025-01-15"),
        type: "income",
      },
      // Expense transactions
      {
        userId: newUser.id,
        budgetItemId: insertedBudgetItems[2].id, // Rent
        amount: "1200.00",
        description: "January Rent Payment",
        date: new Date("2025-01-01"),
        type: "expense",
      },
      {
        userId: newUser.id,
        budgetItemId: insertedBudgetItems[4].id, // Groceries
        amount: "85.43",
        description: "Whole Foods",
        date: new Date("2025-01-05"),
        type: "expense",
      },
      {
        userId: newUser.id,
        budgetItemId: insertedBudgetItems[4].id, // Groceries
        amount: "67.89",
        description: "Target Groceries",
        date: new Date("2025-01-12"),
        type: "expense",
      },
      {
        userId: newUser.id,
        budgetItemId: insertedBudgetItems[5].id, // Dining Out
        amount: "42.50",
        description: "Pizza Night",
        date: new Date("2025-01-10"),
        type: "expense",
      },
      {
        userId: newUser.id,
        budgetItemId: insertedBudgetItems[6].id, // Gas
        amount: "55.00",
        description: "Shell Gas Station",
        date: new Date("2025-01-08"),
        type: "expense",
      },
    ];

    const insertedTransactions = await db
      .insert(transactions)
      .values(transactionsData)
      .returning();
    console.log("✅ Transactions created:", insertedTransactions.length);

    // Display summary
    console.log("\n📊 Seed Summary:");
    console.log(`👤 Users: 1`);
    console.log(
      `📁 Categories: ${insertedIncomeCategories.length + insertedExpenseCategories.length}`,
    );
    console.log(`💰 Budget Items: ${insertedBudgetItems.length}`);
    console.log(`📝 Transactions: ${insertedTransactions.length}`);

    // Show some example data
    const allUsers = await db.select().from(users);
    console.log("\n👥 Users in database:", allUsers);

    const allCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, newUser.id));
    console.log("\n📁 Categories for user:", allCategories);

    console.log("\n🎉 Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("✨ Seed script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seed script error:", error);
    process.exit(1);
  });
