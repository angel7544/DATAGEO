import { User, InsertUser, GpsPoint, InsertGpsPoint, Task, InsertTask } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createGpsPoint(userId: number, point: InsertGpsPoint): Promise<GpsPoint>;
  getGpsPoints(userId: number): Promise<GpsPoint[]>;
  
  createTask(userId: number, task: InsertTask): Promise<Task>;
  getTasks(userId: number): Promise<Task[]>;
  updateTask(id: number, task: Partial<Task>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gpsPoints: Map<number, GpsPoint>;
  private tasks: Map<number, Task>;
  sessionStore: session.Store;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.gpsPoints = new Map();
    this.tasks = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createGpsPoint(userId: number, point: InsertGpsPoint): Promise<GpsPoint> {
    const id = this.currentId++;
    const gpsPoint: GpsPoint = { ...point, id, userId };
    this.gpsPoints.set(id, gpsPoint);
    return gpsPoint;
  }

  async getGpsPoints(userId: number): Promise<GpsPoint[]> {
    return Array.from(this.gpsPoints.values()).filter(
      (point) => point.userId === userId,
    );
  }

  async createTask(userId: number, task: InsertTask): Promise<Task> {
    const id = this.currentId++;
    const newTask: Task = { ...task, id, userId, completed: false };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId,
    );
  }

  async updateTask(id: number, update: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Task not found");
    const updatedTask = { ...task, ...update };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    this.tasks.delete(id);
  }
}

export const storage = new MemStorage();
