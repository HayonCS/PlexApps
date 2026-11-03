import { Ajv, ErrorObject, KeywordDefinition, Options } from "ajv";
import * as Result from "modules/atomic-object/result";

export class SchemaError extends Error implements ErrorObject {
  schemaPath: string;
  propertyName?: string | undefined;
  schema?: any;
  parentSchema?: object | undefined;
  data?: any;
  params: Record<string, any>;
  instancePath: string;
  keyword: string;

  constructor(ajvError: ErrorObject) {
    super(ajvError.instancePath + " " + ajvError.message);
    this.params = ajvError.params;
    this.instancePath = ajvError.instancePath;
    this.keyword = ajvError.keyword;
    this.schemaPath = ajvError.schemaPath;
    this.data = ajvError.data;
    this.schema = ajvError.schema;
    this.propertyName = ajvError.propertyName;
    this.parentSchema = ajvError.parentSchema;
  }
}
export function buildAjv(opts: Options) {
  const ajv = new Ajv(opts);
  ajv.addKeyword({ keyword: "tsType" } as KeywordDefinition);
  return ajv;
}

export const DEFAULT_AJV = buildAjv({
  removeAdditional: false,
  allowUnionTypes: true,
  strict: true,
});

export interface Validator<T> {
  isValid(o: unknown): o is T;
  from(o: unknown): Result.Type<T>;
  validate(o: unknown): T;
}

export function buildValidator<T>(args: { schema: any }): Validator<T> {
  const check = DEFAULT_AJV.compile(args.schema);

  return {
    isValid(o): o is T {
      return check(o) as boolean;
    },
    from(o) {
      return check(o) ? (o as T) : new SchemaError(check.errors![0]);
    },
    validate(o) {
      if (check(o)) {
        return o as T;
      } else {
        throw new SchemaError(check.errors![0]);
      }
    },
  };
}
