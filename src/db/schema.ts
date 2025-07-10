// Simplified Drizzle ORM Schema for EveryDollar Clone MVP
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ===== USERS =====
export const users = pgTable("users", {
  id: text("id").primaryKey(), // NextAuth user ID
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ===== BUDGET CATEGORIES =====
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ===== BUDGET ITEMS =====
export const budgetItems = pgTable("budget_items", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  plannedAmount: decimal("planned_amount", { precision: 10, scale: 2 }).default(
    "0.00",
  ),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ===== TRANSACTIONS =====
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  budgetItemId: integer("budget_item_id").references(() => budgetItems.id, {
    onDelete: "set null",
  }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ===== RELATIONS =====
export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  budgetItems: many(budgetItems),
  transactions: many(transactions),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  budgetItems: many(budgetItems),
}));

export const budgetItemsRelations = relations(budgetItems, ({ one, many }) => ({
  user: one(users, {
    fields: [budgetItems.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [budgetItems.categoryId],
    references: [categories.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  budgetItem: one(budgetItems, {
    fields: [transactions.budgetItemId],
    references: [budgetItems.id],
  }),
}));

// ===== TYPE EXPORTS =====
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertCategory = typeof categories.$inferInsert;
export type SelectCategory = typeof categories.$inferSelect;

export type InsertBudgetItem = typeof budgetItems.$inferInsert;
export type SelectBudgetItem = typeof budgetItems.$inferSelect;

export type InsertTransaction = typeof transactions.$inferInsert;
export type SelectTransaction = typeof transactions.$inferSelect;
