import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchSubmissions = async () => {
    try {
      const q = query(collection(db, 'submissions'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubmissions(data);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen px-4 py-10 flex flex-col items-center" style={{ backgroundColor: 'var(--bg-dark)' }}>
      <div className="scanline-overlay" />

      <div className="w-full max-w-5xl my-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{
              fontFamily: 'Orbitron',
              color: 'var(--neon-blue)',
              textShadow: '0 0 15px rgba(0,247,255,0.5)',
            }}
          >
            ◈ INTERCEPTED TRANSMISSIONS
          </h1>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>{submissions.length} transmissions captured</span>
            <span>•</span>
            <span>Auto-refresh: 10s</span>
            {lastRefresh && (
              <>
                <span>•</span>
                <span>Last sync: {lastRefresh}</span>
              </>
            )}
            <span
              className="inline-block w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--neon-green)', boxShadow: '0 0 6px var(--neon-green)' }}
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          {loading ? (
            <div className="p-10 text-center">
              <p className="text-sm" style={{ color: 'var(--neon-blue)', fontFamily: 'Orbitron' }}>
                DECRYPTING TRANSMISSIONS
                <span className="loading-dots" />
              </p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'Orbitron' }}>
                NO TRANSMISSIONS DETECTED
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '5%' }}>#</th>
                    <th style={{ width: '15%' }}>Team Name</th>
                    <th style={{ width: '30%' }}>Answer</th>
                    <th style={{ width: '10%' }}>Start Time</th>
                    <th style={{ width: '10%' }}>End Time</th>
                    <th style={{ width: '10%' }}>Duration</th>
                    <th style={{ width: '10%' }}>Time</th>
                    <th style={{ width: '10%' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, i) => (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <td style={{ color: 'var(--text-secondary)' }}>{i + 1}</td>
                      <td>
                        <span
                          className="font-semibold"
                          style={{
                            color: 'var(--neon-purple)',
                            textShadow: '0 0 6px rgba(122,0,255,0.4)',
                          }}
                        >
                          {sub.teamName}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-primary)', maxWidth: '300px', wordBreak: 'break-word' }}>
                        {sub.answer}
                      </td>
                      <td style={{ color: 'var(--neon-blue)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {sub.startTime ? new Date(sub.startTime).toLocaleTimeString() : '—'}
                      </td>
                      <td style={{ color: 'var(--neon-green)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {sub.endTime ? new Date(sub.endTime).toLocaleTimeString() : '—'}
                      </td>
                      <td style={{ color: 'var(--neon-purple)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {sub.duration || '—'}
                      </td>
                      <td style={{ color: 'var(--neon-blue)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {sub.submissionTime || '—'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {sub.timestamp?.toDate?.()
                          ? sub.timestamp.toDate().toLocaleString()
                          : '—'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-secondary)' }}>
          GLITCHED ADMIN • CLASSIFIED ACCESS
        </p>
      </div>
    </div>
  );
}
