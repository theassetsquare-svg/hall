const sharp = require('sharp');
const opentype = require('opentype.js');
const path = require('path');
const fs = require('fs');

const W = 1200, H = 1200;
const FONT_BOLD = path.join(__dirname, 'fonts', 'NotoSansKR-Bold.otf');
const OUT = path.join(__dirname, '..');

const fontBold = opentype.loadSync(FONT_BOLD);

// 8 pages — each with a completely unique color theme
const pages = [
  {
    file: 'og-image.png',
    footerText: '일산 최고의 전통 요정 문화 체험',
    bg1: '#6B0000', bg2: '#3D0000', bg3: '#1A0000',
    headerBand: '#8B0000',
    jeogori: '#A0002A', skirt: '#C41E3A', skirtDark: '#7A0020',
    skin: '#F5DEB3',
  },
  {
    file: 'tradition/og-image.png',
    footerText: '15가지 한정식 전통 코스 요리',
    bg1: '#0D1B35', bg2: '#071224', bg3: '#030A14',
    headerBand: '#0D1B35',
    jeogori: '#1B4A8A', skirt: '#006B7A', skirtDark: '#004A58',
    skin: '#FAEBD7',
  },
  {
    file: 'music/og-image.png',
    footerText: '가야금·해금 국악 라이브 공연',
    bg1: '#3D2010', bg2: '#251308', bg3: '#120A03',
    headerBand: '#3D2010',
    jeogori: '#6B3A17', skirt: '#C8860A', skirtDark: '#8B5E07',
    skin: '#F5E6C8',
  },
  {
    file: 'rooms/og-image.png',
    footerText: '프라이빗 룸 30개 완전 독립 공간',
    bg1: '#111111', bg2: '#0A0A0A', bg3: '#050505',
    headerBand: '#111111',
    jeogori: '#2A2A2A', skirt: '#6B2737', skirtDark: '#4A1A27',
    skin: '#F5DEB3',
  },
  {
    file: 'atmosphere/og-image.png',
    footerText: '사진에 담기지 않는 황홀한 분위기',
    bg1: '#1A0035', bg2: '#100025', bg3: '#080012',
    headerBand: '#1A0035',
    jeogori: '#4A0080', skirt: '#7B2FBE', skirtDark: '#5A1E8A',
    skin: '#FAE0D5',
  },
  {
    file: 'review/og-image.png',
    footerText: '실제 방문객 솔직 후기 모음',
    bg1: '#0A0A0A', bg2: '#050505', bg3: '#020202',
    headerBand: '#0A0A0A',
    jeogori: '#222222', skirt: '#8B6914', skirtDark: '#5A4510',
    skin: '#F5DEB3',
  },
  {
    file: 'faq/og-image.png',
    footerText: '방문 전 궁금한 모든 것 해결',
    bg1: '#001A1F', bg2: '#000F14', bg3: '#000709',
    headerBand: '#001A1F',
    jeogori: '#004D5C', skirt: '#008B8B', skirtDark: '#006060',
    skin: '#FAEBD7',
  },
  {
    file: 'contact/og-image.png',
    footerText: '예약 문의 010-3695-4929',
    bg1: '#0A1A0A', bg2: '#060F06', bg3: '#030803',
    headerBand: '#0A1A0A',
    jeogori: '#1A4A1A', skirt: '#2D7A2D', skirtDark: '#1E5A1E',
    skin: '#F5E6C8',
  },
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

function buildHanbok(p) {
  const sk = p.skin;
  const je = p.jeogori;
  const s = p.skirt;
  const sd = p.skirtDark;

  return `
    <!-- Skirt (치마) — drawn first, behind body -->
    <path d="M475,515 Q385,572 268,758 Q192,888 212,1098 L988,1098 Q1008,888 932,758 Q815,572 725,515 Z" fill="${s}"/>
    <!-- Skirt fold lines -->
    <path d="M600,515 L574,802 L544,1098" stroke="${sd}" stroke-width="2" fill="none" opacity="0.28"/>
    <path d="M600,515 L624,802 L650,1098" stroke="${sd}" stroke-width="2" fill="none" opacity="0.28"/>
    <path d="M600,515 L492,752 L430,1098" stroke="${sd}" stroke-width="1.5" fill="none" opacity="0.2"/>
    <path d="M600,515 L716,752 L784,1098" stroke="${sd}" stroke-width="1.5" fill="none" opacity="0.2"/>
    <!-- Skirt hem decorative line -->
    <path d="M220,1088 Q600,1068 980,1088" stroke="#C9A96E" stroke-width="2" fill="none" opacity="0.45"/>

    <!-- 꽃신 (flower shoes) -->
    <ellipse cx="528" cy="1100" rx="60" ry="23" fill="${je}"/>
    <ellipse cx="672" cy="1100" rx="60" ry="23" fill="${je}"/>
    <!-- Shoe gold embroidery -->
    <circle cx="512" cy="1097" r="8" fill="#C9A96E" opacity="0.8"/>
    <circle cx="530" cy="1088" r="5" fill="#FFD700" opacity="0.65"/>
    <circle cx="656" cy="1097" r="8" fill="#C9A96E" opacity="0.8"/>
    <circle cx="670" cy="1088" r="5" fill="#FFD700" opacity="0.65"/>

    <!-- Left sleeve/arm -->
    <path d="M476,390 Q446,444 450,488 Q456,515 484,526" stroke="${je}" stroke-width="42" stroke-linecap="round" fill="none"/>
    <!-- Right sleeve/arm -->
    <path d="M724,390 Q754,444 750,488 Q744,515 716,526" stroke="${je}" stroke-width="42" stroke-linecap="round" fill="none"/>
    <!-- Wrist skin showing -->
    <path d="M450,488 Q456,515 484,526" stroke="${sk}" stroke-width="26" stroke-linecap="round" fill="none"/>
    <path d="M750,488 Q744,515 716,526" stroke="${sk}" stroke-width="26" stroke-linecap="round" fill="none"/>

    <!-- Hands clasped at waist -->
    <ellipse cx="566" cy="538" rx="40" ry="22" fill="${sk}"/>
    <ellipse cx="634" cy="538" rx="40" ry="22" fill="${sk}"/>

    <!-- 저고리 (jacket body) -->
    <path d="M476,388 L494,536 L706,536 L724,388 Q702,345 658,332 L638,344 L600,382 L562,344 L542,332 Q498,345 476,388 Z" fill="${je}"/>

    <!-- 흰 동정 (white V-collar) -->
    <path d="M560,337 L600,398 L640,337 L634,346 L600,392 L566,346 Z" fill="#FFFFFF"/>

    <!-- 고름 (gold ribbon) -->
    <path d="M644,424 Q678,408 698,420 Q691,448 667,452 Q645,445 644,424 Z" fill="#C9A96E"/>
    <path d="M664,452 Q659,472 654,487" stroke="#C9A96E" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M673,452 Q679,468 685,480" stroke="#C9A96E" stroke-width="2.5" fill="none" stroke-linecap="round"/>

    <!-- Neck -->
    <rect x="572" y="325" width="56" height="56" rx="13" fill="${sk}"/>

    <!-- Face -->
    <ellipse cx="600" cy="240" rx="84" ry="94" fill="${sk}"/>

    <!-- Eyebrows -->
    <path d="M553,208 Q573,200 590,205" stroke="#3A2010" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M610,205 Q627,200 647,208" stroke="#3A2010" stroke-width="4" fill="none" stroke-linecap="round"/>

    <!-- Eyes white -->
    <ellipse cx="568" cy="224" rx="16" ry="10" fill="#FFFFFF"/>
    <ellipse cx="632" cy="224" rx="16" ry="10" fill="#FFFFFF"/>
    <!-- Iris -->
    <circle cx="570" cy="225" r="8" fill="#2A1408"/>
    <circle cx="634" cy="225" r="8" fill="#2A1408"/>
    <!-- Eye highlight -->
    <circle cx="573" cy="222" r="3" fill="#FFFFFF"/>
    <circle cx="637" cy="222" r="3" fill="#FFFFFF"/>
    <!-- Upper eyelid line -->
    <path d="M552,219 Q568,213 584,219" stroke="#1A0A00" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M616,219 Q632,213 648,219" stroke="#1A0A00" stroke-width="2" fill="none" stroke-linecap="round"/>

    <!-- Nose -->
    <path d="M594,252 Q600,263 606,252" stroke="#C4956A" stroke-width="2" fill="none" stroke-linecap="round"/>

    <!-- Lips -->
    <path d="M576,275 Q600,287 624,275 Q618,282 600,284 Q582,282 576,275 Z" fill="#D96070"/>
    <path d="M576,275 Q600,268 624,275" stroke="#C05060" stroke-width="1.5" fill="none"/>

    <!-- Side hair flowing to bun -->
    <path d="M517,220 Q512,262 528,302 Q543,326 572,336" fill="#1A1A1A"/>
    <path d="M683,220 Q688,262 672,302 Q657,326 628,336" fill="#1A1A1A"/>

    <!-- 쪽머리 (hair bun) -->
    <ellipse cx="600" cy="147" rx="80" ry="45" fill="#1A1A1A"/>
    <ellipse cx="600" cy="150" rx="62" ry="32" fill="#242424"/>
    <!-- Hair sweeping up to bun -->
    <path d="M518,210 Q507,165 537,143 Q566,127 600,134" fill="#1A1A1A"/>
    <path d="M682,210 Q693,165 663,143 Q634,127 600,134" fill="#1A1A1A"/>

    <!-- 비녀 (hair pin) -->
    <line x1="534" y1="149" x2="666" y2="149" stroke="#C9A96E" stroke-width="5.5"/>
    <circle cx="666" cy="149" r="9" fill="#C9A96E"/>
    <circle cx="661" cy="149" r="5" fill="#FFD700"/>
    <circle cx="538" cy="149" r="6" fill="#C9A96E"/>

    <!-- 꽃 머리장식 center flower -->
    <g transform="translate(600,108)">
      <circle cx="0" cy="-14" r="9" fill="#FF8FA3"/>
      <circle cx="13" cy="-7" r="9" fill="#FF8FA3"/>
      <circle cx="8" cy="9" r="9" fill="#FF8FA3"/>
      <circle cx="-8" cy="9" r="9" fill="#FF8FA3"/>
      <circle cx="-13" cy="-7" r="9" fill="#FF8FA3"/>
      <circle cx="0" cy="0" r="7" fill="#FFD700"/>
    </g>
    <!-- Left flower -->
    <g transform="translate(538,126)">
      <circle cx="0" cy="-9" r="7" fill="#FF6B8A"/>
      <circle cx="8" cy="-4" r="7" fill="#FF6B8A"/>
      <circle cx="5" cy="6" r="7" fill="#FF6B8A"/>
      <circle cx="-5" cy="6" r="7" fill="#FF6B8A"/>
      <circle cx="-8" cy="-4" r="7" fill="#FF6B8A"/>
      <circle cx="0" cy="0" r="5" fill="#FFD700"/>
    </g>
    <!-- Right flower -->
    <g transform="translate(662,126)">
      <circle cx="0" cy="-9" r="7" fill="#FFAABF"/>
      <circle cx="8" cy="-4" r="7" fill="#FFAABF"/>
      <circle cx="5" cy="6" r="7" fill="#FFAABF"/>
      <circle cx="-5" cy="6" r="7" fill="#FFAABF"/>
      <circle cx="-8" cy="-4" r="7" fill="#FFAABF"/>
      <circle cx="0" cy="0" r="5" fill="#FFD700"/>
    </g>
    <!-- Small hanging ornament from bun -->
    <line x1="600" y1="190" x2="600" y2="214" stroke="#C9A96E" stroke-width="2"/>
    <circle cx="600" cy="217" r="3.5" fill="#C9A96E"/>
  `;
}

async function generateOG(page) {
  // Title: "일산명월관" — gold gradient, 170px, centered at y=800
  const titlePath = textToPath(fontBold, '일산명월관', 170, 600, 800, 'url(#titleGold)');
  // Nick: "신실장" — white, 130px, centered at y=968
  const nickPath  = textToPath(fontBold, '신실장', 130, 600, 968, '#FFFFFF');
  // Footer text — small gold
  const footerPath = textToPath(fontBold, page.footerText, 26, 600, 1164, '#C9A96E');
  // Header label — small gold
  const headerPath = textToPath(fontBold, '일산명월관요정', 32, 600, 46, '#C9A96E');

  const hankokSvg = buildHanbok(page);

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${page.bg1}"/>
    <stop offset="60%" stop-color="${page.bg2}"/>
    <stop offset="100%" stop-color="${page.bg3}"/>
  </linearGradient>
  <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="#6B4E10"/>
    <stop offset="25%"  stop-color="#C9A96E"/>
    <stop offset="50%"  stop-color="#FFD700"/>
    <stop offset="75%"  stop-color="#C9A96E"/>
    <stop offset="100%" stop-color="#6B4E10"/>
  </linearGradient>
  <linearGradient id="titleGold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#FFD700"/>
    <stop offset="45%"  stop-color="#F0C040"/>
    <stop offset="100%" stop-color="#C9A96E"/>
  </linearGradient>
  <linearGradient id="hdrGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="${page.headerBand}" stop-opacity="0.97"/>
    <stop offset="100%" stop-color="${page.bg2}"        stop-opacity="0.97"/>
  </linearGradient>
  <linearGradient id="ftrGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="${page.bg2}"        stop-opacity="0.97"/>
    <stop offset="100%" stop-color="${page.headerBand}" stop-opacity="0.97"/>
  </linearGradient>
</defs>

<!-- Background -->
<rect width="${W}" height="${H}" fill="url(#bgGrad)"/>

<!-- Hanbok woman illustration -->
${hankokSvg}

<!-- TEXT OVERLAY — semi-transparent black panel on skirt -->
<rect x="72" y="652" width="1056" height="442" rx="10" fill="#000000" fill-opacity="0.82"/>
<!-- Overlay gold border -->
<rect x="72"  y="652" width="1056" height="3" fill="url(#goldLine)"/>
<rect x="72"  y="1091" width="1056" height="3" fill="url(#goldLine)"/>
<rect x="72"  y="652" width="3"    height="442" fill="url(#goldLine)"/>
<rect x="1125" y="652" width="3"   height="442" fill="url(#goldLine)"/>

<!-- "일산명월관" — gold gradient, very large -->
${titlePath}
<!-- "신실장" — white, very large -->
${nickPath}

<!-- Header band -->
<rect x="0" y="0" width="${W}" height="74" fill="url(#hdrGrad)"/>
<rect x="0" y="71" width="${W}" height="3" fill="url(#goldLine)"/>
${headerPath}

<!-- Footer band -->
<rect x="0" y="1130" width="${W}" height="70" fill="url(#ftrGrad)"/>
<rect x="0" y="1130" width="${W}" height="3" fill="url(#goldLine)"/>
${footerPath}

<!-- Corner gold frames -->
<path d="M18,18 L82,18" stroke="#C9A96E" stroke-width="4.5" fill="none" stroke-linecap="square"/>
<path d="M18,18 L18,82" stroke="#C9A96E" stroke-width="4.5" fill="none" stroke-linecap="square"/>
<path d="M1182,18 L1118,18" stroke="#C9A96E" stroke-width="4.5" fill="none" stroke-linecap="square"/>
<path d="M1182,18 L1182,82" stroke="#C9A96E" stroke-width="4.5" fill="none" stroke-linecap="square"/>
<path d="M18,1182 L82,1182" stroke="#C9A96E" stroke-width="4.5" fill="none" stroke-linecap="square"/>
<path d="M18,1182 L18,1118" stroke="#C9A96E" stroke-width="4.5" fill="none" stroke-linecap="square"/>
<path d="M1182,1182 L1118,1182" stroke="#C9A96E" stroke-width="4.5" fill="none" stroke-linecap="square"/>
<path d="M1182,1182 L1182,1118" stroke="#C9A96E" stroke-width="4.5" fill="none" stroke-linecap="square"/>
<!-- Corner dots -->
<circle cx="18"   cy="18"   r="4.5" fill="#C9A96E"/>
<circle cx="1182" cy="18"   r="4.5" fill="#C9A96E"/>
<circle cx="18"   cy="1182" r="4.5" fill="#C9A96E"/>
<circle cx="1182" cy="1182" r="4.5" fill="#C9A96E"/>

<!-- Traditional pattern inner border -->
<rect x="26" y="79" width="1148" height="1048" rx="3" fill="none" stroke="#C9A96E" stroke-width="1" opacity="0.25" stroke-dasharray="9,5"/>
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
  console.log('한복 여성 OG 이미지 생성 중 (8페이지)...');
  for (const page of pages) {
    await generateOG(page);
  }
  console.log(`\n완료! ${pages.length}개 이미지 생성됨.`);
}

main().catch(e => { console.error(e); process.exit(1); });
