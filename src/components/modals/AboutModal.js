import React from 'react';
import ModalDialog from './ModalDialog.js';

function AboutModal({ show, onClose }) {
  return (
    <ModalDialog
      show={show}
      onClose={onClose}
      title="About IPv6 Practice"
      footer={
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      }
    >
      <p className="lead">
        A comprehensive training application for mastering IPv6 addressing.
      </p>
      <h6 className="mt-4">Features</h6>
      <ul>
        <li>Address format conversion exercises</li>
        <li>Network prefix calculations</li>
        <li>Prefix mathematics practice</li>
        <li>Real-time feedback and statistics</li>
      </ul>
      <h6 className="mt-4">Format Requirements:</h6>
      <ul className="mb-0">
        <li>
          <strong>"Full to Abbreviated":</strong> Shortest valid abbreviation
        </li>
        <li>
          <strong>"Abbreviated to Full":</strong> Full 4-digit hextets
        </li>
        <li>
          <strong>"Prefix":</strong> Abbreviated address with prefix
        </li>
      </ul>
    </ModalDialog>
  );
}

export default AboutModal;