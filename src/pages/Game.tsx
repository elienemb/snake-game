import { useEffect, useRef, useCallback, useState } from "react";
import { useSnakeGame, Difficulty } from "@/hooks/useSnakeGame";
import { Button } from "@/components/ui/button";

const DIFFICULTY_LABELS: Record<Difficulty, { label: string; desc: string; color: string }> = {
  EASY:   { label: "EASY",   desc: "Slow start",    color: "border-green-400 text-green-400 hover:bg-green-400/20 data-[active=true]:bg-green-400/30 data-[active=true]:border-green-400" },
  MEDIUM: { label: "MEDIUM", desc: "Balanced",      color: "border-purple-400 text-purple-400 hover:bg-purple-400/20 data-[active=true]:bg-purple-400/30 data-[active=true]:border-purple-400" },
  HARD:   { label: "HARD",   desc: "Insane speed",  color: "border-red-400 text-red-400 hover:bg-red-400/20 data-[active=true]:bg-red-400/30 data-[active=true]:border-red-400" },
};

const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

export default function Game() {
  const {
    gameState,
    score,
    difficulty,
    highScores,
    isNewHighScore,
    snakeRef,
    foodRef,
    startGame,
    togglePause,
    changeDirection,
    GRID_SIZE,
  } = useSnakeGame();

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("MEDIUM");

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pulseScale, setPulseScale] = useState(1);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          changeDirection("UP");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          changeDirection("DOWN");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          changeDirection("LEFT");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          changeDirection("RIGHT");
          break;
        case " ":
        case "p":
        case "P":
          e.preventDefault();
          if (gameState === "START" || gameState === "GAME_OVER") {
            startGame(selectedDifficulty);
          } else {
            togglePause();
          }
          break;
        case "1":
          setSelectedDifficulty("EASY");
          break;
        case "2":
          setSelectedDifficulty("MEDIUM");
          break;
        case "3":
          setSelectedDifficulty("HARD");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeDirection, gameState, startGame, togglePause, selectedDifficulty]);

  // Touch swipe controls
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      e.preventDefault();

      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 30) {
          changeDirection(dx > 0 ? "RIGHT" : "LEFT");
          touchStartRef.current = null;
        }
      } else {
        if (Math.abs(dy) > 30) {
          changeDirection(dy > 0 ? "DOWN" : "UP");
          touchStartRef.current = null;
        }
      }
    },
    [changeDirection]
  );

  // Food pulsing animation
  useEffect(() => {
    let animationFrameId: number;
    const start = performance.now();
    const animatePulse = (time: number) => {
      setPulseScale(1 + Math.sin((time - start) / 150) * 0.15);
      animationFrameId = requestAnimationFrame(animatePulse);
    };
    animationFrameId = requestAnimationFrame(animatePulse);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const { width, height } = canvas;
      const cellSize = width / GRID_SIZE;

      ctx.fillStyle = "rgba(18, 5, 23, 1)";
      ctx.fillRect(0, 0, width, height);

      // Faint grid lines
      ctx.strokeStyle = "rgba(100, 255, 100, 0.03)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(width, i * cellSize);
        ctx.stroke();
      }

      // Draw food
      const food = foodRef.current;
      const fx = food.x * cellSize + cellSize / 2;
      const fy = food.y * cellSize + cellSize / 2;
      const fRadius = (cellSize / 2.5) * pulseScale;

      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00ff00";
      ctx.fillStyle = "#00ff00";
      ctx.beginPath();
      ctx.arc(fx, fy, fRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw snake
      const snake = snakeRef.current;
      if (snake.length > 0) {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = gameState === "GAME_OVER" ? "#ff0000" : "#80ff80";
        ctx.fillStyle   = gameState === "GAME_OVER" ? "#ff0000" : "#00ff00";
        ctx.strokeStyle = "#005500";
        ctx.lineWidth   = 2;

        snake.forEach((segment, index) => {
          const isHead = index === 0;
          const x = segment.x * cellSize;
          const y = segment.y * cellSize;

          ctx.beginPath();
          ctx.roundRect(x + 1, y + 1, cellSize - 2, cellSize - 2, isHead ? 8 : 4);
          ctx.fill();

          if (isHead) {
            ctx.fillStyle = "#000000";
            const eyeOffset = cellSize * 0.25;
            const eyeSize   = cellSize * 0.15;

            let dirX = 1, dirY = 0;
            if (snake.length > 1) {
              dirX = Math.sign(snake[0].x - snake[1].x) || 1;
              dirY = Math.sign(snake[0].y - snake[1].y);
            }

            let e1x: number, e1y: number, e2x: number, e2y: number;

            if (dirX > 0) {
              e1x = x + cellSize - eyeOffset; e1y = y + eyeOffset;
              e2x = x + cellSize - eyeOffset; e2y = y + cellSize - eyeOffset;
            } else if (dirX < 0) {
              e1x = x + eyeOffset; e1y = y + eyeOffset;
              e2x = x + eyeOffset; e2y = y + cellSize - eyeOffset;
            } else if (dirY < 0) {
              e1x = x + eyeOffset;            e1y = y + eyeOffset;
              e2x = x + cellSize - eyeOffset; e2y = y + eyeOffset;
            } else {
              e1x = x + eyeOffset;            e1y = y + cellSize - eyeOffset;
              e2x = x + cellSize - eyeOffset; e2y = y + cellSize - eyeOffset;
            }

            ctx.beginPath();
            ctx.arc(e1x, e1y, eyeSize, 0, Math.PI * 2);
            ctx.arc(e2x, e2y, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = gameState === "GAME_OVER" ? "#ff0000" : "#00ff00";
          }
        });
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [GRID_SIZE, gameState, pulseScale, snakeRef, foodRef]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const size = Math.min(clientWidth, clientHeight) - 32;
      canvasRef.current.width  = size;
      canvasRef.current.height = size;
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    setTimeout(handleResize, 50);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentHighScore = highScores[gameState === "PLAYING" || gameState === "PAUSED" ? difficulty : selectedDifficulty];

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background text-foreground overflow-hidden font-sans">
      {/* Header */}
      <div className="w-full max-w-md px-4 py-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl sm:text-4xl text-primary font-bold tracking-widest drop-shadow-[0_0_8px_rgba(0,255,0,0.8)]">
            SNAKE
          </h1>
          <p className="text-xs text-secondary mt-1 uppercase tracking-widest">System Online</p>
        </div>
        <div className="text-right flex flex-col gap-1">
          <div className="text-sm">
            <span className="text-secondary uppercase">Score:</span>{" "}
            <span className="text-primary">{score.toString().padStart(4, "0")}</span>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground uppercase">High:</span>{" "}
            <span className="text-muted-foreground">{currentHighScore.toString().padStart(4, "0")}</span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div
        ref={containerRef}
        className="flex-1 w-full max-w-md flex items-center justify-center relative touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className="relative rounded-xl overflow-hidden border border-secondary/30 shadow-[0_0_30px_rgba(100,50,200,0.15)] bg-card">
          <canvas ref={canvasRef} className="block" width={400} height={400} />
          <div className="scanlines absolute inset-0 mix-blend-overlay" />

          {/* START overlay */}
          {gameState === "START" && (
            <div className="absolute inset-0 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 gap-4">
              <h2 className="text-xl text-primary animate-pulse tracking-widest">SYSTEM READY</h2>
              <p className="text-xs text-secondary leading-relaxed">
                Eat data blocks. Avoid corruption. Grow.
              </p>

              {/* Difficulty selector */}
              <div className="w-full mt-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Difficulty</p>
                <div className="flex gap-2 justify-center">
                  {DIFFICULTIES.map((d) => {
                    const cfg = DIFFICULTY_LABELS[d];
                    return (
                      <button
                        key={d}
                        data-testid={`btn-difficulty-${d.toLowerCase()}`}
                        data-active={selectedDifficulty === d}
                        onClick={() => setSelectedDifficulty(d)}
                        className={`flex-1 border rounded-lg py-2 px-1 text-center transition-all ${cfg.color} ${selectedDifficulty === d ? "ring-2 ring-offset-1 ring-offset-background scale-105" : "opacity-60 hover:opacity-90"}`}
                      >
                        <div className="text-[10px] font-bold tracking-wider">{cfg.label}</div>
                        <div className="text-[8px] mt-0.5 opacity-80">{cfg.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {/* High scores per difficulty */}
                <div className="flex gap-2 justify-center mt-2">
                  {DIFFICULTIES.map((d) => (
                    <div key={d} className="flex-1 text-center">
                      <div className="text-[8px] text-muted-foreground uppercase">Best</div>
                      <div className={`text-[10px] ${selectedDifficulty === d ? "text-primary" : "text-muted-foreground"}`}>
                        {highScores[d].toString().padStart(4, "0")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => startGame(selectedDifficulty)}
                data-testid="btn-start"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/80 font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,0,0.5)] mt-1"
              >
                Start
              </Button>
              <p className="text-[9px] text-muted-foreground uppercase hidden sm:block">
                SPACE to start &bull; 1/2/3 to select difficulty
              </p>
            </div>
          )}

          {/* PAUSED overlay */}
          {gameState === "PAUSED" && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 gap-4">
              <h2 className="text-xl text-secondary animate-pulse uppercase tracking-widest">Paused</h2>
              <div className="text-xs text-muted-foreground uppercase">
                {DIFFICULTY_LABELS[difficulty].label}
              </div>
              <Button
                onClick={togglePause}
                className="border border-secondary text-secondary hover:bg-secondary/20"
                variant="outline"
              >
                Resume
              </Button>
            </div>
          )}

          {/* GAME OVER overlay */}
          {gameState === "GAME_OVER" && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 gap-3">
              <h2 className="text-2xl text-destructive drop-shadow-[0_0_8px_rgba(255,0,0,0.8)] tracking-widest">
                SYSTEM FAILURE
              </h2>

              <div className="border border-border bg-black/40 p-3 rounded-lg w-full max-w-[200px]">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase">Final Score</p>
                <p className="text-2xl text-foreground">{score}</p>
                <p className="text-[9px] text-secondary mt-1 uppercase">{DIFFICULTY_LABELS[difficulty].label}</p>
                {isNewHighScore && (
                  <p className="text-[10px] text-primary mt-1 uppercase animate-pulse">New Record!</p>
                )}
              </div>

              {/* Difficulty selector on game over */}
              <div className="w-full">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Play again on:</p>
                <div className="flex gap-2 justify-center">
                  {DIFFICULTIES.map((d) => {
                    const cfg = DIFFICULTY_LABELS[d];
                    return (
                      <button
                        key={d}
                        data-testid={`btn-difficulty-go-${d.toLowerCase()}`}
                        data-active={selectedDifficulty === d}
                        onClick={() => setSelectedDifficulty(d)}
                        className={`flex-1 border rounded-lg py-1.5 px-1 text-center transition-all ${cfg.color} ${selectedDifficulty === d ? "ring-2 ring-offset-1 ring-offset-background scale-105" : "opacity-50 hover:opacity-80"}`}
                      >
                        <div className="text-[9px] font-bold">{cfg.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={() => startGame(selectedDifficulty)}
                data-testid="btn-restart"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/80 font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,0,0.5)]"
              >
                Play Again
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile D-pad */}
      <div className="w-full max-w-md p-4 sm:hidden">
        <div className="grid grid-cols-3 gap-2 w-44 mx-auto opacity-70">
          <div />
          <Button
            variant="outline"
            className="h-12 border-secondary/50 text-secondary bg-transparent hover:bg-secondary/20"
            onClick={() => changeDirection("UP")}
            data-testid="dpad-up"
          >
            ↑
          </Button>
          <div />
          <Button
            variant="outline"
            className="h-12 border-secondary/50 text-secondary bg-transparent hover:bg-secondary/20"
            onClick={() => changeDirection("LEFT")}
            data-testid="dpad-left"
          >
            ←
          </Button>
          <Button
            variant="outline"
            className="h-12 border-secondary/50 text-secondary bg-transparent hover:bg-secondary/20"
            onClick={() => changeDirection("DOWN")}
            data-testid="dpad-down"
          >
            ↓
          </Button>
          <Button
            variant="outline"
            className="h-12 border-secondary/50 text-secondary bg-transparent hover:bg-secondary/20"
            onClick={() => changeDirection("RIGHT")}
            data-testid="dpad-right"
          >
            →
          </Button>
        </div>
      </div>
    </div>
  );
}
