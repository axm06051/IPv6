import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} from "https://esm.sh/react@19";
import ReactDOM from "https://esm.sh/react-dom@19/client";
import katex from "https://esm.sh/katex";
import ipaddr from "https://esm.sh/ipaddr.js";
import {
  BsBarChart,
  BsList,
  BsBook,
  BsCalculator,
  BsFileEarmarkText
} from "https://esm.sh/react-icons/bs";
import { AiOutlineInfoCircle } from "https://esm.sh/react-icons/ai";
import { Offcanvas, Modal, Tooltip } from "https://esm.sh/bootstrap";

const PrefixMode = {
  FIXED_64: "64",
  DIV_BY_4: "div4",
  NOT_DIV_BY_4: "notdiv4",
  RANDOM: "random"
};

function generateInterestingHexWithRepeatedDigits() {
  const digit = Math.floor(Math.random() * 16);
  return (digit << 12) | (digit << 8) | (digit << 4) | digit;
}

function generateInterestingHexWithRandomPattern() {
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

function generateFullyRandomHex() {
  return Math.floor(Math.random() * 0x10000);
}

function generateSmallRandomHex() {
  return Math.floor(Math.random() * 0x1000);
}

function generateInterestingHex() {
  const generators = [
    generateInterestingHexWithRandomPattern,
    generateInterestingHexWithRepeatedDigits,
    generateFullyRandomHex,
    generateSmallRandomHex
  ];
  const selectedGenerator =
    generators[Math.floor(Math.random() * generators.length)];
  return selectedGenerator();
}

function generateHexWithLeadingZeros() {
  const maxValues = [0xf, 0xff, 0xfff];
  const max = maxValues[Math.floor(Math.random() * maxValues.length)];
  return Math.floor(Math.random() * (max + 1));
}

function createIPv6WithInterestingHexPattern(parts) {
  parts[0] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[1] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[2] = generateInterestingHex();
  parts[3] = generateInterestingHex();
  parts[4] = generateInterestingHex();
  parts[5] = Math.random() < 0.5 ? generateInterestingHex() : 0;
  parts[6] = Math.random() < 0.5 ? generateInterestingHex() : 0;
  parts[7] = generateInterestingHex();
}

function createIPv6WithMiddleCompression(parts) {
  parts[0] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[1] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts.fill(0, 2, 6);
  parts[6] = generateInterestingHex();
  parts[7] = generateInterestingHex();
}

function createIPv6WithTrailingCompression(parts) {
  parts[0] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[1] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[2] = generateInterestingHex();
  parts[3] = generateInterestingHex();
  parts.fill(0, 4, 8);
}

function createIPv6WithLeadingZeros(parts) {
  parts[0] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[1] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[2] = generateHexWithLeadingZeros();
  parts[3] = generateHexWithLeadingZeros();
  parts[4] = generateInterestingHex();
  parts[5] = generateHexWithLeadingZeros();
  parts[6] = Math.random() < 0.5 ? generateHexWithLeadingZeros() : 0;
  parts[7] = generateInterestingHex();
}

function createIPv6WithMixedZeros(parts) {
  parts[0] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[1] = Math.floor(Math.random() * 0x10000) || 0x1000;
  parts[2] = Math.random() < 0.7 ? generateInterestingHex() : 0;
  parts[3] = Math.random() < 0.7 ? generateInterestingHex() : 0;
  parts[4] = 0;
  parts[5] = Math.random() < 0.7 ? generateInterestingHex() : 0;
  parts[6] = 0;
  parts[7] = generateInterestingHex();
}

function createDocumentationPrefix(parts) {
  parts[0] = 0x2001;
  parts[1] = 0x0db8;
  parts.fill(0, 2, 4);
  parts[4] = Math.random() < 0.7 ? 0 : generateInterestingHex();
  parts[5] = Math.random() < 0.7 ? 0 : generateInterestingHex();
  parts[6] = Math.random() < 0.7 ? 0 : generateInterestingHex();
  parts[7] = generateInterestingHex();
}

function createUniqueLocalAddress(parts) {
  parts[0] = 0xfd00;
  parts[1] = generateInterestingHex();
  parts[2] = generateInterestingHex();
  parts[3] = generateInterestingHex();
  parts[4] = Math.random() < 0.7 ? 0 : generateInterestingHex();
  parts[5] = Math.random() < 0.7 ? 0 : generateInterestingHex();
  parts[6] = generateInterestingHex();
  parts[7] = generateInterestingHex();
}

function createIPv6WithDocumentationOrULA(parts) {
  if (Math.random() < 0.3) {
    createDocumentationPrefix(parts);
  } else {
    createUniqueLocalAddress(parts);
  }
}

function ensureNonZeroAddress(parts) {
  if (parts.every((p) => p === 0)) {
    parts[7] = 0x1;
  }
}

function generateEducationalIPv6() {
  const parts = new Array(8).fill(0);
  const patternType = Math.floor(Math.random() * 6);
  const patternGenerators = [
    createIPv6WithInterestingHexPattern,
    createIPv6WithMiddleCompression,
    createIPv6WithTrailingCompression,
    createIPv6WithLeadingZeros,
    createIPv6WithMixedZeros,
    createIPv6WithDocumentationOrULA
  ];
  patternGenerators[patternType](parts);
  ensureNonZeroAddress(parts);
  return new ipaddr.IPv6(parts);
}

function generateRandomIPv6Parts() {
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

function randomIPv6() {
  if (Math.random() < 0.3) {
    return generateEducationalIPv6();
  }
  const parts = generateRandomIPv6Parts();
  return new ipaddr.IPv6(parts);
}

function fullIPv6Format(addr) {
  return addr.parts
    .map((h) => h.toString(16).toUpperCase().padStart(4, "0"))
    .join(":");
}

function shortestAbbreviation(addr) {
  return addr.toString().toUpperCase();
}

function isValidIPv6String(str) {
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

function isFullAddressFormat(input) {
  const trimmed = input.trim().toUpperCase();
  const parts = trimmed.split(":");
  return hasExactlyEightHextets(parts) && allHextetsAreFourDigits(parts);
}

function extractAddressAndPrefix(trimmed) {
  const match = trimmed.match(/^(.+?)\s*\/\s*(\d+)$/);
  if (!match) return null;
  return { address: match[1].trim(), prefixLength: match[2] };
}

function parsePrefixInput(input) {
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

function calculateFullHextets(bits) {
  return Math.floor(bits / 16);
}

function calculateRemainingBits(bits) {
  return bits % 16;
}

function createBitMask(remainingBits) {
  return ~((1 << (16 - remainingBits)) - 1) & 0xffff;
}

function applyPrefixMask(parts, fullHextets, remainingBits) {
  for (let i = fullHextets; i < 8; i++) {
    parts[i] = 0;
  }
  if (remainingBits > 0 && fullHextets < 8) {
    const mask = createBitMask(remainingBits);
    parts[fullHextets] &= mask;
  }
}

function ipv6Prefix(addr, bits) {
  const parts = addr.parts.slice();
  const fullHextets = calculateFullHextets(bits);
  const remainingBits = calculateRemainingBits(bits);
  applyPrefixMask(parts, fullHextets, remainingBits);
  return new ipaddr.IPv6(parts);
}

function getRandomInt(minInclusive, maxExclusive) {
  const min = Math.ceil(minInclusive);
  const max = Math.floor(maxExclusive);
  return Math.floor(Math.random() * (max - min) + min);
}

function getCommonPrefixLengths() {
  return [64, 60, 56, 52, 48, 44, 40, 36, 32, 28, 24, 20, 16, 12, 8, 4];
}

function selectRandomCommonLength(min) {
  const commonLengths = getCommonPrefixLengths();
  const filtered = commonLengths.filter((l) => l >= min && l <= 128);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function shouldUseCommonLength() {
  return Math.random() < 0.4;
}

function shouldUseCommonDiv4Length() {
  return Math.random() < 0.7;
}

function getPrefixLengthForDiv4Mode(min) {
  const commonLengths = getCommonPrefixLengths();
  const availableDiv4 = commonLengths.filter((l) => l >= min && l <= 128);
  if (availableDiv4.length > 0 && shouldUseCommonDiv4Length()) {
    return availableDiv4[Math.floor(Math.random() * availableDiv4.length)];
  }
  return 4 * getRandomInt(Math.ceil(min / 4), 33);
}

function getPrefixLengthForNotDiv4Mode(min) {
  let p;
  do {
    p = getRandomInt(Math.max(min, 1), 129);
  } while (p % 4 === 0);
  return p;
}

function getPrefixLength(mode, min = 0) {
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

function useTheme() {
  useEffect(() => {
    const determineTheme = (themeValue) => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)")
        .matches;
      return themeValue === "auto"
        ? prefersDark
          ? "dark"
          : "light"
        : themeValue;
    };
    const applyTheme = (themeValue) => {
      const theme = determineTheme(themeValue);
      document.documentElement.setAttribute("data-bs-theme", theme);
    };
    const getSavedTheme = () => localStorage.getItem("theme") || "auto";
    const setupAutoThemeListener = () => {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyTheme("auto");
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    };
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);
    if (savedTheme === "auto") {
      return setupAutoThemeListener();
    }
  }, []);
}

function loadStatsFromStorage() {
  const saved = localStorage.getItem("ipv6-stats");
  return saved ? JSON.parse(saved) : { total: 0, correct: 0, byCategory: {} };
}

function saveStatsToStorage(stats) {
  localStorage.setItem("ipv6-stats", JSON.stringify(stats));
}

function useStatistics() {
  const [stats, setStats] = useState(loadStatsFromStorage);
  useEffect(() => {
    saveStatsToStorage(stats);
  }, [stats]);
  const recordAnswer = useCallback((category, isCorrect) => {
    setStats((prev) => ({
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      byCategory: {
        ...prev.byCategory,
        [category]: {
          total: (prev.byCategory[category]?.total || 0) + 1,
          correct:
            (prev.byCategory[category]?.correct || 0) + (isCorrect ? 1 : 0)
        }
      }
    }));
  }, []);
  const resetStats = useCallback(() => {
    setStats({ total: 0, correct: 0, byCategory: {} });
  }, []);
  return { stats, recordAnswer, resetStats };
}

function useBootstrapComponent(ref, Component, show) {
  const [instance, setInstance] = useState(null);
  useEffect(() => {
    if (ref.current && !instance) {
      setInstance(new Component(ref.current));
    }
  }, [ref, instance, Component]);
  useEffect(() => {
    if (instance) {
      show ? instance.show() : instance.hide();
    }
  }, [show, instance]);
}

function KaTeX({ tex }) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(tex, { throwOnError: false })
      }}
    />
  );
}

function formatIPv6WithBreaks(address) {
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

function isIPv6Address(str) {
  return /^[0-9A-F:]+$/.test(str);
}

function renderIPv6Question(tex) {
  const textttMatch = tex.match(/\\texttt\{([^}]+)\}/);
  if (textttMatch) {
    const content = textttMatch[1];
    const prefixMatch = content.match(/^([0-9A-F:]+)\/(\d+)$/);
    if (prefixMatch) {
      const [, address, prefix] = prefixMatch;
      return (
        <span className="font-monospace" style={{ fontSize: "inherit" }}>
          {formatIPv6WithBreaks(address)}
          <wbr />/{prefix}
        </span>
      );
    }
    if (isIPv6Address(content)) {
      return (
        <span className="font-monospace" style={{ fontSize: "inherit" }}>
          {formatIPv6WithBreaks(content)}
        </span>
      );
    }
  }
  return <KaTeX tex={tex} />;
}

function shouldRenderWithKaTeX(text) {
  return typeof text === "string" && /^\d+$/.test(text);
}

function renderWithKaTeX(text) {
  if (!shouldRenderWithKaTeX(text)) return text;
  return <KaTeX tex={text} />;
}

function Card({ title, children, className = "" }) {
  return (
    <div className={`card shadow-sm ${className}`}>
      <div className="card-header bg-primary text-white">
        <h5 className="card-title mb-0">{title}</h5>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function getVariantClasses(variant) {
  const variantMap = {
    success: "border-success-subtle bg-success-subtle text-success-emphasis",
    danger: "border-danger-subtle bg-danger-subtle text-danger-emphasis",
    default: "border-secondary-subtle bg-body-tertiary"
  };
  return variantMap[variant] || variantMap.default;
}

function ComparisonCard({ label, value, variant = "default" }) {
  return (
    <div className={`card border ${getVariantClasses(variant)}`}>
      <div className="card-body">
        <small className="d-block mb-1">{label}</small>
        <div className="fs-6 font-monospace">{renderWithKaTeX(value)}</div>
      </div>
    </div>
  );
}

function formatCorrectMessage() {
  return "Correct!";
}

function formatIncorrectMessage(expectedAnswer) {
  return <>Incorrect. Expected: {renderWithKaTeX(expectedAnswer)}</>;
}

function formatResultMessage(message) {
  if (message.includes("Correct!")) {
    return formatCorrectMessage();
  }
  if (message.includes("Incorrect")) {
    return formatIncorrectMessage(message.replace("Incorrect. Expected: ", ""));
  }
  return message;
}

function ResultFeedback({ isCorrect, message, details }) {
  return (
    <div
      className={`alert ${isCorrect ? "alert-success" : "alert-danger"} mb-3`}
    >
      <div
        className={`mb-2 ${
          isCorrect ? "valid-feedback d-block" : "invalid-feedback d-block"
        }`}
      >
        <span className="fw-bold">{formatResultMessage(message)}</span>
      </div>
      {!isCorrect && details}
    </div>
  );
}

function calculateSuccessRate(correct, total) {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

function createStatsItems(stats) {
  const successRate = calculateSuccessRate(stats.correct, stats.total);
  return [
    { value: stats.total, label: "Total Questions", color: "primary" },
    { value: stats.correct, label: "Correct", color: "success" },
    { value: stats.total - stats.correct, label: "Incorrect", color: "danger" },
    { value: `${successRate}%`, label: "Success Rate", color: "info" }
  ];
}

function determineSuccessRateBadgeClass(rate) {
  if (rate >= 80) return "bg-success";
  if (rate >= 60) return "bg-warning";
  return "bg-danger";
}

function calculateCategorySuccessRate(data) {
  return Math.round((data.correct / data.total) * 100);
}

function formatCategoryName(category) {
  return category.replace(/-/g, " ");
}

function hasCategoryData(stats) {
  return Object.keys(stats.byCategory).length > 0;
}

function StatisticsDisplay({ stats, showDetails = false, onReset }) {
  const statsItems = createStatsItems(stats);
  return (
    <div>
      <h5 className="mb-3">Session Statistics</h5>
      <div className="row g-3 mb-4">
        {statsItems.map((item, idx) => (
          <div key={idx} className="col-6 col-md-3">
            <div className={`card text-center border-${item.color}`}>
              <div className="card-body">
                <div className={`display-6 text-${item.color}`}>
                  {item.value}
                </div>
                <small className="text-muted">{item.label}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
      {stats.total > 0 && (
        <div className="progress mb-4" style={{ height: "30px" }}>
          <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{
              width: `${calculateSuccessRate(stats.correct, stats.total)}%`
            }}
            aria-valuenow={stats.correct}
            aria-valuemin="0"
            aria-valuemax={stats.total}
          >
            {calculateSuccessRate(stats.correct, stats.total)}%
          </div>
        </div>
      )}
      {showDetails && hasCategoryData(stats) && (
        <>
          <h6 className="mt-4 mb-3">Performance by Category</h6>
          <div className="table-responsive">
            <table className="table table-sm table-hover">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-center">Questions</th>
                  <th className="text-center">Correct</th>
                  <th className="text-center">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.byCategory).map(([category, data]) => {
                  const rate = calculateCategorySuccessRate(data);
                  const badgeClass = determineSuccessRateBadgeClass(rate);
                  return (
                    <tr key={category}>
                      <td className="text-capitalize">
                        {formatCategoryName(category)}
                      </td>
                      <td className="text-center">{data.total}</td>
                      <td className="text-center">{data.correct}</td>
                      <td className="text-center">
                        <span className={`badge ${badgeClass}`}>{rate}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      {onReset && (
        <div className="mt-4 text-center">
          <button className="btn btn-outline-danger btn-sm" onClick={onReset}>
            Reset Statistics
          </button>
        </div>
      )}
    </div>
  );
}

function addressHasInterestingPattern(fullAddr) {
  const parts = fullAddr.split(":");
  return parts.some(
    (part) =>
      /[A-F].*0.*0.*[A-F]/.test(part) ||
      part === "0000" ||
      /^0+[A-F0-9]+$/.test(part)
  );
}

function tryGenerateInterestingFullToAbbrev(maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    const addr = randomIPv6();
    const fullAddr = fullIPv6Format(addr);
    if (addressHasInterestingPattern(fullAddr)) {
      return {
        question: `\\texttt{${fullAddr}}`,
        answer: shortestAbbreviation(addr),
        fullAnswer: fullAddr,
        type: "full-to-abbrev"
      };
    }
  }
  return null;
}

function generateFullToAbbrevExercise() {
  const addr = randomIPv6();
  const fullAddr = fullIPv6Format(addr);
  const shortest = shortestAbbreviation(addr);
  if (addressHasInterestingPattern(fullAddr)) {
    return {
      question: `\\texttt{${fullAddr}}`,
      answer: shortest,
      fullAnswer: fullAddr,
      type: "full-to-abbrev"
    };
  }
  const interesting = tryGenerateInterestingFullToAbbrev();
  if (interesting) return interesting;
  return {
    question: `\\texttt{${fullAddr}}`,
    answer: shortest,
    fullAnswer: fullAddr,
    type: "full-to-abbrev"
  };
}

function addressHasInterestingCompression(shortest) {
  return (
    shortest.includes("::") ||
    shortest.match(/:[0-9A-F]{1,3}:/g)?.some((h) => h.length < 6)
  );
}

function tryGenerateInterestingAbbrevToFull(maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    const addr = randomIPv6();
    const shortest = shortestAbbreviation(addr);
    if (addressHasInterestingCompression(shortest)) {
      return {
        question: `\\texttt{${shortest}}`,
        answer: fullIPv6Format(addr),
        abbrevAnswer: shortest,
        type: "abbrev-to-full"
      };
    }
  }
  return null;
}

function generateAbbrevToFullExercise() {
  const addr = randomIPv6();
  const shortest = shortestAbbreviation(addr);
  const fullAddr = fullIPv6Format(addr);
  if (addressHasInterestingCompression(shortest)) {
    return {
      question: `\\texttt{${shortest}}`,
      answer: fullAddr,
      abbrevAnswer: shortest,
      type: "abbrev-to-full"
    };
  }
  const interesting = tryGenerateInterestingAbbrevToFull();
  if (interesting) return interesting;
  return {
    question: `\\texttt{${shortest}}`,
    answer: fullAddr,
    abbrevAnswer: shortest,
    type: "abbrev-to-full"
  };
}

function generatePrefixExercise(mode) {
  const addr = randomIPv6();
  const bits = getPrefixLength(mode);
  const network = ipv6Prefix(addr, bits);
  return {
    question: `\\texttt{${shortestAbbreviation(addr)}/${bits}}`,
    answer: `${shortestAbbreviation(network)}/${bits}`,
    fullAnswer: `${fullIPv6Format(network)}/${bits}`,
    type: "prefix"
  };
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

function generateMathExercise(mode) {
  const P = calculatePrefixValueForMathExercise(mode);
  return {
    question: `\\frac{${P}}{4}`,
    answer: Math.floor(P / 4).toString(),
    type: "math"
  };
}

const exerciseGenerators = {
  "full-to-abbrev": generateFullToAbbrevExercise,
  "abbrev-to-full": generateAbbrevToFullExercise,
  prefix: generatePrefixExercise,
  math: generateMathExercise
};

function createExerciseGenerator(type, mode = null) {
  return () => {
    const generator = exerciseGenerators[type];
    if (!generator) throw new Error(`Unknown exercise type: ${type}`);
    return generator(mode);
  };
}

function isShortestAbbreviationMatch(userInput, expectedShortest) {
  const trimmedInput = userInput.trim().toUpperCase();
  if (!isValidIPv6String(trimmedInput)) return false;
  try {
    const userAddr = ipaddr.parse(trimmedInput);
    const userShortest = shortestAbbreviation(userAddr);
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
  const [expectedAddr, expectedPrefix] = expectedAnswer.split("/");
  return { expectedAddr, expectedPrefix: parseInt(expectedPrefix, 10) };
}

function extractUserAddressFromPrefix(trimmedInput) {
  const match = trimmedInput.match(/^(.+?)\s*\/\s*\d+$/);
  return match ? match[1].trim().toUpperCase() : null;
}

function validatePrefixAnswer(userInput, expectedAnswer) {
  const parsedInput = parsePrefixInput(userInput);
  if (!parsedInput) return false;
  const { expectedAddr, expectedPrefix } = extractPrefixComponents(
    expectedAnswer
  );
  if (parsedInput.prefix !== expectedPrefix) return false;
  const userAddrPart = extractUserAddressFromPrefix(userInput);
  if (!userAddrPart) return false;
  return isShortestAbbreviationMatch(userAddrPart, expectedAddr);
}

function validateMathAnswer(userInput, expectedAnswer) {
  return userInput === expectedAnswer;
}

function validateAnswer(userInput, expectedAnswer, exerciseType) {
  const trimmedInput = userInput.trim().toUpperCase();
  const validators = {
    "full-to-abbrev": validateFullToAbbrevAnswer,
    "abbrev-to-full": validateAbbrevToFullAnswer,
    prefix: validatePrefixAnswer,
    math: validateMathAnswer
  };
  const validator = validators[exerciseType];
  if (!validator) return false;
  return validator(trimmedInput, expectedAnswer);
}

function computeShortestFormFromUserInput(userFormattedInput) {
  if (!isValidIPv6String(userFormattedInput)) return null;
  try {
    return shortestAbbreviation(ipaddr.parse(userFormattedInput));
  } catch {
    return null;
  }
}

function createResultMessage(isCorrect, expectedAnswer) {
  return isCorrect ? "Correct!" : `Incorrect. Expected: ${expectedAnswer}`;
}

function createResultState(isCorrect, ex, userFormattedInput, shortestForm) {
  return {
    message: createResultMessage(isCorrect, ex.answer),
    success: isCorrect,
    formattedExpectedAnswer: ex.answer,
    userInput: userFormattedInput,
    shortestForm
  };
}

function renderFullToAbbrevDetails(result) {
  if (!result.shortestForm || result.shortestForm === result.userInput) {
    return null;
  }
  return (
    <div className="mt-2 p-2 bg-body-tertiary border rounded">
      <small className="d-block mb-2 fw-semibold">
        Your input would be abbreviated as:
      </small>
      <ComparisonCard label="Your Input" value={result.userInput} />
      <ComparisonCard
        label="Shortest Form"
        value={result.shortestForm}
        variant="success"
      />
      <div className="mt-2 text-muted small">
        <strong>Tip:</strong>
        <ul className="mb-0 mt-1">
          <li>
            Use <code>::</code> for the longest run of consecutive zeros.
          </li>
        </ul>
      </div>
    </div>
  );
}

function renderAbbrevToFullDetails() {
  return (
    <div className="mt-2 p-2 bg-body-tertiary border rounded">
      <div className="text-muted small">
        <strong className="fw-semibold">Important:</strong>
        <p className="mb-0 mt-1">
          You must use the full address format:
          <br />• Exactly 8 hextets with 4 hex digits each
          <br />• Include leading zeros (e.g., <code>0001</code> not{" "}
          <code>1</code>)
        </p>
      </div>
    </div>
  );
}

function extractShortestFromPrefixInput(userInput) {
  const match = userInput.match(/^(.+?)\s*\/\s*(\d+)$/);
  if (!match) return null;
  const [, addrPart] = match;
  if (!isValidIPv6String(addrPart)) return null;
  try {
    return shortestAbbreviation(ipaddr.parse(addrPart));
  } catch {
    return null;
  }
}

function renderPrefixDetails(result) {
  const shortest = extractShortestFromPrefixInput(result.userInput);
  return (
    <div className="mt-2 p-2 bg-body-tertiary border rounded">
      <div className="text-muted small">
        <strong className="fw-semibold">Important:</strong>
        <p className="mb-1 mt-1">
          For prefix exercises:
          <br />• Use shortest abbreviated form
          <br />• Prefix length must match exactly
          <br />• Space before slash is optional
        </p>
      </div>
      {shortest && (
        <div className="mt-2">
          <small className="d-block mb-1 fw-semibold">
            Your address shortens to:
          </small>
          <ComparisonCard
            label="Shortest Form"
            value={shortest}
            variant="success"
          />
        </div>
      )}
    </div>
  );
}

function extractPrefixValueFromQuestion(question) {
  return parseInt(question.match(/\\frac\{(\d+)\}/)?.[1] || "0", 10);
}

function calculateDifference(userNum, expectedNum) {
  return Math.abs(userNum - expectedNum);
}

function formatDifferenceMessage(userNum, expectedNum) {
  const difference = calculateDifference(userNum, expectedNum);
  if (userNum < expectedNum) {
    return (
      <>
        Too small by <KaTeX tex={difference.toString()} />
      </>
    );
  }
  if (userNum > expectedNum) {
    return (
      <>
        Too large by <KaTeX tex={difference.toString()} />
      </>
    );
  }
  return null;
}

const ALL_PREFIXES = Array.from({ length: 32 }, (_, i) => i + 1);
const MemoryDrillMode = {
  PREFIX_TO_HEXTET: "prefix-to-hextet",
  HEX_TO_BINARY: "hex-to-binary",
  BINARY_TO_DECIMAL: "binary-to-decimal",
  BINARY_TO_HEX: "binary-to-hex",
  IPV4_BINARY_TO_DECIMAL: "ipv4-binary-to-decimal"
};

function MemoryDrillGame({ category, onAnswerSubmit }) {
  const { state, actions, selectors, generators } = useMemoryDrillGame(
    category,
    onAnswerSubmit
  );
  const {
    drillState,
    input,
    result,
    currentQuestion,
    showModeInstructions,
    showSettings,
    penaltyAmountInput,
    selectedPrefixes
  } = state;
  const {
    handleInputChange,
    submit,
    next,
    resetProgress,
    changeMode,
    markModeInstructionsRead,
    updatePenaltySettings,
    handlePenaltyAmountChange,
    setShowSettings,
    updateSelectedPrefixes
  } = actions;
  const {
    penaltySettings,
    learnedItems,
    currentBatch,
    itemSuccessCounts,
    isPrefixMode,
    isComplete,
    batchName,
    masteredItemsInCurrentBatch,
    targetDescription,
    currentBatchItems
  } = selectors;
  const {
    getInputPlaceholder,
    getModeDisplayName,
    getModeDescription
  } = generators;
  if (!drillState.currentMode) {
    return (
      <MemoryDrillModeSelection
        drillState={drillState}
        penaltySettings={penaltySettings}
        onChangeMode={changeMode}
        onShowSettings={() => setShowSettings(true)}
      />
    );
  }
  if (showModeInstructions) {
    return (
      <MemoryDrillInstructions
        mode={drillState.currentMode}
        currentBatch={currentBatch}
        learnedItems={learnedItems}
        masteredItemsInCurrentBatch={masteredItemsInCurrentBatch}
        penaltySettings={penaltySettings}
        isPrefixMode={isPrefixMode}
        currentBatchItems={currentBatchItems}
        onStart={markModeInstructionsRead}
        onBack={() => changeMode(null)}
        getModeDisplayName={getModeDisplayName}
      />
    );
  }
  return (
    <MemoryDrillGameInterface
      mode={drillState.currentMode}
      selectedPrefixes={selectedPrefixes}
      currentQuestion={currentQuestion}
      result={result}
      input={input}
      isPrefixMode={isPrefixMode}
      isComplete={isComplete}
      batchName={batchName}
      masteredItemsInCurrentBatch={masteredItemsInCurrentBatch}
      targetDescription={targetDescription}
      penaltySettings={penaltySettings}
      showSettings={showSettings}
      penaltyAmountInput={penaltyAmountInput}
      onInputChange={handleInputChange}
      onSubmit={submit}
      onNext={next}
      onResetProgress={resetProgress}
      onChangeMode={changeMode}
      onUpdatePenalty={updatePenaltySettings}
      onPenaltyAmountChange={handlePenaltyAmountChange}
      onShowSettings={() => setShowSettings(true)}
      onCloseSettings={() => setShowSettings(false)}
      updateSelectedPrefixes={updateSelectedPrefixes}
      getInputPlaceholder={getInputPlaceholder}
      getModeDisplayName={getModeDisplayName}
      getModeDescription={getModeDescription}
    />
  );
}

function useMemoryDrillGame(category, onAnswerSubmit) {
  const initialState = {
    currentMode: null,
    successCount: 0,
    startTime: null,
    responseTime: null,
    instructionsRead: {},
    penaltySettings: {
      enabled: true,
      amount: 1,
      maxAmount: 5
    },
    learnedItems: {
      [MemoryDrillMode.PREFIX_TO_HEXTET]: [],
      [MemoryDrillMode.HEX_TO_BINARY]: [],
      [MemoryDrillMode.BINARY_TO_DECIMAL]: [],
      [MemoryDrillMode.BINARY_TO_HEX]: [],
      [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: []
    },
    itemSuccessCounts: {
      [MemoryDrillMode.PREFIX_TO_HEXTET]: {},
      [MemoryDrillMode.HEX_TO_BINARY]: {},
      [MemoryDrillMode.BINARY_TO_DECIMAL]: {},
      [MemoryDrillMode.BINARY_TO_HEX]: {},
      [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: {}
    }
  };
  const [drillState, setDrillState] = useLocalStorageState(
    `memory-drill-${category}`,
    initialState
  );
  const [selectedPrefixes, setSelectedPrefixes] = useState(() => {
    const saved = localStorage.getItem("memory-drill-selected-prefixes");
    return saved ? JSON.parse(saved) : ALL_PREFIXES.slice(0, 4);
  });
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [nextQuestion, setNextQuestion] = useState(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [showModeInstructions, setShowModeInstructions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPrefixSelection, setShowPrefixSelection] = useState(false);
  const [penaltyAmountInput, setPenaltyAmountInput] = useState(
    drillState.penaltySettings?.amount?.toString() || "1"
  );
  const inputRef = useRef(null);
  const selectors = useMemo(
    () => ({
      penaltySettings: drillState.penaltySettings,
      learnedItems: drillState.learnedItems?.[drillState.currentMode] || [],
      itemSuccessCounts:
        drillState.itemSuccessCounts?.[drillState.currentMode] || {},
      currentBatch: selectedPrefixes,
      isPrefixMode: drillState.currentMode === MemoryDrillMode.PREFIX_TO_HEXTET,
      isComplete: false,
      batchName: getBatchName(drillState, selectedPrefixes),
      masteredItemsInCurrentBatch: getMasteredItemsInCurrentBatch(
        drillState,
        selectedPrefixes
      ),
      targetDescription: getTargetDescription(drillState),
      currentBatchItems: selectedPrefixes
    }),
    [drillState, selectedPrefixes]
  );
  const generators = useMemo(
    () => ({
      getInputPlaceholder: () => getInputPlaceholder(drillState.currentMode),
      getModeDisplayName: (mode) => getModeDisplayName(mode),
      getModeDescription: (mode) => getModeDescription(mode)
    }),
    [drillState.currentMode]
  );
  const questionGenerator = useQuestionGenerator(
    drillState.currentMode,
    drillState,
    selectedPrefixes
  );
  const { addLearnedItem } = useBatchOperations(drillState, setDrillState);
  useEffect(() => {
    if (drillState.currentMode) {
      const question = questionGenerator();
      setCurrentQuestion(question);
      setStartTime(Date.now());
      const nextQ = questionGenerator();
      setNextQuestion(nextQ);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [drillState.currentMode, questionGenerator]);

  const submit = useCallback(() => {
    if (!input.trim() || !currentQuestion) return;
    const responseTime = Date.now() - startTime;
    const userAnswer = input.trim().toUpperCase();
    const isCorrect = userAnswer === currentQuestion.answer.toUpperCase();
    const submittedQuestion = currentQuestion;
    setResult({
      success: isCorrect,
      expected: submittedQuestion.answer,
      responseTime,
      question: submittedQuestion.question,
      explanation: submittedQuestion.explanation,
      userAnswer,
      itemId: submittedQuestion.itemId
    });
    onAnswerSubmit(category, isCorrect);
    if (isCorrect) {
      addLearnedItem(submittedQuestion.itemId);
      const newSuccessCount = drillState.successCount + 1;
      setDrillState((prev) => ({ ...prev, successCount: newSuccessCount }));
    } else {
      const penaltyAmount = drillState.penaltySettings.enabled
        ? drillState.penaltySettings.amount
        : 0;
      const newSuccessCount = Math.max(
        0,
        drillState.successCount - penaltyAmount
      );
      setDrillState((prev) => ({ ...prev, successCount: newSuccessCount }));
    }
    setInput("");
  }, [
    input,
    startTime,
    currentQuestion,
    category,
    onAnswerSubmit,
    drillState,
    addLearnedItem
  ]);

  const next = useCallback(() => {
    setCurrentQuestion(nextQuestion);
    setResult(null);
    setInput("");
    setStartTime(Date.now());
    const newNextQuestion = questionGenerator();
    setNextQuestion(newNextQuestion);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, [nextQuestion, questionGenerator]);

  const handleInputChange = useCallback(
    (value) => {
      if (getInputPattern(drillState.currentMode, value) || value === "") {
        setInput(value);
      }
    },
    [drillState.currentMode]
  );

  const resetProgress = useCallback(() => {
    if (
      confirm(
        "Reset all progress? This will reset all modes to batch 1 and clear all learned items and success counts."
      )
    ) {
      setDrillState({
        ...initialState,
        currentMode: drillState.currentMode
      });
      const question = questionGenerator();
      setCurrentQuestion(question);
      setResult(null);
      setInput("");
      setStartTime(Date.now());
      const nextQ = questionGenerator();
      setNextQuestion(nextQ);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [drillState.currentMode, questionGenerator]);

  const changeMode = useCallback(
    (newMode) => {
      setDrillState((prev) => ({
        ...prev,
        currentMode: newMode,
        successCount: 0
      }));
      setResult(null);
      setInput("");
      if (newMode && !drillState.instructionsRead?.[newMode]) {
        setShowModeInstructions(true);
      } else {
        const question = questionGenerator();
        setCurrentQuestion(question);
        setStartTime(Date.now());
        const nextQ = questionGenerator();
        setNextQuestion(nextQ);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 10);
      }
    },
    [drillState.instructionsRead, questionGenerator]
  );

  const markModeInstructionsRead = useCallback(() => {
    setShowModeInstructions(false);
    setDrillState((prev) => ({
      ...prev,
      instructionsRead: {
        ...(prev.instructionsRead || {}),
        [drillState.currentMode]: true
      }
    }));
    const question = questionGenerator();
    setCurrentQuestion(question);
    setResult(null);
    setInput("");
    setStartTime(Date.now());
    const nextQ = questionGenerator();
    setNextQuestion(nextQ);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, [drillState.currentMode, questionGenerator]);

  const updatePenaltySettings = useCallback(
    (enabled, amount) => {
      const maxAmount = drillState.penaltySettings.maxAmount || 5;
      const penaltyAmount = Math.max(1, Math.min(amount, maxAmount));
      setDrillState((prev) => ({
        ...prev,
        penaltySettings: {
          ...prev.penaltySettings,
          enabled,
          amount: penaltyAmount,
          maxAmount
        }
      }));
      setPenaltyAmountInput(penaltyAmount.toString());
    },
    [drillState.penaltySettings.maxAmount]
  );

  const handlePenaltyAmountChange = useCallback(
    (value) => {
      setPenaltyAmountInput(value);
      if (value !== "") {
        const amount = parseInt(value, 10);
        const maxAmount = drillState.penaltySettings.maxAmount || 5;
        if (!isNaN(amount) && amount >= 1 && amount <= maxAmount) {
          updatePenaltySettings(true, amount);
        }
      }
    },
    [updatePenaltySettings, drillState.penaltySettings.maxAmount]
  );

  const updateSelectedPrefixes = useCallback((newPrefixes) => {
    setSelectedPrefixes(newPrefixes);
    localStorage.setItem(
      "memory-drill-selected-prefixes",
      JSON.stringify(newPrefixes)
    );
  }, []);

  return {
    state: {
      drillState,
      input,
      result,
      currentQuestion,
      showModeInstructions,
      showSettings,
      showPrefixSelection,
      penaltyAmountInput,
      selectedPrefixes
    },
    actions: {
      handleInputChange,
      submit,
      next,
      resetProgress,
      changeMode,
      markModeInstructionsRead,
      updatePenaltySettings,
      handlePenaltyAmountChange,
      setShowSettings,
      setShowPrefixSelection,
      updateSelectedPrefixes
    },
    selectors,
    generators
  };
}

function useLocalStorageState(key, initialState) {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return { ...initialState, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Error parsing saved state:", e);
      }
    }
    return initialState;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState];
}

function useBatchOperations(drillState, setDrillState) {
  const addLearnedItem = useCallback(
    (itemId) => {
      if (!drillState.currentMode || !itemId) return;
      setDrillState((prev) => {
        const currentMode = drillState.currentMode;
        const currentCount = prev.itemSuccessCounts[currentMode]?.[itemId] || 0;
        const currentLearnedItems = prev.learnedItems[currentMode] || [];
        return {
          ...prev,
          learnedItems: {
            ...prev.learnedItems,
            [currentMode]: currentLearnedItems.includes(itemId)
              ? currentLearnedItems
              : [...currentLearnedItems, itemId]
          },
          itemSuccessCounts: {
            ...prev.itemSuccessCounts,
            [currentMode]: {
              ...prev.itemSuccessCounts[currentMode],
              [itemId]: currentCount + 1
            }
          }
        };
      });
    },
    [drillState.currentMode]
  );
  return { addLearnedItem };
}

function useQuestionGenerator(currentMode, drillState, selectedPrefixes) {
  return useCallback(() => {
    const generators = {
      [MemoryDrillMode.PREFIX_TO_HEXTET]: () =>
        generatePrefixQuestion(drillState, selectedPrefixes),
      [MemoryDrillMode.HEX_TO_BINARY]: generateHexToBinaryQuestion,
      [MemoryDrillMode.BINARY_TO_DECIMAL]: generateBinaryToDecimalQuestion,
      [MemoryDrillMode.BINARY_TO_HEX]: generateBinaryToHexQuestion,
      [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: generateIPv4BinaryToDecimalQuestion
    };
    return generators[currentMode]
      ? generators[currentMode]()
      : generatePrefixQuestion(drillState, selectedPrefixes);
  }, [currentMode, drillState, selectedPrefixes]);
}

function generatePrefixQuestion(drillState, selectedPrefixes) {
  const itemSuccessCounts =
    drillState.itemSuccessCounts?.[drillState.currentMode] || {};
  let availablePrefixes = selectedPrefixes || ALL_PREFIXES;
  availablePrefixes = availablePrefixes.filter(
    (prefix) => (itemSuccessCounts[prefix] || 0) < 14
  );
  if (availablePrefixes.length === 0) {
    availablePrefixes = selectedPrefixes || ALL_PREFIXES;
  }
  const prefix =
    availablePrefixes[Math.floor(Math.random() * availablePrefixes.length)];
  return {
    type: MemoryDrillMode.PREFIX_TO_HEXTET,
    question: `/${prefix}`,
    answer: Math.floor(prefix / 4).toString(),
    explanation: `Prefix /${prefix} means look at hextet position ${Math.floor(
      prefix / 4
    )} (${prefix} ÷ 4)`,
    itemId: prefix.toString()
  };
}

function generateHexToBinaryQuestion() {
  const hexDigits = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F"
  ];
  const hex = hexDigits[Math.floor(Math.random() * hexDigits.length)];
  const binary = parseInt(hex, 16).toString(2).padStart(4, "0");
  return {
    type: MemoryDrillMode.HEX_TO_BINARY,
    question: `${hex} (hex)`,
    answer: binary,
    explanation: `${hex} in binary is ${binary} (${parseInt(
      hex,
      16
    )} in decimal)`,
    itemId: hex
  };
}

function generateBinaryToDecimalQuestion() {
  const decimal = Math.floor(Math.random() * 16);
  const binary = decimal.toString(2).padStart(4, "0");
  return {
    type: MemoryDrillMode.BINARY_TO_DECIMAL,
    question: binary,
    answer: decimal.toString(),
    explanation: `${binary} in decimal is ${decimal}`,
    itemId: binary
  };
}

function generateBinaryToHexQuestion() {
  const decimal = Math.floor(Math.random() * 16);
  const binary = decimal.toString(2).padStart(4, "0");
  const hex = decimal.toString(16).toUpperCase();
  return {
    type: MemoryDrillMode.BINARY_TO_HEX,
    question: binary,
    answer: hex,
    explanation: `${binary} in hexadecimal is ${hex} (${decimal} in decimal)`,
    itemId: binary
  };
}

function generateIPv4BinaryToDecimalQuestion() {
  const decimal = Math.floor(Math.random() * 256);
  const binary = decimal.toString(2).padStart(8, "0");
  return {
    type: MemoryDrillMode.IPV4_BINARY_TO_DECIMAL,
    question: binary,
    answer: decimal.toString(),
    explanation: `IPv4 octet ${binary} in decimal is ${decimal}`,
    itemId: binary
  };
}

function getCurrentBatch(drillState, selectedPrefixes) {
  if (!drillState.currentMode) return [];
  return selectedPrefixes || [];
}

function getMasteredItemsInCurrentBatch(drillState, selectedPrefixes) {
  if (!drillState.currentMode) return 0;
  const itemSuccessCounts =
    drillState.itemSuccessCounts[drillState.currentMode] || {};
  const currentBatchItems = selectedPrefixes || [];
  return currentBatchItems.filter(
    (itemId) => (itemSuccessCounts[itemId] || 0) >= 14
  ).length;
}

function getBatchName(drillState, selectedPrefixes) {
  if (!drillState.currentMode) return "";
  const isPrefixMode =
    drillState.currentMode === MemoryDrillMode.PREFIX_TO_HEXTET;
  if (isPrefixMode) {
    return `${selectedPrefixes.length} prefixes selected`;
  }
  return getModeDisplayName(drillState.currentMode);
}

function getTargetDescription(drillState) {
  if (!drillState.currentMode) return "";
  if (drillState.currentMode === MemoryDrillMode.PREFIX_TO_HEXTET) {
    return "Practice converting prefix lengths to hextet positions";
  }
  return "Practice rapid conversion skills";
}

function getModeDisplayName(mode) {
  const displayNames = {
    [MemoryDrillMode.PREFIX_TO_HEXTET]: "Prefix → Hextet",
    [MemoryDrillMode.HEX_TO_BINARY]: "Hex → Binary",
    [MemoryDrillMode.BINARY_TO_DECIMAL]: "Binary → Decimal",
    [MemoryDrillMode.BINARY_TO_HEX]: "Binary → Hex",
    [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: "IPv4 Binary → Decimal"
  };
  return displayNames[mode] || "Memory Drill";
}

function getModeDescription(mode) {
  const descriptions = {
    [MemoryDrillMode.PREFIX_TO_HEXTET]:
      "Convert IPv6 prefix length to hextet position (÷4)",
    [MemoryDrillMode.HEX_TO_BINARY]:
      "Convert hexadecimal digit (0-F) to 4-bit binary",
    [MemoryDrillMode.BINARY_TO_DECIMAL]:
      "Convert 4-bit binary to decimal (0-15)",
    [MemoryDrillMode.BINARY_TO_HEX]:
      "Convert 4-bit binary to hexadecimal digit",
    [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]:
      "Convert 8-bit binary (IPv4 octet) to decimal (0-255)"
  };
  return descriptions[mode] || "";
}

function getInputPlaceholder(mode) {
  const placeholders = {
    [MemoryDrillMode.PREFIX_TO_HEXTET]: "0-31",
    [MemoryDrillMode.HEX_TO_BINARY]: "e.g., 1010",
    [MemoryDrillMode.BINARY_TO_DECIMAL]: "0-15",
    [MemoryDrillMode.BINARY_TO_HEX]: "0-F",
    [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: "0-255"
  };
  return placeholders[mode] || "";
}

function getInputPattern(mode, value) {
  const patterns = {
    [MemoryDrillMode.PREFIX_TO_HEXTET]: () =>
      /^\d{1,2}$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 31,
    [MemoryDrillMode.HEX_TO_BINARY]: () => /^[01]{4}$/.test(value),
    [MemoryDrillMode.BINARY_TO_DECIMAL]: () =>
      /^\d{1,2}$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 15,
    [MemoryDrillMode.BINARY_TO_HEX]: () => /^[0-9A-F]$/i.test(value),
    [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: () =>
      /^\d{1,3}$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 255
  };
  return patterns[mode] ? patterns[mode]() : true;
}

function MemoryDrillModeSelection({
  drillState,
  penaltySettings,
  onChangeMode,
  onShowSettings
}) {
  const [selectedPrefixes, setSelectedPrefixes] = useState(() => {
    const saved = localStorage.getItem("memory-drill-selected-prefixes");
    return saved ? JSON.parse(saved) : ALL_PREFIXES.slice(0, 4);
  });
  const currentPenalty = penaltySettings.enabled ? penaltySettings.amount : 0;
  const togglePrefix = (prefix) => {
    setSelectedPrefixes((prev) =>
      prev.includes(prefix)
        ? prev.filter((p) => p !== prefix)
        : [...prev, prefix]
    );
  };
  const selectAll = () => {
    setSelectedPrefixes([...ALL_PREFIXES]);
  };
  const clearSelection = () => {
    setSelectedPrefixes([]);
  };
  const handleModeChange = (mode) => {
    if (
      mode === MemoryDrillMode.PREFIX_TO_HEXTET &&
      selectedPrefixes.length > 0
    ) {
      localStorage.setItem(
        "memory-drill-selected-prefixes",
        JSON.stringify(selectedPrefixes)
      );
    }
    onChangeMode(mode);
  };
  return (
    <Card title="Memory Drill - Select Mode">
      <div className="mb-4">
        <h5>Choose a Practice Mode</h5>
        <p>
          Select a conversion mode to practice. Each mode focuses on different
          networking and IPv6 conversion skills to build muscle memory.
        </p>
        <GameInstructions />
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="text-muted">
              Penalty: {currentPenalty} success points
            </small>
          </div>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={onShowSettings}
          >
            Settings
          </button>
        </div>
        <div className="mt-4">
          <h6>Select Prefixes to Practice</h6>
          <div className="mb-3">
            <button
              className="btn btn-sm btn-outline-primary me-2"
              onClick={selectAll}
            >
              Select All
            </button>
            <button
              className="btn btn-sm btn-outline-secondary me-2"
              onClick={clearSelection}
            >
              Clear All
            </button>
            <small className="text-muted">
              Selected: {selectedPrefixes.length} prefixes
            </small>
          </div>
          <div className="row g-2">
            {ALL_PREFIXES.map((prefix) => (
              <div key={prefix} className="col-3 col-sm-2 col-md-1">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedPrefixes.includes(prefix)}
                    onChange={() => togglePrefix(prefix)}
                    id={`prefix-${prefix}`}
                  />
                  <label
                    className="form-check-label small"
                    htmlFor={`prefix-${prefix}`}
                  >
                    /{prefix}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="row g-3">
        <ModeSelectionCard
          mode={MemoryDrillMode.PREFIX_TO_HEXTET}
          title="Prefix → Hextet"
          description="Convert IPv6 prefix length to hextet position (÷4)"
          drillState={drillState}
          onChangeMode={handleModeChange}
          buttonColor="primary"
          selectedPrefixes={selectedPrefixes}
        />
        <ModeSelectionCard
          mode={MemoryDrillMode.HEX_TO_BINARY}
          title="Hex → Binary"
          description="Convert hex digit (0-F) to 4-bit binary"
          drillState={drillState}
          onChangeMode={handleModeChange}
          buttonColor="success"
        />
        <ModeSelectionCard
          mode={MemoryDrillMode.BINARY_TO_DECIMAL}
          title="Binary → Decimal"
          description="Convert 4-bit binary to decimal (0-15)"
          drillState={drillState}
          onChangeMode={handleModeChange}
          buttonColor="warning"
        />
        <ModeSelectionCard
          mode={MemoryDrillMode.BINARY_TO_HEX}
          title="Binary → Hex"
          description="Convert 4-bit binary to hexadecimal digit"
          drillState={drillState}
          onChangeMode={handleModeChange}
          buttonColor="info"
        />
        <ModeSelectionCard
          mode={MemoryDrillMode.IPV4_BINARY_TO_DECIMAL}
          title="IPv4 Binary → Decimal"
          description="Convert 8-bit binary (IPv4 octet) to decimal (0-255)"
          drillState={drillState}
          onChangeMode={handleModeChange}
          buttonColor="danger"
        />
      </div>
      <div className="mt-4">
        <div className="alert alert-warning">
          <strong>Tip:</strong> Start with the mode you find most challenging!
          Regular practice will help build automatic recall.
        </div>
      </div>
    </Card>
  );
}

function GameInstructions() {
  return (
    <div className="alert alert-info">
      <strong>How it works:</strong>
      <ul className="mb-0 mt-2">
        <li>Each correct answer increases your success count</li>
        <li>
          <strong className="text-danger">Penalty:</strong> Incorrect answers
          reduce success count (configurable)
        </li>
        <li>Quick reference charts appear only when you make mistakes</li>
        <li>
          <strong>Cumulative Learning:</strong> Items stay in practice as you
          master them
        </li>
        <li>
          <strong>Prefix mode:</strong> Select specific prefixes to practice
        </li>
      </ul>
    </div>
  );
}

function ModeSelectionCard({
  mode,
  title,
  description,
  drillState,
  onChangeMode,
  buttonColor,
  selectedPrefixes = []
}) {
  const learnedItems = drillState.learnedItems?.[mode]?.length || 0;
  const totalItems =
    mode === MemoryDrillMode.PREFIX_TO_HEXTET
      ? selectedPrefixes.length || 32
      : 16;
  const handleClick = () => {
    onChangeMode(mode);
  };
  return (
    <div className="col-md-6">
      <div className={`card border-${buttonColor}`}>
        <div className="card-body">
          <h6 className="card-title">{title}</h6>
          <p className="card-text small">{description}</p>
          <div className="mb-2">
            {mode === MemoryDrillMode.PREFIX_TO_HEXTET && (
              <small className="text-muted">
                Selected: {selectedPrefixes.length} prefixes
                <br />
              </small>
            )}
            <small className="text-muted">
              Learned: {learnedItems}/{totalItems} items
            </small>
          </div>
          <button
            className={`btn btn-${buttonColor} w-100`}
            onClick={handleClick}
            disabled={
              mode === MemoryDrillMode.PREFIX_TO_HEXTET &&
              selectedPrefixes.length === 0
            }
          >
            {mode === MemoryDrillMode.PREFIX_TO_HEXTET &&
            selectedPrefixes.length === 0
              ? "Select Prefixes First"
              : "Select"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MemoryDrillInstructions({
  mode,
  currentBatch,
  learnedItems,
  masteredItemsInCurrentBatch,
  penaltySettings,
  isPrefixMode,
  currentBatchItems,
  onStart,
  onBack,
  getModeDisplayName
}) {
  const modeSpecificInstructions = getModeSpecificInstructions(mode);
  return (
    <Card title={`Memory Drill - ${getModeDisplayName(mode)}`}>
      <div className="mb-4">
        {modeSpecificInstructions}
        <GameRules
          penaltySettings={penaltySettings}
          isPrefixMode={isPrefixMode}
        />
        {isPrefixMode && (
          <>
            <div className="alert alert-info">
              <strong>Selected Prefixes:</strong> {currentBatch.length} prefixes
              to practice ({masteredItemsInCurrentBatch} mastered)
              <br />
              <strong>Total Learned Items:</strong> {learnedItems.length} out of{" "}
              {currentBatchItems.length} prefixes
            </div>
          </>
        )}
      </div>
      <div className="d-grid gap-2">
        <button className="btn btn-primary" onClick={onStart}>
          {isPrefixMode
            ? `Start Practice with ${currentBatch.length} Prefixes`
            : "Start Practice"}
        </button>
        <button className="btn btn-outline-secondary" onClick={onBack}>
          Back to Mode Selection
        </button>
      </div>
    </Card>
  );
}

function getModeSpecificInstructions(mode) {
  const instructions = {
    [MemoryDrillMode.PREFIX_TO_HEXTET]: {
      title: "Prefix → Hextet Position",
      keyFormula: "Hextet Position = Prefix Length ÷ 4",
      example: "/64 → 64 ÷ 4 = 16 (16th hextet position, 0-based index)",
      description:
        "This helps you quickly identify which hextet position in an IPv6 address is affected by a given prefix length."
    },
    [MemoryDrillMode.HEX_TO_BINARY]: {
      title: "Hexadecimal → Binary (4-bit)",
      keyFormula: "Each hex digit (0-F) = 4 binary bits",
      example: "A (hex) → 1010 (binary)",
      description:
        "Practice converting single hex digits to their 4-bit binary representation."
    },
    [MemoryDrillMode.BINARY_TO_DECIMAL]: {
      title: "Binary → Decimal (4-bit)",
      keyFormula: "4-bit binary = 0-15 decimal",
      example: "1101 (binary) → 13 (decimal)",
      description: "Practice converting 4-bit binary numbers to decimal values."
    },
    [MemoryDrillMode.BINARY_TO_HEX]: {
      title: "Binary → Hexadecimal (4-bit)",
      keyFormula: "Each 4-bit binary = 1 hex digit",
      example: "0111 (binary) → 7 (hex)",
      description:
        "Practice converting 4-bit binary numbers to single hex digits."
    },
    [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: {
      title: "IPv4 Binary → Decimal (8-bit)",
      keyFormula: "8-bit binary = 0-255 decimal",
      example: "11000000 (binary) → 192 (decimal)",
      description: "Practice converting IPv4 octet binary values to decimal."
    }
  };
  const instruction = instructions[mode];
  if (!instruction) return null;
  return (
    <>
      <h5>{instruction.title}</h5>
      <div className="alert alert-info">
        <strong>Key Formula:</strong> {instruction.keyFormula}
        <br />
        <small>Example: {instruction.example}</small>
      </div>
      <p>{instruction.description}</p>
    </>
  );
}

function GameRules({ penaltySettings, isPrefixMode }) {
  return (
    <>
      <h6>Rules:</h6>
      <ul>
        <li>Answer quickly and accurately</li>
        <li>Each correct answer increases your success count</li>
        <li>
          <strong className="text-danger">Penalty:</strong> Each incorrect
          answer reduces success count by{" "}
          {penaltySettings.enabled ? penaltySettings.amount : 0}
        </li>
        <li>
          <strong>Cumulative Learning:</strong> Items stay in practice as you
          master them
        </li>
        {isPrefixMode && <li>Items are mastered after 14 correct answers</li>}
        <li>Quick reference is only shown after incorrect answers</li>
      </ul>
    </>
  );
}

function MemoryDrillGameInterface({
  mode,
  selectedPrefixes,
  currentQuestion,
  result,
  input,
  isPrefixMode,
  batchName,
  masteredItemsInCurrentBatch,
  targetDescription,
  penaltySettings,
  showSettings,
  penaltyAmountInput,
  onInputChange,
  onSubmit,
  onNext,
  onResetProgress,
  onChangeMode,
  onUpdatePenalty,
  onPenaltyAmountChange,
  onShowSettings,
  onCloseSettings,
  updateSelectedPrefixes,
  getInputPlaceholder,
  getModeDisplayName,
  getModeDescription
}) {
  const [showPrefixSelection, setShowPrefixSelection] = useState(false);

  return (
    <>
      <Card title={`Memory Drill - ${getModeDisplayName(mode)}`}>
        <GameHeader
          batchName={batchName}
          masteredItemsInCurrentBatch={masteredItemsInCurrentBatch}
          selectedPrefixes={selectedPrefixes}
          isPrefixMode={isPrefixMode}
          targetDescription={targetDescription}
          penaltySettings={penaltySettings}
          modeDescription={getModeDescription(mode)}
        />
        <QuestionDisplay
          currentQuestion={currentQuestion}
          result={result}
          mode={mode}
        />
        <AnswerInput
          value={input}
          onChange={onInputChange}
          placeholder={getInputPlaceholder()}
          mode={mode}
          disabled={!!result}
        />
        {result && (
          <ResultDisplay
            result={result}
            itemSuccessCounts={{}}
            penaltySettings={penaltySettings}
          />
        )}
        <ActionButtons
          result={result}
          input={input}
          onSubmit={onSubmit}
          onNext={onNext}
        />
        <ModeSelector
          mode={mode}
          onChangeMode={onChangeMode}
          getModeDisplayName={getModeDisplayName}
        />
        <GameControls
          onResetProgress={onResetProgress}
          onChangeMode={() => onChangeMode(null)}
          onShowSettings={onShowSettings}
          onShowPrefixSelection={() => setShowPrefixSelection(true)}
          isPrefixMode={isPrefixMode}
        />
        <QuickReference
          show={result && !result.success}
          mode={mode}
          currentBatch={selectedPrefixes}
          itemSuccessCounts={{}}
        />
        <SettingsModal
          show={showSettings}
          onClose={onCloseSettings}
          penaltySettings={penaltySettings}
          onUpdatePenalty={onUpdatePenalty}
          penaltyAmountInput={penaltyAmountInput}
          onPenaltyAmountChange={onPenaltyAmountChange}
        />
      </Card>
      {showPrefixSelection && (
        <PrefixSelectionModal
          selectedPrefixes={selectedPrefixes}
          onUpdate={updateSelectedPrefixes}
          onClose={() => setShowPrefixSelection(false)}
        />
      )}
    </>
  );
}

function GameHeader({
  batchName,
  masteredItemsInCurrentBatch,
  selectedPrefixes,
  isPrefixMode,
  targetDescription,
  penaltySettings,
  modeDescription
}) {
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="badge bg-primary">{batchName}</span>
        <span className="badge bg-info">
          Progress: {masteredItemsInCurrentBatch}/
          {isPrefixMode ? selectedPrefixes.length : "N/A"} mastered
        </span>
      </div>
      {isPrefixMode && (
        <>
          <div className="progress mb-2" style={{ height: "8px" }}>
            <div
              className="progress-bar bg-success"
              style={{
                width: `${
                  selectedPrefixes.length > 0
                    ? (masteredItemsInCurrentBatch / selectedPrefixes.length) *
                      100
                    : 0
                }%`
              }}
            />
          </div>
          <div className="d-flex justify-content-between small text-muted mb-2">
            <span>Prefixes: {selectedPrefixes.length}</span>
            <span>
              To practice:{" "}
              {selectedPrefixes.length - masteredItemsInCurrentBatch}
            </span>
          </div>
        </>
      )}
      <small className="text-muted">{targetDescription}</small>
      <div className="mt-2">
        <small className="text-muted">{modeDescription}</small>
        {penaltySettings.enabled && (
          <small className="text-danger ms-2">
            Penalty: {penaltySettings.amount} success points
          </small>
        )}
      </div>
    </div>
  );
}

function QuestionDisplay({ currentQuestion, result, mode }) {
  const displayQuestion = result?.question || currentQuestion?.question;
  return (
    <div className="mb-3">
      <div className="p-4 bg-body-secondary border rounded text-center">
        <div className="mb-2 text-muted small">Question:</div>
        <div className="display-4 font-monospace">{displayQuestion}</div>
        <div className="mt-2 text-muted small">
          {mode === MemoryDrillMode.PREFIX_TO_HEXTET
            ? "Which hextet position? (÷4 = ?)"
            : "Your answer:"}
          {result && !result.success && (
            <div className="mt-2">
              <small className="text-danger">
                You answered: {result.userAnswer}
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnswerInput({ value, onChange, placeholder, mode, disabled }) {
  return (
    <div className="mb-3">
      <label className="form-label">Your Answer</label>
      <input
        type="text"
        className="form-control form-control-lg font-monospace text-center"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck="false"
        disabled={disabled}
      />
      <div className="form-text">
        {mode === MemoryDrillMode.PREFIX_TO_HEXTET
          ? "Enter the integer result of dividing the prefix by 4 (0-31)"
          : mode === MemoryDrillMode.HEX_TO_BINARY
          ? "Enter 4 binary digits (0s and 1s)"
          : mode === MemoryDrillMode.BINARY_TO_DECIMAL
          ? "Enter decimal number (0-15)"
          : mode === MemoryDrillMode.BINARY_TO_HEX
          ? "Enter hexadecimal digit (0-F)"
          : "Enter decimal number (0-255)"}
      </div>
    </div>
  );
}

function ResultDisplay({ result, itemSuccessCounts, penaltySettings }) {
  return (
    <div
      className={`alert ${
        result.success ? "alert-success" : "alert-danger"
      } mb-3`}
    >
      <div className="fw-bold mb-1">
        {result.success ? "Correct!" : "Incorrect"}
      </div>
      <div className="small">
        {result.explanation}
        {result.success ? (
          <div className="mt-1">
            Response time: {(result.responseTime / 1000).toFixed(2)}s
            <div className="mt-1">
              <small className="text-success">
                Success count for this item:{" "}
                {itemSuccessCounts[result.itemId] || 1}/14
              </small>
            </div>
          </div>
        ) : (
          <div className="mt-1">
            <strong>
              Penalty applied: Success count reduced by {penaltySettings.amount}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButtons({ result, input, onSubmit, onNext }) {
  return (
    <div className="d-grid gap-2 mb-3">
      {!result ? (
        <button
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={!input.trim()}
        >
          Submit Answer
        </button>
      ) : (
        <button className="btn btn-success" onClick={onNext}>
          Next Question
        </button>
      )}
    </div>
  );
}

function ModeSelector({ mode, onChangeMode, getModeDisplayName }) {
  const modes = [
    MemoryDrillMode.PREFIX_TO_HEXTET,
    MemoryDrillMode.HEX_TO_BINARY,
    MemoryDrillMode.BINARY_TO_DECIMAL,
    MemoryDrillMode.BINARY_TO_HEX,
    MemoryDrillMode.IPV4_BINARY_TO_DECIMAL
  ];
  return (
    <div className="mb-3">
      <small className="fw-semibold d-block mb-2">Game Mode:</small>
      <div className="btn-group d-flex flex-wrap" role="group">
        {modes.map((gameMode) => (
          <button
            key={gameMode}
            type="button"
            className={`btn btn-sm ${
              mode === gameMode ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => onChangeMode(gameMode)}
          >
            {getModeDisplayName(gameMode)}
          </button>
        ))}
      </div>
    </div>
  );
}

function GameControls({
  onResetProgress,
  onChangeMode,
  onShowSettings,
  onShowPrefixSelection,
  isPrefixMode
}) {
  return (
    <div className="d-grid gap-2">
      {isPrefixMode && (
        <button
          className="btn btn-outline-info btn-sm"
          onClick={onShowPrefixSelection}
        >
          Change Prefix Selection
        </button>
      )}
      <button
        className="btn btn-outline-secondary btn-sm"
        onClick={onResetProgress}
      >
        Reset All Progress
      </button>
      <button className="btn btn-outline-info btn-sm" onClick={onChangeMode}>
        Change Mode
      </button>
      <button
        className="btn btn-outline-warning btn-sm"
        onClick={onShowSettings}
      >
        Penalty Settings
      </button>
    </div>
  );
}

function PrefixSelectionModal({ selectedPrefixes, onUpdate, onClose }) {
  const [localSelection, setLocalSelection] = useState([...selectedPrefixes]);
  const togglePrefix = (prefix) => {
    setLocalSelection((prev) =>
      prev.includes(prefix)
        ? prev.filter((p) => p !== prefix)
        : [...prev, prefix]
    );
  };
  const selectAll = () => {
    setLocalSelection([...ALL_PREFIXES]);
  };
  const clearSelection = () => {
    setLocalSelection([]);
  };
  const saveAndClose = () => {
    onUpdate(localSelection);
    onClose();
  };
  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Select Prefixes to Practice</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <button
                className="btn btn-sm btn-outline-primary me-2"
                onClick={selectAll}
              >
                Select All (1-32)
              </button>
              <button
                className="btn btn-sm btn-outline-secondary me-2"
                onClick={clearSelection}
              >
                Clear All
              </button>
              <small className="text-muted">
                Selected: {localSelection.length} prefixes
              </small>
            </div>
            <div className="row g-2">
              {ALL_PREFIXES.map((prefix) => (
                <div key={prefix} className="col-3 col-sm-2 col-md-1">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={localSelection.includes(prefix)}
                      onChange={() => togglePrefix(prefix)}
                      id={`modal-prefix-${prefix}`}
                    />
                    <label
                      className="form-check-label small"
                      htmlFor={`modal-prefix-${prefix}`}
                    >
                      /{prefix}
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <small className="text-muted">
                Tip: Select prefixes you want to focus on. The game will
                randomly choose from your selection.
              </small>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={saveAndClose}
            >
              Save Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickReference({ show, mode, currentBatch, itemSuccessCounts }) {
  if (!show) return null;
  const referenceComponents = {
    [MemoryDrillMode.PREFIX_TO_HEXTET]: () => (
      <PrefixQuickReference
        currentBatch={currentBatch}
        itemSuccessCounts={itemSuccessCounts}
      />
    ),
    [MemoryDrillMode.HEX_TO_BINARY]: () => <HexToBinaryQuickReference />,
    [MemoryDrillMode.BINARY_TO_DECIMAL]: () => (
      <BinaryToDecimalQuickReference />
    ),
    [MemoryDrillMode.BINARY_TO_HEX]: () => <BinaryToHexQuickReference />,
    [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: () => (
      <IPv4BinaryToDecimalQuickReference />
    )
  };
  const ReferenceComponent = referenceComponents[mode];
  return ReferenceComponent ? <ReferenceComponent /> : null;
}

function PrefixQuickReference({ currentBatch, itemSuccessCounts }) {
  return (
    <div className="mt-4 p-3 bg-body-tertiary border rounded">
      <small className="fw-semibold d-block mb-2">
        Quick Reference (shown because answer was incorrect):
      </small>
      <div className="row g-2 small font-monospace">
        {currentBatch.map((p) => {
          const count = itemSuccessCounts[p] || 0;
          return (
            <div key={p} className="col-3 col-sm-2">
              /{p} → {Math.floor(p / 4)} ({count}/14)
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HexToBinaryQuickReference() {
  return (
    <div className="mt-4 p-3 bg-body-tertiary border rounded">
      <small className="fw-semibold d-block mb-2">
        Quick Reference (shown because answer was incorrect):
      </small>
      <div className="row g-2 small font-monospace">
        {[
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "A",
          "B",
          "C",
          "D",
          "E",
          "F"
        ].map((hex) => (
          <div key={hex} className="col-3 col-sm-2">
            {hex} → {parseInt(hex, 16).toString(2).padStart(4, "0")}
          </div>
        ))}
      </div>
    </div>
  );
}

function BinaryToDecimalQuickReference() {
  return (
    <div className="mt-4 p-3 bg-body-tertiary border rounded">
      <small className="fw-semibold d-block mb-2">
        Quick Reference (shown because answer was incorrect):
      </small>
      <div className="row g-2 small font-monospace">
        {Array.from({ length: 16 }, (_, i) => i).map((decimal) => (
          <div key={decimal} className="col-3 col-sm-2">
            {decimal.toString(2).padStart(4, "0")} → {decimal}
          </div>
        ))}
      </div>
    </div>
  );
}

function BinaryToHexQuickReference() {
  return (
    <div className="mt-4 p-3 bg-body-tertiary border rounded">
      <small className="fw-semibold d-block mb-2">
        Quick Reference (shown because answer was incorrect):
      </small>
      <div className="row g-2 small font-monospace">
        {Array.from({ length: 16 }, (_, i) => i).map((decimal) => (
          <div key={decimal} className="col-3 col-sm-2">
            {decimal.toString(2).padStart(4, "0")} →{" "}
            {decimal.toString(16).toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

function IPv4BinaryToDecimalQuickReference() {
  const commonOctets = [
    { binary: "00000000", decimal: "0" },
    { binary: "10000000", decimal: "128" },
    { binary: "11000000", decimal: "192" },
    { binary: "11100000", decimal: "224" },
    { binary: "11110000", decimal: "240" },
    { binary: "11111000", decimal: "248" },
    { binary: "11111100", decimal: "252" },
    { binary: "11111110", decimal: "254" },
    { binary: "11111111", decimal: "255" },
    { binary: "10101010", decimal: "170" },
    { binary: "01010101", decimal: "85" },
    { binary: "00111100", decimal: "60" }
  ];
  return (
    <div className="mt-4 p-3 bg-body-tertiary border rounded">
      <small className="fw-semibold d-block mb-2">
        Common IPv4 Octets (shown because answer was incorrect):
      </small>
      <div className="row g-2 small font-monospace">
        {commonOctets.map((item, idx) => (
          <div key={idx} className="col-4 col-sm-3">
            {item.binary} → {item.decimal}
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsModal({
  show,
  onClose,
  penaltySettings,
  onUpdatePenalty,
  penaltyAmountInput,
  onPenaltyAmountChange
}) {
  if (!show) return null;
  const handlePenaltyAmountChange = (value) => {
    onPenaltyAmountChange(value);
    if (value !== "") {
      const amount = parseInt(value, 10);
      const maxAmount = penaltySettings.maxAmount || 5;
      if (!isNaN(amount) && amount >= 1 && amount <= maxAmount) {
        onUpdatePenalty(true, amount);
      }
    }
  };
  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Memory Drill Settings</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            <div className="mb-4">
              <h6 className="fw-bold mb-3">Penalty Settings</h6>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={penaltySettings.enabled}
                  onChange={(e) =>
                    onUpdatePenalty(e.target.checked, penaltySettings.amount)
                  }
                  id="penaltyEnabled"
                  style={{ width: "3em", height: "1.5em" }}
                />
                <label
                  className="form-check-label ms-2"
                  htmlFor="penaltyEnabled"
                >
                  Enable penalty for incorrect answers
                </label>
              </div>
              <div className="mb-3">
                <label className="form-label mb-2">Penalty Amount</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    min="1"
                    max={penaltySettings.maxAmount || 5}
                    value={penaltyAmountInput}
                    onChange={(e) => handlePenaltyAmountChange(e.target.value)}
                    disabled={!penaltySettings.enabled}
                  />
                  <span className="input-group-text">success points</span>
                </div>
                <div className="form-text mt-2">
                  <small>
                    Set how many success points are lost per incorrect answer.
                    <br />
                    Range: 1 to {penaltySettings.maxAmount || 5} (higher = more
                    difficult)
                  </small>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <h6 className="fw-bold mb-3">Learning Settings</h6>
              <div className="alert alert-info">
                <small>
                  <strong>Cumulative Learning:</strong> When you answer
                  correctly, items are added to your "learned items" list and
                  stay in practice even after batch progression.
                </small>
              </div>
            </div>
            <div className="alert alert-warning mb-0">
              <div className="d-flex align-items-center">
                <div className="me-2">⚙️</div>
                <div>
                  <small>
                    <strong>Current penalty:</strong>{" "}
                    {penaltySettings.enabled ? penaltySettings.amount : 0}{" "}
                    success points per incorrect answer
                  </small>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function isInvalidIPv6Format(result, exerciseType) {
  return !isValidIPv6String(result.userInput) && exerciseType !== "math";
}

function getInvalidFormatExplanation(exerciseType) {
  const explanations = {
    "full-to-abbrev": (
      <>
        <strong>Expected format:</strong> Shortest valid IPv6 abbreviation
        <ul className="mb-0 mt-1">
          <li>
            Remove leading zeros from each hextet (e.g., <code>0001</code> →{" "}
            <code>1</code>)
          </li>
          <li>
            Replace the longest run of consecutive zero hextets with{" "}
            <code>::</code>
          </li>
          <li>
            Use <code>::</code> only once in the address
          </li>
          <li>
            Example: <code>2001:0DB8:0000:0000:0000:0000:0000:0001</code> →{" "}
            <code>2001:DB8::1</code>
          </li>
        </ul>
      </>
    ),
    "abbrev-to-full": (
      <>
        <strong>Expected format:</strong> Full IPv6 address (uncompressed)
        <ul className="mb-0 mt-1">
          <li>Exactly 8 hextets separated by colons</li>
          <li>Each hextet must have exactly 4 hexadecimal digits (0-9, A-F)</li>
          <li>
            Include all leading zeros (e.g., <code>1</code> → <code>0001</code>)
          </li>
          <li>
            No <code>::</code> compression allowed
          </li>
          <li>
            Example: <code>2001:DB8::1</code> →{" "}
            <code>2001:0DB8:0000:0000:0000:0000:0000:0001</code>
          </li>
        </ul>
      </>
    ),
    prefix: (
      <>
        <strong>Expected format:</strong> Shortest IPv6 abbreviation with prefix
        length
        <ul className="mb-0 mt-1">
          <li>Network address in shortest abbreviated form</li>
          <li>Forward slash followed by prefix length (0-128)</li>
          <li>
            Example: <code>2001:DB8::/32</code> or{" "}
            <code>2001:DB8:0:0::/64</code>
          </li>
          <li>
            Space before slash is optional: <code>2001:DB8:: /32</code> works
            too
          </li>
        </ul>
      </>
    )
  };
  return (
    explanations[exerciseType] || (
      <>
        <strong>Please check your input format.</strong>
        <p className="mb-0 mt-1">
          Make sure you're entering a valid IPv6 address.
        </p>
      </>
    )
  );
}

function renderInvalidFormatWarning(exerciseType) {
  return (
    <div className="alert alert-warning mt-2">
      <strong>Invalid IPv6 address format</strong>
      <div className="mt-2 small">
        {getInvalidFormatExplanation(exerciseType)}
      </div>
    </div>
  );
}

function getExerciseSpecificDetails(result, ex) {
  if (!result || result.success) return null;
  const detailRenderers = {
    "full-to-abbrev": () => renderFullToAbbrevDetails(result),
    "abbrev-to-full": renderAbbrevToFullDetails,
    prefix: () => renderPrefixDetails(result),
    math: () => renderMathDetails(result, ex.question, ex.answer)
  };
  const renderer = detailRenderers[ex.type];
  return renderer ? renderer() : null;
}

function shouldShowInvalidFormatWarning(result, exerciseType) {
  return isInvalidIPv6Format(result, exerciseType);
}

function Exercise({ title, generator, category, onAnswerSubmit }) {
  const [ex, setEx] = useState(generator());
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  const submit = useCallback(() => {
    if (!input.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const isCorrect = validateAnswer(input, ex.answer, ex.type);
    const userFormattedInput = input.trim().toUpperCase();
    const shortestForm =
      ex.type === "full-to-abbrev" && !isCorrect
        ? computeShortestFormFromUserInput(userFormattedInput)
        : null;
    setResult(
      createResultState(isCorrect, ex, userFormattedInput, shortestForm)
    );
    onAnswerSubmit(category, isCorrect);
    setTimeout(() => setIsSubmitting(false), 300);
  }, [input, isSubmitting, ex, category, onAnswerSubmit]);

  const next = useCallback(() => {
    setEx(generator());
    setInput("");
    setResult(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, [generator]);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, [ex]);

  return (
    <Card title={title}>
      <div className="mb-3">
        <div className="p-3 bg-body-secondary border rounded">
          <div className="ipv6-display font-monospace fs-5">
            {renderIPv6Question(ex.question)}
          </div>
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label">Your Answer</label>
        <input
          ref={inputRef}
          type="text"
          className="form-control form-control-lg font-monospace"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSubmitting}
          autoComplete="off"
          spellCheck="false"
        />
      </div>
      {result && (
        <div>
          <ResultFeedback
            isCorrect={result.success}
            message={result.message}
            details={
              <>
                {getExerciseSpecificDetails(result, ex)}
                {isInvalidIPv6Format(result, ex.type) &&
                  renderInvalidFormatWarning(ex.type)}
              </>
            }
          />
        </div>
      )}
      <div className="d-grid">
        {!result ? (
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Checking..." : "Submit Answer"}
          </button>
        ) : (
          <button className="btn btn-success" onClick={next}>
            Next Question
          </button>
        )}
      </div>
    </Card>
  );
}

const TAB_CONFIG = [
  {
    id: "basics",
    label: "Address Basics",
    icon: BsBook,
    exercises: [
      {
        title: "Full to Abbreviated",
        type: "full-to-abbrev",
        category: "full-to-abbrev"
      },
      {
        title: "Abbreviated to Full",
        type: "abbrev-to-full",
        category: "abbrev-to-full"
      }
    ]
  },
  {
    id: "prefix",
    label: "Prefix Calculation",
    icon: BsCalculator,
    exercises: [
      {
        title: "Prefix (Fixed /64)",
        type: "prefix",
        mode: PrefixMode.FIXED_64,
        category: "prefix-fixed-64"
      },
      {
        title: "Prefix (Divisible by 4)",
        type: "prefix",
        mode: PrefixMode.DIV_BY_4,
        category: "prefix-div-4"
      },
      {
        title: "Prefix (Not Divisible by 4)",
        type: "prefix",
        mode: PrefixMode.NOT_DIV_BY_4,
        category: "prefix-not-div-4"
      },
      {
        title: "Prefix (Random Length)",
        type: "prefix",
        mode: PrefixMode.RANDOM,
        category: "prefix-random"
      }
    ]
  },
  {
    id: "memory",
    label: "Memory Drill",
    icon: BsCalculator,
    exercises: [
      {
        title: "Prefix → Hex Memory",
        type: "memory-drill",
        category: "memory-drill"
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
              className={`nav-link ${isActiveTab(idx) ? "active" : ""}`}
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
            className={`tab-pane fade ${isActiveTab(idx) ? "show active" : ""}`}
            id={createTabPaneId(tab.id)}
            role="tabpanel"
          >
            <div className="row g-4">
              {tab.exercises.map((exercise) => (
                <div key={exercise.category} className="col-12">
                  {exercise.type === "memory-drill" ? (
                    <MemoryDrillGame
                      category={exercise.category}
                      onAnswerSubmit={recordAnswer}
                    />
                  ) : (
                    <Exercise
                      title={exercise.title}
                      generator={createExerciseGenerator(
                        exercise.type,
                        exercise.mode
                      )}
                      category={exercise.category}
                      onAnswerSubmit={recordAnswer}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Header({ onOpenMenu }) {
  return (
    <header className="navbar navbar-dark bg-dark shadow-sm mb-4">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1">
          <BsCalculator className="me-2" />
          IPv6 Practice Exercises
        </span>
        <small className="text-white-50 d-none d-md-inline">
          IPv6 addressing and prefix calculations
        </small>
        <button className="btn btn-outline-light btn-sm" onClick={onOpenMenu}>
          <BsList size={24} /> Menu
        </button>
      </div>
    </header>
  );
}

function MenuItem({ icon: Icon, label, onClick }) {
  return (
    <button
      className="list-group-item list-group-item-action"
      onClick={onClick}
    >
      <Icon className="me-2" />
      {label}
    </button>
  );
}

function OffcanvasMenu({ show, onClose, menuItems }) {
  const offcanvasRef = useRef(null);
  useBootstrapComponent(offcanvasRef, Offcanvas, show);
  return (
    <div
      ref={offcanvasRef}
      className="offcanvas offcanvas-end"
      tabIndex="-1"
      data-bs-backdrop="true"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">Menu</h5>
        <button type="button" className="btn-close" onClick={onClose}></button>
      </div>
      <div className="offcanvas-body p-0">
        <div className="list-group list-group-flush">
          {menuItems.map((item, idx) => (
            <MenuItem
              key={idx}
              icon={item.icon}
              label={item.label}
              onClick={item.onClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ModalDialog({ show, onClose, title, children, footer }) {
  const modalRef = useRef(null);
  useBootstrapComponent(modalRef, Modal, show);
  return (
    <div ref={modalRef} className="modal fade" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

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

function confirmStatsReset() {
  return confirm("Are you sure you want to reset all statistics?");
}

function StatsModal({ show, onClose, stats, onReset }) {
  const handleReset = () => {
    if (confirmStatsReset()) {
      onReset();
      onClose();
    }
  };
  return (
    <ModalDialog
      show={show}
      onClose={onClose}
      title="Statistics"
      footer={
        <>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleReset}
          >
            Reset Statistics
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </>
      }
    >
      <StatisticsDisplay stats={stats} showDetails={true} onReset={null} />
    </ModalDialog>
  );
}

function createRFCLink(title, url, description) {
  return { title, url, description };
}

function getRFCLinks() {
  return [
    createRFCLink(
      "RFC 8200 - Internet Protocol, Version 6 (IPv6) Specification",
      "https://www.rfc-editor.org/rfc/rfc8200.html",
      "The core IPv6 specification document."
    ),
    createRFCLink(
      "RFC 4291 - IP Version 6 Addressing Architecture",
      "https://www.rfc-editor.org/rfc/rfc4291.html",
      "IPv6 addressing architecture and format specifications."
    ),
    createRFCLink(
      "RFC 5952 - A Recommendation for IPv6 Address Text Representation",
      "https://www.rfc-editor.org/rfc/rfc5952.html",
      "Standards for IPv6 address text representation."
    ),
    createRFCLink(
      "RFC 4861 - Neighbor Discovery for IP version 6 (IPv6)",
      "https://www.rfc-editor.org/rfc/rfc4861.html",
      "IPv6 neighbor discovery protocol specification."
    ),
    createRFCLink(
      "RFC 4862 - IPv6 Stateless Address Autoconfiguration",
      "https://www.rfc-editor.org/rfc/rfc4862.html",
      "IPv6 stateless address autoconfiguration."
    ),
    createRFCLink(
      "RFC 4443 - Internet Control Message Protocol (ICMPv6)",
      "https://www.rfc-editor.org/rfc/rfc4443.html",
      "ICMPv6 specification for IPv6."
    )
  ];
}

function createLearningResource(title, content) {
  return { title, content };
}

function getLearningResources() {
  return [
    createLearningResource(
      "IPv6 Address Representation",
      "IPv6 addresses are 128-bit identifiers for interfaces. Format: 32 hexadecimal digits (1 hex digit = 4 bits) arranged as 8 groups of 4 hex digits separated by colons."
    ),
    createLearningResource(
      "Address Compression Rules",
      "Leading zeros in each hextet may be omitted. One sequence of consecutive zero-valued hextets may be replaced with '::' (double colon)."
    ),
    createLearningResource(
      "Prefix Notation",
      "IPv6 prefixes are expressed using CIDR notation (e.g., 2001:db8::/32). The prefix length indicates the number of leftmost bits that define the network portion."
    ),
    createLearningResource(
      "Special Addresses",
      "::1/128 - Loopback address, ::/128 - Unspecified address, fe80::/10 - Link-local addresses, 2001:db8::/32 - Documentation prefix, fc00::/7 - Unique local addresses (ULA)."
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
        <strong>Comparison with IPv4:</strong>
        <ul className="mb-0 mt-2">
          <li>IPv4 (RFC 791): 32-bit addresses ≈ 4.3×10⁹ addresses</li>
          <li>IPv6 (RFC 8200): 128-bit addresses ≈ 3.4×10³⁸ addresses</li>
          <li>IPv4 exhaustion solutions: NAT, CIDR</li>
          <li>IPv6 replaces ARP with Neighbor Discovery Protocol (NDP)</li>
          <li>IPv6 has built-in IPSec support</li>
        </ul>
      </div>
    </ModalDialog>
  );
}

function initializeTooltips() {
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  [...tooltipTriggerList].map((el) => new Tooltip(el));
}

function createMenuItem(label, icon, onClick) {
  return { label, icon, onClick };
}

function createMenuItems(
  setShowOffcanvas,
  setShowStats,
  setShowDocs,
  setShowAbout
) {
  const closeOffcanvas = () => setShowOffcanvas(false);
  return [
    createMenuItem("View Statistics", BsBarChart, () => {
      closeOffcanvas();
      setShowStats(true);
    }),
    createMenuItem("RFC Documentation", BsFileEarmarkText, () => {
      closeOffcanvas();
      setShowDocs(true);
    }),
    createMenuItem("About", AiOutlineInfoCircle, () => {
      closeOffcanvas();
      setShowAbout(true);
    })
  ];
}

function App() {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const { stats, recordAnswer, resetStats } = useStatistics();
  useTheme();
  useEffect(() => {
    initializeTooltips();
  }, []);
  const menuItems = createMenuItems(
    setShowOffcanvas,
    setShowStats,
    setShowDocs,
    setShowAbout
  );
  return (
    <div className="min-vh-100 bg-body">
      <Header onOpenMenu={() => setShowOffcanvas(true)} />
      <OffcanvasMenu
        show={showOffcanvas}
        onClose={() => setShowOffcanvas(false)}
        menuItems={menuItems}
      />
      <AboutModal show={showAbout} onClose={() => setShowAbout(false)} />
      <StatsModal
        show={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
        onReset={resetStats}
      />
      <DocsModal show={showDocs} onClose={() => setShowDocs(false)} />
      <main className="container py-4">
        <ExerciseTabs recordAnswer={recordAnswer} />
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
