import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const body = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, body, crcBuf]);
}

function generateIconPNG(size) {
  const width = size;
  const height = size;

  // Raw image data with 1 filter byte (0) per row
  const raw = Buffer.alloc(height * (1 + width * 4));

  // Colors: Amber background (#f59e0b = 245, 158, 11), Text dark (#1c1917 = 28, 25, 23)
  const bgR = 245, bgG = 158, bgB = 11;
  const fgR = 28, fgG = 25, fgB = 23;

  const radius = size * 0.22;
  const center = size / 2;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      // Check rounded rect distance
      const dx = Math.max(0, Math.abs(x + 0.5 - center) - (center - radius));
      const dy = Math.max(0, Math.abs(y + 0.5 - center) - (center - radius));
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Simple letter 'N' drawing logic
        const nx = (x / size);
        const ny = (y / size);
        const inNLeft = nx >= 0.28 && nx <= 0.40 && ny >= 0.26 && ny <= 0.74;
        const inNRight = nx >= 0.60 && nx <= 0.72 && ny >= 0.26 && ny <= 0.74;
        const inNDiag = Math.abs((nx - 0.28) / (0.60 - 0.28) - (ny - 0.26) / (0.74 - 0.26)) < 0.16 && nx >= 0.32 && nx <= 0.68 && ny >= 0.26 && ny <= 0.74;

        if (inNLeft || inNRight || inNDiag) {
          raw[offset++] = fgR;
          raw[offset++] = fgG;
          raw[offset++] = fgB;
          raw[offset++] = 255;
        } else {
          raw[offset++] = bgR;
          raw[offset++] = bgG;
          raw[offset++] = bgB;
          raw[offset++] = 255;
        }
      } else {
        // Transparent outside rounded corner
        raw[offset++] = 0;
        raw[offset++] = 0;
        raw[offset++] = 0;
        raw[offset++] = 0;
      }
    }
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', zlib.deflateSync(raw));
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve('src/public/icons');
fs.mkdirSync(outDir, { recursive: true });

for (const size of [16, 48, 128]) {
  const png = generateIconPNG(size);
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png);
  console.log(`Generated icon-${size}.png (${png.length} bytes)`);
}
