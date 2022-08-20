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

  const unpredictableGasLimitError = getUnpredictableGasLimitError(ethersError);
  if (unpredictableGasLimitError !== undefined) {
    return unpredictableGasLimitError;
  }

  return undefined;
}
