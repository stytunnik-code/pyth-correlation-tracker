import { useEffect, useRef } from "react";

export default function SmokeBackground() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W = window.innerWidth;
    let H = window.innerHeight;
    let time = 0;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener("resize", resize);

    // Rich purple/violet palette for Pyth-themed smoke
    const COLORS = [
      "rgba(109,40,217,",     // deep violet
      "rgba(139,92,246,",     // primary purple
      "rgba(124,58,237,",     // vivid purple
      "rgba(88,28,135,",      // dark violet
      "rgba(167,139,250,",    // soft lavender
      "rgba(67,56,202,",      // indigo
    ];

    class Particle {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.x = Math.random() * W;
        this.y = initial ? Math.random() * H : H + 80;
        this.size = 160 + Math.random() * 320;
        this.speedY = -(0.06 + Math.random() * 0.18);
        this.speedX = (Math.random() - 0.5) * 0.08;
        this.opacity = 0;
        this.targetOpacity = 0.06 + Math.random() * 0.12;
        this.fadeIn = true;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.002;
        this.scaleX = 0.5 + Math.random() * 1;
        this.scaleY = 0.35 + Math.random() * 0.75;
        this.driftAmp = 20 + Math.random() * 40;
        this.driftFreq = 0.0008 + Math.random() * 0.0015;
        this.driftPhase = Math.random() * Math.PI * 2;
      }
      update() {
        this.y += this.speedY;
        const drift = Math.sin(time * this.driftFreq + this.driftPhase) * this.driftAmp * 0.016;
        this.x += this.speedX + drift;
        this.rotation += this.rotSpeed;
        if (this.fadeIn) {
          this.opacity += 0.0022;
          if (this.opacity >= this.targetOpacity) this.fadeIn = false;
        } else {
          this.opacity -= 0.00025;
        }
        if (this.opacity <= 0 || this.y < -this.size) this.reset();
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scaleX, this.scaleY);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        g.addColorStop(0,   `${this.color}${this.opacity})`);
        g.addColorStop(0.35, `${this.color}${(this.opacity * 0.55).toFixed(3)})`);
        g.addColorStop(0.7,  `${this.color}${(this.opacity * 0.2).toFixed(3)})`);
        g.addColorStop(1,    `${this.color}0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const particles = Array.from({ length: 48 }, () => new Particle());

    let animId;
    function loop() {
      time += 1;
      ctx.clearRect(0, 0, W, H);

      // Subtle vignette gradient for depth
      const vig = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.7);
      vig.addColorStop(0, "transparent");
      vig.addColorStop(1, "rgba(6,4,16,0.12)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      particles.forEach(p => { p.update(); p.draw(); });

      animId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 1,
      }}
    />
  );
}
