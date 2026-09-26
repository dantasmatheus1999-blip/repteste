import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import fs from "fs";
import { initializeApp, getApps } from "firebase/app";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, listAll } from "firebase/storage";

// Load Firebase Config safely
let serverStorage: any = null;
let serverFirebaseConfig: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    serverFirebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const firebaseApp = getApps().length === 0 ? initializeApp(serverFirebaseConfig) : getApps()[0];
    serverStorage = getStorage(firebaseApp);
    console.log("[Server] Firebase Storage initialized successfully.");
  }
} catch (fbErr) {
  console.warn("[Server] Could not initialize Firebase Storage on server:", fbErr);
}

// Multer memory storage - holds buffers in memory before uploading permanently to Firebase Storage
export const MAX_MAP_FILE_SIZE = 50 * 1024 * 1024; // 50 MB = 52.428.800 bytes

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MAP_FILE_SIZE } // 50MB limit = 52.428.800 bytes
});

// Legacy uploads dir for reading existing files if any
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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

  // Middlewares com tratamento amigável de limites de upload (50 MB)
  const handleFileUpload = (req: any, res: any, next: any) => {
    upload.single("file")(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ 
            error: "O arquivo é muito grande. O limite máximo para o mapa é de 50 MB." 
          });
        }
        return res.status(400).json({ error: `Erro no upload: ${err.message}` });
      }
      next();
    });
  };

  const handleMapUpload = (req: any, res: any, next: any) => {
    upload.single("map")(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ 
            error: "O arquivo é muito grande. O limite máximo para o mapa é de 50 MB." 
          });
        }
        return res.status(400).json({ error: `Erro no upload: ${err.message}` });
      }
      next();
    });
  };

  // Upload endpoint unificado permanente para qualquer arquivo (Mapas, Monstros, Fichas, Documentos, PDFs)
  app.post("/api/upload-file", handleFileUpload, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado." });
      }

      const category = (req.body.category || "other") as string;
      const cleanName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      const targetPath = req.body.storagePath || `${category}s/server_${Date.now()}_${cleanName}`;

      // Validação estrita específica para mapas (limite de 50 MB = 52.428.800 bytes)
      if ((category === "map" || targetPath.includes("map")) && req.file.size > MAX_MAP_FILE_SIZE) {
        return res.status(400).json({ error: "O arquivo é muito grande. O limite máximo para o mapa é de 50 MB." });
      }

      const filename = `${Date.now()}_${cleanName}`;
      const localFilePath = path.join(uploadsDir, filename);

      // 1. Salva permanentemente no disco do servidor
      fs.writeFileSync(localFilePath, req.file.buffer);
      let downloadUrl = `/uploads/${filename}`;
      console.log(`[Upload Server] Arquivo gravado permanentemente em disco: ${localFilePath} (${req.file.size} bytes)`);

      // 2. Tenta enviar para o Firebase Storage se configurado
      if (serverStorage) {
        try {
          console.log(`[Upload Server] Tentando espelhamento no Firebase Storage: ${targetPath}`);
          const sRef = storageRef(serverStorage, targetPath);
          const snapshot = await uploadBytes(sRef, req.file.buffer, {
            contentType: req.file.mimetype || "application/octet-stream"
          });
          const fbUrl = await getDownloadURL(snapshot.ref);
          if (fbUrl) {
            downloadUrl = fbUrl;
            console.log(`[Upload Server] Sucesso no Firebase Storage! URL permanente: ${downloadUrl}`);
          }
        } catch (fbErr: any) {
          console.warn(`[Upload Server] Firebase Storage indisponível ou não autorizado (${fbErr.code || fbErr.message}). Utilizando URL permanente do servidor: ${downloadUrl}`);
        }
      }

      return res.json({
        url: downloadUrl,
        storagePath: targetPath,
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      });
    } catch (err: any) {
      console.error("[Upload Server] Erro crítico no endpoint de upload:", err);
      return res.status(500).json({ error: err.message || "Erro no upload permanente" });
    }
  });

  // Upload endpoint de compatibilidade para mapas
  app.post("/api/upload-map", handleMapUpload, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum mapa enviado." });
      }

      // Validação estrita para mapas (limite de 50 MB = 52.428.800 bytes)
      if (req.file.size > MAX_MAP_FILE_SIZE) {
        return res.status(400).json({ error: "O arquivo é muito grande. O limite máximo para o mapa é de 50 MB." });
      }

      const userId = (req.body.userId || "anonymous") as string;
      const cleanName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      const targetPath = req.body.storagePath || `maps/${userId}/${Date.now()}_${cleanName}`;
      const filename = `map_${Date.now()}_${cleanName}`;
      const localFilePath = path.join(uploadsDir, filename);

      // 1. Salva permanentemente no disco do servidor
      fs.writeFileSync(localFilePath, req.file.buffer);
      let downloadUrl = `/uploads/${filename}`;
      console.log(`[Upload Map Server] Mapa gravado permanentemente em disco: ${localFilePath}`);

      // 2. Tenta espelhar no Firebase Storage se configurado
      if (serverStorage) {
        try {
          console.log(`[Upload Map Server] Tentando enviar mapa para Firebase Storage: ${targetPath}`);
          const sRef = storageRef(serverStorage, targetPath);
          const snapshot = await uploadBytes(sRef, req.file.buffer, {
            contentType: req.file.mimetype || "image/jpeg"
          });
          const fbUrl = await getDownloadURL(snapshot.ref);
          if (fbUrl) {
            downloadUrl = fbUrl;
            console.log(`[Upload Map Server] Mapa salvo permanentemente no Firebase Storage: ${downloadUrl}`);
          }
        } catch (fbErr: any) {
          console.warn(`[Upload Map Server] Firebase Storage indisponível (${fbErr.message}). Utilizando armazenamento do servidor: ${downloadUrl}`);
        }
      }

      return res.json({
        url: downloadUrl,
        storagePath: targetPath,
        name: req.file.originalname,
        size: req.file.size
      });
    } catch (err: any) {
      console.error("[Upload Map Server] Erro ao processar mapa:", err);
      return res.status(500).json({ error: err.message || "Erro no upload do mapa" });
    }
  });

  // Busca de imagens de monstros na internet (Wikimedia Commons + Domínio Público RPG)
  app.get("/api/search-monster-images", async (req, res) => {
    try {
      const q = ((req.query.q as string) || "").trim();
      if (!q) {
        return res.json({ results: [] });
      }

      // Mapeamento semântico português -> inglês para melhorar os resultados de RPG na Wikimedia Commons
      const dictionary: Record<string, string> = {
        "dragão": "dragon",
        "dragao": "dragon",
        "morto-vivo": "undead skeleton",
        "morto vivo": "undead skeleton",
        "esqueleto": "skeleton warrior",
        "zumbi": "zombie creature",
        "demônio": "demon fiend",
        "demonio": "demon fiend",
        "aberração": "monster tentacle creature",
        "aberracao": "monster tentacle creature",
        "animal": "beast creature wildlife",
        "lobo": "dire wolf",
        "urso": "bear beast",
        "aranha": "giant spider",
        "construto": "golem automaton statue",
        "golem": "golem statue",
        "elemental": "elemental fantasy",
        "fogo": "fire monster fantasy",
        "gelo": "frost ice monster",
        "humanoide": "warrior knight rpg fantasy",
        "orc": "orc warrior",
        "goblin": "goblin creature",
        "vampiro": "vampire gothic",
        "lich": "lich necromancer",
        "hidra": "hydra monster mythology",
        "manticora": "manticore creature mythology",
        "quimera": "chimera creature mythology",
        "basilisco": "basilisk creature mythology",
        "gargula": "gargoyle statue",
        "gárgula": "gargoyle statue"
      };

      let enrichedQuery = q.toLowerCase();
      for (const [pt, en] of Object.entries(dictionary)) {
        if (enrichedQuery.includes(pt)) {
          enrichedQuery = `${en} fantasy ${enrichedQuery.replace(pt, "")}`;
          break;
        }
      }

      if (!enrichedQuery.includes("fantasy") && !enrichedQuery.includes("monster") && !enrichedQuery.includes("dragon")) {
        enrichedQuery = `${enrichedQuery} fantasy monster`;
      }

      const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(enrichedQuery)}&gsrlimit=24&prop=imageinfo&iiprop=url&iiurlwidth=450&format=json`;

      const response = await fetch(wikiUrl, {
        headers: {
          "User-Agent": "Tormenta20RPGCompanion/1.0 (contact@tormentarpg.local; educational app)"
        }
      });

      if (!response.ok) {
        return res.json({ results: [] });
      }

      const data: any = await response.json();
      const pages = data?.query?.pages || {};
      const results: Array<{ id: string; title: string; thumbUrl: string; fullUrl: string; source: string }> = [];

      for (const pageId of Object.keys(pages)) {
        const page = pages[pageId];
        const info = page.imageinfo?.[0];
        if (!info) continue;

        const rawTitle = (page.title || "").replace(/^File:/i, "");
        // Filtrar apenas extensões de imagem comuns (evitar SVG, PDF, áudio, etc.)
        if (!rawTitle.match(/\.(jpg|jpeg|png|webp)$/i)) continue;

        // Limpar nome para exibição agradável
        const cleanTitle = rawTitle
          .replace(/\.[^/.]+$/, "")
          .replace(/[_-]+/g, " ")
          .trim();

        // Evitar banners de site, mapas geográficos ou logos modernos
        const lower = cleanTitle.toLowerCase();
        if (lower.includes("logo") || lower.includes("flag") || lower.includes("map of") || lower.includes("diagram")) {
          continue;
        }

        results.push({
          id: `wiki_${page.pageid}`,
          title: cleanTitle,
          thumbUrl: info.thumburl || info.url,
          fullUrl: info.url,
          source: "Wikimedia Commons (Domínio Público / CC)"
        });
      }

      return res.json({ results });
    } catch (err: any) {
      console.error("[Search Monster Images] Erro na busca remota:", err);
      return res.status(500).json({ error: "Erro ao buscar imagens na internet" });
    }
  });

  // Proxy de imagem do Firebase Storage para contornar qualquer restrição de CORS no navegador
  app.get("/api/storage/proxy-image", async (req, res) => {
    try {
      const imagePath = req.query.path as string;
      const directUrl = req.query.url as string;
      const token = req.query.token as string;
      const bucket = serverFirebaseConfig?.storageBucket || "gen-lang-client-0150741197.firebasestorage.app";

      let targetUrl = directUrl;
      if (!targetUrl && imagePath) {
        targetUrl = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(imagePath)}?alt=media`;
        if (token) {
          targetUrl += `&token=${encodeURIComponent(token)}`;
        }
      }

      if (!targetUrl) {
        return res.status(400).send("No image specified");
      }

      const headers: Record<string, string> = {};
      const authHeader = (req.headers.authorization || (token ? `Bearer ${token}` : undefined)) as string | undefined;
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      const imgRes = await fetch(targetUrl, { headers });
      if (!imgRes.ok) {
        return res.status(imgRes.status).send(`Failed to fetch image: ${imgRes.statusText}`);
      }

      res.setHeader("Content-Type", imgRes.headers.get("content-type") || "image/png");
      res.setHeader("Cache-Control", "public, max-age=86400");
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      return res.send(buffer);
    } catch (err: any) {
      console.error("[Proxy Image] Erro ao carregar imagem:", err);
      return res.status(500).send("Error fetching image");
    }
  });

  // Upload/cópia definitiva de imagem remota da internet para o servidor e Firebase Storage
  app.post("/api/upload-from-url", async (req, res) => {
    try {
      const { url, category = "monster", name = "monster" } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL da imagem não fornecida." });
      }

      console.log(`[Upload From URL] Baixando imagem externa para armazenamento permanente: ${url}`);
      const imgRes = await fetch(url, {
        headers: {
          "User-Agent": "Tormenta20RPGCompanion/1.0 (educational app)"
        }
      });

      if (!imgRes.ok) {
        throw new Error(`Falha ao baixar imagem remota: ${imgRes.status} ${imgRes.statusText}`);
      }

      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = imgRes.headers.get("content-type") || "image/png";
      const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") 
        ? "jpg" 
        : mimeType.includes("webp") 
          ? "webp" 
          : "png";

      const cleanName = (name || "creature").replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${Date.now()}_${cleanName}.${ext}`;
      const localFilePath = path.join(uploadsDir, filename);

      // 1. Grava no disco permanente do servidor
      fs.writeFileSync(localFilePath, buffer);
      let downloadUrl = `/uploads/${filename}`;
      const targetPath = `${category}s/${Date.now()}_${cleanName}.${ext}`;
      console.log(`[Upload From URL] Imagem gravada permanentemente no servidor: ${localFilePath}`);

      // 2. Tenta espelhar no Firebase Storage se configurado
      if (serverStorage) {
        try {
          const sRef = storageRef(serverStorage, targetPath);
          const snapshot = await uploadBytes(sRef, buffer, { contentType: mimeType });
          const fbUrl = await getDownloadURL(snapshot.ref);
          if (fbUrl) {
            downloadUrl = fbUrl;
            console.log(`[Upload From URL] Imagem espelhada no Firebase Storage: ${downloadUrl}`);
          }
        } catch (fbErr: any) {
          console.warn(`[Upload From URL] Firebase Storage indisponível (${fbErr.message}). Utilizando URL local do servidor: ${downloadUrl}`);
        }
      }

      return res.json({
        url: downloadUrl,
        storagePath: targetPath,
        size: buffer.length,
        mimeType
      });
    } catch (err: any) {
      console.error("[Upload From URL] Erro ao processar:", err);
      return res.status(500).json({ error: err.message || "Erro ao transferir imagem para o storage permanente" });
    }
  });

  // 404 for API - prevent falling back to SPA HTML
  app.get("/api/*", (req, res) => {
    res.status(404).json({ error: "API endpoint não encontrado" });
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
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
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

  // Multer error handling middleware (interrompe uploads que excedam 50 MB)
  app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ 
          error: "O arquivo é muito grande. O limite máximo para o mapa é de 50 MB." 
        });
      }
      return res.status(400).json({ error: `Erro no upload: ${err.message}` });
    }
    next(err);
  });

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("[Global Error]:", err);
    res.status(500).json({ error: "Internal Server Error", details: String(err) });
  });
}

startServer();
