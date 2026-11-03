import { act } from "react-dom/test-utils";

/** Used by Flavor to mark a type in a readable way. */
export interface Flavoring<FlavorT> {
  _type?: FlavorT;
}
/** Create a "flavored" version of a type. TypeScript will disallow mixing flavors, but will allow unflavored values of that type to be passed in where a flavored version is expected. This is a less restrictive form of branding. */
export type Flavor<T, FlavorT> = T & Flavoring<FlavorT>;

/** Used by Brand to mark a type in a readable way. */
export interface Branding<BrandT> {
  _type: BrandT;
}
/** Create a "branded" version of a type.  */
export type Brand<T, BrandT> = T & Branding<BrandT>;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function waitAtMost<T, E>(ms: number, on: Promise<T>, otherwise: E): Promise<T | E> {
  const time = sleep(ms);
  const x = await Promise.race([time, on]);
  if (x) return x;
  return otherwise;
}

export async function testWait() {
  await act(async () => {
    for (let i = 0; i < 10; i++) {
      await sleep(10);
    }
  });
}

/**
 * Create a garbage collecting cache using WeakMap.
 * the computed value will be cached until the input object is garbage collected.
 * @param f a function from some object to a derived value.
 * @returns a cached version of f.
 */
export const weakMemoize = <K extends object, V>(f: (k: K) => V) => {
  const cache = new WeakMap<K, V>();
  return (k: K) => {
    if (!cache.has(k)) {
      cache.set(k, f(k));
    }
    return cache.get(k)!;
  };
};

let bombSuppressions = 0;
export function suppressBomb(fn: () => void) {
  bombSuppressions += 1;
  try {
    fn();
  } finally {
    bombSuppressions -= 1;
  }
}

export function bomb(errorMessage: string, error?: Error): never {
  if (bombSuppressions === 0) {
    console.error(errorMessage, error || new Error());
  }
  throw error || new Error(errorMessage);
}
