import type { EthersError, ReturnValue } from "./types";
import { ERROR_CODES } from "./constants";
import { getKnownErrorCode } from "./utils/getKnownErrorCode";

export function getParsedEthersError(error: EthersError): ReturnValue {
  const topLevelErrorCode = error.code;
  const topLevelErrorMessage = error.message;

  // Handle top level known error codes
  if (topLevelErrorCode !== undefined && topLevelErrorMessage !== undefined) {
    const topLevelKnownErrorCode = getKnownErrorCode(
      topLevelErrorCode,
      topLevelErrorMessage
    );
    if (topLevelKnownErrorCode !== undefined) {
      return topLevelKnownErrorCode;
    }
  }

  // Handle nested level known error codes
  if (error.error !== undefined) {
    const nestedLevelErrorCode = error.error.code;
    const nestedLevelErrorMessage = error.error.message;

    if (
      nestedLevelErrorCode !== undefined &&
      nestedLevelErrorMessage !== undefined
    ) {
      const nestedLevelKnownErrorCode = getKnownErrorCode(
        nestedLevelErrorCode,
        nestedLevelErrorMessage
      );
      if (nestedLevelKnownErrorCode !== undefined) {
        return nestedLevelKnownErrorCode;
      }
    }
  }

  // Check for run out of gas error
  if (error.transaction !== undefined && error.receipt !== undefined) {
    const transactionGasLimit = error.transaction.gasLimit;
    const receiptGasUsed = error.receipt.gasUsed;

    if (receiptGasUsed.gte(transactionGasLimit)) {
      return {
        errorCode: ERROR_CODES.TRANSACTION_RUN_OUT_OF_GAS,
        context: error.transaction.gasLimit.toString(),
      };
    }
  }

  // If we reach here, we should improve previous parsing to not reach this point any longer

  // Try providing some context via the nested level error message
  if (error.error !== undefined && error.error.message !== undefined) {
    return {
      errorCode: ERROR_CODES.UNKNOWN_ERROR,
      context: error.error.message,
    };
  }

  // Try providing some context via the top level error code
  if (topLevelErrorCode !== undefined) {
    return {
      errorCode: ERROR_CODES.UNKNOWN_ERROR,
      context: topLevelErrorCode.toString(),
    };
  }

  return {
    errorCode: ERROR_CODES.UNKNOWN_ERROR,
    context: undefined,
  };
}
