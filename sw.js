// 한 번 열면 인터넷 없이도 열리도록 파일을 저장해 두는 서비스 워커
const CACHE = 'eat-wear-v16';
const CACHE_PREFIX = 'eat-wear-';   // 이 앱의 캐시만 정리한다 (같은 기기의 다른 앱 캐시는 건드리지 않는다)
const FILES = [
  './', 'index.html', 'manifest.json', 'css/style.css', 'fonts/Jua.woff2', 'libs/confetti.js',
  'js/app.config.js', 'js/data.js', 'js/scenes.js', 'js/core.js', 'js/games1.js', 'js/games2.js',
  'js/games3.js', 'js/stickers.js', 'js/parent.js', 'js/start.js', 'js/app.js', 'sounds/correct.mp3',
  'sounds/pop.mp3', 'sounds/sparkle.mp3', 'sounds/tap.mp3', 'sounds/try-again.mp3', 'sounds/win.mp3', 'icons/icon-192.png',
  'icons/icon-512.png', 'images/bg/beach.webp', 'images/bg/farm.webp', 'images/bg/forest.webp', 'images/bg/night.webp', 'images/bg/savanna.webp',
  'images/apple.webp', 'images/avocado.webp', 'images/backpack.webp', 'images/bacon.webp', 'images/bag.webp', 'images/bagel.webp',
  'images/balletshoes.webp', 'images/banana.webp', 'images/beans.webp', 'images/blackcircle.webp', 'images/blacksquare.webp', 'images/blueberry.webp',
  'images/bluecircle.webp', 'images/bluediamond.webp', 'images/boots.webp', 'images/bread.webp', 'images/broccoli.webp', 'images/browncircle.webp',
  'images/cake.webp', 'images/candy.webp', 'images/cap.webp', 'images/carrot.webp', 'images/cheese.webp', 'images/cherries.webp',
  'images/chestnut.webp', 'images/chocolate.webp', 'images/chopsticks.webp', 'images/clothes.webp', 'images/coat.webp', 'images/coconut.webp',
  'images/cookie.webp', 'images/corn.webp', 'images/crescentmoon.webp', 'images/croissant.webp', 'images/cucumber.webp', 'images/curryrice.webp',
  'images/donut.webp', 'images/dress.webp', 'images/dumpling.webp', 'images/egg.webp', 'images/eggplant.webp', 'images/elephant.webp',
  'images/fishcake.webp', 'images/friedshrimp.webp', 'images/garlic.webp', 'images/ginger.webp', 'images/girl.webp', 'images/glasses.webp',
  'images/gloves.webp', 'images/grapes.webp', 'images/greencircle.webp', 'images/halfmoon.webp', 'images/hamburger.webp', 'images/herb.webp',
  'images/honey.webp', 'images/hotdog.webp', 'images/hotdrink.webp', 'images/icecream.webp', 'images/jeans.webp', 'images/juice.webp',
  'images/kiwi.webp', 'images/lemon.webp', 'images/lettuce.webp', 'images/lollipop.webp', 'images/lunchbox.webp', 'images/mango.webp',
  'images/melon.webp', 'images/milk.webp', 'images/mushroom.webp', 'images/napacabbage.webp', 'images/olive.webp', 'images/onion.webp',
  'images/orangecircle.webp', 'images/oval.webp', 'images/pancake.webp', 'images/peach.webp', 'images/pear.webp', 'images/pepper.webp',
  'images/pie.webp', 'images/pineapple.webp', 'images/pinkcircle.webp', 'images/pizza.webp', 'images/popcorn.webp', 'images/potato.webp',
  'images/pretzel.webp', 'images/pumpkin.webp', 'images/purplecircle.webp', 'images/radish.webp', 'images/redcircle.webp', 'images/redheart.webp',
  'images/redtriangle.webp', 'images/rice.webp', 'images/ricecracker.webp', 'images/ringbuoy.webp', 'images/salad.webp', 'images/sandal.webp',
  'images/sandwich.webp', 'images/scarf.webp', 'images/shavedice.webp', 'images/shoe.webp', 'images/shorts.webp', 'images/sneakers.webp',
  'images/soccerball.webp', 'images/socks.webp', 'images/soup.webp', 'images/spaghetti.webp', 'images/spoon.webp', 'images/sprout.webp',
  'images/star.webp', 'images/strawberry.webp', 'images/sushi.webp', 'images/sweetpotato.webp', 'images/swimsuit.webp', 'images/tangerine.webp',
  'images/tea.webp', 'images/tomato.webp', 'images/tshirt.webp', 'images/umbrella.webp', 'images/waffle.webp', 'images/watermelon.webp',
  'images/whitecircle.webp', 'images/yellowcircle.webp',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // 인터넷이 되면 최신 파일, 안 되면 저장해 둔 파일을 쓴다
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(res => {   // 브라우저가 저장해 둔 옛 파일 대신 늘 새 파일을 확인한다
    if (res.ok && new URL(e.request.url).origin === location.origin) {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
    }
    return res;
  }).catch(() => caches.match(e.request)));
});
