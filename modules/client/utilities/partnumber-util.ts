const partNumberRegex = new RegExp("\\d{3}-\\d{4}-\\d+$");

export const isPartNumber = (input: string): boolean => {
  return partNumberRegex.test(input);
};
