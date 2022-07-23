import type { ReturnValue } from "../types";
import { ERROR_CODES, ETHERS_ERROR_CODES } from "../constants";

export function getErrorWhileFormattingOutputFromRPC(
  errorCode: string | number,
  errorCodeMessage: string
): ReturnValue | undefined {
  if (errorCode !== ETHERS_ERROR_CODES.ERROR_WHILE_FORMATTING_OUTPUT_FROM_RPC) {
    return undefined;
  }

  const stringifiedValue = errorCodeMessage.split("RPC '")[1]?.slice(0, -1);
  if (stringifiedValue === undefined) {
    return undefined;
  }

  try {
    const valueObject = JSON.parse(stringifiedValue) as
      | { value: { data?: { code?: number } } }
      | undefined;

    if (valueObject === undefined || valueObject.value.data === undefined) {
      return undefined;
    }

    if (
      valueObject.value.data.code === ETHERS_ERROR_CODES.TRANSACTION_UNDERPRICED
    ) {
      return {
        errorCode: ERROR_CODES.TRANSACTION_UNDERPRICED,
        context: undefined,
      };
    }
  } catch {
    return undefined;
  }

  return undefined;
}
