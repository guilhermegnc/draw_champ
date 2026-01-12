import { useEffect, useRef } from "react";

export function BackgroundPatterns() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0,
      h = 0;
    let animationFrameId: number;

    // Grid config
    const DOT_SIZE = 2;
    const GAP = 20; // Distance between dots

    // State to track blinking dots
    // We store { x, y, alpha, speed, phase } for active blinking dots
    let activeDots: {
      col: number;
      row: number;
      alpha: number;
      speed: number;
      phase: "in" | "out" | "hold";
    }[] = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const drawGrid = () => {
      // Draw static background grid
      const cols = Math.ceil(w / GAP);
      const rows = Math.ceil(h / GAP);

      ctx.clearRect(0, 0, w, h);

      // Draw base grid (visible gray)
      ctx.fillStyle = "#2a2a2a";

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * GAP;
          const y = r * GAP;
          ctx.fillRect(x, y, DOT_SIZE, DOT_SIZE);
        }
      }

      // Update and draw active (blinking) dots
      // remove finished dots
      activeDots = activeDots.filter((d) => d.alpha > 0 || d.phase === "in");

      // Randomly add new dots
      if (Math.random() < 0.05) {
        // Reduced chance per frame since they last longer
        const col = Math.floor(Math.random() * cols);
        const row = Math.floor(Math.random() * rows);

        // Don't add if already active
        if (!activeDots.some((d) => d.col === col && d.row === row)) {
          activeDots.push({
            col,
            row,
            alpha: 0,
            speed: 0.005 + Math.random() * 0.01, // Much slower
            phase: "in",
          });
        }
      }

      activeDots.forEach((dot) => {
        // Update alpha
        if (dot.phase === "in") {
          dot.alpha += dot.speed;
          if (dot.alpha >= 1) {
            dot.alpha = 1;
            dot.phase = "hold";
          }
        } else if (dot.phase === "hold") {
          // Randomly start fading out (slower chance)
          // Hold time: roughly 0.5s to 2s depending on random
          if (Math.random() < 0.01) {
            dot.phase = "out";
          }
        } else if (dot.phase === "out") {
          dot.alpha -= dot.speed;
        }

        // Draw blinking dot
        // Color: Solar Orange (#ff4d00)
        ctx.fillStyle = `rgba(255, 77, 0, ${dot.alpha})`;
        // Add a glow
        ctx.shadowBlur = 10 * dot.alpha;
        ctx.shadowColor = "rgba(255, 77, 0, 0.8)";

        ctx.fillRect(dot.col * GAP, dot.row * GAP, DOT_SIZE, DOT_SIZE);

        // Reset shadow for next operations
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(drawGrid);
    };

    window.addEventListener("resize", resize);
    resize();
    drawGrid();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 mix-blend-screen"
    />
  );
}
