// Wireframe feedback overlay — injected into wireframe.html by feedback-server.ts
// Provides: feedback mode toggle, element highlighting, comment panel, WebSocket live-reload
(function(): void {
  // --- Shadow DOM root ---
  const root: HTMLDivElement = document.createElement('div');
  root.id = 'wf-feedback-root';
  document.body.appendChild(root);
  const shadow: ShadowRoot = root.attachShadow({ mode: 'open' });

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

  const toggleBtn: HTMLElement = shadow.getElementById('wf-toggle-btn')!;
  const highlightEl: HTMLElement = shadow.getElementById('wf-highlight')!;
  const dotEl: HTMLElement = shadow.getElementById('wf-dot')!;
  let feedbackMode: boolean = false;
  let currentPanel: HTMLElement | null = null;
  let ws: WebSocket | null = null;
  let reconnectDelay: number = 1000;

  // --- WebSocket ---
  function connectWS(): void {
    ws = new WebSocket('ws://' + location.host + '/ws');
    ws.onopen = function() {
      reconnectDelay = 1000;
      dotEl.className = 'wf-dot connected';
      toggleBtn.title = 'Feedback mode (connected)';
    };
    ws.onmessage = function(e: MessageEvent) {
      const msg = JSON.parse(e.data);
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
    ws.onerror = function() { ws!.close(); };
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
  function buildSelector(el: Element): string {
    const parts: string[] = [];
    let cur: Element | null = el;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      if (cur.id) {
        parts.unshift('#' + cur.id);
        break;
      }
      const tag: string = cur.tagName;
      const parent: Element | null = cur.parentElement;
      if (parent) {
        const siblings: Element[] = Array.from(parent.children);
        const idx: number = siblings.indexOf(cur) + 1;
        parts.unshift(tag + ':nth-child(' + idx + ')');
      } else {
        parts.unshift(tag);
      }
      cur = parent;
    }
    return parts.join(' > ');
  }

  function getScreenId(): string {
    const active: Element | null = document.querySelector('.screen.active');
    return active ? active.id.replace('screen-', '') : 'unknown';
  }

  // --- Hover highlight ---
  document.addEventListener('mousemove', function(e: MouseEvent) {
    if (!feedbackMode) return;
    const target: Element | null = e.target as Element;
    if (!target || target.closest('#wf-feedback-root') || target.closest('nav')) {
      highlightEl.style.display = 'none';
      return;
    }
    const screen: Element | null = target.closest('.screen.active');
    if (!screen) { highlightEl.style.display = 'none'; return; }
    const rect: DOMRect = target.getBoundingClientRect();
    highlightEl.style.display = 'block';
    highlightEl.style.top = (rect.top + window.scrollY) + 'px';
    highlightEl.style.left = (rect.left + window.scrollX) + 'px';
    highlightEl.style.width = rect.width + 'px';
    highlightEl.style.height = rect.height + 'px';
  });

  // --- Click -> feedback panel ---
  document.addEventListener('click', function(e: MouseEvent) {
    if (!feedbackMode) return;
    const target: Element | null = e.target as Element;
    if (!target || target.closest('#wf-feedback-root')) return;
    if (target.closest('nav')) return;
    const screen: Element | null = target.closest('.screen.active');
    if (!screen) return;
    e.preventDefault();
    e.stopPropagation();
    removePanel();
    const selector: string = buildSelector(target);
    const rect: DOMRect = target.getBoundingClientRect();
    const panel: HTMLDivElement = document.createElement('div');
    panel.className = 'wf-panel';
    panel.innerHTML =
      '<div class="wf-selector">' + selector + '</div>' +
      '<textarea placeholder="Enter feedback..." autofocus></textarea>' +
      '<div class="wf-panel-buttons">' +
        '<button class="cancel">Cancel</button>' +
        '<button class="primary submit">Submit</button>' +
      '</div>';
    const panelTop: number = rect.bottom + window.scrollY + 8;
    const panelLeft: number = Math.max(8, Math.min(rect.left + window.scrollX, window.innerWidth - 300));
    panel.style.top = panelTop + 'px';
    panel.style.left = panelLeft + 'px';
    shadow.appendChild(panel);
    currentPanel = panel;
    const textarea: HTMLTextAreaElement = panel.querySelector('textarea')!;
    setTimeout(function() { textarea.focus(); }, 50);
    panel.querySelector('.cancel')!.addEventListener('click', removePanel);
    panel.querySelector('.submit')!.addEventListener('click', function() {
      const comment: string = textarea.value.trim();
      if (!comment) return;
      const payload = {
        type: 'feedback',
        screenId: getScreenId(),
        selector: selector,
        elementTag: target!.tagName,
        elementText: (target!.textContent || '').trim().slice(0, 80),
        comment: comment
      };
      if (ws && ws.readyState === 1) ws.send(JSON.stringify(payload));
      removePanel();
    });
    textarea.addEventListener('keydown', function(ev: KeyboardEvent) {
      if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) {
        (panel.querySelector('.submit') as HTMLElement).click();
      }
      if (ev.key === 'Escape') removePanel();
    });
  }, true);

  function removePanel(): void {
    if (currentPanel) { currentPanel.remove(); currentPanel = null; }
  }

})();
