export const isValidEmployeeId = (employeeId: string) => {
  const id = employeeId.trim();
  if (id.length !== 5 || Number.isNaN(Number(id)) || id.startsWith("0")) {
    return false;
  }
  return id.length === 5 && !Number.isNaN(Number(id));
};

export const isValidPartNumber = (partNumber: string) => {
  const partSplit = partNumber.split("-");
  if (partNumber.length < 8 || partNumber.length > 12 || partSplit.length < 2 || partSplit.length > 3) {
    return false;
  }
  const prefix = partSplit[0];
  const infix = partSplit[1];
  const suffix = partSplit.length === 3 ? partSplit[2] : undefined;
  if (prefix.length !== 3 || Number.isNaN(Number(prefix)) || prefix.startsWith("0")) {
    return false;
  }
  if (!prefix.startsWith("6") && !prefix.startsWith("7")) {
    return false;
  }
  if (infix.length !== 4 || Number.isNaN(Number(infix)) || infix === "0000") {
    return false;
  }
  if (suffix && (suffix.length !== 3 || Number.isNaN(Number(suffix)))) {
    return false;
  }
  if (Number.isNaN(Number(partSplit.join("")))) {
    return false;
  }
  return true;
};
