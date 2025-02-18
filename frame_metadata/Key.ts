import * as $ from "../deps/scale.ts"
import { DeriveCodec } from "../scale_info/Codec.ts"
import { hashers } from "../util/mod.ts"
import { HasherKind, MapStorageEntryType, Pallet, StorageEntry } from "./Metadata.ts"

export type HasherLookup = { [_ in HasherKind]: (input: Uint8Array) => Uint8Array }

export interface StorageKeyProps {
  deriveCodec: DeriveCodec
  pallet: Pallet
  storageEntry: StorageEntry
}

export function $storageKey(props: StorageKeyProps): $.Codec<unknown[]> {
  let keyCodecs: $.Codec<any>[]
  if (props.storageEntry.type === "Map") {
    const codec = props.deriveCodec(props.storageEntry.key)
    if (props.storageEntry.hashers.length === 1) {
      keyCodecs = [codec]
    } else {
      if (codec._metadata[0]?.factory !== $.tuple) {
        throw new Error("Expected key codec to be a tuple since there are multiple hashers")
      }
      keyCodecs = codec._metadata[0]!.args
    }
  } else {
    keyCodecs = []
  }
  const palletHash = hashers.Twox128.hash(new TextEncoder().encode(props.pallet.name))
  const entryHash = hashers.Twox128.hash(new TextEncoder().encode(props.storageEntry.name))
  const $keys = [...Array(keyCodecs.length + 1).keys()].reduce(
    (keys, i) => {
      keys[i] = $.tuple(
        ...keyCodecs.slice(0, i).map(($key, i) =>
          hashers[(props.storageEntry as MapStorageEntryType).hashers[i]!].$hash($key)
        ),
      )
      return keys
    },
    {} as Record<number, $.Codec<any[]>>,
  )
  return $.createCodec({
    _metadata: $.metadata("$storageKey", $storageKey, props),
    _staticSize: $keys[Object.values($keys).length - 1]!._staticSize,
    _encode(buffer, key) {
      buffer.insertArray(palletHash)
      buffer.insertArray(entryHash)
      if (key.length === 0) return
      $keys[key.length]!._encode(buffer, key)
    },
    _decode(buffer) {
      // Ignore initial hashes
      buffer.index += 32
      return $keys[Object.values($keys).length - 1]!._decode(buffer)
    },
    _assert(assert) {
      assert.instanceof(this, Array)
      const value = assert.value as unknown[]
      if (value.length === 0) return
      $keys[value.length]!._assert(assert)
    },
  })
}
