import {
  RETURN_VALUE_ERROR_CODES,
  NESTED_ETHERS_ERROR_CODES,
} from "../constants";
import type { NestedEthersError, ReturnValue } from "../types";

import { getErrorWhileFormattingOutputFromRPCError } from "./getErrorWhileFormattingOutputFromRPCError";

export function getNestedLevelKnownError(
  ethersError: NestedEthersError
): ReturnValue | undefined {
  const errorCode = ethersError.code;
  const errorCodeMessage = ethersError.message;

  if (errorCode === undefined) {
    return undefined;
  }

  // Handle error while formatting output from RPC
  if (errorCodeMessage !== undefined) {
    const errorWhileFormattingOutputFromRPC =
      getErrorWhileFormattingOutputFromRPCError(errorCode, errorCodeMessage);

    if (errorWhileFormattingOutputFromRPC !== undefined) {
      return errorWhileFormattingOutputFromRPC;
    }
  }

  // Check other known error codes
  if (errorCode === NESTED_ETHERS_ERROR_CODES.REJECTED_TRANSACTION) {
    return {
      errorCode: RETURN_VALUE_ERROR_CODES.REJECTED_TRANSACTION,
      context: errorCodeMessage,
    };
  }

  if (
    errorCode === NESTED_ETHERS_ERROR_CODES.REQUIRE_TRANSACTION &&
    errorCodeMessage !== undefined
  ) {
    if (errorCodeMessage.includes("execution reverted: ")) {
      return {
        errorCode: RETURN_VALUE_ERROR_CODES.EXECUTION_REVERTED,
        context: errorCodeMessage.slice("execution reverted: ".length),
      };
    }
  }

  return undefined;
}
