import { useEffect, useRef } from "react";

export default function SmokeBackground() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", resize);

    // Smoke particles
    const particles = [];
    const COLORS = [
      "rgba(109,40,217,",   // deep purple
      "rgba(139,92,246,",   // purple
      "rgba(76,29,149,",    // dark purple
      "rgba(167,139,250,",  // light purple
      "rgba(49,10,100,",    // very dark
    ];

    class Particle {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.x = Math.random() * W;
        this.y = initial ? Math.random() * H : H + 100;
        this.size = 120 + Math.random() * 250;
        this.speedY = -(0.08 + Math.random() * 0.2);
        this.speedX = (Math.random() - 0.5) * 0.15;
        this.opacity = 0;
        this.targetOpacity = 0.04 + Math.random() * 0.09;
        this.fadeIn = true;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.003;
        this.scaleX = 0.6 + Math.random() * 0.8;
        this.scaleY = 0.4 + Math.random() * 0.6;
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotSpeed;
        if (this.fadeIn) {
          this.opacity += 0.0008;
          if (this.opacity >= this.targetOpacity) this.fadeIn = false;
        } else {
          this.opacity -= 0.0003;
        }
        if (this.opacity <= 0 || this.y < -this.size) this.reset();
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scaleX, this.scaleY);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        grad.addColorStop(0,   `${this.color}${this.opacity})`);
        grad.addColorStop(0.4, `${this.color}${this.opacity * 0.6})`);
        grad.addColorStop(1,   `${this.color}0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Create particles
    for (let i = 0; i < 28; i++) particles.push(new Particle());

    let animId;
    function loop() {
      ctx.clearRect(0, 0, W, H);
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
