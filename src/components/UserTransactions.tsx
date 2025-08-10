// components/UserTransactions.tsx
import { eq } from "drizzle-orm";
import { db } from "@/db"; // Your database connection
import { users } from "@/db/schema";

// Types inferred from our schema
type UserWithTransactions = {
  id: string;
  name: string | null;
  email: string;
  transactions: Array<{
    id: number;
    amount: string;
    description: string;
    date: Date;
    type: "income" | "expense";
    budgetItem: {
      id: number;
      name: string;
      category: {
        id: number;
        name: string;
        type: "income" | "expense";
      };
    } | null;
  }>;
};

// Server-side data fetching function
async function getUserWithTransactions(
  userId: string,
): Promise<UserWithTransactions | null> {
  // Using Drizzle's relational query API for efficient data fetching
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      transactions: {
        with: {
          budgetItem: {
            with: {
              category: true,
            },
          },
        },
        orderBy: (transactions, { desc }) => [desc(transactions.date)],
      },
    },
  });

  return user || null;
}

// React Server Component
export default async function UserTransactions() {
  // Hardcoded user ID for testing (using the one from our seed data)
  const hardcodedUserId = "user_123";

  // Fetch user data with transactions using relational queries
  const user = await getUserWithTransactions(hardcodedUserId);

  if (!user) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">User Not Found</h2>
        <p>No user found with ID: {hardcodedUserId}</p>
      </div>
    );
  }

  // Calculate summary statistics
  const totalIncome = user.transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = user.transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const netAmount = totalIncome - totalExpenses;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* User Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {user.name || "Unknown User"}
        </h1>
        <p className="text-gray-600">{user.email}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-sm font-medium text-green-800">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            ${totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="text-sm font-medium text-red-800">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            ${totalExpenses.toFixed(2)}
          </p>
        </div>
        <div
          className={`p-4 rounded-lg border ${
            netAmount >= 0
              ? "bg-blue-50 border-blue-200"
              : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <h3
            className={`text-sm font-medium ${
              netAmount >= 0 ? "text-blue-800" : "text-yellow-800"
            }`}
          >
            Net Amount
          </h3>
          <p
            className={`text-2xl font-bold ${
              netAmount >= 0 ? "text-blue-600" : "text-yellow-600"
            }`}
          >
            ${netAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">
            Recent Transactions ({user.transactions.length})
          </h2>
        </div>

        {user.transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No transactions found for this user.</p>
          </div>
        ) : (
          <div className="divide-y">
            {user.transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {transaction.description}
                    </h3>
                    {transaction.budgetItem && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">
                          {transaction.budgetItem.category.name}
                        </span>
                        {" → "}
                        <span>{transaction.budgetItem.name}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {transaction.date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-lg font-semibold ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}$
                      {parseFloat(transaction.amount).toFixed(2)}
                    </span>
                    <div
                      className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                        transaction.type === "income"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.type}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Usage example in a page component:
//
// // app/test-user/page.tsx
// import UserTransactions from "@/components/UserTransactions";
//
// export default function TestUserPage() {
//   return <UserTransactions />;
// }
