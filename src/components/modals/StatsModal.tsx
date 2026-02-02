import { StatisticsDisplay } from "../";
import type { ExtendedStatsModalProps } from "../../types";
import ModalDialog from "./ModalDialog";

function confirmStatsReset(): boolean {
  return window.confirm("Are you sure you want to reset all statistics?");
}

function StatsModal({
  show,
  onClose,
  stats,
  onReset,
}: ExtendedStatsModalProps) {
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
      title='Statistics'
      footer={
        <>
          <button
            type='button'
            className='btn btn-danger'
            onClick={handleReset}
          >
            Reset Statistics
          </button>
          <button type='button' className='btn btn-secondary' onClick={onClose}>
            Close
          </button>
        </>
      }
    >
      <StatisticsDisplay stats={stats} showDetails={true} />
    </ModalDialog>
  );
}

export default StatsModal;
