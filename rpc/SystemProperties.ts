import * as common from "/rpc/common.ts";
import * as sys from "/system/mod.ts";

export interface SystemPropertiesResolved {
  ss58Format: number; // TODO: literally-type this
  tokenDecimals: number;
  tokenSymbol: string;
}

export const isSystemPropertiesResolved = (
  inQuestion: SystemPropertiesResolved,
): inQuestion is SystemPropertiesResolved => {
  return typeof inQuestion.ss58Format === "number"
    && typeof inQuestion.tokenDecimals === "number"
    && typeof inQuestion.tokenSymbol === "string";
};

export const SystemProperties = <
  Beacon,
  Resource extends sys.AnyEffectA<sys.ResourceResolved<Beacon>>,
>(resource: Resource) => {
  return sys.effect<SystemPropertiesResolved>()(
    "SystemProperties",
    { resource },
    (_, resolved) => {
      return common.call(resolved.resource, "system_properties", isSystemPropertiesResolved);
    },
  );
};
