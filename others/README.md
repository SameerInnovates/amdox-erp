# 🏢 Smart ERP – AI-Powered Business Management System

**Amdox ERP** is an internship-level MVP of a modern, AI-powered ERP (Enterprise Resource Planning) system. It combines a clean, responsive frontend with a real Python machine learning backend to forecast business revenue.

Built as an internship project for **Amdox Technologies** (April 2026).

---

## 🚀 Live Demo

| | Link |
|---|---|
| **Live App** | https://SameerInnovates.github.io/amdox-erp/ |
| **AI API** | https://amdox-erp-ai.onrender.com/ |
| **GitHub Repo** | https://github.com/SameerInnovates/amdox-erp |
| **Demo Video** | *(add your unlisted YouTube/Loom link here)* |

**Login credentials for demo:**
Email:    admin@amdox.com
Password: admin123

---

## 📸 Screenshots

| Dashboard | Employees | Analytics |
|---|---|---|
| ![Dashboard](screenshots/dashboard.png) | ![Employees](screenshots/employees.png) | ![Analytics](screenshots/analytics.png) |

---

## 🎯 Project Overview

Amdox ERP consolidates core business functions into a single dashboard:

- **Employee Management** — track your workforce
- **Inventory Management** — monitor stock levels in real time
- **Finance Module** — record income and expenses
- **Analytics** — visualize trends across every module
- **AI Forecasting** — predict next month's revenue using machine learning

This is a **frontend-first MVP**: all CRUD data lives in the browser's LocalStorage, while a dedicated Python Flask microservice handles the one feature that genuinely needs a backend — AI prediction.

---

## 🏗️ Architecture

┌─────────────────────────┐
│   Frontend (Browser)    │
│  HTML, CSS, JS,         │
│  Bootstrap 5, Chart.js  │
└────────┬────────┬───────┘
│         │
▼         ▼
┌────────────┐  ┌─────────────────────┐
│LocalStorage │  │   Flask AI API      │
│Employees    │  │   (hosted on Render)│
│Inventory    │  └──────────┬──────────┘
│Finance      │             │
└────────────┘              ▼
┌─────────────────────┐
│ Linear Regression    │
│ (scikit-learn model) │
└─────────────────────┘

**Why this architecture:** CRUD modules don't need a server — LocalStorage keeps the project simple, fast, and free to host on GitHub Pages. The AI module genuinely needs Python's machine learning ecosystem, so it's the one piece that runs as a real backend service.

---

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6)
- Bootstrap 5 + Bootstrap Icons
- Chart.js (bar, line, pie, doughnut charts)
- Google Fonts (Inter)

### Backend / AI
- Python 3
- Flask + Flask-CORS
- Scikit-Learn (Linear Regression)
- NumPy
- Gunicorn (production server)

### Data & Hosting
- Browser LocalStorage (CRUD data)
- GitHub Pages (frontend hosting)
- Render (Flask API hosting)

---

## ✨ Features

### Employee Management
- Add, edit, delete employees
- Search by name/email, filter by department
- Pagination, status badges, summary cards

### Inventory Management
- Add, edit, delete products
- Automatic stock status: In Stock / Low Stock / Out of Stock
- Real-time inventory value calculation

### Finance Module
- Log income and expense transactions
- Category-based organization
- Month filter, running balance card

### Analytics
- Revenue vs expense trend (6-month line chart)
- Inventory breakdown by category (pie chart)
- Employee distribution by department (doughnut chart)
- Top 5 expense categories (horizontal bar chart)

### AI Forecasting
- Real Linear Regression model trained on your live Finance data
- Predicts next month's revenue
- Displayed on the dashboard with trend direction

### UX Polish
- Toast notifications on every action
- Confirmation dialogs before delete
- Loading skeleton states
- Field-level form validation
- Fully responsive (mobile, tablet, desktop)

---

## 📁 Folder Structure

amdox-erp/
├── index.html              # Login page
├── dashboard.html           # Dashboard with KPIs, charts, AI prediction
├── employees.html           # Employee CRUD
├── inventory.html           # Inventory CRUD
├── finance.html              # Finance CRUD
├── analytics.html            # Cross-module analytics charts
│
├── css/
│   ├── style.css             # Login page styles
│   ├── dashboard.css         # Dashboard styles
│   └── components.css        # Shared design system
│
├── js/
│   ├── utils.js               # Shared helpers
│   ├── dashboard.js
│   ├── employees.js
│   ├── inventory.js
│   ├── finance.js
│   ├── analytics.js
│   └── ai-forecast.js         # Calls the Flask AI API
│
├── ai-service/
│   ├── app.py                  # Flask API with /predict endpoint
│   ├── requirements.txt
│   └── render.yaml
│
└── README.md

---

## 🔌 API Documentation

### `GET /`
Health check.

**Response**
```json
{ "status": "running", "message": "Amdox ERP AI Forecasting API is live!" }
```

### `POST /predict`
Predicts next month's revenue from historical sales data.

**Request Body**
```json
{ "sales": [420000, 480000, 510000, 470000, 530000, 610000] }
```

**Response**
```json
{
  "predicted_next_month": 645000,
  "trend": "upward",
  "slope": 32571.43,
  "months_analyzed": 6
}
```

---

## 💻 How to Run Locally

### Frontend
1. Clone this repo
2. Open `index.html` with VS Code's Live Server extension
3. Log in with `admin@amdox.com` / `admin123`

### AI Backend
```bash
cd ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

---

## 🔮 Future Scope

- Migrate LocalStorage to a real database with a REST API
- Add JWT-based authentication
- Expand AI forecasting with seasonal models
- Add role-based access control
- Add data export (PDF/Excel)

---

## 👤 Author

**Sameer**
4th Semester CS (AI) Student
Amdox Technologies Internship — April 2026
