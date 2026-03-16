import { watch, readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, join } from "path";
import { randomUUID } from "crypto";

// --- CLI ---
const feature = process.argv[2];
if (!feature) {
  console.error("Usage: bun run feedback-server.ts <feature>");
  process.exit(1);
}

const artifactsDir = resolve(process.cwd(), "artifacts", feature);
const wireframePath = join(artifactsDir, "wireframe.html");
const feedbackPath = join(artifactsDir, "feedback.json");

if (!existsSync(wireframePath)) {
  console.error(`Not found: ${wireframePath}`);
  process.exit(1);
}

if (!existsSync(feedbackPath)) {
  writeFileSync(feedbackPath, "[]", "utf-8");
}

// --- State ---
const wsClients = new Set<any>();
let pendingPollResolvers: Array<(resp: Response) => void> = [];

// --- Broadcast reload ---
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
function broadcastReload() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    for (const ws of wsClients) {
      ws.send(JSON.stringify({ type: "reload" }));
    }
  }, 300);
}

// --- File watcher (directory-level for atomic write resilience) ---
const wireframeBasename = wireframePath.split("/").pop();
watch(artifactsDir, (_event, filename) => {
  if (filename === wireframeBasename) broadcastReload();
});

// --- Helpers ---
function readFeedback(): any[] {
  try {
    return JSON.parse(readFileSync(feedbackPath, "utf-8"));
  } catch {
    return [];
  }
}

function appendFeedback(item: any): any {
  const items = readFeedback();
  const saved = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    ...item,
  };
  items.push(saved);
  writeFileSync(feedbackPath, JSON.stringify(items, null, 2), "utf-8");
  return saved;
}

function injectOverlay(html: string): string {
  const script = `<script>${OVERLAY_SCRIPT}</script>`;
  const idx = html.lastIndexOf("</body>");
  if (idx === -1) return html + script;
  return html.slice(0, idx) + script + html.slice(idx);
}

// --- Overlay script (transpiled from overlay.ts at startup) ---
const overlayTs = readFileSync(join(import.meta.dir, "overlay.ts"), "utf-8");
const transpiler = new Bun.Transpiler({ loader: "ts" });
const OVERLAY_SCRIPT = transpiler.transformSync(overlayTs);

// --- Bun server ---
const server = Bun.serve({
  port: 3456,
  idleTimeout: 255, // max allowed by Bun (seconds) — long-poll needs this
  async fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === "/ws") {
      if (server.upgrade(req)) return;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    // Serve wireframe with overlay
    if (url.pathname === "/") {
      const html = readFileSync(wireframePath, "utf-8");
      return new Response(injectOverlay(html), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Long-poll: wait for next feedback
    if (url.pathname === "/api/next-feedback" && req.method === "GET") {
      return new Promise<Response>((resolve) => {
        pendingPollResolvers.push(resolve);
      });
    }

    // Manual reload trigger
    if (url.pathname === "/api/reload" && req.method === "POST") {
      broadcastReload();
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Shutdown
    if (url.pathname === "/api/shutdown" && req.method === "POST") {
      setTimeout(() => process.exit(0), 100);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
  websocket: {
    open(ws) {
      wsClients.add(ws);
    },
    message(ws, msg) {
      try {
        const data = JSON.parse(String(msg));
        if (data.type === "feedback") {
          const { type, ...rest } = data;
          const saved = appendFeedback(rest);

          // Resolve long-poll
          const resolvers = pendingPollResolvers;
          pendingPollResolvers = [];
          for (const resolve of resolvers) {
            resolve(
              new Response(JSON.stringify(saved), {
                headers: { "Content-Type": "application/json" },
              })
            );
          }
        }
      } catch {}
    },
    close(ws) {
      wsClients.delete(ws);
    },
  },
});

console.log(`Feedback server running at http://localhost:${server.port}`);
console.log(`Serving: ${wireframePath}`);
