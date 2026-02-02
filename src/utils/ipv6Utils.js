import React from 'react';
import katex from 'katex';
import ipaddr from 'ipaddr.js';

export function KaTeX({ tex }) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(tex, { throwOnError: false })
      }}
    />
  );
}

export function formatIPv6WithBreaks(address) {
  return address.split(':').map((segment, idx, arr) => (
    <React.Fragment key={idx}>
      {segment}
      {idx < arr.length - 1 && (
        <>
          :<wbr />
        </>
      )}
    </React.Fragment>
  ));
}

export function isIPv6Address(str) {
  return /^[0-9A-F:]+$/.test(str);
}

export function renderIPv6Question(tex) {
  const textttMatch = tex.match(/\\texttt\{([^}]+)\}/);
  if (textttMatch) {
    const content = textttMatch[1];
    const prefixMatch = content.match(/^([0-9A-F:]+)\/(\d+)$/);
    
    if (prefixMatch) {
      const [, address, prefix] = prefixMatch;
      return (
        <span className="font-monospace" style={{ fontSize: 'inherit' }}>
          {formatIPv6WithBreaks(address)}
          <wbr />/{prefix}
        </span>
      );
    }
    
    if (isIPv6Address(content)) {
      return (
        <span className="font-monospace" style={{ fontSize: 'inherit' }}>
          {formatIPv6WithBreaks(content)}
        </span>
      );
    }
  }
  
  return <KaTeX tex={tex} />;
}

export function randomIPv6() {
  const parts = [];
  for (let i = 0; i < 8; i++) {
    if (i < 4) {
      parts.push(Math.floor(Math.random() * 0xffff) || 0x1000);
    } else {
      parts.push(Math.random() < 0.6 ? 0 : Math.floor(Math.random() * 0xffff));
    }
  }
  
  // Ensure non-zero address
  if (parts.every(p => p === 0)) {
    parts[7] = 0x1;
  }
  
  return new ipaddr.IPv6(parts);
}

export function fullIPv6Format(addr) {
  return addr.parts
    .map(h => h.toString(16).toUpperCase().padStart(4, '0'))
    .join(':');
}

export function shortestAbbreviation(addr) {
  return addr.toString().toUpperCase();
}