import * as common from "/rpc/common.ts";
import * as sys from "/system/mod.ts";

// TODO: how do we differentiate blocks from signed blocks?
export interface ChainGetBlockResolved {
  block: {
    extrinsics: string[];
    header: {
      digest: {
        logs: string[];
      };
      extrinsicsRoot: string;
      number: string;
      parentHash: string;
      stateRoot: string;
    };
  };
  justification: null; // TODO...
}

export const isChainGetBlockResolved = (inQuestion: any): inQuestion is ChainGetBlockResolved => {
  return typeof inQuestion === "object" && inQuestion.block && inQuestion.block.header;
};

export const ChainGetBlock = <
  Beacon,
  Resource extends sys.AnyEffectA<sys.ResourceResolved<Beacon>>,
  Hash extends sys.AnyEffectA<string | undefined>,
>(
  resource: Resource,
  hash: Hash,
) => {
  return sys.effect<ChainGetBlockResolved>()(
    "ChainGetBlock",
    { resource, hash },
    (_, resolved) => {
      return common.call(
        resolved.resource,
        "chain_getBlock",
        isChainGetBlockResolved,
        // Interesting that `[resolved.hash]` is being widened to `(string | undefined)[]`...
        // TODO: investigate why the widening ^ –– explicit `as const` should NOT be necessary here
        ...(resolved.hash ? [resolved.hash] as const : []),
      );
    },
  );
};
