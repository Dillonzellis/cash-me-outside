// Drizzle ORM Schema for EveryDollar Clone
import {
  pgTable,
  serial,
  varchar,
  decimal,
  integer,
  timestamp,
  boolean,
  date,
  text,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ===== USERS & AUTH =====
// NextAuth will handle most auth tables, but we extend the user
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(), // NextAuth user ID
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===== BUDGET MONTHS =====
// Each month is a separate budget (core EveryDollar concept)
export const budgetMonths = pgTable("budget_months", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 1-12
  monthlyIncome: decimal("monthly_income", { precision: 10, scale: 2 }).default(
    "0.00",
  ),
  isActive: boolean("is_active").default(false), // Current month being worked on
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===== BUDGET CATEGORIES =====
// Main categories (Housing, Food, Transportation, etc.)
export const budgetCategories = pgTable("budget_categories", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  emoji: varchar("emoji", { length: 10 }), // For visual flair like EveryDollar
  type: varchar("type", { length: 20 }).notNull(), // 'income', 'expense', 'savings', 'debt'
  sortOrder: integer("sort_order").default(0),
  isDefault: boolean("is_default").default(false), // Template categories
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===== BUDGET LINE ITEMS =====
// Individual line items within categories (Rent, Groceries, etc.)
export const budgetLineItems = pgTable("budget_line_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => budgetCategories.id, { onDelete: "cascade" }),
  budgetMonthId: integer("budget_month_id")
    .notNull()
    .references(() => budgetMonths.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  plannedAmount: decimal("planned_amount", { precision: 10, scale: 2 }).default(
    "0.00",
  ),
  actualAmount: decimal("actual_amount", { precision: 10, scale: 2 }).default(
    "0.00",
  ), // Sum of transactions
  dueDate: date("due_date"), // For bills
  isRecurring: boolean("is_recurring").default(false),
  isSinkingFund: boolean("is_sinking_fund").default(false), // Special savings funds
  sinkingFundTarget: decimal("sinking_fund_target", {
    precision: 10,
    scale: 2,
  }),
  sinkingFundTargetDate: date("sinking_fund_target_date"),
  notes: text("notes"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===== TRANSACTIONS =====
// Individual expenses/income entries
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  budgetLineItemId: integer("budget_line_item_id").references(
    () => budgetLineItems.id,
    { onDelete: "set null" },
  ),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  transactionDate: date("transaction_date").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'income', 'expense'
  isTransfer: boolean("is_transfer").default(false), // For moving money between categories
  notes: text("notes"),
  // Bank integration fields (for premium features)
  bankTransactionId: varchar("bank_transaction_id", { length: 255 }),
  merchantName: varchar("merchant_name", { length: 255 }),
  category: varchar("category", { length: 100 }), // Bank's category
  isReconciled: boolean("is_reconciled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===== SPLIT TRANSACTIONS =====
// For splitting a single transaction across multiple budget lines
export const transactionSplits = pgTable("transaction_splits", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),
  budgetLineItemId: integer("budget_line_item_id")
    .notNull()
    .references(() => budgetLineItems.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ===== SHARED BUDGETS =====
// For sharing budgets between users (like spouses)
export const budgetShares = pgTable("budget_shares", {
  id: serial("id").primaryKey(),
  budgetOwnerId: varchar("budget_owner_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sharedWithUserId: varchar("shared_with_user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  permission: varchar("permission", { length: 20 }).default("edit"), // 'view', 'edit', 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ===== PAYCHECK PLANNING =====
// For irregular income and paycheck-based budgeting
export const paychecks = pgTable("paychecks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  budgetMonthId: integer("budget_month_id")
    .notNull()
    .references(() => budgetMonths.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  expectedDate: date("expected_date").notNull(),
  actualDate: date("actual_date"),
  source: varchar("source", { length: 255 }), // Employer, freelance, etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ===== BUDGET TEMPLATES =====
// For copying budgets month to month
export const budgetTemplates = pgTable("budget_templates", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const budgetTemplateItems = pgTable("budget_template_items", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id")
    .notNull()
    .references(() => budgetTemplates.id, { onDelete: "cascade" }),
  categoryName: varchar("category_name", { length: 100 }).notNull(),
  categoryType: varchar("category_type", { length: 20 }).notNull(),
  categoryEmoji: varchar("category_emoji", { length: 10 }),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  plannedAmount: decimal("planned_amount", { precision: 10, scale: 2 }).default(
    "0.00",
  ),
  dueDate: integer("due_date"), // Day of month (1-31)
  isRecurring: boolean("is_recurring").default(false),
  isSinkingFund: boolean("is_sinking_fund").default(false),
  sortOrder: integer("sort_order").default(0),
});

// ===== RELATIONS =====
export const usersRelations = relations(users, ({ many }) => ({
  budgetMonths: many(budgetMonths),
  budgetCategories: many(budgetCategories),
  transactions: many(transactions),
  ownedShares: many(budgetShares, { relationName: "owner" }),
  receivedShares: many(budgetShares, { relationName: "shared" }),
}));

export const budgetMonthsRelations = relations(
  budgetMonths,
  ({ one, many }) => ({
    user: one(users, {
      fields: [budgetMonths.userId],
      references: [users.id],
    }),
    lineItems: many(budgetLineItems),
    paychecks: many(paychecks),
  }),
);

export const budgetCategoriesRelations = relations(
  budgetCategories,
  ({ one, many }) => ({
    user: one(users, {
      fields: [budgetCategories.userId],
      references: [users.id],
    }),
    lineItems: many(budgetLineItems),
  }),
);

export const budgetLineItemsRelations = relations(
  budgetLineItems,
  ({ one, many }) => ({
    category: one(budgetCategories, {
      fields: [budgetLineItems.categoryId],
      references: [budgetCategories.id],
    }),
    budgetMonth: one(budgetMonths, {
      fields: [budgetLineItems.budgetMonthId],
      references: [budgetMonths.id],
    }),
    transactions: many(transactions),
    transactionSplits: many(transactionSplits),
  }),
);

export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [transactions.userId],
      references: [users.id],
    }),
    budgetLineItem: one(budgetLineItems, {
      fields: [transactions.budgetLineItemId],
      references: [budgetLineItems.id],
    }),
    splits: many(transactionSplits),
  }),
);

export const transactionSplitsRelations = relations(
  transactionSplits,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionSplits.transactionId],
      references: [transactions.id],
    }),
    budgetLineItem: one(budgetLineItems, {
      fields: [transactionSplits.budgetLineItemId],
      references: [budgetLineItems.id],
    }),
  }),
);
