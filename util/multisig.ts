import * as $ from "../deps/scale.ts"
import { Blake2_256 } from "./hashers.ts"

const seed = "modlpy/utilisuba" // cspell:disable-line

const codec = Blake2_256.$hash($.tuple(
  $.constant(null, new TextEncoder().encode(seed)),
  $.array($.sizedUint8Array(32)),
  $.u16,
))

export function multisigAddress(signatories: Uint8Array[], threshold: number) {
  return codec.encode(
    [null, signatories.sort(sortUint8Array), threshold],
  )
}

function sortUint8Array(a: Uint8Array, b: Uint8Array) {
  for (let i = 0; i < a.length && i < b.length; i++) {
    if (a[i] !== b[i]) {
      return a[i]! - b[i]!
    }
  }
  return a.length - b.length
}
