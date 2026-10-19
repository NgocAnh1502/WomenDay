import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import './LoginForm.css';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu');
      setShakeKey((prev) => prev + 1);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Query Firestore: tìm document trong collection "passwords" có pass_value === input
      const passwordsRef = collection(db, 'passwords');
      const q = query(passwordsRef, where('pass_value', '==', password.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Mật khẩu sai
        setError('Mật khẩu không chính xác. Vui lòng thử lại!');
        setShakeKey((prev) => prev + 1);
        setIsLoading(false);
        inputRef.current?.focus();
        return;
      }

      // Mật khẩu đúng - lấy thông tin
      const matchedDoc = querySnapshot.docs[0];
      const userData = matchedDoc.data();

      // Ghi log truy cập (background - không chặn flow)
      addDoc(collection(db, 'visit_logs'), {
        used_password: password.trim(),
        password_id: matchedDoc.id,
        timestamp: serverTimestamp(),
      }).catch((logErr) => {
        console.warn('Không thể ghi log truy cập:', logErr);
      });

      // Animation thành công
      setIsSuccess(true);

      // Chờ animation xong rồi chuyển trang
      setTimeout(() => {
        navigate('/greeting', {
          state: {
            message: userData.message || '',
            recipientId: matchedDoc.id,
          },
        });
      }, 1200);
    } catch (err) {
      console.error('Lỗi kết nối Firebase:', err);
      setError('Có lỗi xảy ra. Vui lòng thử lại sau!');
      setShakeKey((prev) => prev + 1);
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {!isSuccess ? (
        <motion.div
          className="login-form-container glass-strong"
          key={`form-${shakeKey}`}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            x: error ? [0, -5, 5, -5, 5, 0] : 0,
          }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{
            duration: 0.5,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          {/* Decorative glow */}
          <div className="form-glow" />

          {/* Header */}
          <div className="form-header">
            <motion.div
              className="form-icon"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              🌸
            </motion.div>
            <h1 className="form-title">
              <span className="gradient-text">Chào mừng bạn</span>
            </h1>
            <p className="form-subtitle">
              Nhập mật khẩu để mở món quà đặc biệt
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="form-body" id="login-form">
            <div className="input-group">
              <div className="input-wrapper">
                <span className="input-icon">🔐</span>
                <input
                  ref={inputRef}
                  id="password-input"
                  type="password"
                  className="input-field"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  disabled={isLoading}
                  autoComplete="off"
                  autoFocus
                />
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    className="error-message"
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="error-icon">⚠️</span>
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              type="submit"
              className="btn-primary submit-btn"
              id="login-submit-btn"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <span className="loading-content">
                  <span className="spinner" />
                  Đang xác thực...
                </span>
              ) : (
                <span className="btn-content">
                  Mở quà
                  <span className="btn-arrow">→</span>
                </span>
              )}
            </motion.button>
          </form>

          {/* Footer hint */}
          <p className="form-hint">
            ✨ Mật khẩu được gửi riêng cho bạn
          </p>
        </motion.div>
      ) : (
        /* Success state - fade out animation */
        <motion.div
          className="success-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="success-content"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="success-icon">🎉</span>
            <p className="success-text">Xác thực thành công!</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoginForm;
