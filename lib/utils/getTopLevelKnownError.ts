import { RETURN_VALUE_ERROR_CODES, ETHERS_ERROR_CODES } from "../constants";
import type { EthersError, ReturnValue } from "../types";

import { getUnpredictableGasLimitError } from "./getUnpredictableGasLimitError";

export function getTopLevelKnownError(
  ethersError: EthersError
): ReturnValue | undefined {
  if (
    ethersError.code === ETHERS_ERROR_CODES.NONCE_EXPIRED &&
    ethersError.transaction !== undefined
  ) {
    return {
      errorCode: RETURN_VALUE_ERROR_CODES.NONCE_TOO_LOW,
      context: ethersError.transaction.nonce.toString(),
    };
  }

  if (
    ethersError.code === ETHERS_ERROR_CODES.ACTION_REJECTED &&
    ethersError.action === "sendTransaction"
  ) {
    return {
      errorCode: RETURN_VALUE_ERROR_CODES.REJECTED_TRANSACTION,
      context: ethersError.message,
    };
  }

  if (
    ethersError.code === ETHERS_ERROR_CODES.CALL_EXCEPTION &&
    ethersError.reason !== undefined
  ) {
    return {
      errorCode: RETURN_VALUE_ERROR_CODES.CALL_REVERTED,
      context: ethersError.reason,
    };
  }

  if (
    ethersError.code === ETHERS_ERROR_CODES.UNSUPPORTED_OPERATION &&
    ethersError.operation === "getDeployed" &&
    ethersError.reason === "contract not deployed"
  ) {
    return {
      errorCode: RETURN_VALUE_ERROR_CODES.CONTRACT_NOT_DEPLOYED,
      context: ethersError.contractAddress,
    };
  }
  const unpredictableGasLimitError = getUnpredictableGasLimitError(ethersError);
  if (unpredictableGasLimitError !== undefined) {
    return unpredictableGasLimitError;
  }

  return undefined;
}
