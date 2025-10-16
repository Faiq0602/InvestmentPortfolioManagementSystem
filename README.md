# Investment Portfolio Management System

A lightweight **Vue 3 + Vuex** single-page application for managing investment portfolios and clients.  
It provides login/signup functionality, portfolio CRUD operations, and INR-based reporting using a mock persistence layer (`localStorage`).

---

## 1. Overview
- Built entirely on the front end with **Vue 3**, **Vuex**, **Vue Router**, and **Tailwind CSS**  
- Supports login, registration, and complete portfolio management workflows  
- INR-formatted summaries with computed investment returns  
- Includes seeded demo data for quick exploration  
- Fully portable and ready for backend integration  

---

## 2. Key Features
- Create, edit, delete, and view portfolios  
- Client and investment management modules  
- INR currency formatting and computed return rates  
- Mock database using browser `localStorage`  
- Modular Vuex-based state management  

---

## 3. Tech Stack
Vue 3 • Vuex 4 • Vue Router 4 • Tailwind CSS • Jest • localStorage (mock DB)

---

## 4. Steps to Run
```bash
# Clone the repository
git clone https://github.com/Faiq0602/InvestmentPortfolioManagementSystem.git

cd InvestmentPortfolioManagementSystem

# Install dependencies
npm install

# Run the development server
npm run serve

---

Steps to Test

# Run all unit tests
npm run test:unit

# (Optional) Fix linting issues automatically
npm run lint -- --fix

