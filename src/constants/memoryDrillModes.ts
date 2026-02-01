export const MemoryDrillMode = {
  PREFIX_TO_HEXTET: "prefix-to-hextet",
  HEX_TO_BINARY: "hex-to-binary",
  BINARY_TO_DECIMAL: "binary-to-decimal",
  BINARY_TO_HEX: "binary-to-hex",
  IPV4_BINARY_TO_DECIMAL: "ipv4-binary-to-decimal",
} as const;

export type MemoryDrillModeType =
  (typeof MemoryDrillMode)[keyof typeof MemoryDrillMode];
