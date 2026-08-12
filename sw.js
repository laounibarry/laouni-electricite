/* Service Worker — Laouni Électricité Moderne
 *
 * Règle de prudence : la PAGE est toujours cherchée sur le réseau en priorité.
 * Le cache ne sert que de secours quand la connexion est coupée. Sans cela, un
 * visiteur pourrait rester bloqué des jours sur une vieille version du site.
 * Seules les images (icônes, image de partage) sont servies depuis le cache en
 * priorité : elles ne changent pratiquement jamais.
 */
const VERSION = 'laouni-v1';
const STATIQUES = [
  '/manifest.json',
  '/favicon.ico',
  '/favicon-32.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(STATIQUES))
      .catch(() => {})            // une image manquante ne doit jamais bloquer l'installation
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(noms.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // on ne touche pas à Supabase, aux polices, etc.

  // Images et manifeste : cache d'abord (rapide, et ils ne changent pas)
  if (/\.(png|ico|jpg|jpeg|svg|webp)$/i.test(url.pathname) || url.pathname === '/manifest.json') {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copie = res.clone(); caches.open(VERSION).then((c) => c.put(req, copie)); }
        return res;
      }).catch(() => hit))
    );
    return;
  }

  // Tout le reste (dont la page) : réseau d'abord, cache en secours hors ligne
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && req.mode === 'navigate') {
          const copie = res.clone();
          caches.open(VERSION).then((c) => c.put('/', copie));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('/')))
  );
});
