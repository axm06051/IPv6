import {
  computeShortestFormFromUserInput,
  isFullAddressFormat,
  isValidIPv6String,
  parsePrefixInput,
  validateAnswer,
} from "../";

describe("IPv6 Validation Core Logic", () => {
  describe("isValidIPv6String", () => {
    test("should accept valid IPv6 addresses", () => {
      const validAddresses = [
        "2987:BA11:B011:B00A:1000:0001:F001:F003",
        "3100:0000:0000:1010:D00D:D000:D00B:B00D",
        "3100::1010:D00D:D000:D00B:B00D",
        "FD00:1:1:1:200:FF:FE00:1",
        "2A2A::2A2A",
        "2001:DB8::1",
        "::1",
        "::",
      ];

      validAddresses.forEach(addr => {
        expect(isValidIPv6String(addr)).toBe(true);
      });
    });

    test("should reject invalid inputs", () => {
      const invalidInputs = [
        "11",
        "invalid",
        "192.168.1.1",
        "",
        null,
        undefined,
        "GGGG::1",
        "2001:DB8:::1",
      ];

      invalidInputs.forEach(input => {
        expect(isValidIPv6String(input as string)).toBe(false);
      });
    });
  });

  describe("Full to Abbreviated Conversion", () => {
    const testCases = [
      {
        full: "2987:BA11:B011:B00A:1000:0001:F001:F003",
        abbreviated: "2987:BA11:B011:B00A:1000:1:F001:F003",
      },
      {
        full: "3100:0000:0000:1010:D00D:D000:D00B:B00D",
        abbreviated: "3100::1010:D00D:D000:D00B:B00D",
      },
      {
        full: "FD00:0001:0001:0001:0200:00FF:FE00:0001",
        abbreviated: "FD00:1:1:1:200:FF:FE00:1",
      },
      {
        full: "FDDF:8080:0880:1001:0000:00FF:FE01:0507",
        abbreviated: "FDDF:8080:880:1001:0:FF:FE01:507",
      },
      {
        full: "32CC:0000:0000:000D:210F:0000:0000:0000",
        abbreviated: "32CC:0:0:D:210F::",
      },
      {
        full: "2100:000E:00E0:0000:0000:0000:0000:0E00",
        abbreviated: "2100:E:E0::E00",
      },
      {
        full: "3A11:CA00:0000:0000:0000:00FF:FECC:000C",
        abbreviated: "3A11:CA00::FF:FECC:C",
      },
      {
        full: "3799:9F9F:F000:0000:FFFF:0000:0000:0001",
        abbreviated: "3799:9F9F:F000:0:FFFF::1",
      },
      {
        full: "2A2A:0000:0000:0000:0000:0000:0000:2A2A",
        abbreviated: "2A2A::2A2A",
      },
      {
        full: "3194:0000:0000:0000:0001:0000:0000:0101",
        abbreviated: "3194::1:0:0:101",
      },
      {
        full: "2001:0DB8:0000:0000:0001:0000:0002:0100",
        abbreviated: "2001:DB8::1:0:2:100",
      },
      {
        full: "2001:0DB8:0000:0000:0000:0000:0010:A000",
        abbreviated: "2001:DB8::10:A000",
      },
      {
        full: "3330:0000:0000:0100:0000:0002:0000:0003",
        abbreviated: "3330::100:0:2:0:3",
      },
      {
        full: "FD00:0000:0000:1000:2000:0000:0001:0020",
        abbreviated: "FD00::1000:2000:0:1:20",
      },
      {
        full: "FD11:1000:0100:0010:0001:0000:1000:0100",
        abbreviated: "FD11:1000:100:10:1:0:1000:100",
      },
      {
        full: "2000:0000:0000:0000:0000:0000:0000:0002",
        abbreviated: "2000::2",
      },
    ];

    test("should validate correct full-to-abbreviated answers", () => {
      testCases.forEach(({ full, abbreviated }) => {
        expect(validateAnswer(abbreviated, abbreviated, "full-to-abbrev")).toBe(
          true
        );
      });
    });

    test("should reject incorrect full-to-abbreviated answers", () => {
      testCases.forEach(({ full, abbreviated }) => {
        // Using the full form should be rejected for abbreviated answer
        expect(validateAnswer(full, abbreviated, "full-to-abbrev")).toBe(false);
      });
    });

    test("should compute shortest form correctly", () => {
      testCases.forEach(({ full, abbreviated }) => {
        const computed = computeShortestFormFromUserInput(full);
        expect(computed).toBe(abbreviated.toUpperCase());
      });
    });
  });

  describe("Abbreviated to Full Conversion", () => {
    const testCases = [
      {
        abbreviated: "2987:BA11:B011:B00A:1000:1:F001:F003",
        full: "2987:BA11:B011:B00A:1000:0001:F001:F003",
      },
      {
        abbreviated: "3100::1010:D00D:D000:D00B:B00D",
        full: "3100:0000:0000:1010:D00D:D000:D00B:B00D",
      },
      {
        abbreviated: "FD00:1:1:1:200:FF:FE00:1",
        full: "FD00:0001:0001:0001:0200:00FF:FE00:0001",
      },
      {
        abbreviated: "2A2A::2A2A",
        full: "2A2A:0000:0000:0000:0000:0000:0000:2A2A",
      },
      {
        abbreviated: "2000::2",
        full: "2000:0000:0000:0000:0000:0000:0000:0002",
      },
    ];

    test("should validate correct abbreviated-to-full answers", () => {
      testCases.forEach(({ abbreviated, full }) => {
        expect(validateAnswer(full, full, "abbrev-to-full")).toBe(true);
      });
    });

    test("should reject abbreviated form for full answer", () => {
      testCases.forEach(({ abbreviated, full }) => {
        expect(validateAnswer(abbreviated, full, "abbrev-to-full")).toBe(false);
      });
    });
  });

  describe("isFullAddressFormat", () => {
    test("should accept valid full format addresses", () => {
      const fullAddresses = [
        "2987:BA11:B011:B00A:1000:0001:F001:F003",
        "3100:0000:0000:1010:D00D:D000:D00B:B00D",
        "FD00:0001:0001:0001:0200:00FF:FE00:0001",
        "2000:0000:0000:0000:0000:0000:0000:0002",
      ];

      fullAddresses.forEach(addr => {
        expect(isFullAddressFormat(addr)).toBe(true);
      });
    });

    test("should reject abbreviated addresses", () => {
      const abbreviatedAddresses = [
        "2987:BA11:B011:B00A:1000:1:F001:F003",
        "3100::1010:D00D:D000:D00B:B00D",
        "FD00:1:1:1:200:FF:FE00:1",
        "2A2A::2A2A",
        "2000::2",
      ];

      abbreviatedAddresses.forEach(addr => {
        expect(isFullAddressFormat(addr)).toBe(false);
      });
    });
  });

  describe("Prefix Calculations", () => {
    const prefixTestCases = [
      {
        address: "2987:BA11:B011:B00A:1000:0001:F001:F003",
        prefix: 64,
        expectedNetwork: "2987:BA11:B011:B00A::/64",
      },
      {
        address: "3100:0000:0000:1010:D00D:D000:D00B:B00D",
        prefix: 64,
        expectedNetwork: "3100:0:0:1010::/64",
      },
      {
        address: "2987:BA11:B011:B00A:1000:0001:F001:F003",
        prefix: 60,
        expectedNetwork: "2987:BA11:B011:B000::/60",
      },
      {
        address: "3100:0000:0000:1010:D00D:D000:D00B:B00D",
        prefix: 56,
        expectedNetwork: "3100:0:0:1000::/56",
      },
      {
        address: "FD00:0001:0001:0001:0200:00FF:FE00:0001",
        prefix: 52,
        expectedNetwork: "FD00:1:1::/52",
      },
      {
        address: "FDDF:8080:0880:1001:0000:00FF:FE01:0507",
        prefix: 48,
        expectedNetwork: "FDDF:8080:880::/48",
      },
      {
        address: "32CC:0000:0000:000D:210F:0000:0000:0000",
        prefix: 44,
        expectedNetwork: "32CC::/44",
      },
    ];

    test("should parse prefix input correctly", () => {
      prefixTestCases.forEach(({ address, prefix, expectedNetwork }) => {
        const input = `${address}/${prefix}`;
        const parsed = parsePrefixInput(input);
        expect(parsed).not.toBeNull();
        expect(parsed!.prefix).toBe(prefix);
      });
    });

    test("should validate correct prefix answers", () => {
      prefixTestCases.forEach(({ expectedNetwork }) => {
        expect(validateAnswer(expectedNetwork, expectedNetwork, "prefix")).toBe(
          true
        );
      });
    });

    test("should handle prefix division calculations", () => {
      const divisionTests = [
        { prefix: 60, expectedHextet: 15 },
        { prefix: 56, expectedHextet: 14 },
        { prefix: 52, expectedHextet: 13 },
        { prefix: 48, expectedHextet: 12 },
        { prefix: 44, expectedHextet: 11 },
        { prefix: 64, expectedHextet: 16 },
      ];

      divisionTests.forEach(({ prefix, expectedHextet }) => {
        expect(Math.floor(prefix / 4)).toBe(expectedHextet);
      });
    });
  });

  describe("Math Validation", () => {
    test("should validate correct math answers", () => {
      const mathTests = [
        { input: "15", expected: "15" },
        { input: "14", expected: "14" },
        { input: "13", expected: "13" },
        { input: "12", expected: "12" },
        { input: "11", expected: "11" },
        { input: "16", expected: "16" },
      ];

      mathTests.forEach(({ input, expected }) => {
        expect(validateAnswer(input, expected, "math")).toBe(true);
      });
    });

    test("should reject incorrect math answers", () => {
      expect(validateAnswer("14", "15", "math")).toBe(false);
      expect(validateAnswer("16", "15", "math")).toBe(false);
      expect(validateAnswer("abc", "15", "math")).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty and null inputs", () => {
      expect(isValidIPv6String("")).toBe(false);
      expect(isValidIPv6String(null as any)).toBe(false);
      expect(isValidIPv6String(undefined as any)).toBe(false);
      expect(computeShortestFormFromUserInput("")).toBeNull();
      expect(computeShortestFormFromUserInput(null as any)).toBeNull();
    });

    test("should handle invalid IPv6 formats", () => {
      const invalidFormats = [
        "11",
        "invalid",
        "192.168.1.1",
        "GGGG::1",
        "2001:DB8:::1",
        "2001:DB8:0000:0000:0000:0000:0000:0000:0000", // too many hextets
      ];

      invalidFormats.forEach(invalid => {
        expect(isValidIPv6String(invalid)).toBe(false);
        expect(computeShortestFormFromUserInput(invalid)).toBeNull();
      });
    });

    test("should not process IPv4 addresses as IPv6", () => {
      const ipv4Addresses = ["192.168.1.1", "10.0.0.1", "172.16.0.1"];

      ipv4Addresses.forEach(ipv4 => {
        expect(isValidIPv6String(ipv4)).toBe(false);
        expect(computeShortestFormFromUserInput(ipv4)).toBeNull();
      });
    });
  });

  describe("IPv6 Validation", () => {
    describe("Full to Abbreviated Conversion", () => {
      const fullToAbbreviatedTestCases = [
        {
          full: "2987:BA11:B011:B00A:1000:0001:F001:F003",
          abbreviated: "2987:BA11:B011:B00A:1000:1:F001:F003",
        },
        {
          full: "3100:0000:0000:1010:D00D:D000:D00B:B00D",
          abbreviated: "3100::1010:D00D:D000:D00B:B00D",
        },
        {
          full: "FD00:0001:0001:0001:0200:00FF:FE00:0001",
          abbreviated: "FD00:1:1:1:200:FF:FE00:1",
        },
        {
          full: "FDDF:8080:0880:1001:0000:00FF:FE01:0507",
          abbreviated: "FDDF:8080:880:1001:0:FF:FE01:507",
        },
        {
          full: "32CC:0000:0000:000D:210F:0000:0000:0000",
          abbreviated: "32CC:0:0:D:210F::",
        },
        {
          full: "2100:000E:00E0:0000:0000:0000:0000:0E00",
          abbreviated: "2100:E:E0::E00",
        },
        {
          full: "3A11:CA00:0000:0000:0000:00FF:FECC:000C",
          abbreviated: "3A11:CA00::FF:FECC:C",
        },
        {
          full: "3799:9F9F:F000:0000:FFFF:0000:0000:0001",
          abbreviated: "3799:9F9F:F000:0:FFFF::1",
        },
        {
          full: "2A2A:0000:0000:0000:0000:0000:0000:2A2A",
          abbreviated: "2A2A::2A2A",
        },
        {
          full: "3194:0000:0000:0000:0001:0000:0000:0101",
          abbreviated: "3194::1:0:0:101",
        },
        {
          full: "2001:0DB8:0000:0000:0001:0000:0002:0100",
          abbreviated: "2001:DB8::1:0:2:100",
        },
        {
          full: "2001:0DB8:0000:0000:0000:0000:0010:A000",
          abbreviated: "2001:DB8::10:A000",
        },
        {
          full: "3330:0000:0000:0100:0000:0002:0000:0003",
          abbreviated: "3330::100:0:2:0:3",
        },
        {
          full: "FD00:0000:0000:1000:2000:0000:0001:0020",
          abbreviated: "FD00::1000:2000:0:1:20",
        },
        {
          full: "FD11:1000:0100:0010:0001:0000:1000:0100",
          abbreviated: "FD11:1000:100:10:1:0:1000:100",
        },
        {
          full: "2000:0000:0000:0000:0000:0000:0000:0002",
          abbreviated: "2000::2",
        },
      ];

      test("should compute shortest form correctly for all 16 test cases", () => {
        fullToAbbreviatedTestCases.forEach(({ full, abbreviated }, index) => {
          const computed = computeShortestFormFromUserInput(full);
          expect(computed).toBe(abbreviated.toUpperCase());
        });
      });

      test("should validate correct abbreviated answers for all test cases", () => {
        fullToAbbreviatedTestCases.forEach(({ abbreviated }) => {
          expect(
            validateAnswer(abbreviated, abbreviated, "full-to-abbrev")
          ).toBe(true);
        });
      });

      test("should reject full form when abbreviated is expected", () => {
        fullToAbbreviatedTestCases.forEach(({ full, abbreviated }) => {
          expect(validateAnswer(full, abbreviated, "full-to-abbrev")).toBe(
            false
          );
        });
      });
    });

    describe("Abbreviated to Full Conversion", () => {
      const abbreviatedToFullTestCases = [
        {
          abbreviated: "2987:BA11:B011:B00A:1000:1:F001:F003",
          full: "2987:BA11:B011:B00A:1000:0001:F001:F003",
        },
        {
          abbreviated: "3100::1010:D00D:D000:D00B:B00D",
          full: "3100:0000:0000:1010:D00D:D000:D00B:B00D",
        },
        {
          abbreviated: "FD00:1:1:1:200:FF:FE00:1",
          full: "FD00:0001:0001:0001:0200:00FF:FE00:0001",
        },
        {
          abbreviated: "FDDF:8080:880:1001:0:FF:FE01:507",
          full: "FDDF:8080:0880:1001:0000:00FF:FE01:0507",
        },
        {
          abbreviated: "32CC:0:0:D:210F::",
          full: "32CC:0000:0000:000D:210F:0000:0000:0000",
        },
        {
          abbreviated: "2100:E:E0::E00",
          full: "2100:000E:00E0:0000:0000:0000:0000:0E00",
        },
        {
          abbreviated: "3A11:CA00::FF:FECC:C",
          full: "3A11:CA00:0000:0000:0000:00FF:FECC:000C",
        },
        {
          abbreviated: "3799:9F9F:F000:0:FFFF::1",
          full: "3799:9F9F:F000:0000:FFFF:0000:0000:0001",
        },
        {
          abbreviated: "2A2A::2A2A",
          full: "2A2A:0000:0000:0000:0000:0000:0000:2A2A",
        },
        {
          abbreviated: "3194::1:0:0:101",
          full: "3194:0000:0000:0000:0001:0000:0000:0101",
        },
        {
          abbreviated: "2001:DB8::1:0:2:100",
          full: "2001:0DB8:0000:0000:0001:0000:0002:0100",
        },
        {
          abbreviated: "2001:DB8::10:A000",
          full: "2001:0DB8:0000:0000:0000:0000:0010:A000",
        },
        {
          abbreviated: "3330::100:0:2:0:3",
          full: "3330:0000:0000:0100:0000:0002:0000:0003",
        },
        {
          abbreviated: "FD00::1000:2000:0:1:20",
          full: "FD00:0000:0000:1000:2000:0000:0001:0020",
        },
        {
          abbreviated: "FD11:1000:100:10:1:0:1000:100",
          full: "FD11:1000:0100:0010:0001:0000:1000:0100",
        },
        {
          abbreviated: "2000::2",
          full: "2000:0000:0000:0000:0000:0000:0000:0002",
        },
      ];

      test("should validate correct full answers for all test cases", () => {
        abbreviatedToFullTestCases.forEach(({ full }) => {
          expect(validateAnswer(full, full, "abbrev-to-full")).toBe(true);
        });
      });

      test("should reject abbreviated form when full is expected", () => {
        abbreviatedToFullTestCases.forEach(({ abbreviated, full }) => {
          expect(validateAnswer(abbreviated, full, "abbrev-to-full")).toBe(
            false
          );
        });
      });

      test("should identify full address format correctly", () => {
        abbreviatedToFullTestCases.forEach(({ full }) => {
          expect(isFullAddressFormat(full)).toBe(true);
        });
      });

      test("should reject abbreviated format as full", () => {
        abbreviatedToFullTestCases.forEach(({ abbreviated }) => {
          expect(isFullAddressFormat(abbreviated)).toBe(false);
        });
      });
    });

    describe("IPv6 Prefix Calculations /64", () => {
      const prefix64TestCases = [
        {
          address: "2987:BA11:B011:B00A:1000:0001:F001:F003",
          network: "2987:BA11:B011:B00A::/64",
        },
        {
          address: "3100:0000:0000:1010:D00D:D000:D00B:B00D",
          network: "3100:0:0:1010::/64",
        },
        {
          address: "FD00:0001:0001:0001:0200:00FF:FE00:0001",
          network: "FD00:1:1:1::/64",
        },
        {
          address: "FDDF:8080:0880:1001:0000:00FF:FE01:0507",
          network: "FDDF:8080:880:1001::/64",
        },
        {
          address: "32CC:0000:0000:000D:210F:0000:0000:0000",
          network: "32CC:0:0:D::/64",
        },
        {
          address: "2100:000E:00E0:0000:0000:0000:0000:0E00",
          network: "2100:E:E0::/64",
        },
        {
          address: "3A11:CA00:0000:0000:0000:00FF:FECC:000C",
          network: "3A11:CA00::/64",
        },
        {
          address: "3799:9F9F:F000:0000:FFFF:0000:0000:0001",
          network: "3799:9F9F:F000::/64",
        },
        {
          address: "2A2A:0000:0000:0000:0000:0000:0000:2A2A",
          network: "2A2A::/64",
        },
        {
          address: "3194:0000:0000:0000:0001:0000:0000:0101",
          network: "3194::/64",
        },
        {
          address: "2001:0DB8:0000:0000:0001:0000:0002:0100",
          network: "2001:DB8::/64",
        },
        {
          address: "2001:0DB8:0000:0000:0000:0000:0010:A000",
          network: "2001:DB8::/64",
        },
        {
          address: "3330:0000:0000:0100:0000:0002:0000:0003",
          network: "3330:0:0:100::/64",
        },
        {
          address: "FD00:0000:0000:1000:2000:0000:0001:0020",
          network: "FD00:0:0:1000::/64",
        },
        {
          address: "FD11:1000:0100:0010:0001:0000:1000:0100",
          network: "FD11:1000:100:10::/64",
        },
        {
          address: "2000:0000:0000:0000:0000:0000:0000:0002",
          network: "2000::/64",
        },
      ];

      test("should validate correct /64 prefix answers", () => {
        prefix64TestCases.forEach(({ network }) => {
          expect(validateAnswer(network, network, "prefix")).toBe(true);
        });
      });

      test("should parse /64 prefix inputs correctly", () => {
        prefix64TestCases.forEach(({ address }) => {
          const input = `${address}/64`;
          const parsed = parsePrefixInput(input);
          expect(parsed).not.toBeNull();
          expect(parsed!.prefix).toBe(64);
        });
      });
    });

    describe("Other Prefix Lengths", () => {
      const variablePrefixTestCases = [
        {
          address: "2987:BA11:B011:B00A:1000:0001:F001:F003",
          prefix: 60,
          network: "2987:BA11:B011:B000::/60",
          hextetPosition: 15,
        },
        {
          address: "3100:0000:0000:1010:D00D:D000:D00B:B00D",
          prefix: 56,
          network: "3100:0:0:1000::/56",
          hextetPosition: 14,
        },
        {
          address: "FD00:0001:0001:0001:0200:00FF:FE00:0001",
          prefix: 52,
          network: "FD00:1:1::/52",
          hextetPosition: 13,
        },
        {
          address: "FDDF:8080:0880:1001:0000:00FF:FE01:0507",
          prefix: 48,
          network: "FDDF:8080:880::/48",
          hextetPosition: 12,
        },
        {
          address: "32CC:0000:0000:000D:210F:0000:0000:0000",
          prefix: 44,
          network: "32CC::/44",
          hextetPosition: 11,
        },
        {
          address: "2100:000E:00E0:0000:0000:0000:0000:0E00",
          prefix: 60,
          network: "2100:E:E0::/60",
          hextetPosition: 15,
        },
        {
          address: "3A11:CA00:0000:0000:0000:00FF:FECC:000C",
          prefix: 56,
          network: "3A11:CA00::/56",
          hextetPosition: 14,
        },
        {
          address: "3799:9F9F:F000:0000:FFFF:0000:0000:0001",
          prefix: 52,
          network: "3799:9F9F:F000::/52",
          hextetPosition: 13,
        },
        {
          address: "2A2A:0000:0000:0000:0000:0000:0000:2A2A",
          prefix: 48,
          network: "2A2A::/48",
          hextetPosition: 12,
        },
        {
          address: "3194:0000:0000:0000:0001:0000:0000:0101",
          prefix: 44,
          network: "3194::/44",
          hextetPosition: 11,
        },
      ];

      test("should validate correct variable prefix answers", () => {
        variablePrefixTestCases.forEach(({ network }) => {
          expect(validateAnswer(network, network, "prefix")).toBe(true);
        });
      });

      test("should parse variable prefix inputs correctly", () => {
        variablePrefixTestCases.forEach(({ address, prefix }) => {
          const input = `${address}/${prefix}`;
          const parsed = parsePrefixInput(input);
          expect(parsed).not.toBeNull();
          expect(parsed!.prefix).toBe(prefix);
        });
      });

      test("should calculate hextet positions correctly (prefix ÷ 4)", () => {
        variablePrefixTestCases.forEach(({ prefix, hextetPosition }) => {
          expect(Math.floor(prefix / 4)).toBe(hextetPosition);
        });
      });
    });

    describe("Math Division Calculations", () => {
      const mathTestCases = [
        { prefix: 60, result: 15 },
        { prefix: 56, result: 14 },
        { prefix: 52, result: 13 },
        { prefix: 48, result: 12 },
        { prefix: 44, result: 11 },
        { prefix: 64, result: 16 },
      ];

      test("should validate math division results", () => {
        mathTestCases.forEach(({ result }) => {
          expect(
            validateAnswer(result.toString(), result.toString(), "math")
          ).toBe(true);
        });
      });

      test("should calculate prefix divisions correctly", () => {
        mathTestCases.forEach(({ prefix, result }) => {
          expect(Math.floor(prefix / 4)).toBe(result);
        });
      });

      test("should reject incorrect math calculations", () => {
        mathTestCases.forEach(({ result }) => {
          const wrongAnswer = (result + 1).toString();
          expect(validateAnswer(wrongAnswer, result.toString(), "math")).toBe(
            false
          );
        });
      });
    });

    describe("IPv6 Address Validation", () => {
      test("should validate all full addresses from test cases", () => {
        const allFullAddresses = [
          "2987:BA11:B011:B00A:1000:0001:F001:F003",
          "3100:0000:0000:1010:D00D:D000:D00B:B00D",
          "FD00:0001:0001:0001:0200:00FF:FE00:0001",
          "FDDF:8080:0880:1001:0000:00FF:FE01:0507",
          "32CC:0000:0000:000D:210F:0000:0000:0000",
          "2100:000E:00E0:0000:0000:0000:0000:0E00",
          "3A11:CA00:0000:0000:0000:00FF:FECC:000C",
          "3799:9F9F:F000:0000:FFFF:0000:0000:0001",
          "2A2A:0000:0000:0000:0000:0000:0000:2A2A",
          "3194:0000:0000:0000:0001:0000:0000:0101",
          "2001:0DB8:0000:0000:0001:0000:0002:0100",
          "2001:0DB8:0000:0000:0000:0000:0010:A000",
          "3330:0000:0000:0100:0000:0002:0000:0003",
          "FD00:0000:0000:1000:2000:0000:0001:0020",
          "FD11:1000:0100:0010:0001:0000:1000:0100",
          "2000:0000:0000:0000:0000:0000:0000:0002",
        ];

        allFullAddresses.forEach(address => {
          expect(isValidIPv6String(address)).toBe(true);
          expect(isFullAddressFormat(address)).toBe(true);
        });
      });

      test("should validate all abbreviated addresses from test cases", () => {
        const allAbbreviatedAddresses = [
          "2987:BA11:B011:B00A:1000:1:F001:F003",
          "3100::1010:D00D:D000:D00B:B00D",
          "FD00:1:1:1:200:FF:FE00:1",
          "FDDF:8080:880:1001:0:FF:FE01:507",
          "32CC:0:0:D:210F::",
          "2100:E:E0::E00",
          "3A11:CA00::FF:FECC:C",
          "3799:9F9F:F000:0:FFFF::1",
          "2A2A::2A2A",
          "3194::1:0:0:101",
          "2001:DB8::1:0:2:100",
          "2001:DB8::10:A000",
          "3330::100:0:2:0:3",
          "FD00::1000:2000:0:1:20",
          "FD11:1000:100:10:1:0:1000:100",
          "2000::2",
        ];

        allAbbreviatedAddresses.forEach(address => {
          expect(isValidIPv6String(address)).toBe(true);
          expect(isFullAddressFormat(address)).toBe(false);
        });
      });
    });
  });
});
