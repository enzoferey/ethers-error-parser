import { describe, expect, it } from "vitest";

import type { BigNumber } from "../types";
import {
  RETURN_VALUE_ERROR_CODES,
  ETHERS_ERROR_CODES,
  NESTED_ETHERS_ERROR_CODES,
} from "../constants";
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
  it("should handle transaction underpriced", () => {
    const result = getParsedEthersError({
      message: "",
      error: {
        code: NESTED_ETHERS_ERROR_CODES.ERROR_WHILE_FORMATTING_OUTPUT_FROM_RPC,
        message: `RPC '{"value":{"data":{"code":${NESTED_ETHERS_ERROR_CODES.TRANSACTION_UNDERPRICED}}}}'`,
      },
    });

    expect(result).toEqual({
      errorCode: RETURN_VALUE_ERROR_CODES.TRANSACTION_UNDERPRICED,
      context: undefined,
    });
  });
  it("should handle transaction underpriced that provides an unknown code", () => {
    const message = `RPC '{"value":{"data":{"code":"SOME UNKNOWN CODE"}}}'`;

    const result = getParsedEthersError({
      message: "",
      error: {
        code: NESTED_ETHERS_ERROR_CODES.ERROR_WHILE_FORMATTING_OUTPUT_FROM_RPC,
        message,
      },
    });

    expect(result).toEqual({
      errorCode: RETURN_VALUE_ERROR_CODES.UNKNOWN_ERROR,
      context: message,
    });
  });
  it("should handle transaction underpriced that does not provide the right JSON details", () => {
    const message = `RPC '{}'`;

    const result2 = getParsedEthersError({
      message: "",
      error: {
        code: NESTED_ETHERS_ERROR_CODES.ERROR_WHILE_FORMATTING_OUTPUT_FROM_RPC,
        message,
      },
    });

    expect(result2).toEqual({
      errorCode: RETURN_VALUE_ERROR_CODES.UNKNOWN_ERROR,
      context: message,
    });
  });
  it("should handle transaction underpriced that does not provide a valid JSON details", () => {
    const message = `RPC 'not-a-json'`;

    const result = getParsedEthersError({
      message: "",
      error: {
        code: NESTED_ETHERS_ERROR_CODES.ERROR_WHILE_FORMATTING_OUTPUT_FROM_RPC,
        message,
      },
    });

    expect(result).toEqual({
      errorCode: RETURN_VALUE_ERROR_CODES.UNKNOWN_ERROR,
      context: message,
    });
  });
  it("should handle calls reverted via code", () => {
    const reason = "TOKEN_ID_DOES_NOT_EXIST";

    const result = getParsedEthersError({
      message: "",
      code: ETHERS_ERROR_CODES.CALL_EXCEPTION,
      reason,
    });

    expect(result).toEqual({
      errorCode: RETURN_VALUE_ERROR_CODES.CALL_REVERTED,
      context: reason,
    });
  });
  it("should handle transaction rejected via code", () => {
    const message = "User rejected transaction";

    const result = getParsedEthersError({
      message,
      code: ETHERS_ERROR_CODES.ACTION_REJECTED,
      action: "sendTransaction",
    });

    expect(result).toEqual({
      errorCode: RETURN_VALUE_ERROR_CODES.REJECTED_TRANSACTION,
      context: message,
    });
  });
  it("should handle transaction rejected via error code", () => {
    const message = "User rejected transaction";

    const result = getParsedEthersError({
      message: "",
      error: {
        code: NESTED_ETHERS_ERROR_CODES.REJECTED_TRANSACTION,
        message,
      },
    });

    expect(result).toEqual({
      errorCode: RETURN_VALUE_ERROR_CODES.REJECTED_TRANSACTION,
      context: message,
    });
  });
  it("should handle execution reverted", () => {
    const reason = "Some reason";

    const result = getParsedEthersError({
      message: "",
      error: {
        code: NESTED_ETHERS_ERROR_CODES.REQUIRE_TRANSACTION,
        message: `execution reverted: ${reason}`,
      },
    });

    expect(result).toEqual({
      errorCode: RETURN_VALUE_ERROR_CODES.EXECUTION_REVERTED,
      context: reason,
    });
  });
  it("should handle execution reverted gas estimate errors", () => {
    const reason = "Some reason";

    const result = getParsedEthersError({
      code: ETHERS_ERROR_CODES.UNPREDICTABLE_GAS_LIMIT,
      message: "",
      error: {
        code: NESTED_ETHERS_ERROR_CODES.REQUIRE_TRANSACTION,
        data: {
          message: `execution reverted: ${reason}`,
        },
      },
    });

    expect(result).toEqual({
      errorCode: RETURN_VALUE_ERROR_CODES.EXECUTION_REVERTED,
      context: reason,
    });
  });
  it("should handle no enough funds for gas", () => {
    const result = getParsedEthersError({
      code: ETHERS_ERROR_CODES.UNPREDICTABLE_GAS_LIMIT,
      message: "",
      error: {
        error: {
          error: {
            code: NESTED_ETHERS_ERROR_CODES.TRANSACTION_UNDERPRICED,
          },
          body: '{"error":{"message":"gas required exceeds allowance (0)"}}',
        },
      },
    });

    expect(result).toEqual({
      errorCode: RETURN_VALUE_ERROR_CODES.INSUFFICIENT_FUNDS_FOR_GAS,
      context: undefined,
    });
  });
  it("should handle max priority fee per gas higher than max fee per gas", () => {
    const result = getParsedEthersError({
      code: ETHERS_ERROR_CODES.UNPREDICTABLE_GAS_LIMIT,
      message: "",
      error: {
        error: {
          error: {
            code: NESTED_ETHERS_ERROR_CODES.TRANSACTION_UNDERPRICED,
          },
          body: '{"error":{"message":"max priority fee per gas higher than max fee per gas"}}',
        },
      },
    });

    expect(result).toEqual({
      errorCode:
        RETURN_VALUE_ERROR_CODES.MAX_PRIORITY_FEE_PER_GAS_HIGHER_THAN_MAX_FEE_PER_GAS,
      context: undefined,
    });
  });
  it("should handle max fee per gas less than block base fee", () => {
    const result = getParsedEthersError({
      code: ETHERS_ERROR_CODES.UNPREDICTABLE_GAS_LIMIT,
      message: "",
      error: {
        error: {
          error: {
            code: NESTED_ETHERS_ERROR_CODES.TRANSACTION_UNDERPRICED,
          },
          body: '{"error":{"message":"max fee per gas less than block base fee"}}',
        },
      },
    });

    expect(result).toEqual({
      errorCode:
        RETURN_VALUE_ERROR_CODES.MAX_FEE_PER_GAS_LESS_THAN_BLOCK_BASE_FEE,
      context: undefined,
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
      errorCode: RETURN_VALUE_ERROR_CODES.NONCE_TOO_LOW,
      context: nonce.toString(),
    });
  });
  it("should handle unknown unpredictable gas limit errors", () => {
    const result = getParsedEthersError({
      code: ETHERS_ERROR_CODES.UNPREDICTABLE_GAS_LIMIT,
      message: "",
    });

    expect(result).toEqual({
      errorCode: RETURN_VALUE_ERROR_CODES.UNKNOWN_ERROR,
      context: ETHERS_ERROR_CODES.UNPREDICTABLE_GAS_LIMIT,
    });
  });
  it("should handle unpredictable gas limit with transaction underpriced code but non valid JSON body", () => {
    const result = getParsedEthersError({
      code: ETHERS_ERROR_CODES.UNPREDICTABLE_GAS_LIMIT,
      message: "",
      error: {
        error: {
          error: {
            code: NESTED_ETHERS_ERROR_CODES.TRANSACTION_UNDERPRICED,
          },
          body: "not-a-json",
        },
      },
    });

    expect(result).toEqual({
      errorCode: RETURN_VALUE_ERROR_CODES.UNKNOWN_ERROR,
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
      errorCode: RETURN_VALUE_ERROR_CODES.TRANSACTION_RAN_OUT_OF_GAS,
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
      errorCode: RETURN_VALUE_ERROR_CODES.UNKNOWN_ERROR,
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
      errorCode: RETURN_VALUE_ERROR_CODES.UNKNOWN_ERROR,
      context: message,
    });
  });
  it("should handle unknown errors with a top level error code", () => {
    const code = "SOME INTERNAL ETHERS CODE";

    const result = getParsedEthersError({ code, message: "" });

    expect(result).toEqual({
      errorCode: RETURN_VALUE_ERROR_CODES.UNKNOWN_ERROR,
      context: code,
    });
  });
  it("should handle totally unknown errors", () => {
    const result = getParsedEthersError({ message: "" });

    expect(result).toEqual({
      errorCode: RETURN_VALUE_ERROR_CODES.UNKNOWN_ERROR,
      context: undefined,
    });
  });
});
