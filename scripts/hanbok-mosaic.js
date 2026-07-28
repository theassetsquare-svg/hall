// 한복 전신 사진 최적화 + 얼굴 모자이크 처리
// 요구사항: 머리부터 발끝까지 몸 전체가 나오는 컷만 사용 (상반신 컷 금지)
// 실행: node scripts/hanbok-mosaic.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '_dl');
const OUT = path.join(__dirname, '..', 'images', 'hanbok');
fs.mkdirSync(OUT, { recursive: true });

// id: [이름, 출력폭, webp품질]
const IMG = {
  24866596: ['navy-floral', 800, 62],
  7124117: ['parasol-green', 800, 62],
  19613764: ['red-blue-duo', 800, 62],
  31603017: ['spring-blossom', 800, 44],
  14938770: ['white-hanok', 800, 42],
  35877199: ['red-palace', 800, 62],
  35877202: ['red-wall', 800, 62],
  31560791: ['blossom-stand', 800, 40],
  31743303: ['stone-walk', 800, 62],
  36749203: ['forest-path', 800, 42],
  37821274: ['corridor-pair', 800, 58],
  19751380: ['alley-duo', 800, 58],
};

// 정규화 얼굴/머리 박스 — 원본에 5% 그리드를 씌워 직접 측정
// 정면·측면·뒤통수·배경인물 전부 포함
const BOX = {
  'navy-floral': [[0.41, 0.10, 0.62, 0.29], [0.09, 0.22, 0.39, 0.32]],
  'parasol-green': [[0.33, 0.10, 0.67, 0.41]],
  'red-blue-duo': [[0.21, 0.01, 0.45, 0.25], [0.44, 0, 0.67, 0.25]],
  'spring-blossom': [[0.48, 0.35, 0.64, 0.51]],
  'white-hanok': [[0.29, 0.42, 0.50, 0.61]],
  'red-palace': [[0.43, 0.51, 0.55, 0.64]],
  'red-wall': [[0.47, 0.52, 0.60, 0.64]],
  'blossom-stand': [[0.38, 0.41, 0.50, 0.51]],
  'stone-walk': [[0.42, 0.32, 0.55, 0.44], [0.74, 0.40, 1.0, 0.47]],
  'forest-path': [[0.49, 0.57, 0.74, 0.68]],
  'corridor-pair': [[0.33, 0.43, 0.57, 0.52]],
  'alley-duo': [[0.34, 0.32, 0.47, 0.43], [0.64, 0.33, 0.79, 0.43]],
};

// ★sharp 함정: 축소→확대 연속 resize는 마지막 것만 적용됨. toBuffer로 반드시 분리.
async function mosaic(base, L, T, w, h) {
  const b = Math.max(10, Math.round(w / 15));
  const bh = Math.max(10, Math.round((b * h) / w));
  const small = await sharp(base)
    .extract({ left: L, top: T, width: w, height: h })
    .resize(b, bh, { kernel: 'cubic' })
    .toBuffer();
  return sharp(small).resize(w, h, { kernel: 'nearest' }).png().toBuffer();
}

(async () => {
  const report = [];
  for (const [id, [name, width, q]] of Object.entries(IMG)) {
    const base = await sharp(path.join(SRC, id + '.jpg'))
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .toBuffer();
    const m = await sharp(base).metadata();
    const W = m.width;
    const H = m.height;
    const comps = [];
    for (const [x0, y0, x1, y1] of BOX[name] || []) {
      let L = Math.round(x0 * W);
      let T = Math.round(y0 * H);
      let w = Math.round((x1 - x0) * W);
      let h = Math.round((y1 - y0) * H);
      if (L < 0) L = 0;
      if (T < 0) T = 0;
      if (L + w > W) w = W - L;
      if (T + h > H) h = H - T;
      comps.push({ input: await mosaic(base, L, T, w, h), left: L, top: T });
    }
    const outPath = path.join(OUT, 'ilsan-hanbok-' + name + '.webp');
    fs.writeFileSync(
      outPath,
      await sharp(base).composite(comps).webp({ quality: q, effort: 6 }).toBuffer()
    );
    const size = fs.statSync(outPath).size;
    report.push({ name, w: W, h: H, kb: +(size / 1024).toFixed(1) });
    console.log(name.padEnd(15), W + 'x' + H, (size / 1024).toFixed(1) + 'KB');
  }
  fs.writeFileSync(path.join(OUT, '_dimensions.json'), JSON.stringify(report, null, 2));
})();
