import { RETURN_VALUE_ERROR_CODES } from "./constants";

export interface BigNumber {
  gte: (other: BigNumber) => boolean;
  toString: () => string;
}

export interface EthersError {
  code?: string | number;
  message: string;
  error?: NestedEthersError;
  transaction?: {
    gasLimit: BigNumber;
    nonce: number;
  };
  receipt?: {
    gasUsed: BigNumber;
  };
  action?: string;
  reason?: string;
}

export interface NestedEthersError {
  code?: string | number;
  message?: string;
  data?: {
    message?: string;
  };
  error?: {
    error?: {
      code?: string | number;
    };
    body?: string;
  };
}

type ValueOf<T> = T[keyof T];

type ErrorCode = ValueOf<typeof RETURN_VALUE_ERROR_CODES>;

export type ReturnValue = {
  errorCode: ErrorCode;
  context?: string;
};

// Convert an array of values into an object at which the key itself is the value
export type ToObject<T extends readonly string[]> = {
  [K in T[number]]: {
    [K in T[number]]: K;
  };
}[T[number]];
