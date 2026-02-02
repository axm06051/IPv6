import ipaddr from "ipaddr.js";
import type {
  DetailedFeedback,
  Exercise,
  ExerciseType,
  FeedbackDetails,
  ParsedPrefixInput,
  ResultState,
} from "../types";

export function isValidIPv6String(str: string): boolean {
  if (!str || typeof str !== "string") return false;

  const trimmed = str.trim();

  // Basic IPv6 format check - must contain at least one colon
  if (!trimmed.includes(":")) return false;

  // Check for obviously invalid patterns
  if (trimmed.length < 2 || trimmed.length > 39) return false;

  try {
    const addr = ipaddr.parse(trimmed);
    // Only accept IPv6 addresses, not IPv4
    return addr.kind() === "ipv6";
  } catch {
    return false;
  }
}

function hasExactlyEightHextets(parts: string[]): boolean {
  return parts.length === 8;
}

function allHextetsAreFourDigits(parts: string[]): boolean {
  return parts.every(part => /^[0-9A-F]{4}$/.test(part));
}

export function isFullAddressFormat(input: string): boolean {
  const trimmed = input.trim().toUpperCase();
  const parts = trimmed.split(":");
  return hasExactlyEightHextets(parts) && allHextetsAreFourDigits(parts);
}

function extractAddressAndPrefix(
  trimmed: string
): { address: string; prefixLength: string } | null {
  const match = trimmed.match(/^(.+?)\s*\/\s*(\d+)$/);
  if (!match || !match[1] || !match[2]) return null;
  return { address: match[1].trim(), prefixLength: match[2] };
}

export function parsePrefixInput(input: string): ParsedPrefixInput | null {
  const trimmed = input.trim();
  const extracted = extractAddressAndPrefix(trimmed);
  if (!extracted) return null;
  try {
    const addr = ipaddr.parse(extracted.address);
    const prefix = parseInt(extracted.prefixLength, 10);
    if (prefix < 0 || prefix > 128) return null;
    return { addr, prefix };
  } catch {
    return null;
  }
}

export function validateAnswer(
  userInput: string,
  expectedAnswer: string,
  exerciseType: ExerciseType
): boolean {
  const trimmedInput = userInput.trim().toUpperCase();

  switch (exerciseType) {
    case "full-to-abbrev":
      return validateFullToAbbrevAnswer(trimmedInput, expectedAnswer);
    case "abbrev-to-full":
      return validateAbbrevToFullAnswer(trimmedInput, expectedAnswer);
    case "prefix":
      return validatePrefixAnswer(trimmedInput, expectedAnswer);
    case "math":
      return validateMathAnswer(trimmedInput, expectedAnswer);
    default:
      return false;
  }
}

function isShortestAbbreviationMatch(
  userInput: string,
  expectedShortest: string
): boolean {
  const trimmedInput = userInput.trim().toUpperCase();
  if (!isValidIPv6String(trimmedInput)) return false;
  try {
    const userAddr = ipaddr.parse(trimmedInput);
    const userShortest = userAddr.toString().toUpperCase();
    return (
      trimmedInput === userShortest &&
      trimmedInput === expectedShortest.toUpperCase()
    );
  } catch {
    return false;
  }
}

function validateFullToAbbrevAnswer(
  userInput: string,
  expectedAnswer: string
): boolean {
  return isShortestAbbreviationMatch(userInput, expectedAnswer);
}

function validateAbbrevToFullAnswer(
  userInput: string,
  expectedAnswer: string
): boolean {
  if (!isFullAddressFormat(userInput)) return false;
  return userInput === expectedAnswer.toUpperCase();
}

function extractPrefixComponents(expectedAnswer: string): {
  expectedAddr: string;
  expectedPrefix: number;
} {
  const parts = expectedAnswer.split("/");
  const expectedAddr = parts[0];
  const expectedPrefix = parts[1];
  if (!expectedAddr || !expectedPrefix) {
    throw new Error("Invalid expected answer format");
  }
  return { expectedAddr, expectedPrefix: parseInt(expectedPrefix, 10) };
}

function extractUserAddressFromPrefix(trimmedInput: string): string | null {
  const match = trimmedInput.match(/^(.+?)\s*\/\s*\d+$/);
  if (!match || !match[1]) return null;
  return match[1].trim().toUpperCase();
}

function validatePrefixAnswer(
  userInput: string,
  expectedAnswer: string
): boolean {
  const parsedInput = parsePrefixInput(userInput);
  if (!parsedInput) return false;
  const { expectedAddr, expectedPrefix } =
    extractPrefixComponents(expectedAnswer);
  if (parsedInput.prefix !== expectedPrefix) return false;
  const userAddrPart = extractUserAddressFromPrefix(userInput);
  if (!userAddrPart) return false;
  return isShortestAbbreviationMatch(userAddrPart, expectedAddr);
}

function validateMathAnswer(
  userInput: string,
  expectedAnswer: string
): boolean {
  return userInput === expectedAnswer;
}

export function computeShortestFormFromUserInput(
  userFormattedInput: string
): string | null {
  // Don't process obviously invalid inputs
  if (!userFormattedInput || userFormattedInput.trim().length < 2) return null;

  const trimmed = userFormattedInput.trim();

  // Basic IPv6 format check - must contain at least one colon for IPv6
  if (!trimmed.includes(":")) return null;

  if (!isValidIPv6String(trimmed)) return null;

  try {
    const addr = ipaddr.parse(trimmed);
    // Only process if it's actually an IPv6 address, not IPv4
    if (addr.kind() !== "ipv6") return null;
    return addr.toString().toUpperCase();
  } catch {
    return null;
  }
}

export function createResultMessage(
  isCorrect: boolean,
  expectedAnswer: string
): string {
  return isCorrect ? "Correct!" : `Incorrect. Expected: ${expectedAnswer}`;
}

export function createResultState(
  isCorrect: boolean,
  ex: Exercise,
  userFormattedInput: string,
  shortestForm: string | null
): ResultState {
  return {
    message: createResultMessage(isCorrect, ex.answer),
    success: isCorrect,
    formattedExpectedAnswer: ex.answer,
    userInput: userFormattedInput,
    shortestForm,
  };
}

export function getDetailedFeedback(
  userInput: string,
  expectedAnswer: string,
  exerciseType: ExerciseType,
  isCorrect: boolean
): DetailedFeedback {
  if (isCorrect) {
    return {
      type: "success",
      message: "Correct!",
      details: null,
    };
  }

  const feedback: DetailedFeedback = {
    type: "error",
    message: `Incorrect. Expected: ${expectedAnswer}`,
    details: null,
  };

  switch (exerciseType) {
    case "full-to-abbrev":
      feedback.details = getFullToAbbrevFeedback(userInput, expectedAnswer);
      break;
    case "abbrev-to-full":
      feedback.details = getAbbrevToFullFeedback(userInput, expectedAnswer);
      break;
    case "prefix":
      feedback.details = getPrefixFeedback(userInput, expectedAnswer);
      break;
    case "math":
      feedback.details = getMathFeedback(userInput, expectedAnswer);
      break;
  }

  return feedback;
}

function getFullToAbbrevFeedback(
  userInput: string,
  expectedAnswer: string
): FeedbackDetails | null {
  if (!isValidIPv6String(userInput)) {
    return {
      type: "format-error",
      message: "Invalid IPv6 address format",
      suggestions: [
        "Make sure you use valid hexadecimal digits (0-9, A-F)",
        "Use colons to separate hextets",
        "Check for typos in your input",
      ],
    };
  }

  try {
    const userAddr = ipaddr.parse(userInput);
    const userShortest = userAddr.toString().toUpperCase();

    if (userInput !== userShortest) {
      return {
        type: "abbreviation-error",
        message: "Your address can be abbreviated further",
        suggestions: [
          `Your input: ${userInput}`,
          `Can be shortened to: ${userShortest}`,
          "Use :: for the longest run of consecutive zeros",
          "Remove leading zeros from each hextet",
        ],
      };
    }
  } catch (e) {
    return {
      type: "parse-error",
      message: "Could not parse your IPv6 address",
      suggestions: ["Check the format of your input"],
    };
  }

  return null;
}

function getAbbrevToFullFeedback(
  userInput: string,
  expectedAnswer: string
): FeedbackDetails | null {
  const parts = userInput.split(":");

  if (parts.length !== 8) {
    return {
      type: "format-error",
      message: "Full format requires exactly 8 hextets",
      suggestions: [
        "Each hextet must be 4 hexadecimal digits",
        "Separate hextets with colons",
        "Include leading zeros (e.g., 0001 not 1)",
        "Do not use :: compression in full format",
      ],
    };
  }

  const invalidParts = parts.filter(part => !/^[0-9A-F]{4}$/.test(part));
  if (invalidParts.length > 0) {
    return {
      type: "hextet-error",
      message: "Invalid hextet format",
      suggestions: [
        `Invalid hextets: ${invalidParts.join(", ")}`,
        "Each hextet must be exactly 4 hexadecimal digits",
        "Use leading zeros (e.g., 0001 not 1)",
        "Valid characters: 0-9, A-F",
      ],
    };
  }

  return null;
}

function getPrefixFeedback(
  userInput: string,
  expectedAnswer: string
): FeedbackDetails | null {
  const match = userInput.match(/^(.+?)\s*\/\s*(\d+)$/);

  if (!match || !match[1] || !match[2]) {
    return {
      type: "format-error",
      message: "Invalid prefix notation format",
      suggestions: [
        "Use format: address/prefix-length",
        "Example: 2001:DB8::/32",
        "Prefix length must be 0-128",
        "Space before slash is optional",
      ],
    };
  }

  const address = match[1];
  const prefix = match[2];
  const prefixNum = parseInt(prefix, 10);

  if (prefixNum < 0 || prefixNum > 128) {
    return {
      type: "prefix-error",
      message: "Invalid prefix length",
      suggestions: [
        "Prefix length must be between 0 and 128",
        `You entered: ${prefix}`,
        "Common prefixes: /64, /48, /32, /24",
      ],
    };
  }

  if (!isValidIPv6String(address)) {
    return {
      type: "address-error",
      message: "Invalid IPv6 address in prefix",
      suggestions: [
        "Use shortest abbreviated form for the address",
        "Remove leading zeros from hextets",
        "Use :: for consecutive zero hextets",
      ],
    };
  }

  return null;
}

function getMathFeedback(
  userInput: string,
  expectedAnswer: string
): FeedbackDetails | null {
  const userNum = parseInt(userInput, 10);
  const expectedNum = parseInt(expectedAnswer, 10);

  if (isNaN(userNum)) {
    return {
      type: "format-error",
      message: "Please enter a valid number",
      suggestions: ["Enter only digits (0-9)"],
    };
  }

  const difference = Math.abs(userNum - expectedNum);
  return {
    type: "calculation-error",
    message: "Incorrect calculation",
    suggestions: [
      `Your answer: ${userNum}`,
      `Correct answer: ${expectedNum}`,
      `Difference: ${difference}`,
      userNum < expectedNum
        ? "Your answer is too small"
        : "Your answer is too large",
    ],
  };
}
