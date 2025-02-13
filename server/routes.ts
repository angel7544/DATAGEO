import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertGpsPointSchema, insertTaskSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.get("/api/gps-points", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const points = await storage.getGpsPoints(req.user.id);
    res.json(points);
  });

  app.post("/api/gps-points", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const point = insertGpsPointSchema.parse(req.body);
    const created = await storage.createGpsPoint(req.user.id, point);
    res.status(201).json(created);
  });

  app.get("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tasks = await storage.getTasks(req.user.id);
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const task = insertTaskSchema.parse(req.body);
    const created = await storage.createTask(req.user.id, task);
    res.status(201).json(created);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const updated = await storage.updateTask(parseInt(req.params.id), req.body);
    res.json(updated);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteTask(parseInt(req.params.id));
    res.sendStatus(204);
  });

  const httpServer = createServer(app);
  return httpServer;
}
