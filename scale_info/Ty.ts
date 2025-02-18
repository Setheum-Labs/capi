import * as $ from "../deps/scale.ts"

export class TyDecodeCtx {
  tys: Ty[] | null = null
}

const $compactU32 = $.compact($.u32)
export const $tys: $.Codec<Ty[]> = $.createCodec({
  _metadata: $.metadata("$tys"),
  _staticSize: $compactU32._staticSize,
  _encode(buffer, value) {
    $.array($ty)._encode(buffer, value)
  },
  _decode(buffer) {
    const length = $compactU32._decode(buffer)
    const ctx = buffer.context.get(TyDecodeCtx)
    const tys = ctx.tys = Array.from({ length }, (_, id) => ({ id } as Ty))
    for (let i = 0; i < length; i++) {
      Object.assign(tys[i]!, $ty._decode(buffer))
    }
    return tys
  },
  _assert(assert) {
    $.array($ty)._assert(assert)
  },
})

export const $tyId: $.Codec<Ty> = $.createCodec({
  _metadata: $.metadata("$tyId"),
  _staticSize: $compactU32._staticSize,
  _encode(buffer, value) {
    $compactU32._encode(buffer, value.id)
  },
  _decode(buffer) {
    const ctx = buffer.context.get(TyDecodeCtx)
    const id = $compactU32._decode(buffer)
    return ctx.tys?.[id] ?? { id } as any
  },
  _assert(assert) {
    $compactU32._assert(assert.key(this, "id"))
  },
})

export interface Field {
  name?: string
  ty: Ty
  typeName?: string
  docs: string[]
}
export const $field: $.Codec<Field> = $.object(
  $.optionalField("name", $.str),
  $.field("ty", $tyId),
  $.optionalField("typeName", $.str),
  $.field("docs", $.array($.str)),
)

export type PrimitiveKind = $.Native<typeof $primitiveKind>
const $primitiveKind = $.stringUnion([
  "bool",
  "char",
  "str",
  "u8",
  "u16",
  "u32",
  "u64",
  "u128",
  "u256",
  "i8",
  "i16",
  "i32",
  "i64",
  "i128",
  "i256",
])

export type TyType = TyDef["type"]
export interface StructTyDef {
  type: "Struct"
  fields: Field[]
}
export interface UnionTyDefMember {
  name: string
  fields: Field[]
  index: number
  docs: string[]
}
export interface UnionTyDef {
  type: "Union"
  members: UnionTyDefMember[]
}
export interface SequenceTyDef {
  type: "Sequence"
  typeParam: Ty
}
export interface SizedArrayTyDef {
  type: "SizedArray"
  len: number
  typeParam: Ty
}
export interface TupleTyDef {
  type: "Tuple"
  fields: Ty[]
}
export interface PrimitiveTyDef {
  type: "Primitive"
  kind: PrimitiveKind
}
export interface CompactTyDef {
  type: "Compact"
  typeParam: Ty
}
export interface BitSequenceTyDef {
  type: "BitSequence"
  bitOrderType: Ty
  bitStoreType: Ty
}
export type TyDef =
  | StructTyDef
  | UnionTyDef
  | SequenceTyDef
  | SizedArrayTyDef
  | TupleTyDef
  | PrimitiveTyDef
  | CompactTyDef
  | BitSequenceTyDef
export const $tyDef: $.Codec<TyDef> = $.taggedUnion("type", [
  $.variant("Struct", $.field("fields", $.array($field))),
  $.variant(
    "Union",
    $.field(
      "members",
      $.array($.object(
        $.field("name", $.str),
        $.field("fields", $.array($field)),
        $.field("index", $.u8),
        $.field("docs", $.array($.str)),
      )),
    ),
  ),
  $.variant("Sequence", $.field("typeParam", $tyId)),
  $.variant("SizedArray", $.field("len", $.u32), $.field("typeParam", $tyId)),
  $.variant("Tuple", $.field("fields", $.array($tyId))),
  $.variant("Primitive", $.field("kind", $primitiveKind)),
  $.variant("Compact", $.field("typeParam", $tyId)),
  $.variant("BitSequence", $.field("bitOrderType", $tyId), $.field("bitStoreType", $tyId)),
])

export interface Param {
  name: string
  ty?: Ty
}
export const $param: $.Codec<Param> = $.object(
  $.field("name", $.str),
  $.optionalField("ty", $tyId),
)

export type Ty = {
  id: number
  path: string[]
  params: Param[]
  docs: string[]
} & TyDef
export const $ty: $.Codec<Ty> = $.object(
  $.object(
    $.object(
      $.field("id", $.compact($.u32)),
      $.field("path", $.array($.str)),
      $.field("params", $.array($param)),
    ),
    $tyDef,
  ),
  $.object(
    $.field("docs", $.array($.str)),
  ),
)
