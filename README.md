# 🚀 Webhook Event Relay System (Backend)

The **Webhook Event Relay System** is a backend service built using **Node.js**, **PostgreSQL**, and **Prisma ORM**.  
It acts as a bridge between external services and client applications by **receiving, processing, and relaying webhook events** in real-time — for example, job application updates on a candidate dashboard.

---

## 🧠 Overview

When an event occurs (e.g., a candidate applies for a job), the external system triggers a **webhook** to this backend.  
This service:
1. Receives and validates the webhook payload.
2. Stores the event in a **PostgreSQL** database using **Prisma**.
3. Relays the event to the appropriate client or service (e.g., via REST API, BullMQ).
4. Updates the event status and maintains a complete event log for reliability.

---

## 🛠️ Tech Stack

| Technology | Description |
|-------------|-------------|
| **Node.js** | Backend runtime environment |
| **Express.js** | Web framework for handling routes and middleware |
| **PostgreSQL (Neon)** | Cloud-hosted relational database for persistence |
| **Prisma ORM** | Database ORM for schema management and type-safe queries |
| **dotenv** | Environment variable management |
| **axios** | Used for relaying webhook events to other endpoints |
| **nodemon** | Development hot reloading |

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add:

env
DATABASE_URL="postgresql://<username>:<password>@<host>/<database>?sslmode=require"  
PORT=5000  
REDIS_URL=redis://127.0.0.1:PORT_ON_WHICH_REDIS_IS_RUNNING

---

## 🧩 Prisma Setup
1.Initialize Prisma:npx prisma init  
2.Push the schema to the database:npx prisma db push

---
## 🚀 Getting Started
1️⃣ Clone the repository: git clone https://github.com/abhimanyu-code699/webhook-event-relay-system.git  
2️⃣ Install dependencies: npm install  
3️⃣ Set up environment: Create your .env file as shown above.  
4️⃣ Run database migration: npx prisma migrate dev --name init  
5️⃣ Start the server: npm run dev
