import { useState, useEffect, useCallback, useRef } from "react";

export type GameState = "START" | "PLAYING" | "PAUSED" | "GAME_OVER";
export type Direction = { x: number; y: number };
export type Point = { x: number; y: number };
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

const GRID_SIZE = 20;

const DIFFICULTY_CONFIG: Record<Difficulty, { initialSpeed: number; minSpeed: number; speedIncrement: number }> = {
  EASY:   { initialSpeed: 220, minSpeed: 120, speedIncrement: 4 },
  MEDIUM: { initialSpeed: 150, minSpeed: 60,  speedIncrement: 8 },
  HARD:   { initialSpeed: 90,  minSpeed: 35,  speedIncrement: 12 },
};

const DIR_UP    = { x: 0,  y: -1 };
const DIR_DOWN  = { x: 0,  y: 1  };
const DIR_LEFT  = { x: -1, y: 0  };
const DIR_RIGHT = { x: 1,  y: 0  };

function getHighScoreKey(difficulty: Difficulty) {
  return `snake_high_score_${difficulty.toLowerCase()}`;
}

export function useSnakeGame() {
  const [gameState, setGameState] = useState<GameState>("START");
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");

  const [highScores, setHighScores] = useState<Record<Difficulty, number>>(() => ({
    EASY:   parseInt(localStorage.getItem(getHighScoreKey("EASY"))   || "0", 10),
    MEDIUM: parseInt(localStorage.getItem(getHighScoreKey("MEDIUM")) || "0", 10),
    HARD:   parseInt(localStorage.getItem(getHighScoreKey("HARD"))   || "0", 10),
  }));

  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const snakeRef    = useRef<Point[]>([]);
  const foodRef     = useRef<Point>({ x: 0, y: 0 });
  const dirRef      = useRef<Direction>(DIR_RIGHT);
  const nextDirRef  = useRef<Direction>(DIR_RIGHT);
  const speedRef    = useRef(DIFFICULTY_CONFIG.MEDIUM.initialSpeed);
  const lastTickRef = useRef(0);
  const reqRef      = useRef<number | null>(null);
  const difficultyRef = useRef<Difficulty>("MEDIUM");

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    let isValid = false;
    while (!isValid) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isValid = !currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y);
    }
    foodRef.current = newFood!;
  }, []);

  const initGame = useCallback((diff: Difficulty) => {
    const mid = Math.floor(GRID_SIZE / 2);
    snakeRef.current = [
      { x: mid,     y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
    ];
    dirRef.current     = DIR_RIGHT;
    nextDirRef.current = DIR_RIGHT;
    speedRef.current   = DIFFICULTY_CONFIG[diff].initialSpeed;
    difficultyRef.current = diff;
    generateFood(snakeRef.current);
    setScore(0);
    setIsNewHighScore(false);
  }, [generateFood]);

  const gameOver = useCallback((finalScore: number, diff: Difficulty) => {
    setGameState("GAME_OVER");
    setHighScores((prev) => {
      if (finalScore > prev[diff]) {
        const key = getHighScoreKey(diff);
        localStorage.setItem(key, finalScore.toString());
        setIsNewHighScore(true);
        return { ...prev, [diff]: finalScore };
      }
      return prev;
    });
  }, []);

  const scoreRef = useRef(0);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const tick = useCallback(() => {
    const head = snakeRef.current[0];
    dirRef.current = nextDirRef.current;
    const newHead = {
      x: head.x + dirRef.current.x,
      y: head.y + dirRef.current.y,
    };

    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      gameOver(scoreRef.current, difficultyRef.current);
      return;
    }

    if (snakeRef.current.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      gameOver(scoreRef.current, difficultyRef.current);
      return;
    }

    const newSnake = [newHead, ...snakeRef.current];

    if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
      setScore((s) => {
        const newScore = s + 10;
        const eaten = newScore / 10;
        const cfg = DIFFICULTY_CONFIG[difficultyRef.current];
        if (eaten % 5 === 0) {
          speedRef.current = Math.max(cfg.minSpeed, speedRef.current - cfg.speedIncrement);
        }
        return newScore;
      });
      generateFood(newSnake);
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
  }, [gameOver, generateFood]);

  const gameLoop = useCallback(
    (time: number) => {
      if (gameState !== "PLAYING") return;

      if (!lastTickRef.current) lastTickRef.current = time;
      const deltaTime = time - lastTickRef.current;

      if (deltaTime >= speedRef.current) {
        tick();
        lastTickRef.current = time;
      }

      reqRef.current = requestAnimationFrame(gameLoop);
    },
    [gameState, tick]
  );

  useEffect(() => {
    if (gameState === "PLAYING") {
      reqRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [gameState, gameLoop]);

  const startGame = useCallback((diff?: Difficulty) => {
    const chosen = diff ?? difficulty;
    setDifficulty(chosen);
    initGame(chosen);
    setGameState("PLAYING");
    lastTickRef.current = 0;
  }, [initGame, difficulty]);

  const togglePause = useCallback(() => {
    setGameState((prev) => {
      if (prev === "PLAYING") return "PAUSED";
      if (prev === "PAUSED") {
        lastTickRef.current = 0;
        return "PLAYING";
      }
      return prev;
    });
  }, []);

  const changeDirection = useCallback((dir: "UP" | "DOWN" | "LEFT" | "RIGHT") => {
    const current = dirRef.current;
    if (gameState !== "PLAYING") return;

    switch (dir) {
      case "UP":    if (current !== DIR_DOWN)  nextDirRef.current = DIR_UP;    break;
      case "DOWN":  if (current !== DIR_UP)    nextDirRef.current = DIR_DOWN;  break;
      case "LEFT":  if (current !== DIR_RIGHT) nextDirRef.current = DIR_LEFT;  break;
      case "RIGHT": if (current !== DIR_LEFT)  nextDirRef.current = DIR_RIGHT; break;
    }
  }, [gameState]);

  useEffect(() => { initGame("MEDIUM"); }, [initGame]);

  return {
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
  };
}
