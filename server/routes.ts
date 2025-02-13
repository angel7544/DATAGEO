import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertGpsPointSchema, insertTaskSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import express from 'express';

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // GPS Points
  app.get("/api/gps-points", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const points = await storage.getGpsPoints(req.user.id);
    res.json(points);
  });

  app.post("/api/gps-points", upload.single("imageFile"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const result = insertGpsPointSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);

    let imageUrl: string | undefined;
    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const newFileName = `${req.file.filename}${fileExt}`;
      const newPath = path.join("uploads", newFileName);
      await fs.rename(req.file.path, newPath);
      imageUrl = `/uploads/${newFileName}`;
    }

    const point = await storage.createGpsPoint(req.user.id, {
      ...result.data,
      imageUrl,
    });
    res.status(201).json(point);
  });

  app.delete("/api/gps-points/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteGpsPoint(parseInt(req.params.id), req.user.id);
    res.sendStatus(200);
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tasks = await storage.getTasks(req.user.id);
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const result = insertTaskSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);
    const task = await storage.createTask(req.user.id, result.data);
    res.status(201).json(task);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const task = await storage.updateTask(parseInt(req.params.id), req.user.id, req.body);
    res.json(task);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteTask(parseInt(req.params.id), req.user.id);
    res.sendStatus(200);
  });

  // CSV Export
  app.get("/api/export/gps-points", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const points = await storage.getGpsPoints(req.user.id);
    const csv = [
      "Latitude,Longitude,AP Name,Description,Created At",
      ...points.map(p =>
        `${p.latitude},${p.longitude},${p.apName},"${p.description}",${p.createdAt}`
      )
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=gps-points.csv");
    res.send(csv);
  });

  // Serve uploaded files
  app.use("/uploads", express.static("uploads"));

  const httpServer = createServer(app);
  return httpServer;
}