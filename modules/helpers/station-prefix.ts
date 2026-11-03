export enum TesterType {
  Auxiliary = "Auxiliary",
  CamRf = "CamRf",
  Combo = "Combo",
  Combo2 = "Combo2",
  Debug = "Debug",
  Fpn = "Fpn",
  Fpn2 = "Fpn2",
  Function = "Function",
  Ict = "Ict",
  Ileft = "Ileft",
  Ileft3 = "Ileft3",
  Itm = "Itm",
  LensAligner = "LensAligner",
  Monorail = "Monorail",
  Nodal = "Nodal",
  PartVerifier = "PartVerifier",
  Pod = "Pod",
  Teradyne = "Teradyne",
  Tvt = "Tvt",
  TwoHundredPercent = "TwoHundredPercent",
}

export function getStationPrefixesForTesterType(testerType: TesterType): string[] {
  const prefixMap: Map<TesterType, string[]> = new Map([
    [TesterType.Auxiliary, [""]],
    [TesterType.CamRf, [""]],
    [TesterType.Combo, ["CMB"]],
    [TesterType.Combo2, ["Combo2"]],
    [TesterType.Debug, ["DBG"]],
    [TesterType.Fpn, ["FPN"]],
    [TesterType.Fpn2, ["FPN2"]],
    [TesterType.Function, [""]],
    [TesterType.Ict, [""]],
    [TesterType.Ileft, [""]],
    [TesterType.Ileft3, ["ILEFT"]],
    [TesterType.Itm, ["ITM"]],
    [TesterType.LensAligner, [""]],
    [TesterType.Monorail, ["MR"]],
    [TesterType.Nodal, [""]],
    [TesterType.PartVerifier, [""]],
    [TesterType.Pod, ["POD"]],
    [TesterType.Teradyne, [""]],
    [TesterType.Tvt, ["TVT"]],
    [TesterType.TwoHundredPercent, [""]],
  ]);

  const prefixes = prefixMap.get(testerType);
  return prefixes ?? [];
}
