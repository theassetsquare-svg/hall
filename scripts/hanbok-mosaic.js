// 한복 이미지 최적화 + 얼굴 모자이크 처리
// 실행: node scripts/hanbok-mosaic.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '_dl');
const OUT = path.join(__dirname, '..', 'images', 'hanbok');
fs.mkdirSync(OUT, { recursive: true });

const IMG = {
  20667636: ['navy-elegant', 800, 62],
  31603017: ['spring-blossom', 720, 48],
  37114778: ['smile-blossom', 800, 62],
  14938770: ['white-hanok', 720, 48],
  19613764: ['red-blue-duo', 800, 62],
  24866596: ['navy-floral', 800, 62],
  35877199: ['red-palace', 800, 62],
  20664608: ['pink-braid', 800, 62],
  15039991: ['performer-hat', 800, 62],
  38519776: ['fan-dance', 800, 62],
  7124117: ['parasol-green', 800, 62],
  28900592: ['pink-back', 800, 62],
};

// 정규화 얼굴/머리 박스 — 그리드 오버레이로 좌표 직접 측정 (정면·측면·뒤통수·배경인물 전부 포함)
const BOX = {
  'navy-elegant': [[0.35, 0.06, 0.66, 0.31], [0.38, 0.27, 0.62, 0.37]],
  'navy-floral': [[0.41, 0.10, 0.62, 0.29], [0.09, 0.22, 0.39, 0.32]],
  'parasol-green': [[0.33, 0.10, 0.67, 0.41]],
  'performer-hat': [[0.37, 0.36, 0.69, 0.64], [0.42, 0.60, 0.66, 0.70]],
  'pink-back': [[0.35, 0, 0.67, 0.29], [0.81, 0.12, 1.0, 0.33], [0.21, 0.17, 0.35, 0.30]],
  'pink-braid': [[0.22, 0.21, 0.52, 0.48]],
  'red-blue-duo': [[0.21, 0.01, 0.45, 0.25], [0.44, 0, 0.67, 0.25]],
  'red-palace': [[0.43, 0.51, 0.55, 0.64]],
  'smile-blossom': [[0.35, 0.03, 0.76, 0.42]],
  'spring-blossom': [[0.48, 0.35, 0.64, 0.51]],
  'white-hanok': [[0.29, 0.42, 0.50, 0.61]],
};

// 얼굴이 화면 전체에 흩어져(관객 다수) 모자이크로 가릴 수 없는 컷은 크롭으로 처리.
// fan-dance: 상단 y<0.533 영역에 무용수·관객 얼굴이 밀집 → 잘라내고 치마 부분만 사용.
const CROP = { 'fan-dance': [0, 0.533, 1, 1] };

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
    let base = await sharp(path.join(SRC, id + '.jpg'))
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .toBuffer();
    if (CROP[name]) {
      const c = await sharp(base).metadata();
      const [cx0, cy0, cx1, cy1] = CROP[name];
      base = await sharp(base)
        .extract({
          left: Math.round(cx0 * c.width),
          top: Math.round(cy0 * c.height),
          width: Math.round((cx1 - cx0) * c.width),
          height: Math.round((cy1 - cy0) * c.height),
        })
        .toBuffer();
    }
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
    report.push({ name, dim: W + 'x' + H, kb: (size / 1024).toFixed(1) });
    console.log(name, W + 'x' + H, (size / 1024).toFixed(1) + 'KB');
  }
  fs.writeFileSync(path.join(OUT, '_dimensions.json'), JSON.stringify(report, null, 2));
})();
