// Preloads the app with friendly demo users and portfolios so the dashboard feels lived-in on first run.
import { v4 as uuid } from "uuid";
import { fetchUsers, saveUsers, fetchPortfolios, savePortfolios } from "./db";

// Friendly demo contacts so the UI feels alive during local exploration.
const demoUsers = [
  {
    id: uuid(),
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+91 98765 10101",
  },
  {
    id: uuid(),
    name: "Benjamin Lee",
    email: "ben.lee@example.com",
    phone: "+91 98765 20202",
  },
  {
    id: uuid(),
    name: "Chloe Martinez",
    email: "chloe.martinez@example.com",
  },
];

function buildPortfolioSeeds(users) {
  if (!users.length) {
    return [];
  }
  return [
    {
      id: uuid(),
      clientId: users[0].id,
      name: "Growth 2030",
      status: "ACTIVE",
      initialInvestment: 50000,
      currentValue: 68500,
      expectedReturnRate: 12,
      holdings: [
        { symbol: "AAPL", units: 120, avgPrice: 135 },
        { symbol: "MSFT", units: 80, avgPrice: 220 },
      ],
    },
    {
      id: uuid(),
      clientId: users[1].id,
      name: "Retirement Income",
      status: "UPCOMING",
      initialInvestment: 25000,
      currentValue: 25000,
      expectedReturnRate: 7,
      holdings: [
        { symbol: "BND", units: 150, avgPrice: 85 },
        { symbol: "VTI", units: 60, avgPrice: 200 },
      ],
    },
    {
      id: uuid(),
      clientId: users[2].id,
      name: "College Savings",
      status: "CLOSED",
      initialInvestment: 15000,
      currentValue: 17500,
      expectedReturnRate: 6,
      holdings: [
        { symbol: "VOO", units: 30, avgPrice: 320 },
        { symbol: "VXUS", units: 45, avgPrice: 60 },
      ],
    },
  ];
}

export async function seedDatabase() {
  const existingUsers = await fetchUsers();
  if (!existingUsers.length) {
    await saveUsers(demoUsers);
  }

  const users = existingUsers.length ? existingUsers : demoUsers;
  const existingPortfolios = await fetchPortfolios();
  if (!existingPortfolios.length) {
    const seeds = buildPortfolioSeeds(users);
    await savePortfolios(seeds);
  }
}

seedDatabase();
