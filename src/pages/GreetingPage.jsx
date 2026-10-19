import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function GreetingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = location.state || {};

  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const fireworksRef = useRef([]);

  // ---------------- Canvas Animation (Falling Petals & Sparkles) ----------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let animationFrameId = null;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const particles = [];
    const petals = [];
    const sparks = [];
    const PALETTE = ['#ffd65b', '#ffd8e7', '#ffafd2', '#ffffff', '#e9c349'];

    class FireworkRocket {
      constructor(targetX, targetY) {
        this.x = width * 0.15 + Math.random() * (width * 0.7);
        this.y = height + 10;
        this.targetX = targetX || width * 0.15 + Math.random() * (width * 0.7);
        this.targetY = targetY || height * 0.15 + Math.random() * (height * 0.35);
        const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        const speed = 12 + Math.random() * 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        this.trail = [];
        this.exploded = false;
      }

      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.08;

        if (this.vy >= -1 || this.y <= this.targetY) {
          this.exploded = true;
          this.explode();
        }
      }

      draw() {
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
          const pt = this.trail[i];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        ctx.restore();
      }

      explode() {
        const count = 35 + Math.floor(Math.random() * 25);
        for (let i = 0; i < count; i++) {
          particles.push(new BurstParticle(this.x, this.y, this.color));
        }
      }
    }

    class BurstParticle {
      constructor(x, y, baseColor) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 5.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = 0.012 + Math.random() * 0.018;
        this.gravity = 0.04;
        this.size = 1.5 + Math.random() * 2;
        this.color =
          Math.random() > 0.3
            ? baseColor
            : PALETTE[Math.floor(Math.random() * PALETTE.length)];
      }

      update() {
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw() {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class Petal {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : -20;
        this.size = 6 + Math.random() * 8;
        this.speedY = 0.7 + Math.random() * 1.2;
        this.speedX = Math.sin(Math.random() * 10) * 0.6;
        this.rot = Math.random() * Math.PI;
        this.rotSpeed = 0.01 + Math.random() * 0.02;
        this.flip = Math.random() * Math.PI;
        this.flipSpeed = 0.02 + Math.random() * 0.03;
        this.color = Math.random() > 0.5 ? '#ffd8e7' : '#ffafd2';
      }

      update() {
        this.y += this.speedY;
        this.x += Math.sin(this.rot) * 0.8 + this.speedX;
        this.rot += this.rotSpeed;
        this.flip += this.flipSpeed;
        if (this.y > height + 20) this.reset();
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.scale(Math.cos(this.flip), 1);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.65;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
          -this.size / 2,
          -this.size / 2,
          -this.size / 2,
          this.size / 2,
          0,
          this.size
        );
        ctx.bezierCurveTo(
          this.size / 2,
          this.size / 2,
          this.size / 2,
          -this.size / 2,
          0,
          0
        );
        ctx.fill();
        ctx.restore();
      }
    }

    // 30 Sparkling Dust particles
    for (let i = 0; i < 30; i++) {
      sparks.push({
        x: Math.random() * (width || window.innerWidth),
        y: Math.random() * (height || window.innerHeight),
        r: 0.8 + Math.random() * 1.6,
        alpha: Math.random(),
        speed: 0.008 + Math.random() * 0.015,
      });
    }

    // 24 Falling Petals
    for (let i = 0; i < 24; i++) {
      petals.push(new Petal());
    }

    // Store external firework trigger
    fireworksRef.current = {
      launch: () => {
        const positions = [
          { x: width * 0.25, y: height * 0.2 },
          { x: width * 0.75, y: height * 0.22 },
          { x: width * 0.5, y: height * 0.15 },
        ];
        positions.forEach((pos, idx) => {
          setTimeout(() => {
            fireworks.push(new FireworkRocket(pos.x, pos.y));
          }, idx * 260);
        });
      },
    };

    const fireworks = [];

    // Main render loop - NO AUTOMATIC FIREWORKS IN BACKGROUND per user request
    const renderLoop = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Floating Sparkle Dust
      for (const sp of sparks) {
        sp.alpha += sp.speed;
        const currentAlpha = Math.abs(Math.sin(sp.alpha)) * 0.55;
        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = '#fed65b';
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Falling Rose Petals
      for (const petal of petals) {
        petal.update();
        petal.draw();
      }

      // Update manual fireworks rockets when triggered
      for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].draw();
        if (fireworks[i].exploded) {
          fireworks.splice(i, 1);
        }
      }

      // Update Burst Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const [volume, setVolume] = useState(0.2);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Auto-play audio when navigated after login
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.2;

    const startPlay = () => {
      audio.volume = 0.2;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          const resumeOnFirstClick = () => {
            audio.play().then(() => setIsPlaying(true)).catch(() => {});
            window.removeEventListener('click', resumeOnFirstClick);
            window.removeEventListener('keydown', resumeOnFirstClick);
          };
          window.addEventListener('click', resumeOnFirstClick, { once: true });
          window.addEventListener('keydown', resumeOnFirstClick, { once: true });
        });
    };

    startPlay();

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // ---------------- Handlers ----------------
  const toggleAudio = (e) => {
    e?.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.volume = volume;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      if (newVol > 0 && !isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      } else if (newVol === 0 && isPlaying) {
        setIsPlaying(false);
      }
    }
  };

  const handleToggleCard = () => {
    setIsOpen((prev) => !prev);
    if (!isPlaying && audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleFireworks = () => {
    if (fireworksRef.current?.launch) {
      fireworksRef.current.launch();
      setTimeout(() => fireworksRef.current.launch(), 500);
    }
  };

  const handleReplay = () => {
    if (isOpen) {
      setIsOpen(false);
      setTimeout(() => setIsOpen(true), 600);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#240a17] text-[#fbf9f5] flex flex-col items-center justify-between relative overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Audio em_xinh.mp3 */}
      <audio ref={audioRef} src="/audio/em_xinh.mp3" loop preload="auto" />

      {/* Floating Audio & Volume Controller Fixed at Top-Right Corner */}
      <div
        className="fixed top-4 right-4 md:top-6 md:right-6 z-50 flex items-center gap-2.5 px-3 py-2 rounded-full bg-black/45 hover:bg-black/65 border border-white/20 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all"
        onMouseEnter={() => setShowVolumeSlider(true)}
      >
        {/* Toggle Play / Mute Button */}
        <button
          onClick={toggleAudio}
          className="flex items-center text-amber-300 hover:text-amber-200 transition-colors focus:outline-none"
          title={isPlaying ? 'Bấm để tắt âm lượng' : 'Bấm để phát nhạc'}
        >
          <span className="material-symbols-outlined text-[19px]">
            {volume === 0
              ? 'volume_off'
              : volume < 0.5
              ? 'volume_down'
              : 'volume_up'}
          </span>
        </button>

        {/* Mini Soundwave Equalizer */}
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 bg-amber-300 rounded-full animate-bounce h-full" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 bg-amber-300 rounded-full animate-bounce h-2/3" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 bg-amber-300 rounded-full animate-bounce h-4/5" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {/* Volume Slider for Increasing / Decreasing Volume */}
        <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/15">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-20 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-300"
            title={`Âm lượng: ${Math.round(volume * 100)}%`}
          />
          <span className="text-[10px] font-mono text-amber-200/90 w-7 text-right">
            {`${Math.round(volume * 100)}%`}
          </span>
        </div>
      </div>

      {/* Background Interactive Ambient Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Ambient Vignette Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#ffd65b]/10 via-[#3a0d24]/60 to-[#190410]" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center justify-between min-h-screen w-full max-w-sm px-4 py-7 mx-auto">
        {/* Top Header Section */}
        <header className="flex flex-col items-center text-center space-y-2 w-full mt-2">
          {/* Main Serif Heading in Radiant Gold */}
          <h1 className="font-['Playfair_Display',serif] text-[32px] md:text-[36px] font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-[#fff6c8] via-[#ffd65b] to-[#d4af37] drop-shadow-[0_2px_8px_rgba(254,214,91,0.2)] mt-1">
            Ngày Phụ Nữ Việt Nam
          </h1>

          {/* Subtitle */}
          <p className="text-[13px] text-[#ffd8e7]/75 max-w-[270px] leading-relaxed">
            Chạm vào phong bì để đón nhận lời chúc chân thành
          </p>
        </header>

        {/* 3D Envelope Stage Container */}
        <div className="relative w-full max-w-[320px] h-[360px] my-auto flex items-center justify-center [perspective:1200px]">
          {/* Envelope Wrapper */}
          <div
            className={`relative w-full h-[210px] transition-all duration-700 ease-out cursor-pointer ${
              isOpen ? 'mt-28' : 'mt-16'
            }`}
            onClick={handleToggleCard}
          >
            {/* Back Plate of Envelope */}
            <div className="absolute inset-0 rounded-2xl bg-[#3a0d24] border border-[#ffd65b]/20 shadow-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_40%,#ffd8e7_0%,transparent_70%)]" />
              <span className="material-symbols-outlined text-[#ffd8e7]/10 text-8xl pointer-events-none">
                mark_email_unread
              </span>
            </div>

            {/* Sliding Greeting Letter Inside Envelope */}
            <div
              className={`absolute left-2.5 right-2.5 top-2 bottom-2 rounded-xl bg-[#fffdfa] p-4 shadow-2xl transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col justify-between overflow-hidden ${
                isOpen
                  ? '-translate-y-[200px] scale-[1.03] z-40 h-[360px]'
                  : 'translate-y-0 scale-100 z-10 h-auto'
              }`}
            >
              {/* Inner Decorative Corner Accents */}
              <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#d4af37]/60" />
              <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#d4af37]/60" />
              <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#d4af37]/60" />
              <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#d4af37]/60" />

              {/* Card Header Info */}
              <div className="text-center space-y-0.5 relative z-10">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-rose-50 text-[#831843] font-semibold text-[10px] tracking-wider">
                  20/10/2026
                </div>
                <h2 className="font-['Playfair_Display',serif] text-[17px] font-semibold text-[#3a0424] tracking-normal leading-snug">
                  Chúc Mừng Ngày Phụ Nữ Việt Nam 20/10/2026
                </h2>
              </div>

              {/* Card Core Message */}
              <div className="relative z-10 my-auto py-2 px-1 bg-[#fff5f7]/80 rounded-lg border border-rose-100">
                <p className="text-[12px] text-[#4a1231] leading-relaxed text-center italic">
                  {message ||
                    '"Chúc bạn luôn xinh đẹp theo cách riêng, bình yên trong tâm hồn, tự tin theo đuổi những điều mình yêu thích và luôn được trân trọng, yêu thương. Mong rằng mỗi ngày đều mang đến cho bạn những niềm vui nhỏ bé và những điều thật dịu dàng."'}
                </p>
              </div>

              {/* Card Salutation & Sign-off */}
              <div className="text-center space-y-0.5 relative z-10">
                <p className="text-[13px] text-[#831843] font-semibold">
                  Chúc bạn một ngày 20/10 thật rực rỡ ♡
                </p>
                <p className="text-[10px] text-rose-400/80 tracking-wider uppercase font-medium">
                  Gửi bạn, với tất cả sự trân trọng.
                </p>
              </div>
            </div>

            {/* Envelope Front Pocket (Lower & Sides) */}
            <div className="absolute inset-x-0 bottom-0 h-[155px] rounded-b-2xl bg-[#2e001b] border-b border-x border-[#ffd65b]/20 shadow-md z-20 overflow-hidden flex items-end justify-center pb-2.5">
              <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-[#1f0e15] to-transparent" />
              {/* Front Fold Lines */}
              <svg
                className="absolute inset-0 w-full h-full opacity-35 text-[#ffd65b]"
                preserveAspectRatio="none"
                viewBox="0 0 340 170"
              >
                <path d="M0 170 L170 65 L340 170 Z" fill="#4a1231" stroke="currentColor" strokeWidth="1" />
              </svg>
              <div className="relative z-10 flex items-center gap-1.5 text-[#ffd65b] text-[11px] font-semibold tracking-wider">
                <span className="material-symbols-outlined text-[13px]">local_florist</span>
                <span>GÓI TRỌN YÊU THƯƠNG</span>
                <span className="material-symbols-outlined text-[13px]">local_florist</span>
              </div>
            </div>

            {/* Envelope Top Flap (Opens Upward in 3D) */}
            <div
              className={`absolute top-0 inset-x-0 h-[110px] origin-top transition-transform duration-700 ease-in-out [transform-style:preserve-3d] ${
                isOpen ? '-rotate-x-180 z-5' : 'rotate-x-0 z-30'
              }`}
              style={{
                transform: isOpen ? 'rotateX(-180deg)' : 'rotateX(0deg)',
                zIndex: isOpen ? 5 : 30,
              }}
            >
              <svg
                className="w-full h-full drop-shadow-md text-[#3a0d24]"
                preserveAspectRatio="none"
                viewBox="0 0 340 120"
              >
                <path
                  d="M0 0 L170 120 L340 0 Z"
                  fill="#420f2a"
                  stroke="rgba(254, 214, 91, 0.4)"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Golden Wax Seal Button */}
              <div
                className={`absolute left-1/2 -bottom-2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-gradient-to-br from-[#ffd65b] via-[#e9c349] to-[#b38615] shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center transition-opacity duration-300 ${
                  isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e9c349] to-[#fff1b8] flex items-center justify-center shadow-inner border border-[#ffd65b]">
                  <span
                    className="material-symbols-outlined text-[#3a0424] text-[18px]"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    favorite
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Controls Suite */}
        <footer className="w-full max-w-[280px] flex flex-col items-center gap-3 mt-4 mb-2 z-20">
          {/* Sole Fireworks Button */}
          <button
            className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#ffd65b] via-[#fbcfe8] to-[#f472b6] text-[#2e001b] font-semibold text-[15px] flex items-center justify-center gap-2 shadow-[0_6px_22px_rgba(254,214,91,0.3)] active:scale-[0.98] transition-all hover:brightness-105"
            onClick={handleFireworks}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px] text-[#2e001b]">
              celebration
            </span>
            <span>Pháo hoa 🎆</span>
          </button>

          {/* Return link */}
          <button
            onClick={() => navigate('/')}
            className="text-[11px] text-rose-300/60 hover:text-rose-200 transition-colors"
          >
            ← Quay lại trang đăng nhập
          </button>
        </footer>
      </div>
    </div>
  );
}

export default GreetingPage;
