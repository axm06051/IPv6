import { useState } from "react";
import { Card } from "../";
import { MemoryDrillMode, MemoryDrillModeType } from "../../constants";
import type {
  MemoryDrillModeSelectionProps,
  ModeSelectionCardProps,
} from "../../types";

const ALL_PREFIXES = Array.from({ length: 32 }, (_, i) => i + 1);

function GameInstructions() {
  return (
    <div className='alert alert-info'>
      <strong>How it works:</strong>
      <ul className='mb-0 mt-2'>
        <li>Each correct answer increases your success count</li>
        <li>
          <strong className='text-danger'>Penalty:</strong> Incorrect answers
          reduce success count (configurable)
        </li>
        <li>Quick reference charts appear only when you make mistakes</li>
        <li>
          <strong>Cumulative Learning:</strong> Items stay in practice as you
          master them
        </li>
        <li>
          <strong>Prefix mode:</strong> Select specific prefixes to practice
        </li>
      </ul>
    </div>
  );
}

function ModeSelectionCard({
  mode,
  title,
  description,
  drillState,
  onChangeMode,
  buttonColor,
  selectedPrefixes = [],
}: ModeSelectionCardProps) {
  const learnedItems = drillState.learnedItems?.[mode]?.length || 0;
  const totalItems =
    mode === MemoryDrillMode.PREFIX_TO_HEXTET
      ? selectedPrefixes.length || 32
      : 16;
  const handleClick = () => {
    onChangeMode(mode);
  };
  return (
    <div className='col-md-6'>
      <div className={`card border-${buttonColor}`}>
        <div className='card-body'>
          <h6 className='card-title'>{title}</h6>
          <p className='card-text small'>{description}</p>
          <div className='mb-2'>
            {mode === MemoryDrillMode.PREFIX_TO_HEXTET && (
              <small className='text-muted'>
                Selected: {selectedPrefixes.length} prefixes
                <br />
              </small>
            )}
            <small className='text-muted'>
              Learned: {learnedItems}/{totalItems} items
            </small>
          </div>
          <button
            className={`btn btn-${buttonColor} w-100`}
            onClick={handleClick}
            disabled={
              mode === MemoryDrillMode.PREFIX_TO_HEXTET &&
              selectedPrefixes.length === 0
            }
          >
            {mode === MemoryDrillMode.PREFIX_TO_HEXTET &&
            selectedPrefixes.length === 0
              ? "Select Prefixes First"
              : "Select"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MemoryDrillModeSelection({
  drillState,
  penaltySettings,
  onChangeMode,
  onShowSettings,
}: MemoryDrillModeSelectionProps) {
  const [selectedPrefixes, setSelectedPrefixes] = useState<number[]>(() => {
    const saved = localStorage.getItem("memory-drill-selected-prefixes");
    return saved ? JSON.parse(saved) : ALL_PREFIXES.slice(0, 4);
  });
  const currentPenalty = penaltySettings.enabled ? penaltySettings.amount : 0;
  const togglePrefix = (prefix: number) => {
    setSelectedPrefixes((prev: number[]) =>
      prev.includes(prefix)
        ? prev.filter((p: number) => p !== prefix)
        : [...prev, prefix]
    );
  };
  const selectAll = () => {
    setSelectedPrefixes([...ALL_PREFIXES]);
  };
  const clearSelection = () => {
    setSelectedPrefixes([]);
  };
  const handleModeChange = (mode: MemoryDrillModeType) => {
    if (
      mode === MemoryDrillMode.PREFIX_TO_HEXTET &&
      selectedPrefixes.length > 0
    ) {
      localStorage.setItem(
        "memory-drill-selected-prefixes",
        JSON.stringify(selectedPrefixes)
      );
    }
    onChangeMode(mode);
  };
  return (
    <Card title='Memory Drill - Select Mode'>
      <div className='mb-4'>
        <h5>Choose a Practice Mode</h5>
        <p>
          Select a conversion mode to practice. Each mode focuses on different
          networking and IPv6 conversion skills to build muscle memory.
        </p>
        <GameInstructions />
        <div className='d-flex justify-content-between align-items-center mb-3'>
          <div>
            <small className='text-muted'>
              Penalty: {currentPenalty} success points
            </small>
          </div>
          <button
            className='btn btn-outline-secondary btn-sm'
            onClick={onShowSettings}
          >
            Settings
          </button>
        </div>
        <div className='mt-4'>
          <h6>Select Prefixes to Practice</h6>
          <div className='mb-3'>
            <button
              className='btn btn-sm btn-outline-primary me-2'
              onClick={selectAll}
            >
              Select All
            </button>
            <button
              className='btn btn-sm btn-outline-secondary me-2'
              onClick={clearSelection}
            >
              Clear All
            </button>
            <small className='text-muted'>
              Selected: {selectedPrefixes.length} prefixes
            </small>
          </div>
          <div className='row g-2'>
            {ALL_PREFIXES.map(prefix => (
              <div key={prefix} className='col-3 col-sm-2 col-md-1'>
                <div className='form-check'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    checked={selectedPrefixes.includes(prefix)}
                    onChange={() => togglePrefix(prefix)}
                    id={`prefix-${prefix}`}
                  />
                  <label
                    className='form-check-label small'
                    htmlFor={`prefix-${prefix}`}
                  >
                    /{prefix}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='row g-3'>
        <ModeSelectionCard
          mode={MemoryDrillMode.PREFIX_TO_HEXTET}
          title='Prefix → Hextet'
          description='Convert IPv6 prefix length to hextet position (÷4)'
          drillState={drillState}
          onChangeMode={handleModeChange}
          buttonColor='primary'
          selectedPrefixes={selectedPrefixes}
        />
        <ModeSelectionCard
          mode={MemoryDrillMode.HEX_TO_BINARY}
          title='Hex → Binary'
          description='Convert hex digit (0-F) to 4-bit binary'
          drillState={drillState}
          onChangeMode={handleModeChange}
          buttonColor='success'
        />
        <ModeSelectionCard
          mode={MemoryDrillMode.BINARY_TO_DECIMAL}
          title='Binary → Decimal'
          description='Convert 4-bit binary to decimal (0-15)'
          drillState={drillState}
          onChangeMode={handleModeChange}
          buttonColor='warning'
        />
        <ModeSelectionCard
          mode={MemoryDrillMode.BINARY_TO_HEX}
          title='Binary → Hex'
          description='Convert 4-bit binary to hexadecimal digit'
          drillState={drillState}
          onChangeMode={handleModeChange}
          buttonColor='info'
        />
        <ModeSelectionCard
          mode={MemoryDrillMode.IPV4_BINARY_TO_DECIMAL}
          title='IPv4 Binary → Decimal'
          description='Convert 8-bit binary (IPv4 octet) to decimal (0-255)'
          drillState={drillState}
          onChangeMode={handleModeChange}
          buttonColor='danger'
        />
      </div>
      <div className='mt-4'>
        <div className='alert alert-warning'>
          <strong>Tip:</strong> Start with the mode you find most challenging!
          Regular practice will help build automatic recall.
        </div>
      </div>
    </Card>
  );
}

export default MemoryDrillModeSelection;
