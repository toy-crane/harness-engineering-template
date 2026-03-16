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

// --- Overlay script (injected into wireframe) ---
const OVERLAY_SCRIPT = `
(function() {
  // --- Shadow DOM root ---
  var root = document.createElement('div');
  root.id = 'wf-feedback-root';
  document.body.appendChild(root);
  var shadow = root.attachShadow({ mode: 'open' });

  shadow.innerHTML = '<style>' +
    ':host { all: initial; }' +
    '.wf-toggle { position: fixed; bottom: 20px; right: 20px; z-index: 99999; ' +
      'width: 44px; height: 44px; border-radius: 12px; border: 1px solid hsl(214.3 31.8% 91.4%); ' +
      'background: hsl(0 0% 100%); cursor: pointer; display: flex; align-items: center; ' +
      'justify-content: center; font-family: sans-serif; color: hsl(215.4 16.3% 46.9%); ' +
      'box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06); ' +
      'transition: all 0.15s ease; }' +
    '.wf-toggle:hover { background: hsl(210 40% 96.1%); color: hsl(222.2 47.4% 11.2%); }' +
    '.wf-toggle.active { background: hsl(222.2 47.4% 11.2%); color: hsl(210 40% 98%); ' +
      'border-color: hsl(222.2 47.4% 11.2%); }' +
    '.wf-toggle.active svg { stroke: hsl(210 40% 98%); }' +
    '.wf-highlight { position: absolute; background: rgba(59,130,246,0.15); ' +
      'border: 2px solid rgba(59,130,246,0.5); pointer-events: none; z-index: 99990; ' +
      'border-radius: 2px; transition: all 0.1s; }' +
    '.wf-panel { position: absolute; z-index: 99995; background: #fff; ' +
      'border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; width: 280px; ' +
      'box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-family: sans-serif; }' +
    '.wf-panel textarea { width: 100%; height: 64px; border: 1px solid #d1d5db; ' +
      'border-radius: 4px; padding: 8px; font-size: 13px; resize: vertical; ' +
      'font-family: sans-serif; box-sizing: border-box; }' +
    '.wf-panel-buttons { display: flex; gap: 8px; margin-top: 8px; justify-content: flex-end; }' +
    '.wf-panel button { padding: 4px 12px; border-radius: 4px; font-size: 13px; ' +
      'cursor: pointer; border: 1px solid #d1d5db; background: #fff; font-family: sans-serif; }' +
    '.wf-panel button.primary { background: #3b82f6; color: #fff; border-color: #3b82f6; }' +
    '.wf-panel .wf-selector { font-size: 11px; color: #9ca3af; margin-bottom: 8px; ' +
      'word-break: break-all; }' +
    '.wf-dot { position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; ' +
      'border-radius: 50%; border: 2px solid #fff; transition: background 0.3s; }' +
    '.wf-dot.connected { background: #22c55e; }' +
    '.wf-dot.disconnected { background: #ef4444; }' +
    '.wf-dot.connecting { background: #f59e0b; }' +
  '</style>' +
  '<div class="wf-toggle" id="wf-toggle-btn" title="Feedback mode">' +
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z"/>' +
    '</svg>' +
    '<div class="wf-dot connecting" id="wf-dot"></div>' +
  '</div>' +
  '<div class="wf-highlight" id="wf-highlight" style="display:none"></div>';

  var toggleBtn = shadow.getElementById('wf-toggle-btn');
  var highlightEl = shadow.getElementById('wf-highlight');
  var dotEl = shadow.getElementById('wf-dot');
  var feedbackMode = false;
  var currentPanel = null;
  var ws = null;
  var reconnectDelay = 1000;

  // --- WebSocket ---
  function connectWS() {
    ws = new WebSocket('ws://' + location.host + '/ws');
    ws.onopen = function() {
      reconnectDelay = 1000;
      dotEl.className = 'wf-dot connected';
      toggleBtn.title = 'Feedback mode (connected)';
    };
    ws.onmessage = function(e) {
      var msg = JSON.parse(e.data);
      if (msg.type === 'reload') location.reload();
    };
    ws.onclose = function() {
      dotEl.className = 'wf-dot disconnected';
      toggleBtn.title = 'Feedback mode (disconnected)';
      setTimeout(function() {
        reconnectDelay = Math.min(reconnectDelay * 2, 10000);
        connectWS();
      }, reconnectDelay);
    };
    ws.onerror = function() { ws.close(); };
  }
  connectWS();

  // --- Toggle ---
  toggleBtn.addEventListener('click', function() {
    feedbackMode = !feedbackMode;
    toggleBtn.classList.toggle('active', feedbackMode);
    if (!feedbackMode) {
      highlightEl.style.display = 'none';
      removePanel();
    }
  });

  // --- Selector generation ---
  function buildSelector(el) {
    var parts = [];
    var cur = el;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      if (cur.id) {
        parts.unshift('#' + cur.id);
        break;
      }
      var tag = cur.tagName;
      var parent = cur.parentElement;
      if (parent) {
        var siblings = Array.from(parent.children);
        var idx = siblings.indexOf(cur) + 1;
        parts.unshift(tag + ':nth-child(' + idx + ')');
      } else {
        parts.unshift(tag);
      }
      cur = parent;
    }
    return parts.join(' > ');
  }

  function getScreenId() {
    var active = document.querySelector('.screen.active');
    return active ? active.id.replace('screen-', '') : 'unknown';
  }

  // --- Hover highlight ---
  document.addEventListener('mousemove', function(e) {
    if (!feedbackMode) return;
    var target = e.target;
    if (!target || target.closest('#wf-feedback-root') || target.closest('nav')) {
      highlightEl.style.display = 'none';
      return;
    }
    var screen = target.closest('.screen.active');
    if (!screen) { highlightEl.style.display = 'none'; return; }
    var rect = target.getBoundingClientRect();
    highlightEl.style.display = 'block';
    highlightEl.style.top = (rect.top + window.scrollY) + 'px';
    highlightEl.style.left = (rect.left + window.scrollX) + 'px';
    highlightEl.style.width = rect.width + 'px';
    highlightEl.style.height = rect.height + 'px';
  });

  // --- Click → feedback panel ---
  document.addEventListener('click', function(e) {
    if (!feedbackMode) return;
    var target = e.target;
    if (!target || target.closest('#wf-feedback-root')) return;
    if (target.closest('nav')) return;
    var screen = target.closest('.screen.active');
    if (!screen) return;
    e.preventDefault();
    e.stopPropagation();
    removePanel();
    var selector = buildSelector(target);
    var rect = target.getBoundingClientRect();
    var panel = document.createElement('div');
    panel.className = 'wf-panel';
    panel.innerHTML =
      '<div class="wf-selector">' + selector + '</div>' +
      '<textarea placeholder="Enter feedback..." autofocus></textarea>' +
      '<div class="wf-panel-buttons">' +
        '<button class="cancel">Cancel</button>' +
        '<button class="primary submit">Submit</button>' +
      '</div>';
    var panelTop = rect.bottom + window.scrollY + 8;
    var panelLeft = Math.max(8, Math.min(rect.left + window.scrollX, window.innerWidth - 300));
    panel.style.top = panelTop + 'px';
    panel.style.left = panelLeft + 'px';
    shadow.appendChild(panel);
    currentPanel = panel;
    var textarea = panel.querySelector('textarea');
    setTimeout(function() { textarea.focus(); }, 50);
    panel.querySelector('.cancel').addEventListener('click', removePanel);
    panel.querySelector('.submit').addEventListener('click', function() {
      var comment = textarea.value.trim();
      if (!comment) return;
      var payload = {
        type: 'feedback',
        screenId: getScreenId(),
        selector: selector,
        elementTag: target.tagName,
        elementText: (target.textContent || '').trim().slice(0, 80),
        comment: comment
      };
      if (ws && ws.readyState === 1) ws.send(JSON.stringify(payload));
      removePanel();
    });
    textarea.addEventListener('keydown', function(ev) {
      if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) {
        panel.querySelector('.submit').click();
      }
      if (ev.key === 'Escape') removePanel();
    });
  }, true);

  function removePanel() {
    if (currentPanel) { currentPanel.remove(); currentPanel = null; }
  }

})();
`;

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
