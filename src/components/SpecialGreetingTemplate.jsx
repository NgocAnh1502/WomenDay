import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { motion, AnimatePresence } from 'framer-motion';

export default function SpecialGreetingTemplate({
  code,
  flower = {
    name: 'Bó Hoa Tulip Tinh Khôi',
    gardenTitle: 'VƯỜN TULIP YÊU THƯƠNG',
    image: '/flowers/tulip.jpg',
    meaning: 'Tượng trưng cho sự kiêu sa, niềm hứng khởi và vẻ đẹp thanh lịch bền bỉ theo năm tháng.',
  },
  theme = {
    bgStyle: 'linear-gradient(135deg, #FFF7F3 0%, #F6E2E5 35%, #E9C4CF 70%, #D7B887 100%)',
    envelopeBg: 'rgba(255, 255, 255, 0.85)',
    envelopeBorder: 'border-[#E9C4CF]',
    sealOuter: 'from-[#D7B887] via-[#E9C4CF] to-[#F6E2E5]',
    sealInner: 'from-[#5e1736] to-[#831843]',
    accentColor: '#831843',
    textColor: 'text-[#4c0519]',
    textMuted: 'text-[#831843]/80',
    cardBg: 'bg-white/95',
    cardBorder: 'border-[#E9C4CF]/60',
    fireworkColors: ['#db2777', '#f43f5e', '#fb7185', '#d97706', '#f59e0b', '#ffffff'],
  },
  fallbackMessage = 'Nhân ngày Phụ Nữ Việt Nam 20/10, chúc bạn luôn giữ trọn nụ cười rạng rỡ, ngập tràn sức khỏe, an nhiên và gặt hái thật nhiều thành tựu mới trong sự nghiệp cũng như cuộc sống. Cảm ơn bạn vì sự tận tâm, nguồn năng lượng tích cực và những giá trị tuyệt vời mà bạn luôn mang lại.',
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);

  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  // Query Firestore for pass_value to get customized message
  useEffect(() => {
    let isMounted = true;
    async function fetchPersonData() {
      try {
        const q = query(
          collection(db, 'passwords'),
          where('pass_value', '==', String(code).trim())
        );
        const snap = await getDocs(q);
        if (!snap.empty && isMounted) {
          const data = snap.docs[0].data();
          if (data.message) setMessage(data.message);
        }
      } catch (err) {
        console.warn('Lỗi kết nối Firebase (dùng fallback):', err);
      }
    }

    // Ưu tiên đọc từ state nếu có
    if (location.state?.message) {
      setMessage(location.state.message);
    }

    // Luôn query Firestore để đảm bảo lấy đúng message mới nhất theo pass_value
    fetchPersonData();

    return () => {
      isMounted = false;
    };
  }, [code, location.state]);

  // Audio Playback & Auto-play upon navigating from login
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

  const startCelebration = () => {
    setIsOpen(true);
    if (audioRef.current && !isPlaying) {
      audioRef.current.volume = volume;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // ---------------- West Lake Grand Fireworks Canvas ----------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let animId = null;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', resize);
    resize();

    const particles = [];
    const rockets = [];
    const petals = [];
    const colors = theme.fireworkColors || ['#db2777', '#f43f5e', '#fbbf24', '#d97706', '#ffffff'];

    class Rocket {
      constructor(tx, ty) {
        this.x = width * 0.15 + Math.random() * (width * 0.7);
        this.y = height + 10;
        this.tx = tx || width * 0.15 + Math.random() * (width * 0.7);
        this.ty = ty || height * 0.12 + Math.random() * (height * 0.35);
        const angle = Math.atan2(this.ty - this.y, this.tx - this.x);
        const speed = 11 + Math.random() * 5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.trail = [];
        this.dead = false;
      }
      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 6) this.trail.shift();
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.07;
        if (this.vy >= -1 || this.y <= this.ty) {
          this.dead = true;
          this.explode();
        }
      }
      draw() {
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.5;
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
        const count = 55 + Math.floor(Math.random() * 35);
        for (let i = 0; i < count; i++) {
          particles.push(new Particle(this.x, this.y, this.color));
        }
      }
    }

    class Particle {
      constructor(x, y, baseColor) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 6;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = 0.012 + Math.random() * 0.016;
        this.gravity = 0.045;
        this.size = 1.6 + Math.random() * 2.2;
        this.color = Math.random() > 0.3 ? baseColor : colors[Math.floor(Math.random() * colors.length)];
        this.flicker = Math.random() > 0.5;
      }
      update() {
        this.vx *= 0.975;
        this.vy *= 0.975;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }
      draw() {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha * (this.flicker ? (0.7 + Math.random() * 0.3) : 1));
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Drifting flower petals in background
    class Petal {
      constructor(init = false) {
        this.reset(init);
      }
      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : -20;
        this.size = 5 + Math.random() * 9;
        this.speedY = 0.6 + Math.random() * 1.1;
        this.speedX = (Math.random() - 0.5) * 0.9;
        this.rot = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.03;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = 0.35 + Math.random() * 0.35;
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.rot) * 0.5;
        this.rot += this.rotSpeed;
        if (this.y > height + 20) this.reset();
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < 24; i++) {
      petals.push(new Petal(true));
    }

    let lastLaunch = 0;

    const loop = (timestamp) => {
      ctx.clearRect(0, 0, width, height);

      // Render Petals
      for (const p of petals) {
        p.update();
        p.draw();
      }

      // If envelope is opened, launch grand West Lake fireworks continuously!
      if (isOpen && timestamp - lastLaunch > 700) {
        rockets.push(new Rocket());
        if (Math.random() > 0.4) {
          setTimeout(() => {
            rockets.push(new Rocket());
          }, 240);
        }
        lastLaunch = timestamp;
      }

      // Update rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        rockets[i].update();
        rockets[i].draw();
        if (rockets[i].dead) rockets.splice(i, 1);
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) particles.splice(i, 1);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isOpen, theme.fireworkColors]);

  const displayMessage = message || fallbackMessage;

  return (
    <div
      className="min-h-screen flex flex-col justify-between relative overflow-x-hidden select-none font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-700"
      style={{
        background: theme.bgStyle || 'linear-gradient(135deg, #FFF7F3 0%, #F6E2E5 50%, #E9C4CF 100%)',
      }}
    >
      {/* Background Audio */}
      <audio ref={audioRef} src="/audio/track06_noinaycoanh.mp3" loop preload="auto" />

      {/* Canvas for Fireworks & Ambient Floating Petals */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Top Header Navigation Bar */}
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between border-b border-black/5 bg-white/40 backdrop-blur-md shadow-xs">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/80 border border-black/10 flex items-center justify-center text-amber-500 shadow-sm">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
              auto_awesome
            </span>
          </div>
          <div>
            <h1 className={`font-['Playfair_Display',serif] text-[17px] font-semibold tracking-wide ${theme.textColor || 'text-[#4c0519]'} drop-shadow-xs`}>
              Một Chút Yêu Thương
            </h1>
            <p className={`text-[10px] uppercase tracking-widest ${theme.textMuted || 'text-[#831843]/80'} font-medium`}>
              20/10 • NGÀY PHỤ NỮ VIỆT NAM
            </p>
          </div>
        </div>

        {/* Right: Audio Volume Controller */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white/95 border border-black/10 backdrop-blur-md shadow-sm transition-all">
          <button
            onClick={toggleAudio}
            className="flex items-center text-amber-600 hover:text-amber-700 transition-colors focus:outline-none"
            title={isPlaying ? 'Bấm để tắt âm lượng' : 'Bấm để phát nhạc'}
          >
            <span className="material-symbols-outlined text-[18px]">
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
              <span className="w-0.5 bg-amber-500 rounded-full animate-bounce h-full" style={{ animationDelay: '0ms' }} />
              <span className="w-0.5 bg-amber-500 rounded-full animate-bounce h-2/3" style={{ animationDelay: '150ms' }} />
              <span className="w-0.5 bg-amber-500 rounded-full animate-bounce h-4/5" style={{ animationDelay: '300ms' }} />
            </div>
          )}

          {/* Volume Slider */}
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-black/10">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-20 h-1.5 bg-black/15 rounded-lg appearance-none cursor-pointer accent-amber-500"
              title={`Âm lượng: ${Math.round(volume * 100)}%`}
            />
            <span className={`text-[10px] font-mono ${theme.textColor || 'text-[#4c0519]'} font-semibold w-7 text-right`}>
              {`${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            /* ============================================================
               STATE 1: ENVELOPE SEALED STATE
               ============================================================ */
            <motion.div
              key="sealed-stage"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flex flex-col items-center text-center w-full max-w-lg mx-auto"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-black/10 text-amber-700 text-[11px] font-semibold uppercase tracking-widest mb-4 shadow-xs backdrop-blur-md">
                <span className="material-symbols-outlined text-[15px] text-amber-600">redeem</span>
                <span>MÓN QUÀ TINH TẾ • 20 THÁNG 10</span>
              </div>

              {/* Main Heading */}
              <h2 className={`font-['Playfair_Display',serif] text-[32px] md:text-[42px] font-semibold ${theme.textColor || 'text-[#4c0519]'} tracking-wide mb-2 drop-shadow-xs`}>
                Mở món quà nhỏ nhé ✨
              </h2>

              {/* Subtitle */}
              <p className={`text-[13px] md:text-[14px] ${theme.textMuted || 'text-[#831843]/80'} max-w-md mb-8 leading-relaxed font-normal`}>
                Một phong thư chứa đựng tình cảm trân quý và lời chúc an lành gửi đến cậu
              </p>

              {/* Envelope Stationery Card */}
              <div
                onClick={startCelebration}
                className="relative w-full max-w-[420px] aspect-[16/10] rounded-2xl p-6 flex flex-col justify-between cursor-pointer border shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-md group hover:scale-[1.02] transition-all duration-500 overflow-hidden"
                style={{
                  backgroundColor: theme.envelopeBg || 'rgba(255, 255, 255, 0.85)',
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                }}
              >
                {/* Envelope Fold Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 text-black" preserveAspectRatio="none" viewBox="0 0 420 260">
                  <line x1="0" y1="0" x2="210" y2="130" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 3" />
                  <line x1="420" y1="0" x2="210" y2="130" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 3" />
                  <line x1="0" y1="260" x2="210" y2="130" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 3" />
                  <line x1="420" y1="260" x2="210" y2="130" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 3" />
                </svg>

                {/* Top Bar of Envelope */}
                <div className="relative z-10 flex items-center justify-between text-black/60 text-[11px] tracking-wider uppercase font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-rose-500" style={{ fontVariationSettings: '"FILL" 1' }}>local_florist</span>
                    <span>THƯ CHÚC MỪNG 20/10</span>
                  </div>
                </div>

                {/* Center Wax Seal Button */}
                <div className="relative z-10 my-auto flex flex-col items-center">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-20 h-20 rounded-full bg-gradient-to-br ${theme.sealOuter || 'from-[#d97706] to-[#f59e0b]'} p-1 shadow-[0_6px_25px_rgba(0,0,0,0.15)] flex items-center justify-center cursor-pointer`}
                  >
                    <div className={`w-full h-full rounded-full bg-gradient-to-tr ${theme.sealInner || 'from-[#5e1736] to-[#831843]'} border border-amber-300/40 flex flex-col items-center justify-center shadow-inner text-amber-200`}>
                      <span className="material-symbols-outlined text-[24px]">drafts</span>
                      <span className="text-[9px] font-bold tracking-widest uppercase mt-0.5 text-amber-200/90">
                        CHẠM MỞ
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Bottom of Envelope */}
                <div className="relative z-10 flex justify-center items-center">
                  <span className="text-[10px] uppercase tracking-widest text-black/40 font-medium">
                    TRÂN TRỌNG TRAO GỬI
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ============================================================
               STATE 2: OPENED STATE (1 BÊN ẢNH - 1 BÊN THƯ)
               ============================================================ */
            <motion.div
              key="opened-stage"
              initial={{ opacity: 0, scale: 0.94, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="w-full flex flex-col items-center"
            >
              {/* 2-Column Balanced Layout: 1 Bên Ảnh - 1 Bên Thư */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch w-full max-w-5xl">
                {/* CỘT TRÁI: THƯ CHÚC MỪNG (Parchment Paper Styling) */}
                <div
                  className={`rounded-3xl ${theme.cardBg || 'bg-white/95'} p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border ${theme.cardBorder || 'border-rose-100'} relative flex flex-col justify-between overflow-hidden`}
                  style={{
                    backgroundColor: theme.cardBgColor || 'rgba(255, 255, 255, 0.96)',
                  }}
                >
                  {/* Delicate Inner Border */}
                  <div className="absolute inset-3 border border-black/10 rounded-2xl pointer-events-none" />

                  {/* Corner Ornaments */}
                  <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t border-l border-black/20" />
                  <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t border-r border-black/20" />
                  <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b border-l border-black/20" />
                  <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b border-r border-black/20" />

                  {/* Header info */}
                  <div className="relative z-10 flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold mb-6" style={{ color: theme.cardTitleColor || '#701a3d' }}>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                        local_florist
                      </span>
                      <span>THƯ CHÚC MỪNG 20/10</span>
                    </div>
                  </div>

                  {/* Message Body (Lấy từ Firebase thông qua pass_value) */}
                  <div className="relative z-10 my-auto py-2">
                    <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[15px] md:text-[16px] leading-relaxed font-normal whitespace-pre-line" style={{ color: theme.cardBodyColor || '#2e0b1d' }}>
                      {displayMessage}
                    </p>
                  </div>

                  {/* Sign-off */}
                  <div className="relative z-10 pt-6 mt-6 border-t border-black/10 flex flex-col items-end text-right">
                    <p className="font-['Playfair_Display',serif] italic font-semibold text-[15px]" style={{ color: theme.cardTitleColor || '#701a3d' }}>
                      Trân trọng kính chúc,
                    </p>
                    <p className="text-[12px] font-medium mt-0.5" style={{ color: theme.cardTitleColor || '#701a3d', opacity: 0.85 }}>
                      ♡ Một Chút Yêu Thương
                    </p>
                    <p className="text-[11px] mt-1 font-mono text-black/50">
                      20 / 10 / 2026
                    </p>
                  </div>
                </div>

                {/* CỘT PHẢI: ẢNH BÓ HOA NGHỆ THUẬT (Có thể click để phóng to) */}
                <div className={`rounded-3xl ${theme.cardBg || 'bg-white/95'} border ${theme.cardBorder || 'border-rose-100'} p-4 md:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative overflow-hidden flex flex-col justify-center group`}>
                  {/* Flower Image Container with Zoom Click */}
                  <div
                    onClick={() => setIsZoomed(true)}
                    className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-inner cursor-zoom-in group"
                    title="Bấm để xem ảnh phóng to"
                  >
                    <img
                      src={flower.image}
                      alt={flower.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src = '/flowers/tulip.jpg';
                      }}
                    />

                    {/* Zoom Icon Hint Badge */}
                    <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs flex items-center gap-1.5 shadow-md opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-[15px]">zoom_in</span>
                      <span>Phóng to</span>
                    </div>

                    {/* Gradient Overlay with Flower Details */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-5">
                      <span className="text-[11px] uppercase tracking-widest text-amber-300 font-semibold mb-1">
                        DÀNH TẶNG BẠN
                      </span>
                      <h4 className="font-['Playfair_Display',serif] text-[20px] md:text-[22px] font-semibold text-white drop-shadow-sm leading-snug">
                        {flower.name}
                      </h4>
                      <p className="text-[12px] text-white/85 line-clamp-2 mt-1 leading-relaxed font-light">
                        {flower.meaning}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Điều hướng chân trang sau khi mở thiệp */}
              <div className="mt-8 flex items-center justify-center gap-6 z-20">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-white/80 hover:bg-white text-xs font-semibold text-[#4a1231] transition-all flex items-center gap-1.5 shadow-sm border border-black/10 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">replay</span>
                  <span>Xem lại phong thư</span>
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-5 py-2.5 rounded-full bg-white/80 hover:bg-white text-xs font-semibold text-[#4a1231] transition-all flex items-center gap-1.5 shadow-sm border border-black/10 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Quay lại trang đăng nhập</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full py-4 text-center border-t border-black/5 bg-white/30 backdrop-blur-xs">
        <p className={`text-[11px] uppercase tracking-widest ${theme.textMuted || 'text-[#831843]/60'} font-medium`}>
          ♡ TRỌN VẸN YÊU THƯƠNG DÀNH CHO PHÁI ĐẸP ♡
        </p>
      </footer>

      {/* Lightbox Modal để phóng to ảnh bông hoa */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all z-10"
              title="Đóng xem ảnh"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              src={flower.image}
              alt={flower.name}
              className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 text-center text-white select-text" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-['Playfair_Display',serif] text-2xl font-semibold text-amber-200">{flower.name}</h3>
              <p className="text-sm text-white/80 max-w-lg mt-1 font-light leading-relaxed">{flower.meaning}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
