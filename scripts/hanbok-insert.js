// 전 페이지 한복 사진 3장씩 삽입 (각 h2 섹션 앞)
// alt/캡션은 24개 전부 고유 — 중복 시 구글 페널티
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIM = {
  'navy-elegant': [800, 1200], 'navy-floral': [800, 1200], 'parasol-green': [800, 1200],
  'performer-hat': [800, 1199], 'pink-back': [800, 1200], 'pink-braid': [800, 1200],
  'red-blue-duo': [800, 1067], 'red-palace': [800, 1067], 'smile-blossom': [800, 1200],
  'spring-blossom': [720, 960], 'white-hanok': [720, 960], 'fan-dance': [800, 560],
};

// [파일, [이미지, alt, 캡션] x3] — 이미지는 페이지당 중복 없음, 전체 12장을 2회씩 사용
const PLAN = [
  ['index.html', [
    ['navy-elegant', '일산요정 명월관 대문 앞에 남색 치마 한복을 갖춰 입고 선 여성', '골목 안쪽 나무 대문 — 여기부터 다른 세계가 시작된다'],
    ['red-blue-duo', '일산명월관 마당에서 주황빛과 남색 전통 한복을 맞춰 입은 여성 두 사람', '함께 온 사람이 편해야 좋은 자리가 된다'],
    ['white-hanok', '일산요정 한옥 툇마루를 따라 걷는 하늘색 치마 한복 차림 여성', '마룻바닥이 발밑에서 울리는 30년 된 한옥'],
  ]],
  ['tradition/index.html', [
    ['spring-blossom', '일산명월관요정 한정식 상 받기 전 매화나무 아래 선 분홍 한복 여성', '봄이면 뜰의 매화부터 손님을 맞는다'],
    ['navy-floral', '일산 한정식 코스를 기다리며 꽃자수 남색 한복을 입은 여성', '열다섯 가지 코스, 한 접시씩 천천히 나온다'],
    ['parasol-green', '일산요정 전통 한정식 손님맞이에 나선 연두 저고리 한복 여성', '상을 물리고 나면 식혜 한 그릇이 마무리'],
  ]],
  ['music/index.html', [
    ['fan-dance', '일산명월관 국악 무대에서 붉은 치맛자락을 휘날리는 한복 군무 장면', '치맛자락이 도는 순간 방 공기가 바뀐다'],
    ['performer-hat', '일산요정 국악 공연 중 채상모를 쓰고 춤추는 한복 차림 연희자', '가야금만이 아니다 — 연희 무대도 열린다'],
    ['smile-blossom', '가야금 소리를 들으며 미소 짓는 일산명월관요정 한복 여성', '아리랑이 시작되면 다들 잔을 내려놓는다'],
  ]],
  ['rooms/index.html', [
    ['pink-braid', '일산요정 룸으로 향하는 복도에서 분홍 치마 한복을 입은 여성 뒷모습', '방 번호 대신 이름이 붙은 서른 개의 문'],
    ['red-palace', '일산명월관 프라이빗 룸 문 앞에 홀로 선 붉은 한복 차림 여성', '문을 닫으면 그 안은 온전히 우리만의 공간'],
    ['pink-back', '자수 저고리를 갖춰 입고 일산 요정 안뜰을 지나는 한복 여성 뒤태', '복도에서 마주쳐도 서로를 모른 척하는 배려'],
  ]],
  ['atmosphere/index.html', [
    ['white-hanok', '일산명월관요정 처마 아래 고요한 정취와 연푸른 한복 차림 여성', '사진에 안 담기는 건 결국 공기다'],
    ['spring-blossom', '봄밤 일산요정 뜰에 핀 매화와 연분홍 한복을 입은 여성', '계절마다 뜰의 얼굴이 바뀐다'],
    ['navy-elegant', '일산명월관 회랑 기둥 사이에 서 있는 짙은 남색 한복 여성', '기둥 사이로 스며드는 저녁 빛'],
  ]],
  ['review/index.html', [
    ['smile-blossom', '일산요정 후기를 남긴 손님이 기억한 매화 배경 한복 여성', '다녀온 사람들이 가장 많이 말하는 장면'],
    ['pink-back', '일산명월관 다녀온 뒤 오래 남았다는 분홍 치마 한복 여성', '접대 자리가 끝나고도 대화가 이어졌다'],
    ['red-blue-duo', '방문 후기 속 일산 요정에서 전통 한복을 갖춰 입은 여성들', '동창 모임에도 이만한 자리가 없다는 말'],
  ]],
  ['faq/index.html', [
    ['navy-floral', '일산명월관요정 자주 묻는 질문 안내와 남색 꽃무늬 한복 여성', '가기 전 궁금한 건 미리 물어보는 게 편하다'],
    ['parasol-green', '일산요정 방문 전 궁금증을 풀어주는 색동 저고리 한복 차림 여성', '드레스코드는 따로 없다, 편하게 오면 된다'],
    ['pink-braid', '일산 요정 방문 예절 안내, 댕기 머리에 분홍 한복을 입은 여성', '단체는 인원이 정해지면 바로 연락하는 편이 좋다'],
  ]],
  ['contact/index.html', [
    ['red-palace', '일산명월관 예약 문의 전 둘러본 한옥 처마와 붉은 한복 여성', '전화 한 통이면 자리 잡는 일은 끝난다'],
    ['fan-dance', '일산요정 예약 손님을 맞이하는 전통 무용 한복 치맛자락', '무대 일정은 예약할 때 함께 확인하면 된다'],
    ['performer-hat', '일산명월관요정 예약 시 볼 수 있는 국악 연희자의 한복 무대', '평일 저녁이 여유 있고 소리도 더 가깝다'],
  ]],
];

let total = 0;
const seenAlt = new Set();
for (const [file, items] of PLAN) {
  const p = path.join(ROOT, file);
  let html = fs.readFileSync(p, 'utf8');
  if (html.includes('hanbok-figure')) {
    console.log('SKIP (already inserted):', file);
    continue;
  }
  const lines = html.split('\n');
  const h2idx = [];
  lines.forEach((l, i) => { if (/^\s*<h2[\s>]/.test(l)) h2idx.push(i); });
  if (h2idx.length < items.length) throw new Error(file + ': h2 ' + h2idx.length + '개뿐');

  // 뒤에서부터 삽입해야 인덱스가 밀리지 않음
  for (let k = items.length - 1; k >= 0; k--) {
    const [name, alt, caption] = items[k];
    if (seenAlt.has(alt)) throw new Error('중복 alt: ' + alt);
    seenAlt.add(alt);
    const [w, h] = DIM[name];
    const indent = (lines[h2idx[k]].match(/^\s*/) || [''])[0];
    const block = [
      indent + '<figure class="hanbok-figure">',
      indent + '  <img src="/images/hanbok/ilsan-hanbok-' + name + '.webp" alt="' + alt + '" width="' + w + '" height="' + h + '" loading="lazy" decoding="async">',
      indent + '  <figcaption>' + caption + '</figcaption>',
      indent + '</figure>',
      '',
    ].join('\n');
    lines.splice(h2idx[k], 0, block);
    total++;
  }
  fs.writeFileSync(p, lines.join('\n'));
  console.log('OK', file, items.length + '장');
}
console.log('총', total, '장 삽입 / 고유 alt', seenAlt.size, '개');
