import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { createServer as createNetServer } from "node:net";
import { createServer as createHttpServer } from "node:http";

async function isPortAvailable(port: number) {
  return new Promise<boolean>((resolve) => {
    const server = createNetServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "0.0.0.0");
  });
}

async function findAvailablePort(preferredPort: number, attempts = 20) {
  for (let offset = 0; offset < attempts; offset += 1) {
    const candidate = preferredPort + offset;
    if (await isPortAvailable(candidate)) {
      return candidate;
    }
  }

  throw new Error(`No available port found from ${preferredPort} to ${preferredPort + attempts - 1}.`);
}

async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const preferredPort = Number(process.env.PORT) || 3000;
  const PORT = await findAvailablePort(preferredPort);

  app.use(express.json());

  // API routes
  // Note: In a real app, you'd use Firestore or MongoDB here.
  // We'll use a mock in-memory store for the "backend" part of the request
  // but the frontend will also use Firestore for persistence as per standard.
  // However, to satisfy the "full-stack" requirement with specific endpoints:
  
  const wasteLogs: any[] = [];
  const pollutionReports: any[] = [];

  app.post("/api/waste", (req, res) => {
    const { plastic, organic, recyclable, userId } = req.body;
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      plastic,
      organic,
      recyclable,
      date: new Date().toISOString(),
    };
    wasteLogs.push(newLog);
    res.status(201).json(newLog);
  });

  app.get("/api/waste", (req, res) => {
    res.json(wasteLogs);
  });

  app.post("/api/pollution", (req, res) => {
    const { latitude, longitude, description, imageUrl, userId, intensity } = req.body;
    const newReport = {
      id: Math.random().toString(36).substr(2, 9),
      latitude,
      longitude,
      description,
      imageUrl,
      userId,
      intensity: intensity || 1,
      createdAt: new Date().toISOString(),
    };
    pollutionReports.push(newReport);
    res.status(201).json(newReport);
  });

  app.get("/api/pollution", (req, res) => {
    res.json(pollutionReports);
  });

  app.post("/api/resources/analyze", (req, res) => {
    const { population, catch: fishingCatch } = req.body;
    const safeLimit = population * 0.3;
    const status = fishingCatch > safeLimit ? "Overfishing" : "Safe";
    const recommendation = fishingCatch > safeLimit 
      ? "CRITICAL: Reduce fishing intensity immediately to avoid ecosystem collapse." 
      : "Sustainable: Current fishing levels are within safe biological limits.";

    res.json({
      safeLimit,
      status,
      recommendation,
      usagePercent: (fishingCatch / population) * 100,
      limitPercent: 30
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    if (PORT !== preferredPort) {
      console.warn(`Port ${preferredPort} is busy; using http://localhost:${PORT} instead.`);
    }

    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
