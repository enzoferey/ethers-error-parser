import type { ReturnValue } from "../types";
import {
  RETURN_VALUE_ERROR_CODES,
  NESTED_ETHERS_ERROR_CODES,
} from "../constants";

export function getErrorWhileFormattingOutputFromRPCError(
  errorCode: string | number,
  errorCodeMessage: string
): ReturnValue | undefined {
  if (
    errorCode !==
    NESTED_ETHERS_ERROR_CODES.ERROR_WHILE_FORMATTING_OUTPUT_FROM_RPC
  ) {
    return undefined;
  }

  const stringifiedValue = errorCodeMessage.split("RPC '")[1]?.slice(0, -1);
  if (stringifiedValue === undefined) {
    return undefined;
  }

  try {
    const valueObject = JSON.parse(stringifiedValue) as {
      value?: { data?: { code?: number } };
    };

    if (
      valueObject.value === undefined ||
      valueObject.value.data === undefined
    ) {
      return undefined;
    }

    if (
      valueObject.value.data.code ===
      NESTED_ETHERS_ERROR_CODES.TRANSACTION_UNDERPRICED
    ) {
      return {
        errorCode: RETURN_VALUE_ERROR_CODES.TRANSACTION_UNDERPRICED,
        context: undefined,
      };
    }
  } catch {
    return undefined;
  }

  return undefined;
}
