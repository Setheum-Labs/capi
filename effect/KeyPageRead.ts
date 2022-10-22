import { Config } from "../config/mod.ts";
import * as Z from "../deps/zones.ts";
import * as U from "../util/mod.ts";
import { $key } from "./core/$key.ts";
import { $storageKey } from "./core/$storageKey.ts";
import { deriveCodec } from "./core/deriveCodec.ts";
import { storageKey } from "./core/storageKey.ts";
import { Metadata } from "./Metadata.ts";
import { RpcCall } from "./RpcCall.ts";

export class KeyPageRead<
  PalletName extends Z.$<string>,
  EntryName extends Z.$<string>,
  Count extends Z.$<number>,
  Rest extends [start?: unknown[] | undefined, blockHash?: Z.$<U.HexHash | undefined>],
> extends Z.Name {
  root;

  constructor(
    config: Config,
    palletName: PalletName,
    entryName: EntryName,
    count: Count,
    ...[start, blockHash]: [...Rest]
  ) {
    super();
    const metadata_ = new Metadata(config, blockHash as Rest[1]);
    const deriveCodec_ = deriveCodec(metadata_);
    const palletMetadata_ = metadata_.pallet(palletName);
    const entryMetadata_ = Z.call(
      palletMetadata_.entry(entryName),
      function assertIsMap(entryMetadata) {
        if (entryMetadata.type !== "Map") {
          return new ReadingKeysOfNonMapError();
        }
        return entryMetadata;
      },
    );
    const $storageKey_ = $storageKey(deriveCodec_, palletMetadata_, entryMetadata_);
    const startKey = start ? storageKey($storageKey_, start) : undefined;
    const storageKey_ = storageKey($storageKey_);
    const call = new RpcCall(config, "state_getKeysPaged", [
      storageKey_,
      count,
      startKey,
      blockHash as Rest[1],
    ]);
    const $key_ = $key(deriveCodec_, palletMetadata_, entryMetadata_);
    const keysEncoded = Z.sel(call, "result");
    const keysDecoded = Z.call(
      Z.ls($key_, keysEncoded),
      function keysDecodedImpl([$key, keysEncoded]) {
        return keysEncoded.map((keyEncoded: U.Hex) => {
          return $key.decode(U.hex.decode(keyEncoded));
        });
      },
    );
    this.root = Z.wrap(keysDecoded, "keys");
  }
}

export class ReadingKeysOfNonMapError extends U.ErrorCtor("ReadingKeysOfNonMap") {}