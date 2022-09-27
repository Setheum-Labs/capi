import { Config } from "../config/mod.ts";
import { TmpMetadata } from "./metadata.ts";
import * as knownRpc from "./rpc.ts";

// TODO: swap out chain-specific rpc and metadata types
// @see https://github.com/paritytech/capi/issues/127
const Config_ = Config.from<
  knownRpc.CallMethods,
  knownRpc.SubscriptionMethods,
  knownRpc.ErrorDetails,
  TmpMetadata
>();

export class Polkadot extends Config_("wss://rpc.polkadot.io", 0) {}
export const polkadot = new Polkadot();

export class Kusama extends Config_("wss://kusama-rpc.polkadot.io", 2) {}
export const kusama = new Kusama();

export class Acala extends Config_("wss://acala-polkadot.api.onfinality.io/public-ws", 10) {}
export const acala = new Acala();

export class Rococo
  extends Config_("wss://rococo-contracts-rpc.polkadot.io", undefined! /* TODO */)
{}
export const rococo = new Rococo();

export class Moonbeam extends Config_("wss://wss.api.moonbeam.network", 1284) {}
export const moonbeam = new Moonbeam();

export class Statemint extends Config_("wss://statemint-rpc.polkadot.io", undefined! /* TODO */) {}
export const statemint = new Statemint();

export class Subsocial extends Config_("wss://para.subsocial.network", 28) {}
export const subsocial = new Subsocial();

export class Westend extends Config_("wss://westend-rpc.polkadot.io", 42) {}
export const westend = new Westend();
