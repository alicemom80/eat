// 단어 데이터: [그림 파일 이름, 영어, 한글, (읽을 소리: 영어와 다를 때만)]
// 출처: 앱/먹고입어요/기획서.md 3장 (테마와 단어), 5장 (테마별 게임 배정)
// games: [게임 id, 단계 1·2·3] 배정. mission: 놀이 끝에 보여 주는 화면 밖 미션.
// 주제 하나에 단어 5의 배수를 넣는 것이 원칙이다. 지금은 주제 6개 × 20개 = 120개 (묶음 4개씩, 묶음마다 5개).
window.A = window.A || {};

// 모든 주제가 같은 게임 8개를 같은 순서로 쓴다 (카드는 맨 위, 묻고 답하기는 맨 아래 가로 한 줄)
const ALL_GAMES = [
  ['card', 1], ['pick', 1], ['balloon', 1], ['match', 1],
  ['ox', 2], ['scratch', 2], ['maze', 3], ['qa', 3],
];

// 복수형 단어: "These are ..." 로 말한다 (기획서 4-4장)
const PLURAL_IDS = new Set([
  'grapes', 'chopsticks', 'beans', 'jeans', 'shorts', 'socks', 'sneakers',
  'boots', 'clothes', 'glasses', 'gloves', 'balletshoes', 'cherries',
]);

// 관사(a/an)를 붙이지 않는 단어: 색깔("This is red.")과 셀 수 없는 말("This is milk.")
const COLOR_IDS = new Set([
  'redcircle', 'orangecircle', 'yellowcircle', 'greencircle', 'bluecircle',
  'purplecircle', 'pinkcircle', 'browncircle', 'blackcircle', 'whitecircle',
]);
const NO_ART_IDS = new Set([
  ...COLOR_IDS,
  'broccoli', 'corn', 'garlic', 'ginger', 'salad', 'lettuce',             // 채소
  'chocolate', 'popcorn', 'honey', 'cheese', 'bread', 'icecream', 'shavedice',   // 간식
  'rice', 'soup', 'bacon', 'curryrice', 'spaghetti', 'milk', 'juice', 'tea', 'hotdrink', 'sushi',  // 식사·음료
]);

const FOOD_MISSION = '오늘 먹은 음식 하나를 영어로 말해 보기';
const CLOTHES_MISSION = '오늘 입은 옷 이름을 영어로 말해 보기';

A.THEMES = [
  { id: 'fruit', ko: '과일', en: 'Fruits', icon: '🍎', cover: 'strawberry', color: '#ffd1d1',
    games: ALL_GAMES,
    mission: FOOD_MISSION,
    words: [
      ['apple', 'apple', '사과'], ['banana', 'banana', '바나나'], ['tangerine', 'tangerine', '귤'], ['grapes', 'grapes', '포도'], ['strawberry', 'strawberry', '딸기'],
      ['watermelon', 'watermelon', '수박'], ['pineapple', 'pineapple', '파인애플'], ['lemon', 'lemon', '레몬'], ['cherries', 'cherries', '체리'], ['peach', 'peach', '복숭아'],
      ['pear', 'pear', '배'], ['kiwi', 'kiwi', '키위'], ['mango', 'mango', '망고'], ['coconut', 'coconut', '코코넛'], ['avocado', 'avocado', '아보카도'],
      ['tomato', 'tomato', '토마토'], ['olive', 'olive', '올리브'], ['chestnut', 'chestnut', '밤'],
      ['melon', 'melon', '멜론'], ['blueberry', 'blueberry', '블루베리'],
    ] },
  { id: 'veg', ko: '채소', en: 'Vegetables', icon: '🥕', cover: 'carrot', color: '#c9ebc3',
    games: ALL_GAMES,
    mission: FOOD_MISSION,
    words: [
      ['carrot', 'carrot', '당근'], ['broccoli', 'broccoli', '브로콜리'], ['corn', 'corn', '옥수수'], ['eggplant', 'eggplant', '가지'], ['cucumber', 'cucumber', '오이'],
      ['potato', 'potato', '감자'], ['onion', 'onion', '양파'], ['mushroom', 'mushroom', '버섯'], ['pepper', 'pepper', '피망'], ['garlic', 'garlic', '마늘'],
      ['beans', 'beans', '콩'], ['sprout', 'sprout', '새싹'], ['ginger', 'ginger', '생강'], ['herb', 'herb', '허브'], ['salad', 'salad', '샐러드'],
      ['pumpkin', 'pumpkin', '호박'], ['radish', 'radish', '무'], ['napacabbage', 'cabbage', '배추'], ['sweetpotato', 'sweet potato', '고구마'],
      ['lettuce', 'lettuce', '상추'],
    ] },
  { id: 'snack', ko: '간식', en: 'Snacks', icon: '🍪', cover: 'cookie', color: '#ffe3a3',
    games: ALL_GAMES,
    mission: FOOD_MISSION,
    words: [
      ['candy', 'candy', '사탕'], ['lollipop', 'lollipop', '막대사탕'], ['cookie', 'cookie', '쿠키'], ['donut', 'donut', '도넛'], ['icecream', 'ice cream', '아이스크림'],
      ['chocolate', 'chocolate', '초콜릿'], ['popcorn', 'popcorn', '팝콘'], ['waffle', 'waffle', '와플'], ['cake', 'cake', '케이크'], ['honey', 'honey', '꿀'],
      ['pancake', 'pancake', '팬케이크'], ['croissant', 'croissant', '크루아상'], ['pie', 'pie', '파이'], ['fishcake', 'fish cake', '어묵'], ['shavedice', 'shaved ice', '빙수'],
      ['ricecracker', 'rice cracker', '쌀과자'], ['pretzel', 'pretzel', '프레첼'], ['bagel', 'bagel', '베이글'], ['cheese', 'cheese', '치즈'], ['bread', 'bread', '빵'],
    ] },
  { id: 'meal', ko: '식사·음료', en: 'Meals & Drinks', icon: '🍚', cover: 'pizza', color: '#ffd3b0',
    games: ALL_GAMES,
    mission: FOOD_MISSION,
    words: [
      ['rice', 'rice', '밥'], ['spoon', 'spoon', '숟가락'], ['chopsticks', 'chopsticks', '젓가락'], ['soup', 'soup', '국'], ['bacon', 'bacon', '베이컨'],
      ['curryrice', 'curry rice', '카레라이스'], ['spaghetti', 'spaghetti', '스파게티'], ['pizza', 'pizza', '피자'], ['hamburger', 'hamburger', '햄버거'], ['sandwich', 'sandwich', '샌드위치'],
      ['hotdog', 'hot dog', '핫도그'], ['sushi', 'sushi', '초밥'], ['dumpling', 'dumpling', '만두'], ['egg', 'egg', '달걀'], ['friedshrimp', 'shrimp', '새우튀김'],
      ['lunchbox', 'lunch box', '도시락'], ['milk', 'milk', '우유'], ['juice', 'juice', '주스'], ['hotdrink', 'hot drink', '따뜻한 음료'], ['tea', 'tea', '차'],
    ] },
  { id: 'wear', ko: '옷·신발', en: 'Clothes & Shoes', icon: '👕', cover: 'tshirt', color: '#c9dcff',
    games: ALL_GAMES,
    mission: CLOTHES_MISSION,
    words: [
      ['tshirt', 'shirt', '티셔츠'], ['jeans', 'jeans', '청바지'], ['dress', 'dress', '원피스'], ['shorts', 'shorts', '반바지'], ['socks', 'socks', '양말'],
      ['sneakers', 'sneakers', '운동화'], ['boots', 'boots', '부츠'], ['shoe', 'shoe', '구두'], ['sandal', 'sandal', '샌들'], ['cap', 'cap', '야구모자'],
      ['umbrella', 'umbrella', '우산'], ['clothes', 'clothes', '옷'], ['glasses', 'glasses', '안경'], ['gloves', 'gloves', '장갑'], ['scarf', 'scarf', '목도리'],
      ['backpack', 'backpack', '책가방'], ['coat', 'coat', '외투'], ['swimsuit', 'swimsuit', '수영복'], ['balletshoes', 'ballet shoes', '발레화'], ['bag', 'bag', '핸드백'],
    ] },
  { id: 'color', ko: '색깔·모양', en: 'Colors & Shapes', icon: '🎨', cover: 'star', color: '#e3d1ff',
    games: ALL_GAMES,
    mission: '오늘 입은 옷의 색깔을 영어로 말해 보기',
    words: [
      ['redcircle', 'red', '빨강'], ['orangecircle', 'orange', '주황'], ['yellowcircle', 'yellow', '노랑'], ['greencircle', 'green', '초록'], ['bluecircle', 'blue', '파랑'],
      ['purplecircle', 'purple', '보라'], ['pinkcircle', 'pink', '분홍'], ['browncircle', 'brown', '갈색'], ['blackcircle', 'black', '검정'], ['whitecircle', 'white', '흰색'],
      ['soccerball', 'circle', '동그라미'], ['blacksquare', 'square', '네모'], ['redtriangle', 'triangle', '세모'], ['star', 'star', '별'], ['redheart', 'heart', '하트'],
      ['bluediamond', 'diamond', '마름모'], ['crescentmoon', 'crescent', '초승달'], ['halfmoon', 'half moon', '반달'], ['oval', 'oval', '타원'], ['ringbuoy', 'ring', '고리'],
    ] },
];

// 5개씩 묶음으로 나누기 (맨 끝 묶음은 5개보다 적을 수 있음)
A.GROUP_SIZE = 5;
A.THEMES.forEach(t => {
  t.words = t.words.map(([id, en, ko, say]) => ({
    id, en, ko, say: say || en,
    art: NO_ART_IDS.has(id) ? '' : (/^[aeiou]/i.test(en) ? 'an' : 'a'),
    plural: PLURAL_IDS.has(id),
  }));
  t.groups = [];
  for (let i = 0; i < t.words.length; i += A.GROUP_SIZE) {
    t.groups.push(t.words.slice(i, i + A.GROUP_SIZE));
  }
});
