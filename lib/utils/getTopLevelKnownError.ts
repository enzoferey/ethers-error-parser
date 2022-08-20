import { ERROR_CODES, ETHERS_ERROR_CODES } from "../constants";
import type { EthersError, ReturnValue } from "../types";

import { getErrorWhileFormattingOutputFromRPCError } from "./getErrorWhileFormattingOutputFromRPCError";

export function getTopLevelKnownError(
  ethersError: EthersError
): ReturnValue | undefined {
  // Handle error while formatting output from RPC
  if (ethersError.code !== undefined) {
    const errorWhileFormattingOutputFromRPC =
      getErrorWhileFormattingOutputFromRPCError(
        ethersError.code,
        ethersError.message
      );

    if (errorWhileFormattingOutputFromRPC !== undefined) {
      return errorWhileFormattingOutputFromRPC;
    }
  }

  // Check other known error codes
  if (ethersError.code === ETHERS_ERROR_CODES.REJECTED_TRANSACTION) {
    return {
      errorCode: ERROR_CODES.REJECTED_TRANSACTION,
      context: ethersError.message,
    };
  }

  if (ethersError.code === ETHERS_ERROR_CODES.REQUIRE_TRANSACTION) {
    if (ethersError.message.includes("execution reverted: ")) {
      return {
        errorCode: ERROR_CODES.EXECUTION_REVERTED,
        context: ethersError.message.slice("execution reverted: ".length),
      };
    }
  }

  if (
    ethersError.code === ETHERS_ERROR_CODES.NONCE_EXPIRED &&
    ethersError.transaction !== undefined
  ) {
    return {
      errorCode: ERROR_CODES.NONCE_TOO_LOW,
      context: ethersError.transaction.nonce.toString(),
    };
  }

  return undefined;
}
