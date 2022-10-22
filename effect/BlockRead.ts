import { Config } from "../config/mod.ts";
import * as Z from "../deps/zones.ts";
import * as U from "../util/mod.ts";
import { $extrinsic } from "./core/$extrinsic.ts";
import { deriveCodec } from "./core/deriveCodec.ts";
import { Metadata } from "./Metadata.ts";
import { RpcCall } from "./RpcCall.ts";

export class BlockRead<Rest extends [blockHash?: Z.$<U.HexHash | undefined>]> extends Z.Name {
  root;

  constructor(
    config: Config,
    ...[blockHash]: [...Rest]
  ) {
    super();
    const metadata_ = new Metadata(config, blockHash);
    const $extrinsic_ = $extrinsic(deriveCodec(metadata_), metadata_, undefined!);
    const call = new RpcCall(config, "chain_getBlock", [blockHash]);
    const decoded = Z.call(Z.ls($extrinsic_, call), function mapExtrinsicCall([$extrinsic_, call]) {
      const { block: { extrinsics, header }, justifications } = call.result;
      return {
        justifications,
        block: {
          header,
          extrinsics: extrinsics.map((extrinsic: U.Hex) => {
            return $extrinsic_.decode(U.hex.decode(extrinsic));
          }),
        },
      };
    });
    this.root = Z.wrap(decoded, "block");
  }
}