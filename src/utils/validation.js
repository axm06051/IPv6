import ipaddr from 'ipaddr.js';

export function isValidIPv6String(str) {
  try {
    ipaddr.parse(str.trim());
    return true;
  } catch {
    return false;
  }
}

function hasExactlyEightHextets(parts) {
  return parts.length === 8;
}

function allHextetsAreFourDigits(parts) {
  return parts.every((part) => /^[0-9A-F]{4}$/.test(part));
}

export function isFullAddressFormat(input) {
  const trimmed = input.trim().toUpperCase();
  const parts = trimmed.split(':');
  return hasExactlyEightHextets(parts) && allHextetsAreFourDigits(parts);
}

function extractAddressAndPrefix(trimmed) {
  const match = trimmed.match(/^(.+?)\s*\/\s*(\d+)$/);
  if (!match) return null;
  return { address: match[1].trim(), prefixLength: match[2] };
}

export function parsePrefixInput(input) {
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

export function validateAnswer(userInput, expectedAnswer, exerciseType) {
  const trimmedInput = userInput.trim().toUpperCase();
  
  switch (exerciseType) {
    case 'full-to-abbrev':
      return validateFullToAbbrevAnswer(trimmedInput, expectedAnswer);
    case 'abbrev-to-full':
      return validateAbbrevToFullAnswer(trimmedInput, expectedAnswer);
    case 'prefix':
      return validatePrefixAnswer(trimmedInput, expectedAnswer);
    case 'math':
      return validateMathAnswer(trimmedInput, expectedAnswer);
    default:
      return false;
  }
}

function isShortestAbbreviationMatch(userInput, expectedShortest) {
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

function validateFullToAbbrevAnswer(userInput, expectedAnswer) {
  return isShortestAbbreviationMatch(userInput, expectedAnswer);
}

function validateAbbrevToFullAnswer(userInput, expectedAnswer) {
  if (!isFullAddressFormat(userInput)) return false;
  return userInput === expectedAnswer.toUpperCase();
}

function extractPrefixComponents(expectedAnswer) {
  const [expectedAddr, expectedPrefix] = expectedAnswer.split('/');
  return { expectedAddr, expectedPrefix: parseInt(expectedPrefix, 10) };
}

function extractUserAddressFromPrefix(trimmedInput) {
  const match = trimmedInput.match(/^(.+?)\s*\/\s*\d+$/);
  return match ? match[1].trim().toUpperCase() : null;
}

function validatePrefixAnswer(userInput, expectedAnswer) {
  const parsedInput = parsePrefixInput(userInput);
  if (!parsedInput) return false;
  const { expectedAddr, expectedPrefix } = extractPrefixComponents(expectedAnswer);
  if (parsedInput.prefix !== expectedPrefix) return false;
  const userAddrPart = extractUserAddressFromPrefix(userInput);
  if (!userAddrPart) return false;
  return isShortestAbbreviationMatch(userAddrPart, expectedAddr);
}

function validateMathAnswer(userInput, expectedAnswer) {
  return userInput === expectedAnswer;
}

export function computeShortestFormFromUserInput(userFormattedInput) {
  if (!isValidIPv6String(userFormattedInput)) return null;
  try {
    const addr = ipaddr.parse(userFormattedInput);
    return addr.toString().toUpperCase();
  } catch {
    return null;
  }
}

export function createResultMessage(isCorrect, expectedAnswer) {
  return isCorrect ? 'Correct!' : `Incorrect. Expected: ${expectedAnswer}`;
}

export function createResultState(isCorrect, ex, userFormattedInput, shortestForm) {
  return {
    message: createResultMessage(isCorrect, ex.answer),
    success: isCorrect,
    formattedExpectedAnswer: ex.answer,
    userInput: userFormattedInput,
    shortestForm
  };
}

export function getDetailedFeedback(userInput, expectedAnswer, exerciseType, isCorrect) {

  if (isCorrect) {
    return {
      type: 'success',
      message: 'Correct!',
      details: null
    };
  }

  const feedback = {
    type: 'error',
    message: `Incorrect. Expected: ${expectedAnswer}`,
    details: null
  };

  switch (exerciseType) {
    case 'full-to-abbrev':
      feedback.details = getFullToAbbrevFeedback(userInput, expectedAnswer);
      break;
    case 'abbrev-to-full':
      feedback.details = getAbbrevToFullFeedback(userInput, expectedAnswer);
      break;
    case 'prefix':
      feedback.details = getPrefixFeedback(userInput, expectedAnswer);
      break;
    case 'math':
      feedback.details = getMathFeedback(userInput, expectedAnswer);
      break;
  }

  return feedback;
}

function getFullToAbbrevFeedback(userInput, expectedAnswer) {
  if (!isValidIPv6String(userInput)) {
    return {
      type: 'format-error',
      message: 'Invalid IPv6 address format',
      suggestions: [
        'Make sure you use valid hexadecimal digits (0-9, A-F)',
        'Use colons to separate hextets',
        'Check for typos in your input'
      ]
    };
  }

  try {
    const userAddr = ipaddr.parse(userInput);
    const userShortest = userAddr.toString().toUpperCase();
    
    if (userInput !== userShortest) {
      return {
        type: 'abbreviation-error',
        message: 'Your address can be abbreviated further',
        suggestions: [
          `Your input: ${userInput}`,
          `Can be shortened to: ${userShortest}`,
          'Use :: for the longest run of consecutive zeros',
          'Remove leading zeros from each hextet'
        ]
      };
    }
  } catch (e) {
    return {
      type: 'parse-error',
      message: 'Could not parse your IPv6 address',
      suggestions: ['Check the format of your input']
    };
  }

  return null;
}

function getAbbrevToFullFeedback(userInput, expectedAnswer) {
  const parts = userInput.split(':');
  
  if (parts.length !== 8) {
    return {
      type: 'format-error',
      message: 'Full format requires exactly 8 hextets',
      suggestions: [
        'Each hextet must be 4 hexadecimal digits',
        'Separate hextets with colons',
        'Include leading zeros (e.g., 0001 not 1)',
        'Do not use :: compression in full format'
      ]
    };
  }

  const invalidParts = parts.filter(part => !/^[0-9A-F]{4}$/.test(part));
  if (invalidParts.length > 0) {
    return {
      type: 'hextet-error',
      message: 'Invalid hextet format',
      suggestions: [
        `Invalid hextets: ${invalidParts.join(', ')}`,
        'Each hextet must be exactly 4 hexadecimal digits',
        'Use leading zeros (e.g., 0001 not 1)',
        'Valid characters: 0-9, A-F'
      ]
    };
  }

  return null;
}

function getPrefixFeedback(userInput, expectedAnswer) {
  const match = userInput.match(/^(.+?)\s*\/\s*(\d+)$/);
  
  if (!match) {
    return {
      type: 'format-error',
      message: 'Invalid prefix notation format',
      suggestions: [
        'Use format: address/prefix-length',
        'Example: 2001:DB8::/32',
        'Prefix length must be 0-128',
        'Space before slash is optional'
      ]
    };
  }

  const [, address, prefix] = match;
  const prefixNum = parseInt(prefix, 10);
  
  if (prefixNum < 0 || prefixNum > 128) {
    return {
      type: 'prefix-error',
      message: 'Invalid prefix length',
      suggestions: [
        'Prefix length must be between 0 and 128',
        `You entered: ${prefix}`,
        'Common prefixes: /64, /48, /32, /24'
      ]
    };
  }

  if (!isValidIPv6String(address)) {
    return {
      type: 'address-error',
      message: 'Invalid IPv6 address in prefix',
      suggestions: [
        'Use shortest abbreviated form for the address',
        'Remove leading zeros from hextets',
        'Use :: for consecutive zero hextets'
      ]
    };
  }

  return null;
}

function getMathFeedback(userInput, expectedAnswer) {
  const userNum = parseInt(userInput, 10);
  const expectedNum = parseInt(expectedAnswer, 10);
  
  if (isNaN(userNum)) {
    return {
      type: 'format-error',
      message: 'Please enter a valid number',
      suggestions: ['Enter only digits (0-9)']
    };
  }

  const difference = Math.abs(userNum - expectedNum);
  return {
    type: 'calculation-error',
    message: 'Incorrect calculation',
    suggestions: [
      `Your answer: ${userNum}`,
      `Correct answer: ${expectedNum}`,
      `Difference: ${difference}`,
      userNum < expectedNum ? 'Your answer is too small' : 'Your answer is too large'
    ]
  };
}