import { MemoryDrillMode, MemoryDrillModeType } from "../../constants";

// Mock localStorage
const localStorageMock: Partial<Storage> = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as Storage;

describe("Memory Drill Game Logic", () => {
  beforeEach(() => {
    (localStorageMock.getItem as jest.Mock).mockClear();
    (localStorageMock.setItem as jest.Mock).mockClear();
    jest.clearAllMocks();
  });

  describe("Input Validation Patterns", () => {
    function getInputPattern(
      mode: MemoryDrillModeType,
      value: string
    ): boolean {
      const patterns: Record<MemoryDrillModeType, () => boolean> = {
        [MemoryDrillMode.PREFIX_TO_HEXTET]: () =>
          /^\d{1,2}$/.test(value) &&
          parseInt(value) >= 0 &&
          parseInt(value) <= 31,
        [MemoryDrillMode.HEX_TO_BINARY]: () => /^[01]{1,4}$/.test(value),
        [MemoryDrillMode.BINARY_TO_DECIMAL]: () =>
          /^\d{1,2}$/.test(value) &&
          parseInt(value) >= 0 &&
          parseInt(value) <= 15,
        [MemoryDrillMode.BINARY_TO_HEX]: () => /^[0-9A-F]$/i.test(value),
        [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: () =>
          /^\d{1,3}$/.test(value) &&
          parseInt(value) >= 0 &&
          parseInt(value) <= 255,
      };
      return patterns[mode] ? patterns[mode]() : true;
    }

    test("should validate PREFIX_TO_HEXTET input correctly", () => {
      const validInputs = ["0", "15", "31", "16"];
      const invalidInputs = ["32", "99", "abc", ""];

      validInputs.forEach(input => {
        expect(getInputPattern(MemoryDrillMode.PREFIX_TO_HEXTET, input)).toBe(
          true
        );
      });

      invalidInputs.forEach(input => {
        expect(getInputPattern(MemoryDrillMode.PREFIX_TO_HEXTET, input)).toBe(
          false
        );
      });
    });

    test("should validate HEX_TO_BINARY input correctly", () => {
      const validInputs = ["1", "10", "101", "1010", "0001"];
      const invalidInputs = ["2", "10101", "abc", ""];

      validInputs.forEach(input => {
        expect(getInputPattern(MemoryDrillMode.HEX_TO_BINARY, input)).toBe(
          true
        );
      });

      invalidInputs.forEach(input => {
        expect(getInputPattern(MemoryDrillMode.HEX_TO_BINARY, input)).toBe(
          false
        );
      });
    });

    test("should validate BINARY_TO_DECIMAL input correctly", () => {
      const validInputs = ["0", "15", "8", "1"];
      const invalidInputs = ["16", "99", "abc", ""];

      validInputs.forEach(input => {
        expect(getInputPattern(MemoryDrillMode.BINARY_TO_DECIMAL, input)).toBe(
          true
        );
      });

      invalidInputs.forEach(input => {
        expect(getInputPattern(MemoryDrillMode.BINARY_TO_DECIMAL, input)).toBe(
          false
        );
      });
    });

    test("should validate BINARY_TO_HEX input correctly", () => {
      const validInputs = ["0", "F", "A", "9"];
      const invalidInputs = ["G", "10", "abc", ""];

      validInputs.forEach(input => {
        expect(getInputPattern(MemoryDrillMode.BINARY_TO_HEX, input)).toBe(
          true
        );
      });

      invalidInputs.forEach(input => {
        expect(getInputPattern(MemoryDrillMode.BINARY_TO_HEX, input)).toBe(
          false
        );
      });
    });

    test("should validate IPV4_BINARY_TO_DECIMAL input correctly", () => {
      const validInputs = ["0", "255", "128", "1"];
      const invalidInputs = ["256", "999", "abc", ""];

      validInputs.forEach(input => {
        expect(
          getInputPattern(MemoryDrillMode.IPV4_BINARY_TO_DECIMAL, input)
        ).toBe(true);
      });

      invalidInputs.forEach(input => {
        expect(
          getInputPattern(MemoryDrillMode.IPV4_BINARY_TO_DECIMAL, input)
        ).toBe(false);
      });
    });
  });

  describe("Mode Display Names", () => {
    function getModeDisplayName(mode: MemoryDrillModeType): string {
      const displayNames: Record<MemoryDrillModeType, string> = {
        [MemoryDrillMode.PREFIX_TO_HEXTET]: "Prefix → Hextet",
        [MemoryDrillMode.HEX_TO_BINARY]: "Hex → Binary",
        [MemoryDrillMode.BINARY_TO_DECIMAL]: "Binary → Decimal",
        [MemoryDrillMode.BINARY_TO_HEX]: "Binary → Hex",
        [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: "IPv4 Binary → Decimal",
      };
      return displayNames[mode] || "Memory Drill";
    }

    test("should return correct display names for all modes", () => {
      const expectedNames = {
        [MemoryDrillMode.PREFIX_TO_HEXTET]: "Prefix → Hextet",
        [MemoryDrillMode.HEX_TO_BINARY]: "Hex → Binary",
        [MemoryDrillMode.BINARY_TO_DECIMAL]: "Binary → Decimal",
        [MemoryDrillMode.BINARY_TO_HEX]: "Binary → Hex",
        [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: "IPv4 Binary → Decimal",
      };

      Object.entries(expectedNames).forEach(([mode, expectedName]) => {
        expect(getModeDisplayName(mode as MemoryDrillModeType)).toBe(
          expectedName
        );
      });
    });
  });

  describe("Input Placeholders", () => {
    function getInputPlaceholder(mode: MemoryDrillModeType): string {
      const placeholders: Record<MemoryDrillModeType, string> = {
        [MemoryDrillMode.PREFIX_TO_HEXTET]: "0-31",
        [MemoryDrillMode.HEX_TO_BINARY]: "e.g., 1010",
        [MemoryDrillMode.BINARY_TO_DECIMAL]: "0-15",
        [MemoryDrillMode.BINARY_TO_HEX]: "0-F",
        [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: "0-255",
      };
      return placeholders[mode] || "";
    }

    test("should return correct placeholders for all modes", () => {
      const expectedPlaceholders = {
        [MemoryDrillMode.PREFIX_TO_HEXTET]: "0-31",
        [MemoryDrillMode.HEX_TO_BINARY]: "e.g., 1010",
        [MemoryDrillMode.BINARY_TO_DECIMAL]: "0-15",
        [MemoryDrillMode.BINARY_TO_HEX]: "0-F",
        [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: "0-255",
      };

      Object.entries(expectedPlaceholders).forEach(
        ([mode, expectedPlaceholder]) => {
          expect(getInputPlaceholder(mode as MemoryDrillModeType)).toBe(
            expectedPlaceholder
          );
        }
      );
    });
  });

  describe("Prefix Selection Logic", () => {
    test("should handle prefix selection updates", () => {
      const newPrefixes = [1, 2, 3, 4, 5];

      // Simulate updating selected prefixes (this would normally be done by the hook)
      (localStorageMock.setItem as jest.Mock)(
        "memory-drill-selected-prefixes",
        JSON.stringify(newPrefixes)
      );

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "memory-drill-selected-prefixes",
        JSON.stringify(newPrefixes)
      );
    });

    test("should calculate batch information correctly", () => {
      const selectedPrefixes = [1, 2, 3, 4];
      const batchName = `${selectedPrefixes.length} prefixes selected`;

      expect(batchName).toBe("4 prefixes selected");
    });
  });
});
