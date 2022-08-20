import {
  RETURN_VALUE_ERROR_CODES,
  NESTED_ETHERS_ERROR_CODES,
  ETHERS_ERROR_CODES,
} from "../constants";
import type { EthersError, ReturnValue } from "../types";

export function getUnpredictableGasLimitError(
  ethersError: EthersError
): ReturnValue | undefined {
  if (ethersError.code !== ETHERS_ERROR_CODES.UNPREDICTABLE_GAS_LIMIT) {
    return undefined;
  }

  if (
    ethersError.error !== undefined &&
    ethersError.error.code === NESTED_ETHERS_ERROR_CODES.REQUIRE_TRANSACTION &&
    ethersError.error.data !== undefined &&
    ethersError.error.data.message !== undefined
  ) {
    const errorMessage = ethersError.error.data.message;
    if (errorMessage.includes("execution reverted: ")) {
      return {
        errorCode: RETURN_VALUE_ERROR_CODES.EXECUTION_REVERTED,
        context: errorMessage.slice("execution reverted: ".length),
      };
    }
  }

  if (
    ethersError.error !== undefined &&
    ethersError.error.error !== undefined &&
    ethersError.error.error.error !== undefined &&
    ethersError.error.error.error.code ===
      NESTED_ETHERS_ERROR_CODES.TRANSACTION_UNDERPRICED &&
    ethersError.error.error.body !== undefined
  ) {
    try {
      const bodyObject = JSON.parse(ethersError.error.error.body) as {
        error?: {
          message?: string;
        };
      };

      if (
        bodyObject.error !== undefined &&
        bodyObject.error.message === "gas required exceeds allowance (0)"
      ) {
        return {
          errorCode: RETURN_VALUE_ERROR_CODES.INSUFFICIENT_FUNDS_FOR_GAS,
          context: undefined,
        };
      }
    } catch {
      return undefined;
    }
  }

  return undefined;
}
