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

// Distance from point (px, py) to line segment (ax, ay)-(bx, by)
function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  const projX = ax + t * dx;
  const projY = ay + t * dy;
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

/**
 * Generate high-definition ClipNote icon with Single-Stroke "CN" Monogram (一筆畫寫完)
 * - 'C' shifted up further (center Y = 0.37)
 * - 'N' shifted down (Y: 0.39 - 0.79)
 * - Seamless fusion: ZERO black border, ZERO shadow, smooth continuous single-stroke flow
 * - Radiant Amber gradient throughout
 */
function generateIconPNG(size) {
  const width = size;
  const height = size;

  const SS = 4;
  const ssW = width * SS;
  const ssH = height * SS;

  const bgR = 24, bgG = 24, bgB = 27;           // #18181b (Charcoal dark)
  const borderR = 48, borderG = 48, borderB = 56;    // #303038
  const amberR = 245, amberG = 158, amberB = 11;     // #F59E0B (Amber)
  const amberLightR = 251, amberLightG = 191, amberLightB = 36; // #FBBF24 (Bright amber)

  const containerRadius = ssW * 0.22;
  const containerBorder = ssW * 0.035;
  const center = ssW / 2;

  // Geometry: 'C' shifted up further to Y=0.37
  const cCenterX = ssW * 0.36;
  const cCenterY = ssH * 0.37;
  const cROuter = ssW * 0.215;
  const cRInner = ssW * 0.125;
  const cThickness = cROuter - cRInner;
  const cCapRadius = cThickness / 2;
  const cCapDist = (cROuter + cRInner) / 2;
  const cGapAngle = 0.58; // Opening angle

  const topCapX = cCenterX + cCapDist * Math.cos(-cGapAngle);
  const topCapY = cCenterY + cCapDist * Math.sin(-cGapAngle);
  const botCapX = cCenterX + cCapDist * Math.cos(cGapAngle);
  const botCapY = cCenterY + cCapDist * Math.sin(cGapAngle);

  // Letter 'N' shifted down (starts where bottom arm of C meets it)
  const nTopY = ssH * 0.37;
  const nBottomY = ssH * 0.79;
  const nStemWidth = ssW * 0.088;
  const nLeftX1 = ssW * 0.465;
  const nLeftX2 = nLeftX1 + nStemWidth;
  const nRightX2 = ssW * 0.79;
  const nRightX1 = nRightX2 - nStemWidth;

  const nDiagStartX = (nLeftX1 + nLeftX2) / 2;
  const nDiagStartY = nTopY;
  const nDiagEndX = (nRightX1 + nRightX2) / 2;
  const nDiagEndY = nBottomY;
  const nDiagHalfThick = nStemWidth * 0.52;

  const ssBuffer = new Float32Array(ssW * ssH * 4);

  for (let sy = 0; sy < ssH; sy++) {
    for (let sx = 0; sx < ssW; sx++) {
      const idx = (sy * ssW + sx) * 4;

      // Squircle container
      const cdx = Math.max(0, Math.abs(sx + 0.5 - center) - (center - containerRadius));
      const cdy = Math.max(0, Math.abs(sy + 0.5 - center) - (center - containerRadius));
      const distContainer = Math.sqrt(cdx * cdx + cdy * cdy);

      if (distContainer <= containerRadius) {
        let r = bgR;
        let g = bgG;
        let b = bgB;
        let a = 1.0;

        // Container subtle outer border
        if (distContainer >= containerRadius - containerBorder) {
          const t = (distContainer - (containerRadius - containerBorder)) / containerBorder;
          r = bgR * (1 - t) + borderR * t;
          g = bgG * (1 - t) + borderG * t;
          b = bgB * (1 - t) + borderB * t;
        }

        const px = sx + 0.5;
        const py = sy + 0.5;

        // Test if (px, py) is inside 'C'
        const distFromCCenter = Math.sqrt((px - cCenterX) ** 2 + (py - cCenterY) ** 2);
        const angleC = Math.atan2(py - cCenterY, px - cCenterX);
        const inOpening = angleC > -cGapAngle && angleC < cGapAngle;

        let inC = false;
        if (distFromCCenter >= cRInner && distFromCCenter <= cROuter && !inOpening) {
          inC = true;
        } else {
          const dTop = Math.sqrt((px - topCapX) ** 2 + (py - topCapY) ** 2);
          const dBot = Math.sqrt((px - botCapX) ** 2 + (py - botCapY) ** 2);
          if (dTop <= cCapRadius || dBot <= cCapRadius) {
            inC = true;
          }
        }

        // Test if (px, py) is inside 'N'
        let inN = false;
        const inNLeft = px >= nLeftX1 && px <= nLeftX2 && py >= nTopY && py <= nBottomY;
        const inNRight = px >= nRightX1 && px <= nRightX2 && py >= nTopY && py <= nBottomY;
        const dDiag = distToSegment(px, py, nDiagStartX, nDiagStartY, nDiagEndX, nDiagEndY);
        const inNDiag = dDiag <= nDiagHalfThick && py >= nTopY && py <= nBottomY;

        if (inNLeft || inNRight || inNDiag) {
          inN = true;
        }

        // Single-stroke seamless fusion (一筆畫寫完)
        // No black line, no shadow, completely unified continuous ribbon
        if (inC || inN) {
          const grad = Math.min(1, Math.max(0, ((sy / ssH) - 0.16) / 0.65));
          r = amberLightR * (1 - grad) + amberR * grad;
          g = amberLightG * (1 - grad) + amberG * grad;
          b = amberLightB * (1 - grad) + amberB * grad;
        }

        ssBuffer[idx] = r;
        ssBuffer[idx + 1] = g;
        ssBuffer[idx + 2] = b;
        ssBuffer[idx + 3] = a;
      } else {
        // Transparent outside container
        ssBuffer[idx + 3] = 0;
      }
    }
  }

  // Downsample to final size
  const raw = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    raw[offset++] = 0;

    for (let x = 0; x < width; x++) {
      let sumR = 0, sumG = 0, sumB = 0, sumA = 0;

      for (let dy = 0; dy < SS; dy++) {
        for (let dx = 0; dx < SS; dx++) {
          const ssX = x * SS + dx;
          const ssY = y * SS + dy;
          const ssIdx = (ssY * ssW + ssX) * 4;

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
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', zlib.deflateSync(raw));
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const targetDirs = [
  path.resolve('public/icons'),
];

for (const outDir of targetDirs) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const size of [16, 48, 128]) {
    const png = generateIconPNG(size);
    fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png);
    console.log(`Generated ${path.relative('.', outDir)}/icon-${size}.png (${png.length} bytes)`);
  }
}
