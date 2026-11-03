import * as DateFns from "date-fns";

import { Brand } from "helpers";
import { reverse } from "lodash-es";

export type Type = Brand<string, "ISO8601Date">;
export type DateTense = "today" | "past" | "future";
export const VALID_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

function validateAndParse(date: Type): Date {
  if (process.env.NODE_ENV !== "production" && !VALID_REGEX.test(date)) {
    throw new Error(`Invalid IsoDate ${date}`);
  }
  return DateFns.parseISO(date);
}

export const parseToDate = validateAndParse;
export const differenceInDays = (a: Type, b: Type): number =>
  DateFns.differenceInCalendarDays(validateAndParse(a), validateAndParse(b));
export const tomorrow = (): Type => addDays(today(), 1);
export const lastWeek = (): Type => addDays(today(), -7);
export const nextWeek = (): Type => addDays(today(), 7);
export const yesterday = (): Type => addDays(today(), -1);
export const today = (): Type => toIsoDate(new Date());
export const toDate = (x: Date | string): Date => (typeof x === "string" ? DateFns.parseISO(x) : x);
export const toIsoDate = (x: Date | string): Type => DateFns.format(toDate(x), "yyyy-MM-dd") as Type;
export const isValid = (x: Date | string): boolean => DateFns.isValid(toDate(x));
export const toShortDayDate = (x: Type): string => DateFns.format(validateAndParse(x), "E M-d-yyyy");
export const toLongDay = (x: Type): string => DateFns.format(validateAndParse(x), "EEEE");
export const toMonthAndDate = (x: Type): string => DateFns.format(validateAndParse(x), "MMMM d");
export const toShortMonthAndDate = (x: Type): string => DateFns.format(validateAndParse(x), "MMM d");
export const formatLongForm = (x: Type): string => DateFns.format(validateAndParse(x), "E, MMMM d, yyyy");
export const formatLongDayAndMonth = (x: Type): string => DateFns.format(validateAndParse(x), "EEEE, MMMM d");
export const formatShortDayAndLongMonth = (x: Type): string => DateFns.format(validateAndParse(x), "E, MMMM d");
export const formatLongDayMonthYear = (x: Type): string =>
  DateFns.format(validateAndParse(toIsoDate(x)), "dddd, LLLL d, yyyy");
export const formatLongMonthDayYear = (x: Type): string =>
  DateFns.format(validateAndParse(toIsoDate(x)), "LLLL d, yyyy");
export const getMonthAndYearFromIsoDate = (x: Type): string => DateFns.format(validateAndParse(x), "yyyy-MM");

export function eachDay(startDate: Type, endDate: Type, order?: "asc" | "desc") {
  const start = validateAndParse(startDate);
  const end = validateAndParse(endDate);

  return order && order === "asc"
    ? reverse(DateFns.eachDayOfInterval({ start, end }).map(toIsoDate))
    : DateFns.eachDayOfInterval({ start, end }).map(toIsoDate);
}

export function areEqual(_today: Type, date: Type): boolean {
  return DateFns.isEqual(validateAndParse(_today), validateAndParse(date));
}

export function isTomorrow(_today: Type, date: Type): boolean {
  const _tomorrow = DateFns.addDays(validateAndParse(_today), 1);
  return DateFns.isSameDay(_tomorrow, validateAndParse(date));
}

/**
 * Sunday is 0, Saturday is 6
 */
export function getWeekDayFromIsoDate(date: Type): number {
  return DateFns.getDay(validateAndParse(date));
}

export function isWeekend(date: Type): boolean {
  return DateFns.isWeekend(validateAndParse(date));
}

export function getMonthDayFromIsoDate(date: Type): number {
  return DateFns.getDate(validateAndParse(date));
}

export function getMonthAndDayFromIsoDate(date: Type): string {
  return DateFns.format(validateAndParse(date), "MMM d");
}

export function getYearFromIsoDate(date: Type): number {
  return parseInt(date.slice(0, 4), 10);
}

export function distanceInWords(a: Type, b: Type): string {
  return DateFns.formatDistance(validateAndParse(a), validateAndParse(b));
}

export function addMonths(date: Type, numMonths: number): Type {
  return toIsoDate(DateFns.addMonths(validateAndParse(date), numMonths));
}

export function addYears(date: Type, numYears: number): Type {
  return toIsoDate(DateFns.addYears(validateAndParse(date), numYears));
}

export function addDays(date: Type, numDays: number): Type {
  return toIsoDate(DateFns.addDays(validateAndParse(date), numDays));
}

export function getDateTense(date: Type, currentDate: Type): DateTense {
  if (date === currentDate) {
    return "today";
  } else if (date.localeCompare(currentDate) > 0) {
    return "future";
  }
  return "past";
}

export function dateIso(literals: TemplateStringsArray) {
  if (literals.length !== 1) {
    throw new Error("One parameter only, please.");
  }
  const date = literals[0];
  if (!VALID_REGEX.test(date)) {
    throw new Error(`Invalid IsoDate ${date}`);
  }
  return date as Type;
}

export const descendingYearMonthAscendingDateComparator = (_a: Type, _b: Type) => {
  const a = validateAndParse(_a);
  const b = validateAndParse(_b);
  return (
    DateFns.getYear(b) - DateFns.getYear(a) ||
    DateFns.getMonth(b) - DateFns.getMonth(a) ||
    DateFns.getDate(a) - DateFns.getDate(b)
  );
};
