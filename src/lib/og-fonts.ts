import { ARCHIVO_BLACK_B64, ARCHIVO_MEDIUM_B64 } from "./og-font-data";

type OgFont = { name: string; data: ArrayBuffer; weight: 500 | 800; style: "normal" };

function b64ToArrayBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

let cached: OgFont[] | null = null;
/** Brand fonts for generated share images (embedded — no fs or network needed). */
export async function ogFonts(): Promise<OgFont[]> {
  cached ??= [
    { name: "Archivo", data: b64ToArrayBuffer(ARCHIVO_BLACK_B64), weight: 800, style: "normal" },
    { name: "Archivo", data: b64ToArrayBuffer(ARCHIVO_MEDIUM_B64), weight: 500, style: "normal" },
  ];
  return cached;
}
