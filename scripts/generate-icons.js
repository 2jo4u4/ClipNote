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

/**
 * Generate high-definition ClipNote icon with anti-aliasing (supersampling)
 * Style: Raycast Charcoal Dark container (#18181b) + Radiant Amber 'C' (#F59E0B)
 */
function generateIconPNG(size) {
  const width = size;
  const height = size;

  // Supersampling factor for clean antialiasing
  const SS = 4;
  const ssWidth = width * SS;
  const ssHeight = height * SS;

  const bgR = 24, bgG = 24, bgB = 27;        // #18181b
  const borderR = 45, borderG = 45, borderB = 52; // #2d2d34
  const amberR = 245, amberG = 158, amberB = 11;  // #F59E0B
  const amberLightR = 251, amberLightG = 191, amberLightB = 36; // #FBBF24

  const radius = ssWidth * 0.22;
  const borderWidth = ssWidth * 0.035;
  const center = ssWidth / 2;

  // Super-sampled buffer
  const ssBuffer = new Float32Array(ssWidth * ssHeight * 4);

  for (let sy = 0; sy < ssHeight; sy++) {
    for (let sx = 0; sx < ssWidth; sx++) {
      const idx = (sy * ssWidth + sx) * 4;

      // Rounded container distance
      const dx = Math.max(0, Math.abs(sx + 0.5 - center) - (center - radius));
      const dy = Math.max(0, Math.abs(sy + 0.5 - center) - (center - radius));
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Inside squircle
        let r = bgR;
        let g = bgG;
        let b = bgB;
        let a = 1.0;

        // Container border
        if (dist >= radius - borderWidth) {
          const t = (dist - (radius - borderWidth)) / borderWidth;
          r = bgR * (1 - t) + borderR * t;
          g = bgG * (1 - t) + borderG * t;
          b = bgB * (1 - t) + borderB * t;
        }

        // Draw modern ClipNote letter 'C'
        // Centered arc with radius rOuter & rInner
        const cx = center * 1.02;
        const cy = center;
        const cdx = sx + 0.5 - cx;
        const cdy = sy + 0.5 - cy;
        const cDist = Math.sqrt(cdx * cdx + cdy * cdy);

        const rOuter = ssWidth * 0.29;
        const rInner = ssWidth * 0.17;
        const angle = Math.atan2(cdy, cdx); // -PI to +PI

        // Gap on right: opening from -42 deg to +42 deg (approx -0.73 to +0.73 rad)
        const inAngleCut = angle > -0.72 && angle < 0.72;

        if (cDist >= rInner && cDist <= rOuter && !inAngleCut) {
          // Gradient between amberLight (top) and amber (bottom)
          const grad = Math.min(1, Math.max(0, (sy / ssHeight)));
          r = amberLightR * (1 - grad) + amberR * grad;
          g = amberLightG * (1 - grad) + amberG * grad;
          b = amberLightB * (1 - grad) + amberB * grad;
        } else {
          // Rounded caps on the 'C' terminals
          const capRadius = (rOuter - rInner) / 2;
          const capCenterDist = (rOuter + rInner) / 2;
          const capAngle = 0.72;

          const topCapX = cx + capCenterDist * Math.cos(-capAngle);
          const topCapY = cy + capCenterDist * Math.sin(-capAngle);
          const botCapX = cx + capCenterDist * Math.cos(capAngle);
          const botCapY = cy + capCenterDist * Math.sin(capAngle);

          const dTopCap = Math.sqrt((sx + 0.5 - topCapX) ** 2 + (sy + 0.5 - topCapY) ** 2);
          const dBotCap = Math.sqrt((sx + 0.5 - botCapX) ** 2 + (sy + 0.5 - botCapY) ** 2);

          if (dTopCap <= capRadius || dBotCap <= capRadius) {
            const grad = Math.min(1, Math.max(0, (sy / ssHeight)));
            r = amberLightR * (1 - grad) + amberR * grad;
            g = amberLightG * (1 - grad) + amberG * grad;
            b = amberLightB * (1 - grad) + amberB * grad;
          }
        }

        ssBuffer[idx] = r;
        ssBuffer[idx + 1] = g;
        ssBuffer[idx + 2] = b;
        ssBuffer[idx + 3] = a;
      } else {
        // Outside
        ssBuffer[idx + 3] = 0;
      }
    }
  }

  // Downsample to target size
  const raw = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      let sumR = 0, sumG = 0, sumB = 0, sumA = 0;

      for (let dy = 0; dy < SS; dy++) {
        for (let dx = 0; dx < SS; dx++) {
          const ssX = x * SS + dx;
          const ssY = y * SS + dy;
          const ssIdx = (ssY * ssWidth + ssX) * 4;

          const a = ssBuffer[ssIdx + 3];
          sumR += ssBuffer[ssIdx] * a;
          sumG += ssBuffer[ssIdx + 1] * a;
          sumB += ssBuffer[ssIdx + 2] * a;
          sumA += a;
        }
      }

      const totalSamples = SS * SS;
      const alpha = sumA / totalSamples;

      if (alpha > 0.001) {
        raw[offset++] = Math.round(sumR / sumA);
        raw[offset++] = Math.round(sumG / sumA);
        raw[offset++] = Math.round(sumB / sumA);
        raw[offset++] = Math.round(alpha * 255);
      } else {
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

const targetDirs = [
  path.resolve('public/icons'),
  path.resolve('src/public/icons'),
];

for (const outDir of targetDirs) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const size of [16, 48, 128]) {
    const png = generateIconPNG(size);
    fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png);
    console.log(`Generated ${path.relative('.', outDir)}/icon-${size}.png (${png.length} bytes)`);
  }
}
