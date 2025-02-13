import { User, InsertUser, GpsPoint, InsertGpsPoint, Task, InsertTask, AdminLog } from "@shared/schema";
import session from "express-session";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, gpsPoints, tasks, adminLogs } from "@shared/schema";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User Management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { isAdmin?: boolean, createdBy?: number }): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;

  // GPS Points
  getGpsPoints(userId: number): Promise<GpsPoint[]>;
  getAllGpsPoints(): Promise<GpsPoint[]>;
  createGpsPoint(userId: number, point: InsertGpsPoint): Promise<GpsPoint>;
  deleteGpsPoint(id: number, userId: number): Promise<void>;

  // Tasks
  getTasks(userId: number): Promise<Task[]>;
  getAllTasks(): Promise<Task[]>;
  createTask(userId: number, task: InsertTask): Promise<Task>;
  updateTask(id: number, userId: number, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: number, userId: number): Promise<void>;

  // Admin Logs
  createAdminLog(adminId: number, action: string, targetUserId?: number, details?: string): Promise<AdminLog>;
  getAdminLogs(): Promise<AdminLog[]>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser & { isAdmin?: boolean, createdBy?: number }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // GPS Points
  async getGpsPoints(userId: number): Promise<GpsPoint[]> {
    return db.select().from(gpsPoints).where(eq(gpsPoints.userId, userId));
  }

  async getAllGpsPoints(): Promise<GpsPoint[]> {
    return db.select().from(gpsPoints);
  }

  async createGpsPoint(userId: number, point: InsertGpsPoint): Promise<GpsPoint> {
    const [gpsPoint] = await db
      .insert(gpsPoints)
      .values({ ...point, userId })
      .returning();
    return gpsPoint;
  }

  async deleteGpsPoint(id: number, userId: number): Promise<void> {
    await db.delete(gpsPoints).where(eq(gpsPoints.id, id));
  }

  // Tasks
  async getTasks(userId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async getAllTasks(): Promise<Task[]> {
    return db.select().from(tasks);
  }

  async createTask(userId: number, task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values({ ...task, userId })
      .returning();
    return newTask;
  }

  async updateTask(id: number, userId: number, updates: Partial<Task>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number, userId: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Admin Logs
  async createAdminLog(adminId: number, action: string, targetUserId?: number, details?: string): Promise<AdminLog> {
    const [log] = await db
      .insert(adminLogs)
      .values({ adminId, action, targetUserId, details })
      .returning();
    return log;
  }

  async getAdminLogs(): Promise<AdminLog[]> {
    return db.select().from(adminLogs);
  }
}

export const storage = new DatabaseStorage();