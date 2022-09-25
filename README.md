# ethers-error-parser

![Tests](https://github.com/enzoferey/ethers-error-parser/actions/workflows/test.yml/badge.svg)
[![npm version](https://badge.fury.io/js/@enzoferey%2Fethers-error-parser.svg)](https://badge.fury.io/js/@enzoferey%2Fethers-error-parser)
[![codecov](https://codecov.io/gh/enzoferey/ethers-error-parser/branch/main/graph/badge.svg?token=9amQLrkrar)](https://codecov.io/gh/enzoferey/ethers-error-parser)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@enzoferey/ethers-error-parser?color=g&label=gzip%20size)

Parse Ethers.js errors with ease 💅🏻

## Highlights

- Zero dependencies 🧹
- Lightweight 📦
- Simple to use ⚡️
- Work in progress 🚧

## Why

[Ethers.js](https://github.com/ethers-io/ethers.js/) is well known for its cryptic error messages. Whenever a transaction fails you will get an error message that combines plain text and JSON stringified string like this:

```
Error: cannot estimate gas; transaction may fail or may require manual gas limit (error={"code":-32603,"message":"execution reverted: Code has already claimed","data":{"originalError":{"code":3,"data":"0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000018436f64652068617320616c726561647920636c61696d65640000000000000000","message":"execution reverted: Code has already claimed"}}}, method="estimateGas", transaction={"from":"0xC16f5C62b29704F7aBECb27A3cb7E12a91383261","to":"0xb21FFFd62BD2f4aBd2a1dC34A2302Fda364977a0","data":"0xd2c34d3f0000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000063132333435360000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004153801a64156372ec7cd1d91868dd35ed68972dfa8b347c59db14bc49b753ed576fbe8a2bc00b6d0ba5dc8429c01748ae55e87dffa9547aafeb844aa40bb6c3e31b00000000000000000000000000000000000000000000000000000000000000","accessList":null}, code=UNPREDICTABLE_GAS_LIMIT, version=providers/5.5.1)
```

Your users deserve to get amazing feedback on failing transactions. Thanks to `ethers-error-parser` you can do that with ease.

## Work in progress

This package is a work in progress. Although it is not yet complete and many Ethers errors could be handled more elegantly, it is safe to use in production as it is. Some insights is better than no insights.

This package is being used in different production projects and it is in constant evolution based on the needs of these projects. If you find some error that is not handled yet or that does not provide a great context, please open an issue or pull request 🙏

## Getting started

1. Install the package

```sh
yarn add @enzoferey/ethers-error-parser
```

2. Use it

```ts
import { getParsedEthersError } from "@enzoferey/ethers-error-parser";

try {
  const transaction = await someContract.someMethod();
  await transaction.wait();
} catch (error) {
  const parsedEthersError = getParsedEthersError(error);
  // parsedError.errorCode - contains a well defined error code (see full list below)
  // parsedError.context - contains a context based string providing additional information
  // profit ! 💅🏻
}
```

## Return value

When using `getParsedEthersError` you will get back an object containing a well known `errorCode` property and an optional `context` property with additional information. The TypeScript type definition looks like the following:

```ts
interface ReturnValue {
  errorCode: string;
  context?: string;
}
```

Here is the complete list of returned objects:

| `errorCode`                                            | `context`                                                                  |
| ------------------------------------------------------ | -------------------------------------------------------------------------- |
| `TRANSACTION_RAN_OUT_OF_GAS`                           | The transaction gas limit as a string.                                     |
| `TRANSACTION_UNDERPRICED`                              | `undefined`                                                                |
| `REJECTED_TRANSACTION`                                 | The reason why the transaction rejected.                                   |
| `CALL_REVERTED`                                        | The reason why the call reverted.                                          |
| `EXECUTION_REVERTED`                                   | The reason why the transaction reverted.                                   |
| `NONCE_TOO_LOW`                                        | The transaction nonce as a string.                                         |
| `INSUFFICIENT_FUNDS_FOR_GAS`                           | `undefined`                                                                |
| `MAX_PRIORITY_FEE_PER_GAS_HIGHER_THAN_MAX_FEE_PER_GAS` | `undefined `                                                               |
| `MAX_FEE_PER_GAS_LESS_THAN_BLOCK_BASE_FEE`             | `undefined `                                                               |
| `UNKNOWN_ERROR`                                        | Some code or description of the error if available. `undefined` otherwise. |

The error codes strings can be accesses via the `RETURN_VALUE_ERROR_CODES` constant that the package exports.

If you find some error that is not handled yet or that does not provide a great context, please open an issue or pull request 🙏
