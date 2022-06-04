import { effector } from "/effect/Effect.ts";
import { Pallet } from "/effect/std/pallet.ts";

export interface Map {
  pallet: Pallet;
  name: string;
}

export const map = effector.sync("map", () =>
  (pallet: Pallet, name: string): Map => ({
    pallet,
    name,
  }));