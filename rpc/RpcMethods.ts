import * as common from "/rpc/common.ts";
import * as sys from "/system/mod.ts";

export interface RpcMethodsOk {
  methods: string[];
  version: number;
}

export const isRpcMethodsOk = (inQuestion: any): inQuestion is RpcMethodsOk => {
  return !!(inQuestion && Array.isArray(inQuestion.methods) && typeof inQuestion.version === "number");
};

export const RpcMethods = <
  Beacon,
  Resource extends sys.AnyEffectA<sys.ResourceResolved<Beacon>>,
>(resource: Resource) => {
  return sys.effect<RpcMethodsOk>()(
    "RpcMethods",
    { resource },
    async (_, resolved) => {
      return common.call(resolved.resource, "rpc_methods", isRpcMethodsOk);
    },
  );
};
