import { ToObject } from "../types";

export function toObject<T extends readonly string[]>(values: T): ToObject<T> {
  return Object.fromEntries(
    values.map((value) => [value, value])
  ) as ToObject<T>;
}
