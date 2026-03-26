import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import GlitchText from '../components/GlitchText';
import ParticleBackground from '../components/ParticleBackground';

export default function MainScreen() {
  const [teamName, setTeamName] = useState('');
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const storedStartTime = localStorage.getItem('glitched_startTime');
    if (storedStartTime) {
      setStartTime(parseInt(storedStartTime, 10));
      setHasStarted(true);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (hasStarted && startTime) {
      // Calculate immediate elapsed time securely
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [hasStarted, startTime]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setErrorMsg('Team name is required to start.');
      return;
    }
    setErrorMsg('');
    const now = Date.now();
    setStartTime(now);
    setHasStarted(true);
    localStorage.setItem('glitched_startTime', now.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!teamName.trim()) {
      setErrorMsg('Team name is required.');
      return;
    }
    if (!answer.trim()) {
      setErrorMsg('Answer is required.');
      return;
    }

    setStatus('loading');

    try {
      const now = new Date();
      const submissionTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out. Check Firestore setup.')), 15000)
      );

      await Promise.race([
        addDoc(collection(db, 'submissions'), {
          teamName: teamName.trim(),
          answer: answer.trim(),
          timestamp: serverTimestamp(),
          submissionTime,
          startTime: new Date(startTime).toLocaleString('en-US'),
          endTime: new Date().toLocaleString('en-US'),
          duration: formatTime(elapsedTime),
        }),
        timeoutPromise,
      ]);

      setStatus('success');
      setTeamName('');
      setAnswer('');
      setHasStarted(false);
      setStartTime(null);
      setElapsedTime(0);
      localStorage.removeItem('glitched_startTime');
    } catch (err) {
      console.error('Submission error:', err);
      setStatus('error');
      setErrorMsg(err.message || 'Transmission failed. Try again.');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 crt-flicker">
      {/* Scanline overlay */}
      <div className="scanline-overlay" />

      {/* Particles */}
      <ParticleBackground />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="glass-card relative z-10 w-full max-w-3xl rounded-3xl p-8 md:p-14"
      >
        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-2xl" style={{ borderColor: 'var(--neon-blue)' }} />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-2xl" style={{ borderColor: 'var(--neon-purple)' }} />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-2xl" style={{ borderColor: 'var(--neon-purple)' }} />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-2xl" style={{ borderColor: 'var(--neon-red)' }} />

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            /* ====== SUCCESS STATE ====== */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center text-center py-10 w-full"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{
                  border: '2px solid var(--neon-green)',
                  boxShadow: '0 0 20px var(--neon-green), 0 0 40px rgba(0,255,136,0.3)',
                }}
              >
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="var(--neon-green)" strokeWidth="2.5">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>

              <h2
                className="text-2xl font-bold mb-3"
                style={{
                  fontFamily: 'Orbitron',
                  color: 'var(--neon-green)',
                  textShadow: '0 0 20px var(--neon-green)',
                }}
              >
                TRANSMISSION RECEIVED
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Your response has been captured successfully.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStatus('idle')}
                className="neon-button mt-8 text-sm"
                style={{
                  borderColor: 'var(--neon-blue)',
                  color: 'var(--neon-blue)',
                  textShadow: '0 0 8px var(--neon-blue)',
                  boxShadow: '0 0 10px rgba(0,247,255,0.3), inset 0 0 10px rgba(0,247,255,0.1)',
                }}
              >
                New Transmission
              </motion.button>
            </motion.div>
          ) : (
            /* ====== FORM STATE ====== */
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <GlitchText text="GLITCHED" className="text-5xl md:text-7xl mb-6" />

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-base md:text-lg tracking-[0.3em] uppercase"
                  style={{
                    fontFamily: 'Orbitron',
                    color: 'var(--neon-blue)',
                    textShadow: '0 0 10px rgba(0,247,255,0.5)',
                  }}
                >
                  Transmission Detected...
                </motion.p>
              </div>

              {/* Question */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6 p-4 rounded-lg text-center"
                style={{
                  background: 'rgba(122, 0, 255, 0.08)',
                  border: '1px solid rgba(122, 0, 255, 0.2)',
                }}
              >
                <p
                  className="text-lg md:text-2xl"
                  style={{
                    fontFamily: 'Orbitron',
                    color: 'var(--neon-purple)',
                    textShadow: '0 0 8px rgba(122,0,255,0.5)',
                  }}
                >
                  &quot;What is your conclusion?&quot;
                </p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label
                    className="block text-xs uppercase tracking-widest mb-2"
                    style={{ fontFamily: 'Orbitron', color: 'var(--neon-blue)' }}
                  >
                    Team Identifier
                  </label>
                  <input
                    id="teamName"
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter your team name..."
                    className="neon-input rounded-xl text-lg px-5 py-4"
                    disabled={status === 'loading' || hasStarted}
                  />
                </motion.div>

                {!hasStarted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="pt-2"
                  >
                    <motion.button
                      type="button"
                      onClick={handleStart}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="neon-button w-full rounded-xl text-lg py-5 tracking-widest"
                      style={{
                        borderColor: 'var(--neon-green)',
                        color: 'var(--neon-green)',
                        textShadow: '0 0 8px var(--neon-green)',
                        boxShadow: '0 0 10px rgba(0,255,136,0.3), inset 0 0 10px rgba(0,255,136,0.1)',
                      }}
                    >
                      ▶ START TIMER
                    </motion.button>
                  </motion.div>
                )}

                {hasStarted && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4 rounded-xl mb-4"
                      style={{
                        background: 'rgba(0, 247, 255, 0.05)',
                        border: '1px solid rgba(0, 247, 255, 0.2)',
                      }}
                    >
                      <p className="text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Time Elapsed
                      </p>
                      <p
                        className="text-4xl font-bold"
                        style={{
                          fontFamily: 'Orbitron',
                          color: 'var(--neon-blue)',
                          textShadow: '0 0 15px rgba(0,247,255,0.8)',
                        }}
                      >
                        {formatTime(elapsedTime)}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label
                        className="block text-xs uppercase tracking-widest mb-2"
                        style={{ fontFamily: 'Orbitron', color: 'var(--neon-blue)' }}
                      >
                        Decoded Answer
                      </label>
                      <div className="flex flex-col gap-4">
                        {['Human interference', 'Killed By AI robot'].map((option) => {
                          const isSelected = answer === option;
                          return (
                            <motion.button
                              key={option}
                              type="button"
                              onClick={() => setAnswer(option)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              disabled={status === 'loading'}
                              className="neon-input rounded-xl text-lg px-5 py-4 text-left flex items-center gap-3 transition-colors duration-300"
                              style={{
                                borderColor: isSelected ? 'var(--neon-green)' : 'rgba(0, 247, 255, 0.3)',
                                color: isSelected ? 'var(--neon-green)' : 'var(--text-primary)',
                                textShadow: isSelected ? '0 0 8px var(--neon-green)' : 'none',
                                boxShadow: isSelected ? '0 0 15px rgba(0,255,136,0.2), inset 0 0 10px rgba(0,255,136,0.1)' : 'none',
                                background: isSelected ? 'rgba(0, 255, 136, 0.05)' : 'transparent',
                              }}
                            >
                              <span className="text-2xl">{isSelected ? '◉' : '〇'}</span>
                              <span style={{ fontFamily: 'Orbitron' }}>{option}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* Error */}
                    <AnimatePresence>
                      {errorMsg && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-sm text-center"
                          style={{ color: 'var(--neon-red)', textShadow: '0 0 8px var(--neon-red)' }}
                        >
                          ⚠ {errorMsg}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="pt-2"
                    >
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        disabled={status === 'loading'}
                        className="neon-button w-full rounded-xl text-lg py-5 tracking-widest"
                      >
                        {status === 'loading' ? (
                          <span className="flex items-center justify-center gap-3">
                            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeLinecap="round" />
                            </svg>
                            TRANSMITTING
                            <span className="loading-dots" />
                          </span>
                        ) : (
                          '⟐ TRANSMIT RESPONSE ⟐'
                        )}
                      </motion.button>
                    </motion.div>
                  </>
                )}
              </form>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center text-xs mt-6 tracking-wider"
                style={{ color: 'var(--text-secondary)' }}
              >
                TECHNITUDE • GLITCHED • FINAL ROUND
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
