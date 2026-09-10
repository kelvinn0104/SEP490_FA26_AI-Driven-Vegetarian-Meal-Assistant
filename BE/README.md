# ⚙️ VeggieAI Backend (.NET Core Clean Architecture)

This folder contains the complete Backend solution written in **C# ASP.NET Core (.NET 8/9)** following **Clean Architecture** principles.

---

## 🏗 Project Structure

- **VeggieAI.Domain:** Contains Domain Entities (User, Recipe, MealPlan, CommunityPost), Enums, and Value Objects.
- **VeggieAI.Application:** Business Logic, Use Cases, DTOs, and Interfaces for AI solvers (`IMealPlannerService`, `IComputerVisionService`, `IChatbotService`).
- **VeggieAI.Infrastructure:** EF Core PostgreSQL Database Context (`Npgsql`), `pgvector` Vector Search integration, Redis Caching, and Google OR-Tools / ONNX Runtime C# AI implementations.
- **VeggieAI.API:** REST API Controllers, Middlewares, Dependency Injection, Swagger Documentation, JWT Authentication, and Health Checks.

---

## 🤖 Built-in .NET AI Engine Implementations
- **Meal Planner:** Powered by C# Linear Programming (`Google.OrTools`).
- **Computer Vision:** Powered by C# ONNX Runtime (`Microsoft.ML.OnnxRuntime`) for YOLOv8 object detection.
- **Nutrition Chatbot & RAG:** Powered by C# OpenAI / Semantic Kernel SDK + PostgreSQL `pgvector`.
