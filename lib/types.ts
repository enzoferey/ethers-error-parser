import { ERROR_CODES } from "./constants";

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
}

export interface NestedEthersError {
  code?: string | number;
  message?: string;
}

type ValueOf<T> = T[keyof T];

type ErrorCode = ValueOf<typeof ERROR_CODES>;

export type ReturnValue = {
  errorCode: ErrorCode;
  context?: string;
};
