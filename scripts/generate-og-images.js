const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Pure Node.js PNG generator - no external dependencies
const WIDTH = 1200;
const HEIGHT = 630;

function createPNG(width, height, pixelFn) {
  // PNG signature
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw pixel data with filter byte
  const rawData = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 3);
    rawData[rowOffset] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelFn(x, y, width, height);
      const px = rowOffset + 1 + x * 3;
      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 6 });

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeB = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeB, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcData), 0);
    return Buffer.concat([len, typeB, data, crc]);
  }

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// CRC32 implementation
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c;
    }
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Color helpers
function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
function blend(bg, fg, alpha) {
  return [
    lerp(bg[0], fg[0], alpha),
    lerp(bg[1], fg[1], alpha),
    lerp(bg[2], fg[2], alpha)
  ];
}

const png = createPNG(WIDTH, HEIGHT, (x, y, w, h) => {
  // Gradient background: deep red
  const t = y / h;
  let r = lerp(139, 74, t);  // #8B0000 -> #4a0000
  let g = lerp(0, 0, t);
  let b = lerp(0, 0, t);
  let bg = [r, g, b];

  // Radial gold glow in upper center
  const dx = (x - w / 2) / w;
  const dy = (y - h * 0.35) / h;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 0.35) {
    const glowAlpha = Math.max(0, (0.35 - dist) / 0.35) * 0.12;
    bg = blend(bg, [201, 169, 110], glowAlpha);
  }

  // Crescent moon
  const moonCx = w / 2, moonCy = h * 0.3, moonR = 60;
  const moonDist = Math.sqrt((x - moonCx) ** 2 + (y - moonCy) ** 2);
  const shadowCx = moonCx + 18, shadowCy = moonCy - 12, shadowR = 52;
  const shadowDist = Math.sqrt((x - shadowCx) ** 2 + (y - shadowCy) ** 2);
  if (moonDist <= moonR && shadowDist > shadowR) {
    const edge = Math.max(0, 1 - Math.abs(moonDist - moonR + 2) / 3);
    bg = blend(bg, [201, 169, 110], 0.85 + edge * 0.15);
  }

  // Gold border (3px)
  const bw = 3;
  const margin = 30;
  if (
    (x >= margin && x < margin + bw && y >= margin && y < h - margin) ||
    (x >= w - margin - bw && x < w - margin && y >= margin && y < h - margin) ||
    (y >= margin && y < margin + bw && x >= margin && x < w - margin) ||
    (y >= h - margin - bw && y < h - margin && x >= margin && x < w - margin)
  ) {
    bg = blend(bg, [201, 169, 110], 0.7);
  }

  // Horizontal gold line under title area
  if (y >= 430 && y <= 432 && x >= 300 && x <= 900) {
    bg = blend(bg, [201, 169, 110], 0.3);
  }

  return bg;
});

const outPath = path.join(__dirname, '..', 'og-image.png');
fs.writeFileSync(outPath, png);
console.log('OG image generated:', outPath, '(' + png.length + ' bytes)');
