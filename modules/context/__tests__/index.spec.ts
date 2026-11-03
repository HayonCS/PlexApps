import { afterEach, describe, expect, it, vi } from "vitest";
import { KnexPort } from "atomic-object/records/knex/ports";
import * as db from "modules/db";
import { Context } from "modules/context";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Context database adapter", () => {
  it("lazily resolves the shared database when no override is supplied", () => {
    const database = {} as db.Knex;
    const getConnection = vi.spyOn(db, "getConnection").mockReturnValue(database);
    const context = new Context();

    expect(getConnection).not.toHaveBeenCalled();
    expect(context.get(KnexPort)).toBe(database);
    expect(context.get(KnexPort)).toBe(database);
    expect(getConnection).toHaveBeenCalledTimes(1);
  });

  it("preserves an explicit database override when cloned", () => {
    const database = {} as db.Knex;
    const getConnection = vi.spyOn(db, "getConnection");
    const context = new Context({ db: database });

    expect(context.get(KnexPort)).toBe(database);
    expect(context.clone().get(KnexPort)).toBe(database);
    expect(getConnection).not.toHaveBeenCalled();
  });

  it("resolves the shared database in a cloned default context", () => {
    const database = {} as db.Knex;
    vi.spyOn(db, "getConnection").mockReturnValue(database);

    expect(new Context().clone().get(KnexPort)).toBe(database);
  });

  it("preserves a transaction database override", () => {
    const database = {} as db.Knex;
    const transaction = {} as db.Knex;
    const getConnection = vi.spyOn(db, "getConnection");
    const context = new Context({ db: database });

    expect(context.clone((recipe) => recipe.add(KnexPort, () => transaction)).get(KnexPort)).toBe(transaction);
    expect(context.get(KnexPort)).toBe(database);
    expect(getConnection).not.toHaveBeenCalled();
  });
});
