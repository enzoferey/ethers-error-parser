export const RETURN_VALUE_ERROR_CODES = {
  TRANSACTION_RAN_OUT_OF_GAS: "TRANSACTION_RAN_OUT_OF_GAS",
  TRANSACTION_UNDERPRICED: "TRANSACTION_UNDERPRICED",
  REJECTED_TRANSACTION: "REJECTED_TRANSACTION",
  EXECUTION_REVERTED: "EXECUTION_REVERTED",
  NONCE_TOO_LOW: "NONCE_TOO_LOW",
  INSUFFICIENT_FUNDS_FOR_GAS: "INSUFFICIENT_FUNDS_FOR_GAS",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export const ETHERS_ERROR_CODES = {
  NONCE_EXPIRED: "NONCE_EXPIRED",
  UNPREDICTABLE_GAS_LIMIT: "UNPREDICTABLE_GAS_LIMIT",
};

export const NESTED_ETHERS_ERROR_CODES = {
  REJECTED_TRANSACTION: 4001,
  REQUIRE_TRANSACTION: -32603,
  ERROR_WHILE_FORMATTING_OUTPUT_FROM_RPC: -32603,
  TRANSACTION_UNDERPRICED: -32000,
};
