// 전 페이지 한복 전신 사진 3장씩 삽입 (각 h2 섹션 앞)
// 기존 .hanbok-figure 블록은 전부 제거 후 재삽입 — 몇 번 돌려도 결과 동일
// alt/캡션은 24개 전부 고유 — 중복 시 구글 페널티
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIM = {
  'navy-floral': [800, 1200], 'parasol-green': [800, 1200], 'red-blue-duo': [800, 1067],
  'spring-blossom': [800, 1067], 'white-hanok': [800, 1067], 'red-palace': [800, 1067],
  'red-wall': [800, 1067], 'blossom-stand': [800, 1200], 'stone-walk': [800, 1200],
  'forest-path': [800, 1067], 'corridor-pair': [800, 1200], 'alley-duo': [800, 1200],
};

// [파일, [이미지, alt, 캡션] x3] — 페이지당 중복 없음, 12장을 2회씩 사용
const PLAN = [
  ['index.html', [
    ['navy-floral', '일산요정 명월관 앞에 남색 꽃자수 한복을 입고 선 여성 전신', '골목 안쪽 나무 대문 — 여기부터 다른 세계가 시작된다'],
    ['red-wall', '일산명월관 담장 길을 걷는 붉은 치마 한복 여성의 뒷모습 전신', '담장을 따라 걸으면 나무 향이 먼저 마중 나온다'],
    ['white-hanok', '일산요정 한옥 툇마루에 머리부터 발끝까지 연푸른 한복 차림', '마룻바닥이 발밑에서 울리는 30년 된 한옥'],
  ]],
  ['tradition/index.html', [
    ['blossom-stand', '일산명월관요정 한정식 전 매화 앞에 선 연분홍 한복 여성 전신', '봄이면 뜰의 매화부터 손님을 맞는다'],
    ['spring-blossom', '일산 한정식 상 받기 전 봄꽃 뜰에 서 있는 분홍 치마 차림', '열다섯 가지 코스, 한 접시씩 천천히 나온다'],
    ['parasol-green', '일산요정 전통 밥상 손님맞이, 연두 저고리 한복 여성 머리부터 신발까지', '상을 물리고 나면 식혜 한 그릇이 마무리'],
  ]],
  ['music/index.html', [
    ['forest-path', '일산명월관 국악 가락처럼 숲길을 걷는 한복 두 사람 전신', '가락은 걸음처럼 천천히 시작된다'],
    ['corridor-pair', '일산요정 가야금 소리 울리는 회랑을 지나는 한복 여성 온몸', '기둥 사이로 소리가 길게 남는다'],
    ['red-blue-duo', '일산명월관요정 연주가 끝난 뒤 나서는 전통 한복 차림 전신', '아리랑이 끝나면 한동안 아무도 말이 없다'],
  ]],
  ['rooms/index.html', [
    ['stone-walk', '일산요정 룸으로 향하는 돌마당, 분홍 한복 여성 발끝까지', '방 번호 대신 이름이 붙은 서른 개의 문'],
    ['red-palace', '일산명월관 프라이빗 룸 앞에 홀로 선 붉은 한복 전신', '문을 닫으면 그 안은 온전히 우리만의 공간'],
    ['alley-duo', '일산 요정 골목을 나란히 걷는 한복 두 사람의 전신 뒷모습', '복도에서 마주쳐도 서로를 모른 척하는 배려'],
  ]],
  ['atmosphere/index.html', [
    ['white-hanok', '일산명월관요정 처마 아래 고요한 정취와 연푸른 한복 온몸', '사진에 안 담기는 건 결국 공기다'],
    ['blossom-stand', '봄밤 일산요정 뜰, 매화 사이에 선 연분홍 한복 여성 전체 모습', '계절마다 뜰의 얼굴이 바뀐다'],
    ['corridor-pair', '일산명월관 기둥 회랑에 번지는 빛과 한복 차림 여성 전신', '기둥 사이로 스며드는 저녁 빛'],
  ]],
  ['review/index.html', [
    ['red-blue-duo', '일산요정 후기에 자주 오르는 전통 한복 두 사람 전신 모습', '다녀온 사람들이 가장 많이 말하는 장면'],
    ['alley-duo', '일산명월관 다녀온 뒤 기억에 남은 골목길 한복 뒷모습 전체', '접대 자리가 끝나고도 대화가 이어졌다'],
    ['navy-floral', '방문 후기 속 일산 요정, 남색 치마 한복 여성 머리부터 발까지', '동창 모임에도 이만한 자리가 없다는 말'],
  ]],
  ['faq/index.html', [
    ['parasol-green', '일산명월관요정 자주 묻는 질문, 색동 저고리 한복 전신 차림', '가기 전 궁금한 건 미리 물어보는 게 편하다'],
    ['stone-walk', '일산요정 방문 전 알아둘 점과 돌마당 걷는 한복 여성 온몸', '드레스코드는 따로 없다, 편하게 오면 된다'],
    ['red-wall', '일산 요정 예절 안내, 담장 앞 붉은 한복 여성의 전체 뒷모습', '단체는 인원이 정해지면 바로 연락하는 편이 좋다'],
  ]],
  ['contact/index.html', [
    ['red-palace', '일산명월관 예약 문의 전 둘러본 한옥과 붉은 한복 전신', '전화 한 통이면 자리 잡는 일은 끝난다'],
    ['forest-path', '일산요정 예약 손님을 맞는 숲길 한복 두 사람 머리부터 발끝', '무대 일정은 예약할 때 함께 확인하면 된다'],
    ['spring-blossom', '일산명월관요정 예약 후 마주할 봄 뜰과 한복 여성 전신 모습', '평일 저녁이 여유 있고 소리도 더 가깝다'],
  ]],
];

let total = 0;
const seenAlt = new Set();
const seenCap = new Set();
for (const [file, items] of PLAN) {
  const p = path.join(ROOT, file);
  let html = fs.readFileSync(p, 'utf8');

  // 기존 한복 figure 블록 제거 (재실행 안전)
  html = html.replace(/[ \t]*<figure class="hanbok-figure">[\s\S]*?<\/figure>\n\n?/g, '');

  const lines = html.split('\n');
  const h2idx = [];
  lines.forEach((l, i) => { if (/^\s*<h2[\s>]/.test(l)) h2idx.push(i); });
  if (h2idx.length < items.length) throw new Error(file + ': h2 ' + h2idx.length + '개뿐');

  // 뒤에서부터 삽입해야 인덱스가 밀리지 않음
  for (let k = items.length - 1; k >= 0; k--) {
    const [name, alt, caption] = items[k];
    if (seenAlt.has(alt)) throw new Error('중복 alt: ' + alt);
    if (seenCap.has(caption)) throw new Error('중복 캡션: ' + caption);
    seenAlt.add(alt); seenCap.add(caption);
    if (!DIM[name]) throw new Error('치수 미등록: ' + name);
    const [w, h] = DIM[name];
    const indent = (lines[h2idx[k]].match(/^\s*/) || [''])[0];
    // 각 페이지 첫 장은 LCP 대상 → eager, 나머지는 lazy
    const load = k === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
    const block = [
      indent + '<figure class="hanbok-figure">',
      indent + '  <img src="/images/hanbok/ilsan-hanbok-' + name + '.webp" alt="' + alt + '" width="' + w + '" height="' + h + '" ' + load + ' decoding="async">',
      indent + '  <figcaption>' + caption + '</figcaption>',
      indent + '</figure>',
      '',
    ].join('\n');
    lines.splice(h2idx[k], 0, block);
    total++;
  }
  fs.writeFileSync(p, lines.join('\n'));
  console.log('OK', file.padEnd(24), items.length + '장');
}
console.log('총', total, '장 / 고유 alt', seenAlt.size, '개 / 고유 캡션', seenCap.size, '개');
