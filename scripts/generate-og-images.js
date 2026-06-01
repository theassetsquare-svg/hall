const sharp = require('sharp');
const opentype = require('opentype.js');
const path = require('path');
const fs = require('fs');

const W = 1200, H = 1200;
const FONT_BOLD = path.join(__dirname, 'fonts', 'NotoSansKR-Bold.otf');
const FONT_REG = path.join(__dirname, 'fonts', 'NotoSansKR-Regular.otf');
const OUT = path.join(__dirname, '..');

const fontBold = opentype.loadSync(FONT_BOLD);
const fontReg = opentype.loadSync(FONT_REG);

const pages = [
  { file: 'og-image.png', title: '일산명월관요정', sub: '문 열고 들어서면, 시간이 멈춘다' },
  { file: 'tradition/og-image.png', title: '일산명월관요정', sub: '15가지 한정식의 비밀' },
  { file: 'music/og-image.png', title: '일산명월관요정', sub: '가야금 소리에 숨이 멎다' },
  { file: 'rooms/og-image.png', title: '일산명월관요정', sub: '프라이빗 룸 30개' },
  { file: 'atmosphere/og-image.png', title: '일산명월관요정', sub: '사진에 안 담기는 공간' },
  { file: 'review/og-image.png', title: '일산명월관요정', sub: '다녀온 사람들의 솔직한 말' },
  { file: 'faq/og-image.png', title: '일산명월관요정', sub: '가기 전에 궁금한 것 전부 답했다' },
  { file: 'contact/og-image.png', title: '일산명월관요정', sub: '전화 한 통이면 예약 끝' }
];

function textToPath(font, text, fontSize, cx, cy, fill) {
  const p = font.getPath(text, 0, 0, fontSize);
  const bb = p.getBoundingBox();
  const tw = bb.x2 - bb.x1;
  const th = bb.y2 - bb.y1;
  const ox = cx - tw / 2 - bb.x1;
  const oy = cy + th / 2 - bb.y2;
  const moved = font.getPath(text, ox, oy, fontSize);
  return `<path d="${moved.toPathData(2)}" fill="${fill}"/>`;
}

async function generateOG(page) {
  /* 신실장 — 가장 크게 (160px) */
  const nickPath = textToPath(fontBold, '신실장', 160, 600, 420, '#FFFFFF');

  /* 일산명월관요정 — 상단 (42px) */
  const titlePath = textToPath(fontBold, page.title, 42, 600, 200, '#C9A96E');

  /* 서브타이틀 (28px) */
  const subPath = textToPath(fontReg, page.sub, 28, 600, 680, '#E8D5B7');

  /* 전화번호 (24px) */
  const telPath = textToPath(fontReg, '010-3695-4929', 24, 600, 780, 'rgba(232,213,183,0.7)');

  /* 밤의 달 아이콘 */
  const moonSvg = `
    <circle cx="600" cy="100" r="40" fill="#C9A96E" opacity="0.25"/>
    <circle cx="615" cy="90" r="33" fill="#6a0000"/>
  `;

  /* 구분선 */
  const divider = `<line x1="350" y1="730" x2="850" y2="730" stroke="#C9A96E" stroke-width="1" opacity="0.35"/>`;

  /* 놀쿨 브랜딩 */
  const brandPath = textToPath(fontReg, '놀쿨에서 확인', 18, 600, 850, 'rgba(232,213,183,0.4)');

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#8B0000"/>
      <stop offset="50%" stop-color="#5a0000"/>
      <stop offset="100%" stop-color="#3a0000"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="50%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#C9A96E" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="nickGlow" cx="50%" cy="38%" r="30%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#nickGlow)"/>
  ${moonSvg}
  <rect x="32" y="32" width="${W-64}" height="${H-64}" rx="6" fill="none" stroke="#C9A96E" stroke-width="2" opacity="0.5"/>
  <line x1="350" y1="260" x2="850" y2="260" stroke="#C9A96E" stroke-width="1" opacity="0.3"/>
  ${titlePath}
  ${nickPath}
  <line x1="350" y1="560" x2="850" y2="560" stroke="#C9A96E" stroke-width="1" opacity="0.3"/>
  ${subPath}
  ${divider}
  ${telPath}
  ${brandPath}
</svg>`;

  const outPath = path.join(OUT, page.file);
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await sharp(Buffer.from(svg))
    .resize(W, H)
    .png({ compressionLevel: 6 })
    .toFile(outPath);

  const stats = fs.statSync(outPath);
  console.log(`  ✓ ${page.file} (${Math.round(stats.size / 1024)}KB)`);
}

async function main() {
  console.log('Generating 1:1 OG images — 신실장 BIG...');
  for (const page of pages) {
    await generateOG(page);
  }
  console.log(`Done! ${pages.length} images generated.`);
}

main().catch(e => { console.error(e); process.exit(1); });
