import React from 'react';
import ModalDialog from './ModalDialog';

function createRFCLink(title, url, description) {
  return { title, url, description };
}

function getRFCLinks() {
  return [
    createRFCLink(
      'RFC 8200 - Internet Protocol, Version 6 (IPv6) Specification',
      'https://www.rfc-editor.org/rfc/rfc8200.html',
      'The core IPv6 specification document.'
    ),
    createRFCLink(
      'RFC 4291 - IP Version 6 Addressing Architecture',
      'https://www.rfc-editor.org/rfc/rfc4291.html',
      'IPv6 addressing architecture and format specifications.'
    ),
    createRFCLink(
      'RFC 5952 - A Recommendation for IPv6 Address Text Representation',
      'https://www.rfc-editor.org/rfc/rfc5952.html',
      'Standards for IPv6 address text representation.'
    )
  ];
}

function createLearningResource(title, content) {
  return { title, content };
}

function getLearningResources() {
  return [
    createLearningResource(
      'IPv6 Address Representation',
      'IPv6 addresses are 128-bit identifiers for interfaces. Format: 32 hexadecimal digits arranged as 8 groups of 4 hex digits separated by colons.'
    ),
    createLearningResource(
      'Address Compression Rules',
      'Leading zeros in each hextet may be omitted. One sequence of consecutive zero-valued hextets may be replaced with "::" (double colon).'
    ),
    createLearningResource(
      'Prefix Notation',
      'IPv6 prefixes are expressed using CIDR notation (e.g., 2001:db8::/32). The prefix length indicates the number of leftmost bits that define the network portion.'
    )
  ];
}

function DocsModal({ show, onClose }) {
  const rfcLinks = getRFCLinks();
  const learningResources = getLearningResources();

  return (
    <ModalDialog
      show={show}
      onClose={onClose}
      title="RFC Documentation & Reference"
      footer={
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      }
    >
      <h6>RFC Standards</h6>
      {rfcLinks.map((rfc, index) => (
        <div key={index} className="mb-3">
          <a
            href={rfc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none"
          >
            <strong>{rfc.title}</strong>
          </a>
          <p className="text-muted small mb-0">{rfc.description}</p>
        </div>
      ))}
      
      <h6 className="mt-4">IPv6 Quick Reference</h6>
      {learningResources.map((resource, index) => (
        <div key={index} className="mb-3">
          <strong>{resource.title}</strong>
          <p className="mb-0">{resource.content}</p>
        </div>
      ))}
      
      <div className="alert alert-info mt-3 mb-0">
        <strong>Keyboard Shortcuts:</strong>
        <ul className="mb-0 mt-2">
          <li>Press <kbd>Enter</kbd> to submit your answer</li>
          <li>Focus automatically moves to input fields</li>
          <li>Quick navigation between exercises</li>
        </ul>
      </div>
    </ModalDialog>
  );
}

export default DocsModal;