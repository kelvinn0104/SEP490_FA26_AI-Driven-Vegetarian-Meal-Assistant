# 🥦 VeggieAI - AI-Driven Vegetarian Meal Assistant
> **Capstone Project (SEP490) - FPT University (Fall 2026 - Spring 2027)**  
> **Tech Stack:** ASP.NET Core (.NET 8/9) Backend + ReactJS Frontend + PostgreSQL (+pgvector) & Redis

---

## 📌 Project Overview
VeggieAI is a comprehensive platform combining a social vegetarian recipe network with a personalized AI ecosystem to solve 3 key challenges for vegetarians:
1. **Meal Monotony:** AI personalized recommendations & recipe generator.
2. **Nutritional Imbalance:** Linear Programming meal planner for balanced protein, iron, B12, and omega-3 based on user BMI & health goals.
3. **Ingredient Selection & Freshness:** Computer Vision (YOLOv8 ONNX in .NET) to identify ingredients from fridge photos & recommend zero-waste recipes.

---

## 🏗 Repository Structure

```text
SEP490_FA26/
├── BE/                            # Pure C# .NET Core Solution (Clean Architecture)
│   ├── VeggieAI.sln               # .NET Solution File
│   └── src/
│       ├── VeggieAI.API/          # REST API Endpoints & Middlewares
│       ├── VeggieAI.Application/  # Business Logic, DTOs, AI Engine Interfaces
│       ├── VeggieAI.Domain/       # Core Domain Entities & Enums
│       └── VeggieAI.Infrastructure/ # EF Core (PostgreSQL + pgvector), Redis, AI Solvers
├── FE/                            # Pure ReactJS Application (User Portal + Admin & Mod Dashboard)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── components/            # Reusable UI components
│       ├── pages/                 # User Pages, Admin Dashboard, Moderation Queue
│       └── services/              # API Client (Axios/Fetch)
├── docker-compose.yml             # Local PostgreSQL + pgvector & Redis Setup
├── .gitignore
└── README.md
```

---

## 🛠 Tech Stack Details

### Backend (.NET Core)
- **Framework:** ASP.NET Core (.NET 8 / .NET 9)
- **Architecture:** Clean Architecture (Domain, Application, Infrastructure, API)
- **Database:** PostgreSQL with `pgvector` (Vector Embeddings & Semantic Search)
- **OR-Tools Solver:** Google.OrTools for Linear Programming (Nutritional Meal Optimization in C#)
- **Computer Vision:** ONNX Runtime for C# (YOLOv8 object detection in C#)
- **AI Chatbot & RAG:** OpenAI C# SDK / Microsoft Semantic Kernel + Vector Search
- **Caching & Background Jobs:** Redis + Hangfire

### Frontend (ReactJS)
- **Framework:** ReactJS (React 18 / Vite)
- **State & Routing:** React Router, Context API
- **Styling:** Modern CSS Glassmorphism Design System
- **Icons:** Lucide-React

---

## 🚀 Quick Start Guide

### 1. Database Services (Docker)
```bash
docker-compose up -d
```

### 2. Backend (.NET Core)
```bash
cd BE
dotnet restore
dotnet run --project src/VeggieAI.API
```

### 3. Frontend (ReactJS)
```bash
cd FE
npm install
npm run dev
```
