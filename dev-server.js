#!/usr/bin/env node
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
const fs = require("fs");

const app = express();
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = process.env.PORT || 3000;

// Load vercel.json if present to apply rewrites/cleanUrls
let vercelConfig = {};
const vercelPath = path.join(__dirname, "vercel.json");
if (fs.existsSync(vercelPath)) {
  try {
    vercelConfig = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
  } catch (err) {
    console.warn("dev-server: erro ao ler vercel.json:", err.message);
  }
}

// Apply explicit rewrites from vercel.json before static handling
if (Array.isArray(vercelConfig.rewrites)) {
  vercelConfig.rewrites.forEach((rewrite) => {
    const src = rewrite.source || rewrite.src || rewrite.from;
    const dest = rewrite.destination || rewrite.dest || rewrite.to;
    if (!src || !dest) return;

    // Express route: use the source as-is (vercel pattern like /c/:slug maps to express)
    app.get(src, (req, res) => {
      const target = path.join(PUBLIC_DIR, dest.replace(/^\//, ""));
      if (fs.existsSync(target)) {
        return res.sendFile(target);
      }
      return res.status(404).send("Not Found");
    });
  });
}

// Proxy /api to local backend (assumes backend runs on 3001)
app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    onError: (err, req, res) => {
      res.status(502).send("Backend unavailable (proxy error)");
    },
  }),
);

// cleanUrls: if request has no extension and a corresponding .html exists, serve it
app.use((req, res, next) => {
  // ignore api and assets
  if (req.path.startsWith("/api") || path.extname(req.path)) return next();

  if (vercelConfig.cleanUrls) {
    const candidate = path.join(
      PUBLIC_DIR,
      req.path.replace(/^\//, "") + ".html",
    );
    if (fs.existsSync(candidate)) {
      return res.sendFile(candidate);
    }
  }

  next();
});

// Serve static files (falls back to index.html for directories if present)
app.use(
  express.static(PUBLIC_DIR, { extensions: ["html"], index: "index.html" }),
);

// If not found, return 404
app.use((req, res) => {
  res.status(404).send("404: NOT_FOUND");
});

app.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
  console.log("Serving static files from", PUBLIC_DIR);
  if (vercelConfig.cleanUrls)
    console.log("cleanUrls enabled (serving /foo -> /foo.html)");
  if (Array.isArray(vercelConfig.rewrites) && vercelConfig.rewrites.length) {
    console.log("Rewrites:");
    vercelConfig.rewrites.forEach((r) =>
      console.log(`  ${r.source} -> ${r.destination}`),
    );
  }
});
