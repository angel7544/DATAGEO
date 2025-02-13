import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Middleware to check if user is admin
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (!req.user.isAdmin && !req.user.isSuperAdmin) return res.sendStatus(403);
  next();
}

// Middleware to check if user is super admin
export function isSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (!req.user.isSuperAdmin) return res.sendStatus(403);
  next();
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Admin Routes
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // Special route to create the first super admin if none exists
  app.post("/api/setup-super-admin", async (req, res) => {
    const users = await storage.getAllUsers();
    if (users.length > 0) {
      return res.status(403).send("Super admin can only be created when there are no existing users");
    }

    const { username, password } = req.body;
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      username,
      password: await hashPassword(password),
      isAdmin: true,
      isSuperAdmin: true,
    });

    req.login(user, (err) => {
      if (err) return res.status(500).send(err); //Error handling improved
      res.status(201).json(user);
    });
  });


  // Update existing admin routes to check for super admin status
  app.post("/api/admin/users", isAdmin, async (req, res) => {
    const { username, password, isAdmin } = req.body;

    // Only super admin can create admin users
    if (isAdmin && !req.user.isSuperAdmin) {
      return res.status(403).send("Only super admin can create admin users");
    }

    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      username,
      password: await hashPassword(password),
      isAdmin,
      isSuperAdmin: false, // Only the first user can be super admin
      createdBy: req.user.id,
    });

    await storage.createAdminLog(
      req.user.id,
      "CREATE_USER",
      user.id,
      `Created user ${username} with admin=${isAdmin}`
    );

    res.status(201).json(user);
  });

  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    const targetUser = await storage.getUser(userId);

    if (!targetUser) {
      return res.status(404).send("User not found");
    }

    // Only super admin can delete admin users
    if (targetUser.isAdmin && !req.user.isSuperAdmin) {
      return res.status(403).send("Only super admin can delete admin users");
    }

    // Cannot delete your own account or other super admins
    if (userId === req.user.id || targetUser.isSuperAdmin) {
      return res.status(400).send("Cannot delete this user");
    }

    await storage.deleteUser(userId);
    await storage.createAdminLog(
      req.user.id,
      "DELETE_USER",
      userId,
      `Deleted user ${targetUser.username}`
    );

    res.sendStatus(200);
  });

  app.get("/api/admin/logs", isAdmin, async (req, res) => {
    const logs = await storage.getAdminLogs();
    res.json(logs);
  });

  app.get("/api/admin/data", isAdmin, async (req, res) => {
    const [users, points, tasks] = await Promise.all([
      storage.getAllUsers(),
      storage.getAllGpsPoints(),
      storage.getAllTasks(),
    ]);

    res.json({
      users,
      points,
      tasks,
    });
  });
}