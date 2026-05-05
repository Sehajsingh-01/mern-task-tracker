/**
 * ============================================================
 *  server.js  ·  Express + MongoDB Entry Point
 * ============================================================
 *
 *  This is the main backend server file for the MERN Task
 *  Tracker.  In a real deployment it runs with:
 *    node server.js   OR   nodemon server.js
 *
 *  Architecture overview:
 *    Express app  →  Routes  →  Controllers  →  Mongoose Model
 *                                                    ↓
 *                                             MongoDB Atlas
 *
 *  Interview talking points:
 *    • Why we use dotenv for environment variables
 *    • CORS configuration for cross-origin React requests
 *    • Middleware stack order (body-parser before routes)
 *    • Async error handling pattern in Express
 *    • RESTful resource naming conventions (/api/tasks)
 * ============================================================
 */

// ─── Core Dependencies ────────────────────────────────────────
// const express    = require("express");
// const mongoose   = require("mongoose");
// const cors       = require("cors");
// const dotenv     = require("dotenv");
// const Task       = require("./models/TaskModel");

// Load environment variables from .env BEFORE anything else
// dotenv.config();

// ─── Express App Initialisation ───────────────────────────────
// const app  = express();
// const PORT = process.env.PORT || 5000;

// ─── Middleware Stack ─────────────────────────────────────────
/*
 *  app.use(cors({
 *    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
 *    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
 *    credentials: true,
 *  }));
 *
 *  // Parse incoming JSON request bodies
 *  app.use(express.json());
 *
 *  // Parse URL-encoded form data
 *  app.use(express.urlencoded({ extended: true }));
 */

// ─── MongoDB Connection ───────────────────────────────────────
/*
 *  mongoose
 *    .connect(process.env.MONGO_URI, {
 *      useNewUrlParser:    true,
 *      useUnifiedTopology: true,
 *    })
 *    .then(() => console.log("✅  MongoDB connected successfully"))
 *    .catch((err) => {
 *      console.error("❌  MongoDB connection error:", err.message);
 *      process.exit(1);   // Exit if DB is unreachable
 *    });
 */

// ─── RESTful API Routes ───────────────────────────────────────
/*
 *  Base URL:  /api/tasks
 *
 *  METHOD   PATH                  ACTION
 *  ─────── ──────────────────── ─────────────────────────────
 *  GET      /api/tasks            Fetch all tasks
 *  POST     /api/tasks            Create a new task
 *  PUT      /api/tasks/:id        Full update of a task
 *  PATCH    /api/tasks/:id/toggle Toggle completed status
 *  DELETE   /api/tasks/:id        Delete a task
 */

// ── GET /api/tasks ──────────────────────────────────────────
/*
 *  app.get("/api/tasks", async (req, res) => {
 *    try {
 *      // Find all tasks, newest first
 *      const tasks = await Task.find().sort({ createdAt: -1 });
 *      res.status(200).json({ success: true, count: tasks.length, data: tasks });
 *    } catch (error) {
 *      res.status(500).json({ success: false, message: error.message });
 *    }
 *  });
 */

// ── POST /api/tasks ─────────────────────────────────────────
/*
 *  app.post("/api/tasks", async (req, res) => {
 *    try {
 *      const { title, description, priority, category, dueDate } = req.body;
 *
 *      // Mongoose validation runs automatically here
 *      const task = await Task.create({
 *        title,
 *        description,
 *        priority,
 *        category,
 *        dueDate,
 *      });
 *
 *      res.status(201).json({ success: true, data: task });
 *    } catch (error) {
 *      // Distinguish validation errors (400) from server errors (500)
 *      if (error.name === "ValidationError") {
 *        return res.status(400).json({ success: false, message: error.message });
 *      }
 *      res.status(500).json({ success: false, message: error.message });
 *    }
 *  });
 */

// ── PATCH /api/tasks/:id/toggle ─────────────────────────────
/*
 *  app.patch("/api/tasks/:id/toggle", async (req, res) => {
 *    try {
 *      const task = await Task.findById(req.params.id);
 *      if (!task) {
 *        return res.status(404).json({ success: false, message: "Task not found" });
 *      }
 *
 *      // Flip the completed boolean
 *      task.completed = !task.completed;
 *      await task.save();
 *
 *      res.status(200).json({ success: true, data: task });
 *    } catch (error) {
 *      res.status(500).json({ success: false, message: error.message });
 *    }
 *  });
 */

// ── PUT /api/tasks/:id ──────────────────────────────────────
/*
 *  app.put("/api/tasks/:id", async (req, res) => {
 *    try {
 *      const task = await Task.findByIdAndUpdate(
 *        req.params.id,
 *        req.body,
 *        {
 *          new: true,            // Return updated document
 *          runValidators: true,  // Re-run schema validators
 *        }
 *      );
 *      if (!task) {
 *        return res.status(404).json({ success: false, message: "Task not found" });
 *      }
 *      res.status(200).json({ success: true, data: task });
 *    } catch (error) {
 *      res.status(500).json({ success: false, message: error.message });
 *    }
 *  });
 */

// ── DELETE /api/tasks/:id ───────────────────────────────────
/*
 *  app.delete("/api/tasks/:id", async (req, res) => {
 *    try {
 *      const task = await Task.findByIdAndDelete(req.params.id);
 *      if (!task) {
 *        return res.status(404).json({ success: false, message: "Task not found" });
 *      }
 *      res.status(200).json({ success: true, message: "Task deleted successfully" });
 *    } catch (error) {
 *      res.status(500).json({ success: false, message: error.message });
 *    }
 *  });
 */

// ─── Global Error Handler Middleware ──────────────────────────
/*
 *  // Must have FOUR parameters — Express identifies it as error middleware
 *  app.use((err, req, res, next) => {
 *    console.error(err.stack);
 *    res.status(err.status || 500).json({
 *      success: false,
 *      message: err.message || "Internal Server Error",
 *    });
 *  });
 */

// ─── Start the Server ─────────────────────────────────────────
/*
 *  app.listen(PORT, () => {
 *    console.log(`🚀  Server running on http://localhost:${PORT}`);
 *    console.log(`📦  Environment: ${process.env.NODE_ENV || "development"}`);
 *  });
 */

/**
 * ─── .env File Template ───────────────────────────────────────
 *
 *  Create a file named  .env  in the project root:
 *
 *    PORT=5000
 *    MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/tasktracker
 *    NODE_ENV=development
 *    CLIENT_ORIGIN=http://localhost:5173
 *
 *  ⚠️  NEVER commit .env to Git — add it to .gitignore
 */

/**
 * ─── package.json Scripts (server) ───────────────────────────
 *
 *  "scripts": {
 *    "start":  "node server.js",
 *    "dev":    "nodemon server.js",
 *    "test":   "jest --coverage"
 *  }
 *
 *  Required npm packages:
 *    npm install express mongoose cors dotenv
 *    npm install --save-dev nodemon jest
 */

export {};   // Makes this a valid ES module for the browser build
