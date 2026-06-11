// Generates icon-192.png and icon-512.png for the PWA.
// Uses only Node built-ins (zlib + fs) — no external image library needed.
import { deflateSync } from 'zlib'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dir, '../public')

// CRC32 table
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let crc = 0xffffffff
  for (const b of buf) crc = CRC_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
}

// Draw a solid-color PNG with a centred "HX" shape
function makePNG(size) {
  // Palette: background dark, accent gold, text near-white
  const BG  = [10,  10,  10]   // #0a0a0a
  const ACC = [232, 193, 42]   // #e8c12a  Hyrox gold
  const FG  = [240, 237, 232]  // #f0ede8

  const px = (x, y) => {
    // Outer circle border (2px ring at r = 46% of size)
    const cx = size / 2, cy = size / 2
    const r = (x - cx) ** 2 + (y - cy) ** 2
    const outer = (size * 0.46) ** 2
    const inner = (size * 0.42) ** 2
    const bg    = (size * 0.40) ** 2

    if (r > outer) return BG           // outside circle
    if (r > inner) return ACC          // gold ring
    if (r > bg)    return BG           // narrow gap

    // "H" glyph (centred, 40% width, 50% height)
    const gw = size * 0.40
    const gh = size * 0.50
    const x0 = cx - gw / 2, x1 = cx + gw / 2
    const y0 = cy - gh / 2, y1 = cy + gh / 2
    const sw = size * 0.08  // stroke width

    const inLeftBar  = x >= x0 && x <= x0 + sw && y >= y0 && y <= y1
    const inRightBar = x >= x1 - sw && x <= x1  && y >= y0 && y <= y1
    const midTop = cy - sw / 2, midBot = cy + sw / 2
    const inCross    = y >= midTop && y <= midBot && x >= x0 && x <= x1

    if (inLeftBar || inRightBar || inCross) return ACC  // gold "H"
    return BG
  }

  // Build raw filter+RGB scanlines
  const raw = Buffer.alloc((size * 3 + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0  // filter byte: None
    for (let x = 0; x < size; x++) {
      const [r, g, b] = px(x + 0.5, y + 0.5)
      const i = y * (size * 3 + 1) + 1 + x * 3
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b
    }
  }

  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0)
  ihdrData.writeUInt32BE(size, 4)
  ihdrData[8] = 8  // bit depth
  ihdrData[9] = 2  // RGB
  // compression, filter, interlace = 0

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdrData),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [192, 512]) {
  const path = resolve(publicDir, `icon-${size}.png`)
  writeFileSync(path, makePNG(size))
  console.log(`wrote ${path}`)
}
