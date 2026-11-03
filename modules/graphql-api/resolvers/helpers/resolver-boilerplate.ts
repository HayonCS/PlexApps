export const ResolverBoilerPlate = async (
  type: "evaluation" | "bindingCall" | "group",
  parent: any,
  args: any,
  ctx: any,
  handler: any
) => {
  const [domain, testPlanName, revisionNumber, elementIdentifier] = parent.id.split(":");

  const testPlanDocument = await ctx.testPlanDocument.find.load({
    domain: domain as any,
    testPlanName,
    revisionNumber: Number.parseInt(revisionNumber),
  });

  if (!testPlanDocument) {
    return "";
  }

  const element = testPlanDocument.document.elements[elementIdentifier];
  if (!element) {
    return "";
  }

  if (element.type !== type) {
    throw new Error(`Element type is not a ${type}`);
  }

  return handler(element);
};
