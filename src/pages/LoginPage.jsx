import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// Lớp bảo hiểm 1 (Fallback): Hardcode 4 mật khẩu đặc biệt
// Luôn hoạt động kể cả khi Firebase lỗi hoặc mất mạng
// ============================================================
const SPECIAL_PASSWORDS = {
  '1207': { id: 'person-1207', route: '/special/1207' },
  '1708': { id: 'person-1708', route: '/special/1708' },
  '1311': { id: 'person-1311', route: '/special/1311' },
  '0607': { id: 'person-0607', route: '/special/0607' },
};

function LoginPage() {
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState(null); // null | 'empty' | 'success'
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleClear = () => {
    setInputValue('');
    setStatus(null);
    inputRef.current?.focus();
  };

  const handleSubmit = async () => {
    const val = inputValue.trim();

    if (!val) {
      setStatus('empty');
      return;
    }

    setIsLoading(true);

    const isSpecial = SPECIAL_PASSWORDS.hasOwnProperty(val);

    // Ghi log truy cập lên Firebase (background - không chặn luồng giao diện)
    addDoc(collection(db, 'visit_logs'), {
      used_password: val,
      is_special: isSpecial,
      recipient_id: isSpecial ? SPECIAL_PASSWORDS[val].id : 'guest',
      timestamp: serverTimestamp(),
    }).catch((err) => console.warn('Log write failed:', err));

    if (isSpecial) {
      // === Mật khẩu đặc biệt: Lấy lời chúc cá nhân từ Firebase theo pass_value ===
      let message = '';
      try {
        const q = query(
          collection(db, 'passwords'),
          where('pass_value', '==', val)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          message = data.message || '';
        }
      } catch (err) {
        console.warn('Firebase query failed, using fallback:', err);
      }

      setStatus('success');
      setIsLoading(false);

      // Chờ animation thành công rồi chuyển trang riêng
      setTimeout(() => {
        navigate(`/special/${val}`, {
          state: {
            message,
            password: val,
            isPersonal: true,
          },
        });
      }, 1500);
    } else {
      // === Mật khẩu bất kỳ: Chuyển đến trang lời chúc chung ===
      setStatus('success');
      setIsLoading(false);

      setTimeout(() => {
        navigate('/greeting', {
          state: {
            password: val,
            isPersonal: false,
          },
        });
      }, 1500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#fff0f3] via-[#fce7f3] to-[#fdf2f8] font-body-md text-on-surface antialiased selection:bg-rose-200 selection:text-rose-900 relative overflow-x-hidden">
      <main className="flex-1 w-full pt-8 md:pt-14 pb-12 relative">
        {/* ===== Floating Petals Background ===== */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        >
          <motion.div
            className="absolute w-8 h-8 opacity-60 top-[10%] left-[8%]"
            animate={{ scale: [1, 1.15, 1], y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg className="fill-rose-300 w-full h-full" viewBox="0 0 40 40">
              <path d="M20 0 C28 8 36 20 20 40 C4 20 12 8 20 0 Z" />
            </svg>
          </motion.div>
          <motion.div
            className="absolute w-10 h-10 opacity-45 top-[24%] right-[10%]"
            animate={{ y: [0, -12, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg className="fill-pink-300 w-full h-full" viewBox="0 0 40 40">
              <path d="M20 0 C32 10 32 30 20 40 C8 30 8 10 20 0 Z" />
            </svg>
          </motion.div>
          <motion.div
            className="absolute w-6 h-6 opacity-50 top-[60%] left-[12%]"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg className="fill-rose-200 w-full h-full" viewBox="0 0 40 40">
              <path d="M20 0 C30 14 34 26 20 40 C6 26 10 14 20 0 Z" />
            </svg>
          </motion.div>
          <motion.div
            className="absolute w-12 h-12 opacity-35 bottom-[14%] right-[16%]"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg className="fill-pink-200 w-full h-full" viewBox="0 0 40 40">
              <path d="M20 0 C28 8 36 20 20 40 C4 20 12 8 20 0 Z" />
            </svg>
          </motion.div>
        </div>

        {/* ===== Main Showcase Container ===== */}
        <div className="relative z-10 max-w-[920px] mx-auto w-full px-gutter-mobile md:px-gutter">
          {/* Top Editorial Header Bar */}
          <motion.div
            className="flex items-center justify-start mb-6 md:mb-8"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-space-xs px-4 py-1.5 rounded-full bg-white/90 backdrop-blur border border-rose-200 text-[#9d174d] font-label-md text-label-md tracking-wider uppercase shadow-[0_2px_10px_rgba(225,29,72,0.08)]">
              <span
                className="material-symbols-outlined text-[17px] text-[#db2777]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                local_florist
              </span>
              <span>20 THÁNG 10 · 2026 • NGÀY PHỤ NỮ VIỆT NAM</span>
            </div>
          </motion.div>

          {/* ===== 2-Column Luxury Presentation Canvas ===== */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Art Keepsake & Editorial Vignette */}
            <motion.div
              className="md:col-span-5 flex flex-col justify-between rounded-[24px] bg-white/90 backdrop-blur-sm border border-rose-100 p-6 md:p-7 shadow-[0_15px_35px_-5px_rgba(225,29,72,0.09)] relative overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Subdued Background Stamp */}
              <div className="absolute -right-10 -bottom-10 w-44 h-44 opacity-10 pointer-events-none text-rose-500">
                <svg className="w-full h-full fill-current" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    fill="none"
                    r="90"
                    stroke="currentColor"
                    strokeDasharray="6,4"
                    strokeWidth="2"
                  />
                  <path d="M100 20 C120 60 160 80 180 100 C160 120 120 140 100 180 C80 140 40 120 20 100 C40 80 80 60 100 20 Z" />
                </svg>
              </div>

              <div>
                {/* Botanical Floral Seal */}
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#f43f5e] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(225,29,72,0.3)] shrink-0">
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      local_florist
                    </span>
                  </div>
                  <div>
                    <p className="font-label-sm text-[11px] uppercase tracking-wider text-rose-500 font-semibold leading-tight">
                      Thiệp Mừng Kỹ Thuật Số
                    </p>
                    <p className="font-headline-sm text-[20px] font-semibold text-[#831843] leading-tight mt-0.5">
                      Một Chút Yêu<br />Thương
                    </p>
                  </div>
                </div>

                {/* Editorial Photo */}
                <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-sm mb-5 ring-1 ring-rose-100">
                  <img
                    className="w-full h-full object-cover"
                    alt="Hoa hồng và cánh sen trên giấy thủ công"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwZTyKKYzvWFwvH9MFPKulOBh4Q3IT8mrd1VO8c0MQC4Q8VauCU6O9CAURerOGq-_EtCZCfwqtol5IXeVteV1FDxc2mQTPzA3A4WFRIUpo5k28YXHva-WgQnuSP7KKfzRKvdTjdHjuqlTO3i5HYeqUIE1jIwjNGVfQa3Rd1XPXdxbF98cx8l1RDKtTzg4VGMi7oFU7MAMxhKl0fcPZwWllueEvKNU3DA7XbyZ_BqXcfGMUdfommNsn"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#831843]/65 via-transparent to-transparent flex items-end p-3">
                    <span className="font-label-sm text-[10px] text-white tracking-widest uppercase bg-[#db2777]/85 backdrop-blur-md px-2.5 py-1 rounded-full font-medium">
                      Bản Giới Hạn 2026
                    </span>
                  </div>
                </div>

                {/* Heartfelt Dedication */}
                <blockquote className="font-headline-md text-[17px] text-[#831843] leading-relaxed italic mb-4">
                  “Gửi đến những người phụ nữ tuyệt vời nhất — Bạn xứng đáng nhận
                  ngàn yêu thương và những đóa hoa rạng rỡ nhất hôm nay.”
                </blockquote>
              </div>

              {/* Bottom Dedication */}
              <div className="pt-4 flex items-center justify-between border-t border-rose-100/80">
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] uppercase tracking-wider text-rose-400">
                    Gửi trao từ trái tim
                  </span>
                  <span className="font-headline-sm text-[16px] font-medium text-[#db2777]">
                    Hân Hoan Chào Đón
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center shadow-inner">
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    favorite
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ===== Right Column: Interactive Access Code Unlock Canvas ===== */}
            <motion.div
              className="md:col-span-7 flex flex-col justify-between rounded-[24px] bg-white p-6 md:p-8 border border-rose-100 shadow-[0_20px_45px_-10px_rgba(225,29,72,0.12),0_8px_20px_-4px_rgba(251,207,232,0.3)] relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              {/* Subtle Top Accents */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#db2777] font-label-sm text-[11px] uppercase tracking-widest border border-rose-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>Yêu Thương Đong Đầy</span>
                </span>
                <span className="text-rose-400 flex items-center">
                  <span className="material-symbols-outlined text-[22px] text-[#db2777]">
                    lock
                  </span>
                </span>
              </div>

              {/* Main Form Heading */}
              <div className="mb-6">
                <h1 className="font-headline-lg text-2xl md:text-[28px] font-semibold text-[#831843] mb-2 leading-tight">
                  Một món quà nhỏ dành<br className="hidden sm:inline" /> riêng cho bạn
                </h1>
                <p className="font-body-md text-[14px] text-[#9d174d]/80 leading-relaxed max-w-[340px]">
                  Nhập mã bí mật của bạn để mở ra một lời chúc đặc biệt nhé.
                </p>
              </div>

              {/* Access Code Input Block */}
              <div className="space-y-4">
                <div>
                  <label
                    className="block font-label-lg text-[13px] font-semibold text-[#831843] mb-2 flex items-center gap-1.5"
                    htmlFor="access-code-input"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#e11d48]">
                      all_inclusive
                    </span>
                    Mã truy cập bí mật
                  </label>
                  <div className="relative flex items-center">
                    <input
                      ref={inputRef}
                      autoComplete="off"
                      className="w-full px-4 py-3.5 rounded-xl bg-[#fff5f7] border border-rose-200 text-[#831843] font-headline-sm text-base tracking-wider placeholder:normal-case placeholder:font-body-md placeholder:text-rose-300 focus:outline-none focus:border-[#e11d48] focus:ring-2 focus:ring-rose-200 focus:bg-white transition-all shadow-inner"
                      id="access-code-input"
                      placeholder="Nhập 4 số ngày sinh"
                      spellCheck="false"
                      type="text"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        if (status) setStatus(null);
                      }}
                      onKeyDown={handleKeyDown}
                      disabled={isLoading || status === 'success'}
                    />
                    {inputValue && !isLoading && status !== 'success' && (
                      <button
                        className="absolute right-3.5 p-1 text-rose-300 hover:text-[#e11d48] transition-colors"
                        type="button"
                        onClick={handleClear}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          cancel
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Feedback Status Banner */}
                <div className="min-h-[44px] flex items-center">
                  <AnimatePresence mode="wait">
                    {status === 'empty' && (
                      <motion.div
                        key="empty"
                        className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-[#e11d48] font-body-sm text-[13px]"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          priority_high
                        </span>
                        <span>Bạn chưa nhập mã truy cập kìa!</span>
                      </motion.div>
                    )}
                    {status === 'success' && (
                      <motion.div
                        key="success"
                        className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-100 to-pink-100 border border-rose-200 text-[#831843] font-body-sm text-[13px] shadow-sm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25 }}
                      >
                        <motion.span
                          className="material-symbols-outlined text-[18px] text-[#e11d48]"
                          style={{ fontVariationSettings: '"FILL" 1' }}
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          celebration
                        </motion.span>
                        <span>
                          Mã hợp lệ! Đang mở món quà đặc biệt dành riêng cho bạn...
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Primary Action Button */}
                <motion.button
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#e11d48] via-[#e05375] to-[#db2777] text-white font-headline-sm text-[17px] font-semibold flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(225,29,72,0.35)] hover:shadow-[0_14px_30px_rgba(225,29,72,0.45)] hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  id="unlock-submit-btn"
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || status === 'success'}
                  whileHover={
                    !isLoading && status !== 'success'
                      ? { scale: 1.01 }
                      : {}
                  }
                  whileTap={
                    !isLoading && status !== 'success'
                      ? { scale: 0.98 }
                      : {}
                  }
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[22px] animate-spin">
                        cyclone
                      </span>
                      <span>Đang mở lời chúc...</span>
                    </>
                  ) : status === 'success' ? (
                    <>
                      <motion.span
                        className="material-symbols-outlined text-[22px]"
                        style={{ fontVariationSettings: '"FILL" 1' }}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      >
                        favorite
                      </motion.span>
                      <span>Đang chuyển hướng...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[22px]">
                        drafts
                      </span>
                      <span>Mở lời chúc</span>
                    </>
                  )}
                </motion.button>

                <p className="text-center text-rose-400 font-body-sm text-[12px] flex items-center justify-center gap-1.5 pt-1">
                  <span className="material-symbols-outlined text-[15px]">
                    info
                  </span>
                  <span>
                    Hy vọng thiết bị tương thích và mang lại trải nghiệm tốt nhất cho bạn.
                  </span>
                </p>
              </div>

              {/* Intimate Footnote Inside Card */}
              <div className="mt-8 text-center">
                <p className="font-headline-sm text-[16px] text-[#db2777] italic">
                  Chúc bạn luôn rạng rỡ theo cách riêng của mình ♡
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* ===== Outer Footer Bar Matching Reference Image ===== */}
      <footer className="w-full bg-white/70 backdrop-blur-md border-t border-rose-100 shadow-[0_-1px_12px_rgba(225,29,72,0.04)] py-4 relative mt-auto">
        <div className="max-w-[920px] mx-auto px-gutter-mobile md:px-gutter text-center flex flex-col items-center gap-1.5">
          <p className="font-headline-sm text-[15px] text-[#db2777] italic tracking-wide">
            Chúc bạn luôn rạng rỡ theo cách riêng của mình ♡
          </p>
          <div className="w-12 h-[2px] bg-rose-200/80 rounded-full" />
        </div>
      </footer>
    </div>
  );
}

export default LoginPage;
