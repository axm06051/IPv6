import type { FC } from "react";
import { useState } from "react";
import { ExerciseTabs, Header, OffcanvasMenu } from "./components";
import { AboutModal, DocsModal, StatsModal } from "./components/modals";
import { useStatistics, useTheme } from "./hooks";
import { createMenuItems } from "./utils";

const App: FC = () => {
  const [showOffcanvas, setShowOffcanvas] = useState<boolean>(false);
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showDocs, setShowDocs] = useState<boolean>(false);

  const { stats, recordAnswer, resetStats } = useStatistics();

  useTheme();

  const menuItems = createMenuItems(
    setShowOffcanvas,
    setShowStats,
    setShowDocs,
    setShowAbout
  );

  return (
    <div className='min-vh-100 bg-body'>
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

      <main className='container py-4'>
        <ExerciseTabs recordAnswer={recordAnswer} />
      </main>
    </div>
  );
};

export default App;
