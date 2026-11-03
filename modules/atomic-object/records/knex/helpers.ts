export function escapeSqlString(val: any | undefined | null) {
  if (val === null || val === undefined) {
    return "null";
  }

  return `'${`${val}`.replace(/'/g, "''")}'`;
}

export function escapeBindingSyntax(val: string) {
  //https://github.com/knex/knex/pull/4053
  return val.replace(/\?/g, "\\?");
}
