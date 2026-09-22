import { Template } from '../types';

export const STARTER_TEMPLATES: Template[] = [
  {
    id: 'hero',
    name: 'BiboCodeLab Showcase',
    description: 'The signature modern dark hero with interactive button and glow badge.',
    tag: 'Showcase',
    files: {
      html: `<div class="hero">
  <div class="badge">
    <span class="dot"></span>
    BiboCodeLab Live
  </div>
  <h1>Build something<br><span>extraordinary.</span></h1>
  <p>A fast, responsive browser coding playground with instant preview and live debugging.</p>
  <div class="actions">
    <button class="btn primary" onclick="changeMessage()">Try It →</button>
    <button class="btn secondary" onclick="triggerConfetti()">Confetti Effect ✨</button>
  </div>
  <p id="message" class="message-box"></p>
</div>`,
      css: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: radial-gradient(circle at 50% 20%, #171d30, #090c14 80%);
  color: #f1f5f9;
  padding: 24px;
}

.hero {
  width: min(540px, 100%);
  padding: 44px 36px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  background: rgba(18, 24, 38, 0.65);
  backdrop-filter: blur(16px);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-align: left;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(108, 99, 255, 0.15);
  border: 1px solid rgba(108, 99, 255, 0.3);
  color: #a59eff;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #31d48b;
  box-shadow: 0 0 8px #31d48b;
}

h1 {
  font-size: clamp(32px, 5vw, 44px);
  font-weight: 800;
  line-height: 1.15;
  margin: 22px 0 14px;
  letter-spacing: -0.5px;
}

h1 span {
  background: linear-gradient(135deg, #8d85ff, #c0bbfb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  color: #94a3b8;
  line-height: 1.6;
  font-size: 15px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn.primary {
  background: #6c63ff;
  color: #ffffff;
  box-shadow: 0 8px 20px rgba(108, 99, 255, 0.35);
}

.btn.primary:hover {
  background: #7d75ff;
  transform: translateY(-1px);
}

.btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.message-box {
  margin-top: 20px;
  min-height: 24px;
  color: #31d48b;
  font-weight: 500;
  font-size: 14px;
  transition: opacity 0.3s ease;
}`,
      js: `let clickCount = 0;

function changeMessage() {
  clickCount++;
  const msgEl = document.getElementById("message");
  msgEl.textContent = \`✨ Fantastic! Action #\${clickCount} executed successfully.\`;
  console.log("Button clicked! Current counter:", clickCount);
}

function triggerConfetti() {
  console.log("Triggering mini particles animation...");
  const colors = ["#6c63ff", "#31d48b", "#f5c451", "#ff6b7a", "#38bdf8"];
  for (let i = 0; i < 24; i++) {
    const p = document.createElement("div");
    p.style.position = "fixed";
    p.style.width = Math.random() * 8 + 4 + "px";
    p.style.height = Math.random() * 8 + 4 + "px";
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.borderRadius = "50%";
    p.style.left = "50vw";
    p.style.top = "50vh";
    p.style.pointerEvents = "none";
    p.style.transition = "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)";
    p.style.zIndex = "9999";
    document.body.appendChild(p);
    
    setTimeout(() => {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 200 + 50;
      p.style.transform = \`translate(\${Math.cos(angle) * dist}px, \${Math.sin(angle) * dist}px) scale(0)\`;
      p.style.opacity = "0";
    }, 20);
    
    setTimeout(() => p.remove(), 900);
  }
}

console.log("BiboCodeLab studio loaded and running smoothly!");`
    }
  },
  {
    id: 'canvas',
    name: 'Interactive Particle Mesh',
    description: 'An HTML5 Canvas simulation with particles linking together as you move your mouse.',
    tag: 'Canvas & Animation',
    files: {
      html: `<canvas id="canvas"></canvas>
<div class="hud">
  <h2>Particle Constellation</h2>
  <p>Move your mouse or touch the screen to repel and connect nodes.</p>
</div>`,
      css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #090b10;
  color: #fff;
  font-family: system-ui, sans-serif;
  overflow: hidden;
  height: 100vh;
}

canvas {
  display: block;
  width: 100vw;
  height: 100vh;
}

.hud {
  position: fixed;
  top: 24px;
  left: 24px;
  background: rgba(14, 17, 24, 0.7);
  backdrop-filter: blur(10px);
  padding: 16px 20px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

.hud h2 {
  font-size: 16px;
  color: #a59eff;
  margin-bottom: 4px;
}

.hud p {
  font-size: 12px;
  color: #8b95a7;
}`,
      js: `const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const mouse = { x: null, y: null, radius: 140 };
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener("mouseleave", () => {
  mouse.x = null;
  mouse.y = null;
});

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.radius = Math.random() * 2 + 1.5;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;

    if (mouse.x !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 3;
        this.y -= (dy / dist) * force * 3;
      }
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#8b83ff";
    ctx.fill();
  }
}

const particles = Array.from({ length: 65 }, () => new Particle());

function animate() {
  ctx.clearRect(0, 0, width, height);
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 110) {
        ctx.beginPath();
        ctx.strokeStyle = \`rgba(108, 99, 255, \${1 - dist / 110})\`;
        ctx.lineWidth = 0.8;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animate);
}

animate();
console.log("Mesh animation started with 65 nodes.");`
    }
  },
  {
    id: 'todo',
    name: 'Task Flow Manager',
    description: 'A responsive tasks tracker with filtering, local storage persistence, and strike-through.',
    tag: 'Web Application',
    files: {
      html: `<div class="todo-app">
  <header>
    <h1>Task Flow</h1>
    <span id="taskCount" class="counter">0 tasks left</span>
  </header>
  <form id="todoForm">
    <input type="text" id="todoInput" placeholder="Add a new task..." autocomplete="off" />
    <button type="submit">Add</button>
  </form>
  <div class="filters">
    <button class="filter-btn active" data-filter="all">All</button>
    <button class="filter-btn" data-filter="active">Active</button>
    <button class="filter-btn" data-filter="completed">Done</button>
  </div>
  <ul id="todoList"></ul>
</div>`,
      css: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #0f141f;
  color: #e2e8f0;
  font-family: system-ui, sans-serif;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 16px;
}

.todo-app {
  width: 100%;
  max-width: 440px;
  background: #182030;
  padding: 28px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

.counter {
  font-size: 12px;
  background: #6c63ff22;
  color: #8b83ff;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 600;
}

form {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
}

input {
  flex: 1;
  background: #0d121c;
  border: 1px solid #283244;
  color: #fff;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
}

input:focus {
  border-color: #6c63ff;
}

form button {
  background: #6c63ff;
  border: none;
  color: #fff;
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.filters {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}

.filter-btn {
  background: transparent;
  border: 1px solid #283244;
  color: #94a3b8;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}

.filter-btn.active {
  background: #6c63ff;
  border-color: #6c63ff;
  color: #fff;
}

ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0f1421;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.todo-text {
  cursor: pointer;
  flex: 1;
  font-size: 14px;
}

.completed .todo-text {
  text-decoration: line-through;
  color: #64748b;
}

.del-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 16px;
  padding: 2px 6px;
}`,
      js: `let todos = [
  { id: 1, text: "Explore BiboCodeLab features", done: true },
  { id: 2, text: "Write your custom JavaScript logic", done: false },
  { id: 3, text: "Inspect variables in the console panel", done: false }
];

let filter = "all";

const list = document.getElementById("todoList");
const form = document.getElementById("todoForm");
const input = document.getElementById("todoInput");
const count = document.getElementById("taskCount");

function render() {
  list.innerHTML = "";
  const filtered = todos.filter(t => {
    if (filter === "active") return !t.done;
    if (filter === "completed") return t.done;
    return true;
  });

  filtered.forEach(todo => {
    const li = document.createElement("li");
    if (todo.done) li.className = "completed";
    li.innerHTML = \`
      <span class="todo-text">\${todo.done ? "✓ " : "○ "} \${todo.text}</span>
      <button class="del-btn" data-id="\${todo.id}">×</button>
    \`;
    li.querySelector(".todo-text").onclick = () => toggle(todo.id);
    li.querySelector(".del-btn").onclick = () => remove(todo.id);
    list.appendChild(li);
  });

  const activeCount = todos.filter(t => !t.done).length;
  count.textContent = \`\${activeCount} task\${activeCount === 1 ? "" : "s"} left\`;
}

function toggle(id) {
  todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
  console.log("Toggled task:", id);
  render();
}

function remove(id) {
  todos = todos.filter(t => t.id !== id);
  console.log("Removed task:", id);
  render();
}

form.onsubmit = (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.push({ id: Date.now(), text, done: false });
  input.value = "";
  console.log("Added new task:", text);
  render();
};

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter;
    render();
  };
});

render();`
    }
  }
];
