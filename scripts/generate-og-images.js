const sharp = require('sharp');
const opentype = require('opentype.js');
const path = require('path');
const fs = require('fs');

const W = 1200, H = 630;
const FONT_BOLD = path.join(__dirname, 'fonts', 'NotoSansKR-Bold.otf');
const FONT_REG = path.join(__dirname, 'fonts', 'NotoSansKR-Regular.otf');
const OUT = path.join(__dirname, '..');

const fontBold = opentype.loadSync(FONT_BOLD);
const fontReg = opentype.loadSync(FONT_REG);

const pages = [
  { file: 'og-image.png', title: '일산명월관요정', sub: '문 열고 들어서면, 시간이 멈춘다', contact: '신실장 010-3695-4929' },
  { file: 'tradition/og-image.png', title: '15가지 한정식', sub: '하나하나의 이야기', contact: '일산명월관요정' },
  { file: 'music/og-image.png', title: '국악 라이브의 감동', sub: '가야금 소리에 숨이 멎다', contact: '일산명월관요정' },
  { file: 'rooms/og-image.png', title: '프라이빗 룸 30개', sub: '방마다 다른 분위기', contact: '일산명월관요정' },
  { file: 'atmosphere/og-image.png', title: '분위기 갤러리', sub: '사진으로 담을 수 없는 공간', contact: '일산명월관요정' },
  { file: 'review/og-image.png', title: '방문 후기', sub: '직접 다녀온 사람들의 솔직한 말', contact: '일산명월관요정' },
  { file: 'faq/og-image.png', title: '자주 묻는 질문', sub: '가기 전에 궁금했던 것들', contact: '일산명월관요정' },
  { file: 'contact/og-image.png', title: '신실장에게 바로 연결', sub: '전화 한 통이면 예약 끝', contact: '010-3695-4929' }
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
  const titlePath = textToPath(fontBold, page.title, 54, 600, 360, '#C9A96E');
  const subPath = textToPath(fontReg, page.sub, 26, 600, 430, '#E8D5B7');
  const contactPath = textToPath(fontReg, page.contact, 20, 600, 520, 'rgba(232,213,183,0.55)');

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8B0000"/>
      <stop offset="100%" stop-color="#4a0000"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="45%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#C9A96E" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <circle cx="600" cy="180" r="55" fill="#C9A96E" opacity="0.85"/>
  <circle cx="618" cy="168" r="47" fill="#6a0000"/>
  <rect x="28" y="28" width="${W-56}" height="${H-56}" rx="4" fill="none" stroke="#C9A96E" stroke-width="2" opacity="0.6"/>
  ${titlePath}
  ${subPath}
  <line x1="420" y1="470" x2="780" y2="470" stroke="#C9A96E" stroke-width="1" opacity="0.3"/>
  ${contactPath}
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
  console.log('Generating OG images with Noto Sans KR...');
  for (const page of pages) {
    await generateOG(page);
  }
  console.log(`Done! ${pages.length} images generated.`);
}

main().catch(e => { console.error(e); process.exit(1); });
