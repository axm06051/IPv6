import ipaddr from "ipaddr.js";
import katex from "katex";
import React from "react";
import type { ExerciseType } from "../types";

interface KaTeXProps {
  tex: string;
}

export function KaTeX({ tex }: KaTeXProps): React.JSX.Element {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(tex, { throwOnError: false }),
      }}
    />
  );
}

export function formatIPv6WithBreaks(address: string): React.JSX.Element[] {
  return address.split(":").map((segment, idx, arr) => (
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

export function isIPv6Address(str: string): boolean {
  return /^[0-9A-F:]+$/.test(str);
}

export function renderIPv6Question(tex: string): React.JSX.Element {
  const textttMatch = tex.match(/\\texttt\{([^}]+)\}/);
  if (textttMatch) {
    const content = textttMatch[1];
    if (!content) {
      return <KaTeX tex={tex} />;
    }

    const prefixMatch = content.match(/^([0-9A-F:]+)\/(\d+)$/);

    if (prefixMatch) {
      const address = prefixMatch[1];
      const prefix = prefixMatch[2];
      if (!address || !prefix) {
        return <KaTeX tex={tex} />;
      }
      return (
        <span className='font-monospace' style={{ fontSize: "inherit" }}>
          {formatIPv6WithBreaks(address)}
          <wbr />/{prefix}
        </span>
      );
    }

    if (isIPv6Address(content)) {
      return (
        <span className='font-monospace' style={{ fontSize: "inherit" }}>
          {formatIPv6WithBreaks(content)}
        </span>
      );
    }
  }

  return <KaTeX tex={tex} />;
}

export function shouldRenderWithKaTeX(text: string): boolean {
  return typeof text === "string" && /^\d+$/.test(text);
}

export function renderWithKaTeX(text: string): React.JSX.Element | string {
  if (!shouldRenderWithKaTeX(text)) return text;
  return <KaTeX tex={text} />;
}

function generateInterestingHexWithRepeatedDigits(): number {
  const digit = Math.floor(Math.random() * 16);
  return (digit << 12) | (digit << 8) | (digit << 4) | digit;
}

function generateInterestingHexWithRandomPattern(): number {
  const first = Math.floor(Math.random() * 16);
  const second = Math.floor(Math.random() * 16);
  const third = Math.floor(Math.random() * 16);
  const fourth = Math.floor(Math.random() * 16);
  return (
    (first << 12) |
    (second << 8) |
    (Math.random() < 0.3 ? 0 : third << 4) |
    fourth
  );
}

function generateFullyRandomHex(): number {
  return Math.floor(Math.random() * 0x10000);
}

function generateSmallRandomHex(): number {
  return Math.floor(Math.random() * 0x1000);
}

function generateInterestingHex(): number {
  const generators = [
    generateInterestingHexWithRandomPattern,
    generateInterestingHexWithRepeatedDigits,
    generateFullyRandomHex,
    generateSmallRandomHex,
  ];
  const selectedGenerator =
    generators[Math.floor(Math.random() * generators.length)];
  if (!selectedGenerator) {
    throw new Error("No hex generator found");
  }
  return selectedGenerator();
}

function generateHexWithLeadingZeros(): number {
  const maxValues = [0xf, 0xff, 0xfff];
  const max = maxValues[Math.floor(Math.random() * maxValues.length)];
  if (max === undefined) {
    throw new Error("No max value found for hex generation");
  }
  return Math.floor(Math.random() * (max + 1));
}

function createIPv6WithInterestingHexPattern(parts: number[]): void {
  parts[0] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[1] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[2] = generateInterestingHex();
  parts[3] = generateInterestingHex();
  parts[4] = generateInterestingHex();
  parts[5] = Math.random() < 0.5 ? generateInterestingHex() : 0;
  parts[6] = Math.random() < 0.5 ? generateInterestingHex() : 0;
  parts[7] = generateInterestingHex();
}

function createIPv6WithMiddleCompression(parts: number[]): void {
  parts[0] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[1] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts.fill(0, 2, 6);
  parts[6] = generateInterestingHex();
  parts[7] = generateInterestingHex();
}

function createIPv6WithTrailingCompression(parts: number[]): void {
  parts[0] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[1] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[2] = generateInterestingHex();
  parts[3] = generateInterestingHex();
  parts.fill(0, 4, 8);
}

function createIPv6WithLeadingZeros(parts: number[]): void {
  parts[0] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[1] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[2] = generateHexWithLeadingZeros();
  parts[3] = generateHexWithLeadingZeros();
  parts[4] = generateInterestingHex();
  parts[5] = generateHexWithLeadingZeros();
  parts[6] = Math.random() < 0.5 ? generateHexWithLeadingZeros() : 0;
  parts[7] = generateInterestingHex();
}

function createIPv6WithMixedZeros(parts: number[]): void {
  parts[0] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[1] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[2] = Math.random() < 0.7 ? generateInterestingHex() : 0;
  parts[3] = Math.random() < 0.7 ? generateInterestingHex() : 0;
  parts[4] = 0;
  parts[5] = Math.random() < 0.7 ? generateInterestingHex() : 0;
  parts[6] = 0;
  parts[7] = generateInterestingHex();
}

function createDocumentationPrefix(parts: number[]): void {
  parts[0] = 0x2001;
  parts[1] = 0x0db8;
  parts.fill(0, 2, 4);
  parts[4] = Math.random() < 0.7 ? 0 : generateInterestingHex();
  parts[5] = Math.random() < 0.7 ? 0 : generateInterestingHex();
  parts[6] = Math.random() < 0.7 ? 0 : generateInterestingHex();
  parts[7] = generateInterestingHex();
}

function createUniqueLocalAddress(parts: number[]): void {
  parts[0] = 0xfd00;
  parts[1] = generateInterestingHex();
  parts[2] = generateInterestingHex();
  parts[3] = generateInterestingHex();
  parts[4] = Math.random() < 0.7 ? 0 : generateInterestingHex();
  parts[5] = Math.random() < 0.7 ? 0 : generateInterestingHex();
  parts[6] = generateInterestingHex();
  parts[7] = generateInterestingHex();
}

function createIPv6WithDocumentationOrULA(parts: number[]): void {
  if (Math.random() < 0.3) {
    createDocumentationPrefix(parts);
  } else {
    createUniqueLocalAddress(parts);
  }
}

function ensureNonZeroAddress(parts: number[]): void {
  if (parts.every(p => p === 0)) {
    (parts as any)[7] = 1;
  }
}

function generateEducationalIPv6(): any {
  const parts: number[] = new Array(8).fill(0);
  const patternType = Math.floor(Math.random() * 6);
  const patternGenerators = [
    createIPv6WithInterestingHexPattern,
    createIPv6WithMiddleCompression,
    createIPv6WithTrailingCompression,
    createIPv6WithLeadingZeros,
    createIPv6WithMixedZeros,
    createIPv6WithDocumentationOrULA,
  ];
  const selectedGenerator = patternGenerators[patternType];
  if (!selectedGenerator) {
    throw new Error(`No pattern generator found for type: ${patternType}`);
  }
  selectedGenerator(parts);
  ensureNonZeroAddress(parts);
  return new ipaddr.IPv6(parts);
}

function generateRandomIPv6Parts(): number[] {
  const parts = [];
  for (let i = 0; i < 8; i++) {
    if (i < 4) {
      parts.push(Math.floor(Math.random() * 0xffff) || 0x1000);
    } else {
      parts.push(Math.random() < 0.6 ? 0 : Math.floor(Math.random() * 0xffff));
    }
  }
  ensureNonZeroAddress(parts);
  return parts;
}

export function randomIPv6(): any {
  if (Math.random() < 0.3) {
    return generateEducationalIPv6();
  }
  const parts = generateRandomIPv6Parts();
  return new ipaddr.IPv6(parts);
}

export function fullIPv6Format(addr: any): string {
  return addr.parts
    .map((h: number) => h.toString(16).toUpperCase().padStart(4, "0"))
    .join(":");
}

export function shortestAbbreviation(addr: any): string {
  return addr.toString().toUpperCase();
}

// Prefix calculation functions
function calculateFullHextets(bits: number): number {
  return Math.floor(bits / 16);
}

function calculateRemainingBits(bits: number): number {
  return bits % 16;
}

function createBitMask(remainingBits: number): number {
  return ~((1 << (16 - remainingBits)) - 1) & 0xffff;
}

function applyPrefixMask(
  parts: number[],
  fullHextets: number,
  remainingBits: number
): void {
  for (let i = fullHextets; i < 8; i++) {
    parts[i] = 0;
  }
  if (remainingBits > 0 && fullHextets < 8) {
    const mask = createBitMask(remainingBits);
    const targetPart = parts[fullHextets];
    if (targetPart !== undefined) {
      parts[fullHextets] = targetPart & mask;
    }
  }
}

export function ipv6Prefix(addr: any, bits: number): any {
  const parts = addr.parts.slice();
  const fullHextets = calculateFullHextets(bits);
  const remainingBits = calculateRemainingBits(bits);
  applyPrefixMask(parts, fullHextets, remainingBits);
  return new ipaddr.IPv6(parts);
}

// Pattern detection functions
export function addressHasInterestingPattern(fullAddr: string): boolean {
  const parts = fullAddr.split(":");
  return parts.some(
    part =>
      /[A-F].*0.*0.*[A-F]/.test(part) ||
      part === "0000" ||
      /^0+[A-F0-9]+$/.test(part)
  );
}

export function addressHasInterestingCompression(shortest: string): boolean {
  return (
    shortest.includes("::") ||
    shortest.match(/:[0-9A-F]{1,3}:/g)?.some(h => h.length < 6) ||
    false
  );
}

interface ExerciseResult {
  question: string;
  answer: string;
  fullAnswer?: string;
  abbrevAnswer?: string;
  type: ExerciseType;
}

export function tryGenerateInterestingFullToAbbrev(
  maxAttempts: number = 3
): ExerciseResult | null {
  for (let i = 0; i < maxAttempts; i++) {
    const addr = randomIPv6();
    const fullAddr = fullIPv6Format(addr);
    if (addressHasInterestingPattern(fullAddr)) {
      return {
        question: `\\texttt{${fullAddr}}`,
        answer: shortestAbbreviation(addr),
        fullAnswer: fullAddr,
        type: "full-to-abbrev",
      };
    }
  }
  return null;
}

export function tryGenerateInterestingAbbrevToFull(
  maxAttempts: number = 3
): ExerciseResult | null {
  for (let i = 0; i < maxAttempts; i++) {
    const addr = randomIPv6();
    const shortest = shortestAbbreviation(addr);
    if (addressHasInterestingCompression(shortest)) {
      return {
        question: `\\texttt{${shortest}}`,
        answer: fullIPv6Format(addr),
        abbrevAnswer: shortest,
        type: "abbrev-to-full",
      };
    }
  }
  return null;
}
