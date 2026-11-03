import * as _ from "lodash-es";
const naturalCompare = require("natural-compare");

/**
 * Return the first mapped item (using mapFn) that matches the given predicate.
 */
export const findMapped = <T, S>(items: T[], mapFn: (obj: T) => S, predicate: (obj: S) => boolean): S | undefined => {
  for (const item of items) {
    const mapped = mapFn(item);
    if (predicate(mapped)) {
      return mapped;
    }
  }
  return undefined;
};

export function compareNaturally(a: any, b: any, sortOrder: "asc" | "desc" = "asc"): number {
  if (a === b) {
    return 0;
  }

  // Want nils last - so if a is nil and b is not, b should come first
  if ((a === null || a === undefined) && b !== null && b !== undefined) {
    return 1;
  }

  // Want nils last - so if a is not nil and b is, a should come first
  if (a !== null && a !== undefined && (b === null || b === undefined)) {
    return -1;
  }

  if (typeof a === "number") {
    return sortOrder === "asc" ? a - b : b - a;
  }
  return sortOrder === "asc" ? naturalCompare(a, b) : naturalCompare(b, a);
}

function normalizeSortOrder(sortOrder: "asc" | "desc" | "ASC" | "DESC" | undefined | null): "asc" | "desc" {
  switch (sortOrder) {
    case "desc":
    case "DESC":
      return "desc";
    default:
      return "asc";
  }
}

export function sortObjectArrayNaturally<T>(
  arr: T[],
  sort: Array<{
    sortField: keyof T | ((o: T) => T[keyof T]);
    sortOrder?: "asc" | "desc" | "ASC" | "DESC";
  }> = [{ sortField: _.identity }]
) {
  const sorted = [...arr].sort(
    (a: T, b: T) =>
      // Iterate through the provided sort options, returning the result of the first
      // naturalCompare that is non-zero.
      findMapped(
        sort,
        (sortDef) => {
          const sortOrder = normalizeSortOrder(sortDef.sortOrder);
          const valueA = typeof sortDef.sortField === "function" ? sortDef.sortField(a) : a[sortDef.sortField];
          const valueB = typeof sortDef.sortField === "function" ? sortDef.sortField(b) : b[sortDef.sortField];

          return compareNaturally(valueA, valueB, sortOrder);
        },
        (order: number) => order !== 0
      ) || 0
  );

  return sorted;
}
