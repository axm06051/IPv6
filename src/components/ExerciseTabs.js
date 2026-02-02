import React from 'react';
import { BsBook, BsCalculator } from 'react-icons/bs';
import Exercise from './Exercise';
import { createExerciseGenerator } from '../utils/exerciseGenerators';
import { PrefixMode } from '../constants/prefixModes';

const TAB_CONFIG = [
  {
    id: 'basics',
    label: 'Address Basics',
    icon: BsBook,
    exercises: [
      {
        title: 'Full to Abbreviated',
        type: 'full-to-abbrev',
        category: 'full-to-abbrev'
      },
      {
        title: 'Abbreviated to Full',
        type: 'abbrev-to-full',
        category: 'abbrev-to-full'
      }
    ]
  },
  {
    id: 'prefix',
    label: 'Prefix Calculation',
    icon: BsCalculator,
    exercises: [
      {
        title: 'Prefix (Fixed /64)',
        type: 'prefix',
        mode: PrefixMode.FIXED_64,
        category: 'prefix-fixed-64'
      },
      {
        title: 'Prefix (Divisible by 4)',
        type: 'prefix',
        mode: PrefixMode.DIV_BY_4,
        category: 'prefix-div-4'
      },
      {
        title: 'Prefix (Not Divisible by 4)',
        type: 'prefix',
        mode: PrefixMode.NOT_DIV_BY_4,
        category: 'prefix-not-div-4'
      },
      {
        title: 'Prefix (Random Length)',
        type: 'prefix',
        mode: PrefixMode.RANDOM,
        category: 'prefix-random'
      }
    ]
  },
  {
    id: 'math',
    label: 'Math Practice',
    icon: BsCalculator,
    exercises: [
      {
        title: 'Division Practice',
        type: 'math',
        mode: PrefixMode.RANDOM,
        category: 'math-practice'
      }
    ]
  }
];

function createTabId(tabId) {
  return `${tabId}-tab`;
}

function createTabPaneId(tabId) {
  return `${tabId}-tab-pane`;
}

function isActiveTab(idx) {
  return idx === 0;
}

function ExerciseTabs({ recordAnswer }) {
  return (
    <>
      <ul className="nav nav-tabs mb-4" role="tablist">
        {TAB_CONFIG.map((tab, idx) => (
          <li className="nav-item" key={tab.id} role="presentation">
            <button
              className={`nav-link ${isActiveTab(idx) ? 'active' : ''}`}
              id={createTabId(tab.id)}
              data-bs-toggle="tab"
              data-bs-target={`#${createTabPaneId(tab.id)}`}
              type="button"
              role="tab"
            >
              <tab.icon className="me-2" />
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
      
      <div className="tab-content">
        {TAB_CONFIG.map((tab, idx) => (
          <div
            key={tab.id}
            className={`tab-pane fade ${isActiveTab(idx) ? 'show active' : ''}`}
            id={createTabPaneId(tab.id)}
            role="tabpanel"
          >
            <div className="row g-4">
              {tab.exercises.map((exercise) => (
                <div key={exercise.category} className="col-12">
                  <Exercise
                    title={exercise.title}
                    generator={createExerciseGenerator(exercise.type, exercise.mode)}
                    category={exercise.category}
                    onAnswerSubmit={recordAnswer}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default ExerciseTabs;