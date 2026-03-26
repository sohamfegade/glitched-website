import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const bootSequence = [
  { text: '> INITIALIZING SYSTEM...', delay: 10 },
  { text: '> LOADING KERNEL MODULES...', delay: 100 },
  { text: '> ESTABLISHING UPLINK...', delay: 300 },
  { text: '> CONNECTION UNSTABLE ████░░░░', delay: 500 },
  { text: '> RECALIBRATING SIGNAL...', delay: 700 },
  { text: '> DECRYPTING TRANSMISSION...', delay: 900 },
  { text: '> STATUS: ██████████ ONLINE', delay: 1000 },
  { text: '> ACCESS GRANTED', delay: 1500 },
];

export default function LoadingScreen({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers = bootSequence.map((line, i) =>
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, line.text]);
        if (i === bootSequence.length - 1) {
          setTimeout(() => setDone(true), 300);
        }
      }, line.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (done) {
      const t = setTimeout(onComplete, 200);
      return () => clearTimeout(t);
    }
  }, [done, onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          style={{
            backgroundColor: 'var(--bg-dark)',
            backgroundImage: "linear-gradient(to bottom, rgba(11, 11, 26, 0.5), rgba(0, 0, 0, 0.8)), url('/loading-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full max-w-xl px-6">
            {/* Terminal Header */}
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-t-lg"
              style={{
                background: 'rgba(122, 0, 255, 0.15)',
                borderBottom: '1px solid rgba(122, 0, 255, 0.3)',
              }}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: 'var(--neon-red)' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#ffaa00' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: 'var(--neon-green)' }} />
              <span
                className="ml-2 text-xs uppercase tracking-widest"
                style={{ fontFamily: 'Orbitron', color: 'var(--text-secondary)' }}
              >
                GLITCHED v1.0
              </span>
            </div>

            {/* Terminal Body */}
            <div
              className="p-6 rounded-b-lg"
              style={{
                background: 'rgba(10, 10, 30, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(2px)',
                border: '1px solid rgba(122, 0, 255, 0.2)',
                borderTop: 'none',
                minHeight: '280px',
              }}
            >
              {visibleLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-2 text-sm font-mono"
                  style={{
                    color:
                      line.includes('ACCESS GRANTED')
                        ? 'var(--neon-green)'
                        : line.includes('UNSTABLE')
                          ? 'var(--neon-red)'
                          : 'var(--neon-blue)',
                    textShadow: line.includes('ACCESS GRANTED')
                      ? '0 0 10px var(--neon-green)'
                      : 'none',
                  }}
                >
                  {line}
                </motion.div>
              ))}
              {!done && visibleLines.length > 0 && (
                <span className="typing-cursor text-sm font-mono" />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
