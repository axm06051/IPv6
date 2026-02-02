import { randomIPv6, fullIPv6Format, shortestAbbreviation } from './ipv6Utils';
import { PrefixMode } from '../constants/prefixModes';
import ipaddr from 'ipaddr.js';

export function generateFullToAbbrevExercise() {
  const addr = randomIPv6();
  const fullAddr = fullIPv6Format(addr);
  const shortest = shortestAbbreviation(addr);
  
  return {
    question: `\\texttt{${fullAddr}}`,
    answer: shortest,
    fullAnswer: fullAddr,
    type: 'full-to-abbrev'
  };
}

export function generateAbbrevToFullExercise() {
  const addr = randomIPv6();
  const shortest = shortestAbbreviation(addr);
  const fullAddr = fullIPv6Format(addr);
  
  return {
    question: `\\texttt{${shortest}}`,
    answer: fullAddr,
    abbrevAnswer: shortest,
    type: 'abbrev-to-full'
  };
}

export function generatePrefixExercise(mode) {
  const addr = randomIPv6();
  const bits = getPrefixLength(mode);
  const network = ipv6Prefix(addr, bits);
  
  return {
    question: `\\texttt{${shortestAbbreviation(addr)}/${bits}}`,
    answer: `${shortestAbbreviation(network)}/${bits}`,
    fullAnswer: `${fullIPv6Format(network)}/${bits}`,
    type: 'prefix'
  };
}

export function generateMathExercise(mode) {
  const P = calculatePrefixValueForMathExercise(mode);
  return {
    question: `\\frac{${P}}{4}`,
    answer: Math.floor(P / 4).toString(),
    type: 'math'
  };
}

function getPrefixLength(mode, min = 0) {
  switch (mode) {
    case PrefixMode.FIXED_64:
      return 64;
    case PrefixMode.DIV_BY_4:
      return 4 * getRandomInt(Math.max(1, Math.ceil(min / 4)), 33);
    case PrefixMode.NOT_DIV_BY_4:
      let p;
      do {
        p = getRandomInt(Math.max(min, 1), 129);
      } while (p % 4 === 0);
      return p;
    case PrefixMode.RANDOM:
    default:
      return getRandomInt(min, 129);
  }
}

function calculatePrefixValueForMathExercise(mode) {
  if (mode === PrefixMode.NOT_DIV_BY_4) {
    let P;
    do {
      P = getRandomInt(4, 65);
    } while (P % 4 === 0 || P < 4);
    return P;
  }
  return 4 * getRandomInt(Math.max(1, Math.ceil(4 / 4)), 17);
}

function ipv6Prefix(addr, bits) {
  const parts = addr.parts.slice();
  const fullHextets = Math.floor(bits / 16);
  const remainingBits = bits % 16;
  
  for (let i = fullHextets; i < 8; i++) {
    parts[i] = 0;
  }
  
  if (remainingBits > 0 && fullHextets < 8) {
    const mask = ~((1 << (16 - remainingBits)) - 1) & 0xffff;
    parts[fullHextets] &= mask;
  }
  
  return new ipaddr.IPv6(parts);
}

function getRandomInt(minInclusive, maxExclusive) {
  const min = Math.ceil(minInclusive);
  const max = Math.floor(maxExclusive);
  return Math.floor(Math.random() * (max - min) + min);
}

export function createExerciseGenerator(type, mode = null) {
  return () => {
    switch (type) {
      case 'full-to-abbrev':
        return generateFullToAbbrevExercise();
      case 'abbrev-to-full':
        return generateAbbrevToFullExercise();
      case 'prefix':
        return generatePrefixExercise(mode);
      case 'math':
        return generateMathExercise(mode);
      default:
        throw new Error(`Unknown exercise type: ${type}`);
    }
  };
}