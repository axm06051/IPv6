import ipaddr from 'ipaddr.js';

export function isValidIPv6String(str) {
  try {
    ipaddr.parse(str.trim());
    return true;
  } catch {
    return false;
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

function validateFullToAbbrevAnswer(userInput, expectedAnswer) {
  if (!isValidIPv6String(userInput)) return false;
  
  try {
    const userAddr = ipaddr.parse(userInput);
    const userShortest = userAddr.toString().toUpperCase();
    return userInput === userShortest && userInput === expectedAnswer.toUpperCase();
  } catch {
    return false;
  }
}

function validateAbbrevToFullAnswer(userInput, expectedAnswer) {
  const parts = userInput.split(':');
  if (parts.length !== 8) return false;
  
  const isFullFormat = parts.every(part => /^[0-9A-F]{4}$/.test(part));
  return isFullFormat && userInput === expectedAnswer.toUpperCase();
}

function validatePrefixAnswer(userInput, expectedAnswer) {
  const match = userInput.match(/^(.+?)\s*\/\s*(\d+)$/);
  if (!match) return false;
  
  const [, address, prefix] = match;
  const expectedMatch = expectedAnswer.match(/^(.+?)\/(\d+)$/);
  if (!expectedMatch) return false;
  
  const [, expectedAddr, expectedPrefix] = expectedMatch;
  
  if (parseInt(prefix, 10) !== parseInt(expectedPrefix, 10)) return false;
  
  try {
    const userAddr = ipaddr.parse(address);
    const expectedAddrParsed = ipaddr.parse(expectedAddr);
    return userAddr.toString().toUpperCase() === expectedAddrParsed.toString().toUpperCase();
  } catch {
    return false;
  }
}

function validateMathAnswer(userInput, expectedAnswer) {
  return userInput === expectedAnswer;
}