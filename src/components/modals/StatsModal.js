import React from 'react';
import ModalDialog from './ModalDialog.js';
import StatisticsDisplay from '../StatisticsDisplay.js';

function confirmStatsReset() {
  return window.confirm('Are you sure you want to reset all statistics?');
}

function StatsModal({ show, onClose, stats, onReset }) {
  const handleReset = () => {
    if (confirmStatsReset()) {
      onReset();
      onClose();
    }
  };
  return (
    <ModalDialog
      show={show}
      onClose={onClose}
      title="Statistics"
      footer={
        <>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleReset}
          >
            Reset Statistics
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </>
      }
    >
      <StatisticsDisplay stats={stats} showDetails={true} onReset={null} />
    </ModalDialog>
  );
}

export default StatsModal;