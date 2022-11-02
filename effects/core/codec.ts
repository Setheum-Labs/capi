import * as Z from "../../deps/zones.ts";
import * as M from "../../frame_metadata/mod.ts";

export const codec = Z.call.fac((
  deriveCodec: M.DeriveCodec,
  ty: number | M.Ty,
) => {
  return deriveCodec(ty);
});