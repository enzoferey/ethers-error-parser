import { describe, expect, it } from "vitest";

import type { BigNumber } from "../types";
import { ERROR_CODES, ETHERS_ERROR_CODES } from "../constants";
import { getParsedEthersError } from "../getParsedEthersError";

function getTestBigNumber(value: string): BigNumber {
  return {
    gte: (other) => {
      return parseFloat(value) >= parseFloat(other.toString());
    },
    toString: () => {
      return value;
    },
  };
}

describe("getParsedEthersError", () => {
  it("should handle transaction underpriced at the top level", () => {
    const result = getParsedEthersError({
      code: ETHERS_ERROR_CODES.ERROR_WHILE_FORMATTING_OUTPUT_FROM_RPC,
      message: `RPC '{"value":{"data":{"code":${ETHERS_ERROR_CODES.TRANSACTION_UNDERPRICED}}}}'`,
    });

    expect(result).toEqual({
      errorCode: ERROR_CODES.TRANSACTION_UNDERPRICED,
      context: undefined,
    });
  });
  it("should handle transaction underpriced at the nested level", () => {
    const result = getParsedEthersError({
      message: "",
      error: {
        code: ETHERS_ERROR_CODES.ERROR_WHILE_FORMATTING_OUTPUT_FROM_RPC,
        message: `RPC '{"value":{"data":{"code":${ETHERS_ERROR_CODES.TRANSACTION_UNDERPRICED}}}}'`,
      },
    });

    expect(result).toEqual({
      errorCode: ERROR_CODES.TRANSACTION_UNDERPRICED,
      context: undefined,
    });
  });
  it("should handle transaction underpriced that does not provide the right JSON details", () => {
    const result1 = getParsedEthersError({
      code: ETHERS_ERROR_CODES.ERROR_WHILE_FORMATTING_OUTPUT_FROM_RPC,
      message: `RPC '{"value":{"data":{"code":"SOME NON EXPECTED CODE"}}}'`,
    });

    expect(result1).toEqual({
      errorCode: ERROR_CODES.UNKNOWN_ERROR,
      context:
        ETHERS_ERROR_CODES.ERROR_WHILE_FORMATTING_OUTPUT_FROM_RPC.toString(),
    });

    const result2 = getParsedEthersError({
      code: ETHERS_ERROR_CODES.ERROR_WHILE_FORMATTING_OUTPUT_FROM_RPC,
      message: `RPC '{}'`,
    });

    expect(result2).toEqual({
      errorCode: ERROR_CODES.UNKNOWN_ERROR,
      context:
        ETHERS_ERROR_CODES.ERROR_WHILE_FORMATTING_OUTPUT_FROM_RPC.toString(),
    });
  });
  it("should handle transaction underpriced that does not provide a valid JSON details", () => {
    const result = getParsedEthersError({
      code: ETHERS_ERROR_CODES.ERROR_WHILE_FORMATTING_OUTPUT_FROM_RPC,
      message: `RPC 'not-a-json'`,
    });

    expect(result).toEqual({
      errorCode: ERROR_CODES.UNKNOWN_ERROR,
      context:
        ETHERS_ERROR_CODES.ERROR_WHILE_FORMATTING_OUTPUT_FROM_RPC.toString(),
    });
  });
  it("should handle transaction rejected at the top level", () => {
    const message = "User rejected transaction";

    const result = getParsedEthersError({
      code: ETHERS_ERROR_CODES.REJECTED_TRANSACTION,
      message,
    });

    expect(result).toEqual({
      errorCode: ERROR_CODES.REJECTED_TRANSACTION,
      context: message,
    });
  });
  it("should handle transaction rejected at the nested level", () => {
    const message = "User rejected transaction";

    const result = getParsedEthersError({
      message: "",
      error: {
        code: ETHERS_ERROR_CODES.REJECTED_TRANSACTION,
        message,
      },
    });

    expect(result).toEqual({
      errorCode: ERROR_CODES.REJECTED_TRANSACTION,
      context: message,
    });
  });
  it("should handle execution reverted at the top level", () => {
    const reason = "Some reason";

    const result = getParsedEthersError({
      code: ETHERS_ERROR_CODES.REQUIRE_TRANSACTION,
      message: `execution reverted: ${reason}`,
    });

    expect(result).toEqual({
      errorCode: ERROR_CODES.EXECUTION_REVERTED,
      context: reason,
    });
  });
  it("should handle execution reverted at the nested level", () => {
    const reason = "Some reason";

    const result = getParsedEthersError({
      message: "",
      error: {
        code: ETHERS_ERROR_CODES.REQUIRE_TRANSACTION,
        message: `execution reverted: ${reason}`,
      },
    });

    expect(result).toEqual({
      errorCode: ERROR_CODES.EXECUTION_REVERTED,
      context: reason,
    });
  });
  it("should handle execution reverted gas estimate errors", () => {
    const reason = "Some reason";

    const result = getParsedEthersError({
      code: ETHERS_ERROR_CODES.UNPREDICTABLE_GAS_LIMIT,
      message: "",
      error: {
        code: ETHERS_ERROR_CODES.REQUIRE_TRANSACTION,
        data: {
          message: `execution reverted: ${reason}`,
        },
      },
    });

    expect(result).toEqual({
      errorCode: ERROR_CODES.EXECUTION_REVERTED,
      context: reason,
    });
  });
  it("should handle nonce too low errors", () => {
    const nonce = 100;

    const result = getParsedEthersError({
      code: ETHERS_ERROR_CODES.NONCE_EXPIRED,
      message: "nonce has already been used",
      transaction: {
        gasLimit: getTestBigNumber("1"),
        nonce,
      },
    });

    expect(result).toEqual({
      errorCode: ERROR_CODES.NONCE_TOO_LOW,
      context: nonce.toString(),
    });
  });
  it("should handle unknown unpredictable gas limit errors", () => {
    const result = getParsedEthersError({
      code: ETHERS_ERROR_CODES.UNPREDICTABLE_GAS_LIMIT,
      message: "",
    });

    expect(result).toEqual({
      errorCode: ERROR_CODES.UNKNOWN_ERROR,
      context: ETHERS_ERROR_CODES.UNPREDICTABLE_GAS_LIMIT,
    });
  });
  it("should handle transaction ran out of gas errors", () => {
    const gasLimit = getTestBigNumber("100");
    const gasUsed = getTestBigNumber("100");

    const result = getParsedEthersError({
      message: "",
      transaction: {
        gasLimit,
        nonce: 0,
      },
      receipt: {
        gasUsed,
      },
    });

    expect(result).toEqual({
      errorCode: ERROR_CODES.TRANSACTION_RAN_OUT_OF_GAS,
      context: gasLimit.toString(),
    });
  });
  it("should handle unknown errors with a nested level error", () => {
    const code = "SOME INTERNAL ETHERS CODE";
    const message = "Some internal Ethers error message";

    const result = getParsedEthersError({
      message: "",
      error: {
        code,
        message,
      },
    });

    expect(result).toEqual({
      errorCode: ERROR_CODES.UNKNOWN_ERROR,
      context: message,
    });
  });
  it("should handle unknown errors with only a nested level error message", () => {
    const message = "Some internal Ethers error message";

    const result = getParsedEthersError({
      message: "",
      error: {
        message,
      },
    });

    expect(result).toEqual({
      errorCode: ERROR_CODES.UNKNOWN_ERROR,
      context: message,
    });
  });
  it("should handle unknown errors with a top level error code", () => {
    const code = "SOME INTERNAL ETHERS CODE";

    const result = getParsedEthersError({ code, message: "" });

    expect(result).toEqual({
      errorCode: ERROR_CODES.UNKNOWN_ERROR,
      context: code,
    });
  });
  it("should handle totally unknown errors", () => {
    const result = getParsedEthersError({ message: "" });

    expect(result).toEqual({
      errorCode: ERROR_CODES.UNKNOWN_ERROR,
      context: undefined,
    });
  });
});
