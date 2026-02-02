import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ExerciseTabs from './components/ExerciseTabs';
import OffcanvasMenu from './components/OffcanvasMenu';
import AboutModal from './components/modals/AboutModal';
import StatsModal from './components/modals/StatsModal';
import DocsModal from './components/modals/DocsModal';
import { useStatistics } from './hooks/useStatistics';
import { useTheme } from './hooks/useTheme';
import { createMenuItems } from './utils/menuUtils';

function App() {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  
  const { stats, recordAnswer, resetStats } = useStatistics();
  
  useTheme();

  const menuItems = createMenuItems(
    setShowOffcanvas,
    setShowStats,
    setShowDocs,
    setShowAbout
  );

  return (
    <div className="min-vh-100 bg-body">
      <Header onOpenMenu={() => setShowOffcanvas(true)} />
      
      <OffcanvasMenu
        show={showOffcanvas}
        onClose={() => setShowOffcanvas(false)}
        menuItems={menuItems}
      />
      
      <AboutModal show={showAbout} onClose={() => setShowAbout(false)} />
      
      <StatsModal
        show={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
        onReset={resetStats}
      />
      
      <DocsModal show={showDocs} onClose={() => setShowDocs(false)} />
      
      <main className="container py-4">
        <ExerciseTabs recordAnswer={recordAnswer} />
      </main>
    </div>
  );
}

export default App;