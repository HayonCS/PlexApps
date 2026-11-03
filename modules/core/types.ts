export type Fn<T, U> = (t: T) => U;
export type UnionKeys<T> = T[keyof T];
export type PromiseType<T> = T extends PromiseLike<infer U> ? U : T;

export type AsStrings<T> = {
  [P in keyof T]: string;
};
export type ValueOf<T> = T[keyof T];

export type ActionType<TActions extends { [k: string]: any }> = ReturnType<ValueOf<TActions>>;

export type FirstArgument<T> = T extends (arg1: infer U, ...args: any[]) => any ? U : any;

export type SecondArgument<T> = T extends (arg1: any, arg2: infer U, ...args: any[]) => any ? U : any;

export type ThirdArgument<T> = T extends (arg1: any, arg2: any, arg3: infer U, ...args: any[]) => any ? U : any;

export type FirstElement<T> = T extends [infer U] ? U : any;

import React from "react";

export type ExtractProps<TComponentOrTProps> =
  TComponentOrTProps extends React.ComponentType<infer TProps> ? TProps : TComponentOrTProps;

export enum OperationType {
  OP_NOT_SET = "OP_NOT_SET",
  OP_WRITE = "OP_WRITE",
  OP_VERIFY = "OP_VERIFY",
  OP_CALIBRATE = "OP_CALIBRATE",
  OP_LIMIT = "OP_LIMIT",
  OP_DEF_CHK = "OP_DEF_CHK",
}

export enum DirectionType {
  INPUT = "INPUT",
  OUTPUT = "OUTPUT",
  MEMORY = "MEMORY",
  NONE = "NONE",
}

export type DirectionTypeString = keyof typeof DirectionType;

type NumberType<T extends number> = `U${T}` | `D${T}` | `S${T}` | `F${T}`;

type EightBitType = NumberType<8>;
type SixteenBitType = NumberType<16>;
type ThirtyTwoBitType = NumberType<32>;

type BitType = EightBitType | SixteenBitType | ThirtyTwoBitType;

type ArrayType<U extends number> = `${BitType}[${U}]`;

export type CommandSetDataDataType = BitType | ArrayType<number> | "string";

export type DisplayFormatType = "HEXADECIMAL" | "BINARY" | "DECIMAL" | "ASCII";

export type CurrentLibraryFilterOptions = "WORKING COPY" | "PRODUCTION RELEASE" | "CUSTOM";

import { SavedMemoryMapsRecord } from "modules/records/memorymaps";

export type MemoryMapsWithWC = SavedMemoryMapsRecord & {
  IsWorkingCopy: boolean;
};
