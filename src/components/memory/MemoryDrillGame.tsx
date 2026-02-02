import { useMemoryDrillGame } from "../../hooks";
import type { MemoryDrillGameProps } from "../../types";
import {
  MemoryDrillGameInterface,
  MemoryDrillInstructions,
  MemoryDrillModeSelection,
} from "./";

function MemoryDrillGame({ category, onAnswerSubmit }: MemoryDrillGameProps) {
  const { state, actions, selectors, generators } = useMemoryDrillGame(
    category,
    onAnswerSubmit
  );
  const {
    drillState,
    input,
    result,
    currentQuestion,
    showModeInstructions,
    showSettings,
    penaltyAmountInput,
    selectedPrefixes,
    inputRef,
  } = state;
  const {
    handleInputChange,
    submit,
    next,
    resetProgress,
    changeMode,
    markModeInstructionsRead,
    updatePenaltySettings,
    handlePenaltyAmountChange,
    setShowSettings,
    updateSelectedPrefixes,
  } = actions;
  const {
    penaltySettings,
    learnedItems,
    currentBatch,
    itemSuccessCounts,
    isPrefixMode,
    batchName,
    masteredItemsInCurrentBatch,
    targetDescription,
    currentBatchItems,
  } = selectors;
  const { getInputPlaceholder, getModeDisplayName, getModeDescription } =
    generators;

  if (!drillState.currentMode) {
    return (
      <MemoryDrillModeSelection
        drillState={drillState}
        penaltySettings={penaltySettings}
        onChangeMode={changeMode}
        onShowSettings={() => setShowSettings(true)}
      />
    );
  }

  if (showModeInstructions) {
    return (
      <MemoryDrillInstructions
        mode={drillState.currentMode}
        currentBatch={currentBatch}
        learnedItems={learnedItems}
        masteredItemsInCurrentBatch={masteredItemsInCurrentBatch}
        penaltySettings={penaltySettings}
        isPrefixMode={isPrefixMode}
        currentBatchItems={currentBatchItems}
        onStart={markModeInstructionsRead}
        onBack={() => changeMode(null)}
        getModeDisplayName={getModeDisplayName}
      />
    );
  }

  return (
    <MemoryDrillGameInterface
      mode={drillState.currentMode}
      selectedPrefixes={selectedPrefixes}
      currentQuestion={currentQuestion}
      result={result}
      input={input}
      isPrefixMode={isPrefixMode}
      batchName={batchName}
      masteredItemsInCurrentBatch={masteredItemsInCurrentBatch}
      targetDescription={targetDescription}
      penaltySettings={penaltySettings}
      showSettings={showSettings}
      penaltyAmountInput={penaltyAmountInput}
      inputRef={inputRef}
      onInputChange={handleInputChange}
      onSubmit={submit}
      onNext={next}
      onResetProgress={resetProgress}
      onChangeMode={changeMode}
      onUpdatePenalty={updatePenaltySettings}
      onPenaltyAmountChange={handlePenaltyAmountChange}
      onShowSettings={() => setShowSettings(true)}
      onCloseSettings={() => setShowSettings(false)}
      updateSelectedPrefixes={updateSelectedPrefixes}
      getInputPlaceholder={getInputPlaceholder}
      getModeDisplayName={getModeDisplayName}
      getModeDescription={getModeDescription}
    />
  );
}

export default MemoryDrillGame;
