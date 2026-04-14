// src/agents/agent6_htmlRenderer.js

export async function runAgent6(milestones, conceptName) {
  console.log(`[Agent 6] Building HTML for: ${conceptName}`);
  if (!milestones || !Array.isArray(milestones) || milestones.length === 0) {
    return { html: null, success: false, error: "No milestones to render" };
  }
  try {
    const html = buildDirectHTML(milestones, conceptName);
    console.log("[Agent 6] ✓ HTML built successfully");
    return { html, success: true };
  } catch (err) {
    console.error("[Agent 6] Build failed:", err.message);
    return { html: null, success: false, error: err.message };
  }
}

function buildDirectHTML(milestones, conceptName) {
  // Store JSON in a hidden <div> with type="application/json"
  // This completely avoids ALL encoding issues — no btoa, no escaping,
  // no unicode problems. The browser treats it as inert text content.
  const jsonStr = JSON.stringify(milestones)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const safeName = String(conceptName)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${safeName} — PF Visual Learner</title>
<script src="https://unpkg.com/konva@10.2.0/konva.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet"/>

<!-- Milestones data stored safely as HTML text — no JS encoding issues -->
<div id="milestones-data" type="application/json" style="display:none">${jsonStr}</div>

<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:100%;min-height:100%;}
body{background:#0d0d14;color:#CDD6F4;font-family:'Space Grotesk',sans-serif;}
#app{max-width:1100px;margin:0 auto;padding:20px 24px;}
.header{display:flex;align-items:center;gap:12px;padding-bottom:16px;border-bottom:1px solid #1a1a2e;margin-bottom:16px;}
.header h1{font-size:1.4rem;font-weight:700;letter-spacing:-0.5px;}
.tag{background:#89B4FA18;border:1px solid #89B4FA33;color:#89B4FA;font-size:0.65rem;padding:3px 9px;border-radius:20px;font-family:'JetBrains Mono',monospace;letter-spacing:1px;}
.tab-bar{display:flex;border-bottom:1px solid #1a1a2e;margin-bottom:20px;overflow-x:auto;}
.tab{background:transparent;border:none;border-bottom:2px solid transparent;color:#6272a4;font-family:'Space Grotesk',sans-serif;font-size:0.75rem;font-weight:600;padding:8px 16px;cursor:pointer;white-space:nowrap;margin-bottom:-1px;transition:color 0.15s;}
.tab:hover{color:#CDD6F4;}
.tab.active{color:#89B4FA;border-bottom-color:#89B4FA;}
.main{display:grid;grid-template-columns:1fr 300px;gap:16px;align-items:start;}
@media(max-width:800px){.main{grid-template-columns:1fr;}}
.milestone-header{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.m-num{background:#89B4FA;color:#1E1E2E;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;flex-shrink:0;}
.m-title{font-size:1rem;font-weight:700;}
.canvas-wrap{background:#1E1E2E;border:1px solid #252535;border-radius:10px;overflow:hidden;}
.controls{display:flex;gap:8px;flex-wrap:wrap;padding:10px 12px;background:#13131f;border-top:1px solid #1e1e30;min-height:48px;}
.btn{border:1px solid;font-family:'Space Grotesk',sans-serif;font-size:0.78rem;font-weight:600;padding:6px 14px;border-radius:6px;cursor:pointer;transition:all 0.12s;background:transparent;}
.btn:active{transform:scale(0.97);}
.btn.primary{border-color:#89B4FA55;color:#89B4FA;}
.btn.primary:hover{background:#89B4FA18;}
.btn.success{border-color:#A6E3A155;color:#A6E3A1;}
.btn.success:hover{background:#A6E3A118;}
.btn.warning{border-color:#F9E2AF55;color:#F9E2AF;}
.btn.warning:hover{background:#F9E2AF18;}
.btn.danger{border-color:#F38BA855;color:#F38BA8;}
.btn.danger:hover{background:#F38BA818;}
.pills{display:flex;gap:6px;flex-wrap:wrap;padding:6px 12px;background:#0f0f1a;border-top:1px solid #1a1a2e;min-height:30px;}
.pill{background:#1e1e2e;border-radius:4px;padding:2px 8px;font-size:0.72rem;font-family:'JetBrains Mono',monospace;color:#CDD6F4;}
.pill span{color:#89B4FA;font-weight:700;}
.explanation{background:#13131f;border:1px solid #1e1e30;border-radius:10px;padding:16px 18px;position:sticky;top:16px;}
.explanation-header{font-size:0.62rem;font-weight:700;color:#89B4FA;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;font-family:'JetBrains Mono',monospace;padding-bottom:8px;border-bottom:1px solid #1e1e30;}
.explanation-body{font-size:0.84rem;line-height:1.75;color:#a6adc8;}
.explanation-body p{margin-bottom:8px;}
.explanation-body strong{color:#CDD6F4;}
.explanation-body code{background:#1e1e2e;color:#A6E3A1;padding:1px 5px;border-radius:3px;font-family:'JetBrains Mono',monospace;font-size:0.78rem;}
.nav-row{display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid #1e1e30;}
.nav-btn{background:#1e1e2e;border:1px solid #2a2a3e;color:#CDD6F4;font-family:'Space Grotesk',sans-serif;font-size:0.78rem;font-weight:600;padding:6px 14px;border-radius:6px;cursor:pointer;}
.nav-btn:hover{background:#252535;}
.nav-btn:disabled{opacity:0.25;cursor:not-allowed;}
.nav-pos{font-size:0.68rem;color:#6272a4;font-family:'JetBrains Mono',monospace;}
</style>
</head>
<body>
<div id="app">
  <div class="header">
    <h1>${safeName}</h1>
    <span class="tag">PF COURSE</span>
    <span class="tag">INTERACTIVE</span>
  </div>
  <div class="tab-bar" id="tab-bar"></div>
  <div class="main">
    <div>
      <div class="milestone-header">
        <div class="m-num" id="m-num">1</div>
        <div class="m-title" id="m-title"></div>
      </div>
      <div class="canvas-wrap">
        <div id="konva-container"></div>
        <div class="controls" id="controls"></div>
        <div class="pills" id="pills"></div>
      </div>
    </div>
    <aside class="explanation">
      <div class="explanation-header">Lesson Context</div>
      <div class="explanation-body" id="explanation-body"></div>
      <div class="nav-row">
        <button class="nav-btn" id="btn-prev" onclick="navigate(-1)">&#8592; Prev</button>
        <span class="nav-pos" id="nav-pos">1 / 5</span>
        <button class="nav-btn" id="btn-next" onclick="navigate(1)">Next &#8594;</button>
      </div>
    </aside>
  </div>
</div>

<script>
// Read milestones from the hidden div — zero encoding issues
var MILESTONES = JSON.parse(document.getElementById('milestones-data').textContent);

var activeIndex = 0, stage = null, layer = null, shapeMap = {}, stateRef = {};

function evalExpr(expr, s) {
  try { return (new Function('state', 'Math', 'return (' + expr + ')'))(s, Math); }
  catch(e) { return undefined; }
}

function applyProp(node, prop, val) {
  if (val === undefined || val === null) return;
  try {
    if (prop === 'text')        { node.text(String(val)); return; }
    if (prop === 'x')           { node.x(Number(val)); return; }
    if (prop === 'y')           { node.y(Number(val)); return; }
    if (prop === 'fill')        { node.fill(String(val)); return; }
    if (prop === 'stroke')      { node.stroke(String(val)); return; }
    if (prop === 'opacity')     { node.opacity(Number(val)); return; }
    if (prop === 'strokeWidth') { node.strokeWidth(Number(val)); return; }
    if (prop === 'width')       { node.width(Number(val)); return; }
    if (prop === 'height')      { node.height(Number(val)); return; }
    if (prop === 'radius')      { node.radius(Number(val)); return; }
    if (prop === 'visible')     { node.visible(Boolean(val)); return; }
    if (prop === 'fontSize')    { if (node.fontSize) node.fontSize(Number(val)); return; }
    if (prop === 'scaleX')      { node.scaleX(Number(val)); return; }
    if (prop === 'scaleY')      { node.scaleY(Number(val)); return; }
    node.setAttr(prop, val);
  } catch(e) {}
}

function renderShape(s, parent) {
  if (!s || !s.type) return;
  var p = {};
  Object.keys(s).forEach(function(k) { if (k !== 'type' && k !== 'children') p[k] = s[k]; });
  var node = null;
  if (s.type === 'Rect')         { node = new Konva.Rect(p); }
  else if (s.type === 'Circle')  { node = new Konva.Circle(p); }
  else if (s.type === 'Text')    { p.fontStyle = p.fontStyle || 'normal'; p.fontFamily = p.fontFamily || 'JetBrains Mono'; node = new Konva.Text(p); }
  else if (s.type === 'Arrow')   { p.pointerLength = p.pointerLength || 8; p.pointerWidth = p.pointerWidth || 6; node = new Konva.Arrow(p); }
  else if (s.type === 'Line')    { node = new Konva.Line(p); }
  else if (s.type === 'Ellipse') { node = new Konva.Ellipse(p); }
  else if (s.type === 'Group')   {
    var g = new Konva.Group({ x: s.x || 0, y: s.y || 0, id: s.id });
    if (s.children) s.children.forEach(function(c) { renderShape(c, g); });
    parent.add(g);
    if (s.id) shapeMap[s.id] = g;
    return;
  }
  if (node) { parent.add(node); if (s.id) shapeMap[s.id] = node; }
}

function handleAction(actionId) {
  var spec = MILESTONES[activeIndex].canvas_spec;
  var anim = null;
  for (var i = 0; i < (spec.animations || []).length; i++) {
    if (spec.animations[i].trigger === actionId) { anim = spec.animations[i]; break; }
  }
  if (!anim) return;
  var old = {}, next = {};
  Object.keys(stateRef).forEach(function(k) { old[k] = stateRef[k]; next[k] = stateRef[k]; });
  anim.steps.forEach(function(s) { if (s.state_update) next[s.state_update] = evalExpr(s.value_expr, old); });
  Object.keys(next).forEach(function(k) { stateRef[k] = next[k]; });
  anim.steps.forEach(function(s) {
    if (!s.target_id || !s.property) return;
    var node = shapeMap[s.target_id];
    if (!node) return;
    applyProp(node, s.property, evalExpr(s.value_expr, next));
  });
  layer.batchDraw();
  updatePills();
}

function updatePills() {
  var el = document.getElementById('pills');
  if (!el) return;
  var html = '';
  Object.keys(stateRef).forEach(function(k) {
    var v = stateRef[k];
    if (typeof v !== 'object' && !Array.isArray(v)) html += '<div class="pill">' + k + ': <span>' + v + '</span></div>';
  });
  el.innerHTML = html;
}

function initMilestone(idx) {
  activeIndex = idx;
  var m = MILESTONES[idx], spec = m.canvas_spec;
  if (stage) { stage.destroy(); stage = null; }
  shapeMap = {};
  stateRef = JSON.parse(JSON.stringify(spec.state || {}));
  document.getElementById('konva-container').innerHTML = '';
  var w = spec.width || 700, h = spec.height || 380;
  stage = new Konva.Stage({ container: 'konva-container', width: w, height: h });
  layer = new Konva.Layer();
  stage.add(layer);
  layer.add(new Konva.Rect({ x:0, y:0, width:w, height:h, fill: spec.background || '#1E1E2E' }));
  (spec.shapes || []).forEach(function(s) { renderShape(s, layer); });
  layer.draw();
  var btns = '';
  (spec.buttons || []).forEach(function(b) {
    btns += '<button class="btn ' + (b.style||'primary') + '" onclick="handleAction(\'' + b.action + '\')">' + b.label + '</button>';
  });
  document.getElementById('controls').innerHTML = btns;
  document.getElementById('explanation-body').innerHTML = m.explanation_html || '';
  document.getElementById('m-num').textContent = idx + 1;
  document.getElementById('m-title').textContent = m.title || '';
  document.getElementById('nav-pos').textContent = (idx+1) + ' / ' + MILESTONES.length;
  document.getElementById('btn-prev').disabled = idx === 0;
  document.getElementById('btn-next').disabled = idx === MILESTONES.length - 1;
  document.querySelectorAll('.tab').forEach(function(t, i) { t.classList.toggle('active', i === idx); });
  updatePills();
}

function navigate(dir) {
  var n = activeIndex + dir;
  if (n >= 0 && n < MILESTONES.length) initMilestone(n);
}

var tabBar = document.getElementById('tab-bar');
MILESTONES.forEach(function(m, i) {
  var b = document.createElement('button');
  b.className = 'tab' + (i === 0 ? ' active' : '');
  b.textContent = m.milestone_number + '. ' + m.title;
  b.setAttribute('onclick', 'initMilestone(' + i + ')');
  tabBar.appendChild(b);
});

function tryInit() {
  if (typeof Konva !== 'undefined') { initMilestone(0); }
  else { setTimeout(tryInit, 50); }
}
tryInit();
</script>
</body>
</html>`;
}