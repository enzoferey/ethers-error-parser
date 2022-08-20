import type { EthersError, ReturnValue } from "./types";
import { RETURN_VALUE_ERROR_CODES } from "./constants";
import { getNestedLevelKnownError } from "./utils/getNestedLevelKnownError";
import { getTopLevelKnownError } from "./utils/getTopLevelKnownError";

export function getParsedEthersError(error: EthersError): ReturnValue {
  const topLevelEthersError = error;
  const nestedLevelEthersError = error.error;

  // Handle top level known error codes
  const topLevelKnownErrorCode = getTopLevelKnownError(topLevelEthersError);
  if (topLevelKnownErrorCode !== undefined) {
    return topLevelKnownErrorCode;
  }

  // Handle nested level known error codes
  if (nestedLevelEthersError !== undefined) {
    const nestedLevelKnownErrorCode = getNestedLevelKnownError(
      nestedLevelEthersError
    );
    if (nestedLevelKnownErrorCode !== undefined) {
      return nestedLevelKnownErrorCode;
    }
  }

  // Check for ran out of gas error
  if (
    topLevelEthersError.transaction !== undefined &&
    topLevelEthersError.receipt !== undefined
  ) {
    const transactionGasLimit = topLevelEthersError.transaction.gasLimit;
    const receiptGasUsed = topLevelEthersError.receipt.gasUsed;

    if (receiptGasUsed.gte(transactionGasLimit)) {
      return {
        errorCode: RETURN_VALUE_ERROR_CODES.TRANSACTION_RAN_OUT_OF_GAS,
        context: topLevelEthersError.transaction.gasLimit.toString(),
      };
    }
  }

  // If we reach here, we should improve previous parsing to not reach this point any longer

  // Try providing some context via the nested level error message
  if (error.error !== undefined && error.error.message !== undefined) {
    return {
      errorCode: RETURN_VALUE_ERROR_CODES.UNKNOWN_ERROR,
      context: error.error.message,
    };
  }

  // Try providing some context via the top level error code
  if (topLevelEthersError.code !== undefined) {
    return {
      errorCode: RETURN_VALUE_ERROR_CODES.UNKNOWN_ERROR,
      context: topLevelEthersError.code.toString(),
    };
  }

  return {
    errorCode: RETURN_VALUE_ERROR_CODES.UNKNOWN_ERROR,
    context: undefined,
  };
}
