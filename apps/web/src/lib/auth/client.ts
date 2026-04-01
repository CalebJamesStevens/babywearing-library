"use client";

import { createAuthClient } from "@neondatabase/auth/next";

const rawAuthClient = createAuthClient();
const authProxyCache = new WeakMap<object, unknown>();

function shouldHideAuthProp(prop: PropertyKey) {
  if (typeof prop === "symbol") {
    return prop === Symbol.toPrimitive || prop === Symbol.toStringTag;
  }

  if (typeof prop !== "string") {
    return false;
  }

  return [
    "__proto__",
    "arguments",
    "caller",
    "constructor",
    "displayName",
    "length",
    "name",
    "prototype",
    "toJSON",
    "toString",
    "valueOf",
  ].includes(prop);
}

function wrapAuthValue<T>(value: T): T {
  if ((typeof value !== "object" && typeof value !== "function") || value === null) {
    return value;
  }

  const cachedValue = authProxyCache.get(value as object);
  if (cachedValue) {
    return cachedValue as T;
  }

  const wrappedValue = new Proxy(value as any, {
    apply(target, thisArg, args) {
      return Reflect.apply(target, thisArg, args);
    },
    get(target, prop, receiver) {
      if (shouldHideAuthProp(prop)) {
        return undefined;
      }

      return wrapAuthValue(Reflect.get(target, prop, receiver));
    },
  });

  authProxyCache.set(value as object, wrappedValue);
  return wrappedValue as T;
}

export const authClient = wrapAuthValue(rawAuthClient);
export const { useSession } = authClient;
