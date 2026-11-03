import * as DateFns from "date-fns";
import * as DateIso from "./date-iso";
import * as TimeIso from "./time-iso";

import { Brand } from "helpers";

export type Type = Brand<string, "ISO8601DateTime">;

// expand as needed
export type IANA_TIMEZONES = "America/Detroit" | "America/Chicago";

// not a perfect regex but probably good enough for our needs
export const VALID_REGEX = /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]|Z)(([01]\d|2[0-3]):([0-5]\d))?$/;

export function validateAndParse(dateTime: Type): Date {
  if (process.env.NODE_ENV !== "production" && !VALID_REGEX.test(dateTime)) {
    throw new Error(`Invalid IsoDateTime ${dateTime}`);
  }

  return DateFns.parseISO(dateTime);
}

// todo make these accept Type
export function dateFromTimestamp(timestamp: string): DateIso.Type {
  return DateIso.toIsoDate(new Date(Date.parse(timestamp)));
}
export function timeFromTimestamp(timestamp: string): TimeIso.Type {
  return TimeIso.fromDate(new Date(Date.parse(timestamp)));
}

export function addHours(dateTime: Type, hoursToAdd: number): Type {
  return toIsoDateTime(DateFns.addHours(validateAndParse(dateTime), hoursToAdd));
}

export function isValid(dateTime: Date | string): boolean {
  return `${dateTime}` !== "Invalid Date";
}

export function toIsoDateTime(dateTime: Date | string): Type {
  if (typeof dateTime === "string" && !/([+]\d{2})|([Z]$)/.test(dateTime)) {
    // should end in :DD or Z
    console.warn(`☢️ You called toIsoDateTime with a date string that will be interpreted as local time. This value will be converted to UTC.
    You _probably_ didn’t mean to do this.
    If you’re writing a test that involves dates, e.g. "2012-01-01", you probably want to use "2012-01-01Z or "2012:01-01:{UTC OFFSET}"
    If you’re writing a test that involves times, e.g. "2012-01-01T12-59-59", you probably want to use "2012-01-01T12:59:59Z" or "2012-01-01T12:59:59:{UTC OFFSET}"`);
  }

  dateTime = typeof dateTime === "string" ? DateFns.parseISO(dateTime) : dateTime;
  // return in utc

  return new Date(dateTime.setMilliseconds(0)).toISOString() as Type;
}

const zeroPad = (str: string): string => {
  const n: number = parseInt(str);
  return `${n < 10 ? "0" : ""}${n}`;
};

export function dateFromMonthDayYearTime(dateTime: Date | string): Type | undefined {
  const regex = /([^-]+)-([^-]+)-([^\s]+)[\s]([^:]+):([^\s]+)\s+(AM|PM)/;
  const result = regex.exec(`${dateTime}`);

  if (result) {
    const dayString = zeroPad(result[2]);
    const monthString = zeroPad(result[1]);

    const rawHour: number = parseInt(result[4]);
    const hour: number = (rawHour % 12) + (result[6] === "PM" ? 12 : 0);
    const hourAdjusted: number = hour === 24 ? 0 : hour;
    const hourString = zeroPad(`${hourAdjusted}`);
    const minuteString = zeroPad(result[5]);

    return `${result[3]}-${monthString}-${dayString}T${hourString}:${minuteString}:00.000Z` as Type;
  }

  return undefined;
}

export function toSecondsSinceEpoch(dateTime: Type): number {
  const date = validateAndParse(dateTime);

  return Math.floor(date.getTime() / 1000);
}

export function toUTC(dateTime: Type): Type {
  return validateAndParse(dateTime).toISOString() as Type;
}

export function toLocalTime(arg: Type): Type {
  return DateFns.format(validateAndParse(arg), "yyyy-MM-dd HH:mm:ss.SSS") as Type;
}

export function getMostRecentDate(d1: Type, d2: Type): Type {
  return DateFns.compareDesc(validateAndParse(d1), validateAndParse(d2)) === 1 ? d2 : d1;
}

export function toLocalTimeIso(dateTime: Type): TimeIso.Type {
  return DateFns.format(validateAndParse(dateTime), "HH:mm:ss") as TimeIso.Type;
}

export const now = (): Type => toIsoDateTime(new Date());

export function dateTimeIso(literals: TemplateStringsArray) {
  if (literals.length !== 1) {
    throw new Error("One parameter only, please.");
  }
  const dateTime = literals[0];
  if (!VALID_REGEX.test(dateTime)) {
    throw new Error(`Invalid IsoDateTime ${dateTime}`);
  }
  return dateTime as Type;
}

export function startOfDay(time: Type): Type {
  return toIsoDateTime(DateFns.startOfDay(validateAndParse(time)));
}

export const createIntervals = (start: Type, end: Type, intervalInDays: number): { start: Type; end: Type }[] => {
  const intervalInHours = intervalInDays * 24;
  let current = start;
  const intervals: { start: Type; end: Type }[] = [];

  for (;;) {
    const next = addHours(current, intervalInHours);
    if (next >= end) {
      break;
    }
    intervals.push({ start: current, end: next });
    current = next;
  }

  intervals.push({ start: current, end });
  return intervals;
};
