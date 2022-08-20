import { ERROR_CODES, ETHERS_ERROR_CODES } from "../constants";
import type { EthersError, ReturnValue } from "../types";

export function getUnpredictableGasLimitError(
  ethersError: EthersError
): ReturnValue | undefined {
  if (
    ethersError.error !== undefined &&
    ethersError.error.code === ETHERS_ERROR_CODES.REQUIRE_TRANSACTION &&
    ethersError.error.data !== undefined &&
    ethersError.error.data.message !== undefined
  ) {
    const errorMessage = ethersError.error.data.message;

    if (errorMessage.includes("execution reverted: ")) {
      return {
        errorCode: ERROR_CODES.EXECUTION_REVERTED,
        context: errorMessage.slice("execution reverted: ".length),
      };
    }
  }



  return undefined;
}
