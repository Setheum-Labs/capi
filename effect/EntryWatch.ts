import { Config } from "../config/mod.ts";
import * as Z from "../deps/zones.ts";
import * as rpc from "../rpc/mod.ts";
import * as U from "../util/mod.ts";
import { $storageKey } from "./core/$storageKey.ts";
import { codec } from "./core/codec.ts";
import { deriveCodec } from "./core/deriveCodec.ts";
import { storageKey } from "./core/storageKey.ts";
import { Metadata } from "./Metadata.ts";
import { RpcCall } from "./RpcCall.ts";
import { RpcSubscription } from "./RpcSubscription.ts";

export type WatchEntryEvent = [key?: U.Hex, value?: unknown];

export class EntryWatch<
  PalletName extends Z.$<string>,
  EntryName extends Z.$<string>,
  Keys extends unknown[],
> extends Z.Name {
  root;

  constructor(
    readonly config: Config,
    readonly palletName: PalletName,
    readonly entryName: EntryName,
    readonly keys: Keys,
    readonly createWatchHandler: U.CreateWatchHandler<WatchEntryEvent[]>,
  ) {
    super();
    const metadata_ = new Metadata(config);
    const deriveCodec_ = deriveCodec(metadata_);
    const palletMetadata_ = metadata_.pallet(palletName);
    const entryMetadata_ = palletMetadata_.entry(entryName);
    const $storageKey_ = $storageKey(deriveCodec_, palletMetadata_, entryMetadata_);
    const entryValueTypeI = Z.sel(entryMetadata_, "value");
    const $entry = codec(deriveCodec_, entryValueTypeI);
    const storageKeys = Z.call(
      storageKey($storageKey_, ...keys.length ? [keys] : []),
      function wrapWithList(v) {
        return [v];
      },
    );
    const watchInit = Z.call($entry, function entryWatchInit($entry) {
      return U.mapCreateWatchHandler(
        createWatchHandler,
        (message: rpc.NotifMessage) => {
          return message.params.result.changes.map(([key, val]: any) => {
            return <WatchEntryEvent> [key, val ? $entry.decode(U.hex.decode(val)) : undefined];
          });
        },
      );
    });
    this.root = new RpcSubscription(
      config,
      "state_subscribeStorage",
      [storageKeys],
      watchInit,
      (ok) => {
        return new RpcCall(config, "state_unsubscribeStorage", [ok.result]);
      },
    );
  }
}