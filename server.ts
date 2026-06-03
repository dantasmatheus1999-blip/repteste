import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists - Use a dedicated folder outside of public for runtime assets
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Double check directory exists on every upload
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Logging middleware - Filtered to reduce noise from source files
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const isSourceFile = req.url.match(/\.(tsx|ts|jsx|js|css|json|png|jpg|jpeg|svg|ico)$/) || req.url.includes('/node_modules/');
      const isSuccess = res.statusCode < 400;

      // Only log API calls, non-source files, or any errors
      if (!isSourceFile || !isSuccess || req.url.startsWith('/api/')) {
        console.log(`[Server] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
      }
    });
    next();
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/ping", (req, res) => res.json({ status: "ok", message: "pong" }));

  // Serve uploads directory explicitly
  app.use("/uploads", express.static(uploadsDir));

  // 404 for uploads - prevent falling back to SPA HTML
  app.get("/uploads/*", (req, res) => {
    // If it's an image, return a clean 404 without JSON body to avoid confusing loaders
    if (req.url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) {
      return res.status(404).end();
    }
    res.status(404).json({ error: "Arquivo não encontrado no servidor" });
  });

  // 404 for API - prevent falling back to SPA HTML
  app.get("/api/*", (req, res) => {
    res.status(404).json({ error: "API endpoint não encontrado" });
  });

  // Upload endpoint
  app.post("/api/upload-map", (req, res, next) => {
    console.log("[Upload] Attempting upload...");
    next();
  }, upload.single("map"), (req, res) => {
    console.log("[Upload] File received:", req.file);
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // Proxy for ComfyUI to bypass CORS
  app.all("/api/comfy-proxy/*", async (req, res) => {
    const targetUrl = (process.env.COMFYUI_URL || "https://norman-sierra-concern-plant.trycloudflare.com").replace(/\/$/, "");
    const path = (req.params[0] || "").replace(/^\//, "");
    const query = new URLSearchParams(req.query as any).toString();
    const url = `${targetUrl}/${path}${query ? `?${query}` : ""}`;

    console.log(`[ComfyUI Proxy] ${req.method} /${path} -> ${url}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const response = await fetch(url, {
        method: req.method,
        headers: {
          "Accept": "*/*",
          "User-Agent": "MythosCompanion/1.0",
          ...(req.headers["content-type"] ? { "Content-Type": req.headers["content-type"] } : {})
        },
        body: ["POST", "PUT", "PATCH"].includes(req.method) ? JSON.stringify(req.body) : undefined,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log(`[ComfyUI Proxy] Response: ${response.status} ${response.statusText}`);

      const contentType = response.headers.get("content-type");
      res.setHeader("Content-Type", contentType || "application/json");

      if (contentType?.includes("image")) {
        const buffer = await response.arrayBuffer();
        console.log(`[ComfyUI Proxy] Sending image buffer: ${buffer.byteLength} bytes`);
        res.send(Buffer.from(buffer));
      } else {
        const data = await response.text();
        res.status(response.status).send(data);
      }
    } catch (error: any) {
      console.error("[Proxy Error]:", error);
      let status = 500;
      let message = "Failed to proxy request to ComfyUI";
      
      if (error.name === 'AbortError') {
        status = 504;
        message = "Request to ComfyUI timed out";
      } else if (error.code === 'ENOTFOUND') {
        status = 502;
        message = "ComfyUI server not found. The URL might be invalid or the tunnel is down.";
      }
      
      res.status(status).json({ 
        error: message, 
        details: String(error),
        tip: "Check if COMFYUI_URL is correctly set in your environment variables."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("[Global Error]:", err);
    res.status(500).json({ error: "Internal Server Error", details: String(err) });
  });
}

startServer();
