# E-Commerce POS System

A modern, full-stack E-Commerce & Point of Sale (POS) system built with React, Express, MySQL, and Vite.

## 🚀 Features

- **Modern POS Interface**: Dark-mode glassmorphism design for optimal usability.
- **Product Management**: View, filter, and search inventory items in real-time.
- **Cart & Checkout**: Dynamic cart management with interactive payment simulation.
- **Order History & Management**: Track past transactions and order details.
- **RESTful API**: Fast and modular backend endpoints powering transactions and catalog operations.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS / Custom Glassmorphism CSS, Axios
- **Backend**: Node.js, Express, MySQL
- **Configuration**: Faable deployment configuration (`faable.json`)

## 📦 Project Structure

```text
├── frontend/        # React + Vite frontend application
├── backend/         # Express + MySQL backend application
├── task-02/         # Main task workspace files
└── faable.json      # Faable deployment configuration
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+)
- MySQL Database

### 1. Frontend Setup

```bash
cd task-02/frontend
npm install
npm run dev
```

The frontend dev server will start at `http://localhost:5173`.

### 2. Backend Setup

```bash
cd task-02/backend
npm install
npm start
```

## 📝 Configuration

- Deployment settings are configured in `faable.json`.
- API base URL can be adjusted in `task-02/frontend/src/api.js`.

---

Developed for **E-Commerce System**.
