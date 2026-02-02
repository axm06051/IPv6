import { PrefixModeType } from "../constants";
import type { Exercise, ExerciseType } from "../types";
import {
  addressHasInterestingCompression,
  addressHasInterestingPattern,
  fullIPv6Format,
  ipv6Prefix,
  randomIPv6,
  shortestAbbreviation,
  tryGenerateInterestingAbbrevToFull,
  tryGenerateInterestingFullToAbbrev,
} from "./";

export const PrefixMode = {
  FIXED_64: "64",
  DIV_BY_4: "div4",
  NOT_DIV_BY_4: "notdiv4",
  RANDOM: "random",
} as const;

function getRandomInt(minInclusive: number, maxExclusive: number): number {
  const min = Math.ceil(minInclusive);
  const max = Math.floor(maxExclusive);
  return Math.floor(Math.random() * (max - min) + min);
}

function getCommonPrefixLengths(): number[] {
  return [64, 60, 56, 52, 48, 44, 40, 36, 32, 28, 24, 20, 16, 12, 8, 4];
}

function selectRandomCommonLength(min: number): number {
  const commonLengths = getCommonPrefixLengths();
  const filtered = commonLengths.filter(l => l >= min && l <= 128);
  if (filtered.length === 0) {
    throw new Error("No common prefix lengths available for the given minimum");
  }
  return filtered[Math.floor(Math.random() * filtered.length)]!;
}

function shouldUseCommonLength(): boolean {
  return Math.random() < 0.4;
}

function shouldUseCommonDiv4Length(): boolean {
  return Math.random() < 0.7;
}

function getPrefixLengthForDiv4Mode(min: number): number {
  const commonLengths = getCommonPrefixLengths();
  const availableDiv4 = commonLengths.filter(l => l >= min && l <= 128);
  if (availableDiv4.length > 0 && shouldUseCommonDiv4Length()) {
    return availableDiv4[Math.floor(Math.random() * availableDiv4.length)]!;
  }
  return 4 * getRandomInt(Math.ceil(min / 4), 33);
}

function getPrefixLengthForNotDiv4Mode(min: number): number {
  let p: number;
  do {
    p = getRandomInt(Math.max(min, 1), 129);
  } while (p % 4 === 0);
  return p;
}

export function getPrefixLength(mode: PrefixModeType, min: number = 0): number {
  if (mode === PrefixMode.RANDOM && shouldUseCommonLength()) {
    return selectRandomCommonLength(min);
  }
  switch (mode) {
    case PrefixMode.FIXED_64:
      return 64;
    case PrefixMode.DIV_BY_4:
      return getPrefixLengthForDiv4Mode(min);
    case PrefixMode.NOT_DIV_BY_4:
      return getPrefixLengthForNotDiv4Mode(min);
    case PrefixMode.RANDOM:
    default:
      return getRandomInt(min, 129);
  }
}

export function generateFullToAbbrevExercise(): Exercise {
  const addr = randomIPv6();
  const fullAddr = fullIPv6Format(addr);
  const shortest = shortestAbbreviation(addr);

  if (addressHasInterestingPattern(fullAddr)) {
    return {
      question: `\\texttt{${fullAddr}}`,
      answer: shortest,
      fullAnswer: fullAddr,
      type: "full-to-abbrev",
    };
  }

  const interesting = tryGenerateInterestingFullToAbbrev();
  if (interesting) return interesting;

  return {
    question: `\\texttt{${fullAddr}}`,
    answer: shortest,
    fullAnswer: fullAddr,
    type: "full-to-abbrev",
  };
}

export function generateAbbrevToFullExercise(): Exercise {
  const addr = randomIPv6();
  const shortest = shortestAbbreviation(addr);
  const fullAddr = fullIPv6Format(addr);

  if (addressHasInterestingCompression(shortest)) {
    return {
      question: `\\texttt{${shortest}}`,
      answer: fullAddr,
      abbrevAnswer: shortest,
      type: "abbrev-to-full",
    };
  }

  const interesting = tryGenerateInterestingAbbrevToFull();
  if (interesting) return interesting;

  return {
    question: `\\texttt{${shortest}}`,
    answer: fullAddr,
    abbrevAnswer: shortest,
    type: "abbrev-to-full",
  };
}

export function generatePrefixExercise(
  mode: PrefixModeType = PrefixMode.RANDOM
): Exercise {
  const addr = randomIPv6();
  const bits = getPrefixLength(mode);
  const network = ipv6Prefix(addr, bits);
  return {
    question: `\\texttt{${shortestAbbreviation(addr)}/${bits}}`,
    answer: `${shortestAbbreviation(network)}/${bits}`,
    fullAnswer: `${fullIPv6Format(network)}/${bits}`,
    type: "prefix",
  };
}

function calculatePrefixValueForMathExercise(mode: PrefixModeType): number {
  if (mode === PrefixMode.NOT_DIV_BY_4) {
    let P: number;
    do {
      P = getRandomInt(4, 65);
    } while (P % 4 === 0 || P < 4);
    return P;
  }
  return 4 * getRandomInt(Math.max(1, Math.ceil(4 / 4)), 17);
}

export function generateMathExercise(
  mode: PrefixModeType = PrefixMode.RANDOM
): Exercise {
  const P = calculatePrefixValueForMathExercise(mode);
  return {
    question: `\\frac{${P}}{4}`,
    answer: Math.floor(P / 4).toString(),
    type: "math",
  };
}

const exerciseGenerators: Record<
  ExerciseType,
  (mode?: PrefixModeType) => Exercise
> = {
  "full-to-abbrev": generateFullToAbbrevExercise,
  "abbrev-to-full": generateAbbrevToFullExercise,
  prefix: generatePrefixExercise,
  math: generateMathExercise,
};

export function createExerciseGenerator(
  type: ExerciseType,
  mode: PrefixModeType | null = null
): () => Exercise {
  return () => {
    const generator = exerciseGenerators[type];
    if (!generator) throw new Error(`Unknown exercise type: ${type}`);
    return generator(mode || undefined);
  };
}
