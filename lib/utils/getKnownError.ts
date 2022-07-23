import { ERROR_CODES, ETHERS_ERROR_CODES } from "../constants";
import type { ReturnValue } from "../types";

import { getErrorWhileFormattingOutputFromRPCError } from "./getErrorWhileFormattingOutputFromRPCError";

export function getKnownError(
  errorCode: string | number,
  errorCodeMessage: string
): ReturnValue | undefined {
  // Handle error while formatting output from RPC
  const errorWhileFormattingOutputFromRPC =
    getErrorWhileFormattingOutputFromRPCError(errorCode, errorCodeMessage);

  if (errorWhileFormattingOutputFromRPC !== undefined) {
    return errorWhileFormattingOutputFromRPC;
  }

  // Check other known error codes
  if (errorCode === ETHERS_ERROR_CODES.REJECTED_TRANSACTION) {
    return {
      errorCode: ERROR_CODES.REJECTED_TRANSACTION,
      context: errorCodeMessage,
    };
  }

  if (errorCode === ETHERS_ERROR_CODES.REQUIRE_TRANSACTION) {
    if (errorCodeMessage.includes("execution reverted: ")) {
      return {
        errorCode: ERROR_CODES.EXECUTION_REVERTED,
        context: errorCodeMessage.slice("execution reverted: ".length),
      };
    }
  }

  return undefined;
}
