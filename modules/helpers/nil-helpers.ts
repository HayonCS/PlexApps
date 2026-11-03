export function notNilType<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined && !Number.isNaN(value as any);
}

export function notNilString(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value !== "";
}

export function excludeNils<T>(values: T[]) {
  return values.filter((v) => notNilType(v)) as Array<NonNullable<T>>;
}

export function notNilOrDefault<T>(value: T | null | undefined, defaultValue: T) {
  return notNilType<T>(value) ? value : defaultValue;
}

export const throwIfNil = <T>(value: T | undefined | null): T => {
  if (value === undefined || value === null) {
    throw new Error("Unexpected nil value");
  }

  return value;
};

export function notNilStrings(values: Array<string | null | undefined>): boolean {
  for (var v of values) {
    if (!notNilString(v)) {
      return false;
    }
  }
  return true;
}
