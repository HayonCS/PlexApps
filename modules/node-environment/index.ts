import config from "config";
import * as Hexagonal from "atomic-object/hexagonal";

interface NodeEnvironment {
  isProduction: boolean;
  isTest: boolean;
  isLocalDevelopment: boolean;
}
export const NodeEnvironmentPort = Hexagonal.port<NodeEnvironment, "node environment">("node environment");
export type NodeEnvironmentPortType = typeof NodeEnvironmentPort;

export const NodeEnvironmentAdapter = Hexagonal.adapter({
  port: NodeEnvironmentPort,
  requires: [],
  build: () => {
    const maybeEnvironment = config.get("environment");
    return {
      isProduction: maybeEnvironment === "production",
      isTest: maybeEnvironment === "test",
      isLocalDevelopment: maybeEnvironment === "development",
    };
  },
});
