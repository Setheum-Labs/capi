// Not much here yet

use {
  base58::{FromBase58, ToBase58},
  js_sys::Uint8Array,
  wasm_bindgen::prelude::*,
};

#[wasm_bindgen(js_name = base58Encode)]
pub fn base58_encode(data: &[u8]) -> Uint8Array {
  console_error_panic_hook::set_once();
  ToBase58::to_base58(&data[..]).as_bytes().into()
}

#[wasm_bindgen(js_name = decodeSs58Text)] // TODO: with prefix
pub fn decode_Ss58Text(addr: &str) -> Uint8Array {
  console_error_panic_hook::set_once();
  let address_bytes = addr.from_base58().unwrap();
  let len = address_bytes.len();
  if len == 35 {
    let hex_public_key = &address_bytes[1..33];
    hex::encode(hex_public_key).as_bytes().into()
  } else {
    unimplemented!()
  }
}