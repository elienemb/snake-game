# 🐍 Snake Game

> A modern take on the classic snake game, built entirely through **vibe coding** with generative AI — no line of code written by hand.

## About the Project

This is a fully functional snake game, ready to play in desktop and mobile browsers. The project was created as part of a generative AI training course, where I explored the practice of **vibe coding** — a method of development where you describe what you want in natural language and collaborate with an AI to build it, iterating through conversation instead of writing code manually.

The entire game — from the game loop logic and canvas rendering to the UI design, mobile controls, and difficulty system — was produced through dialogue with an AI assistant (GitHub Copilot and Replit), without a single line of code written manually.

### What is Vibe Coding?

> "Vibe coding is the practice of building software by describing your intent in natural language, letting AI generate the implementation, and iterating through feedback — focusing on what you want to build rather than how to build it."

Vibe coding shifts the developer's role from writing syntax to directing intent. Instead of knowing the exact API or framework method, you describe the desired behavior, review the result, give feedback, and refine. This project is a practical demonstration of that workflow applied to a real, deployable product.

**Principles practiced in this project:**

- ✅ Describe features in plain language
- ✅ Iterate on design and behavior through conversation
- ✅ Review and validate AI output instead of writing code
- ✅ Treat AI as a skilled collaborator, not just a code generator

## 🎮 Features

- **Classic gameplay** — eat, grow, avoid walls and yourself
- **Three difficulty levels** — Easy, Medium, Hard, each with distinct speed profiles
- **Persistent high scores** — saved in the browser and updated automatically
- **Keyboard controls** — Arrow keys or WASD
- **Neon design** — dark retro-futuristic theme with electric green and deep purple
- **Smooth game loop** — requestAnimationFrame with timestamp-based tick system
- **Responsive** — works on desktop and mobile

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 6 |
| Build Tool | Vite 8 |
| Rendering | Canvas 2D |
| Styling | Tailwind CSS + Radix UI |
| Package Manager | npm |
| Font | Press Start 2P (Google Fonts) |

## 🚀 How to Play

| Action | Control |
|--------|---------|
| Move | Arrow keys or WASD |
| Pause | SPACE or P |
| Change difficulty | 1, 2, 3 or click buttons |
| Restart | Click "Play Again" |

### Difficulty Guide

- **EASY** — Slow start with gentle acceleration. Perfect for warming up.
- **MEDIUM** — Balanced speed. The classic experience.
- **HARD** — Intense speed from the start. Not for the faint-hearted! 💀

## 📦 Running Locally

### Prerequisites

- Node.js 16+ installed
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd snake-game
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The game will be available at `http://localhost:5173/`

### Production Build

```bash
npm run build
```

Optimized files will be generated in `dist/public/`.

### Type Checking

```bash
npm run typecheck
```

## 🌐 Deploying on Netlify

### Option 1: GitHub + Netlify (Recommended)

1. Push to GitHub:
```bash
git add .
git commit -m "Snake Game - Built with Vibe Coding"
git push origin main
```

2. On [Netlify](https://netlify.com):
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/public`
   - Click "Deploy"

3. Your game will be live in minutes! 🎉

### Option 2: Netlify CLI

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist/public
```

## 📂 Project Structure

```
src/
├── components/
│   └── ui/              # UI components (Radix + Tailwind)
├── hooks/
│   └── useSnakeGame.ts  # Main game logic
├── pages/
│   ├── Game.tsx         # Main game page
│   └── not-found.tsx    # 404 page
├── lib/
│   └── utils.ts         # Utilities and helpers
├── App.tsx              # Root component
└── main.tsx             # Entry point
```

## 🎓 Concepts Explored

This project as a practical exercise in:

- Prompt engineering for software development
- Vibe coding methodology and best practices
- Evaluating and validating AI-generated code
- Iterative product development with AI collaboration
- Accelerating portfolio projects with AI

## 📝 License

MIT — feel free to use, fork, and build upon this project.

---

**Have fun playing!** 🐍✨
