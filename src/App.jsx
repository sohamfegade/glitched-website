import { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import MainScreen from './pages/MainScreen';
import SubmissionsPage from './pages/SubmissionsPage';

export default function App() {
  const [booted, setBooted] = useState(false);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  return (
    <>
      {!booted && <LoadingScreen onComplete={handleBootComplete} />}
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
      </Routes>
    </>
  );
}
