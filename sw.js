/* Service Worker — Laouni Électricité Moderne
 *
 * Écrit pour une connexion guinéenne, pas pour la fibre.
 *
 * L'ancienne version cherchait TOUJOURS la page sur le réseau, et ne se
 * rabattait sur le cache qu'en cas d'échec franc. C'est le bon réflexe
 * quand le réseau est bon ou coupé — mais pas quand il est faible : le
 * visiteur attendait quinze secondes une page que le téléphone avait déjà,
 * puisque « lent » n'est pas « échoué ».
 *
 * Ici : la page enregistrée s'affiche TOUT DE SUITE, et la version fraîche
 * est téléchargée derrière. Si elle a changé, on prévient le visiteur au
 * lieu de le bloquer. C'est le compromis honnête — il voit le site en une
 * seconde, et il n'est jamais coincé sur une vieille version sans le savoir.
 */
const VERSION = 'laouni-v2';
const PAGE = '/';
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

/** Prévient les onglets ouverts qu'une nouvelle version du site est prête. */
async function signalerMiseAJour() {
  const clients = await self.clients.matchAll({ type: 'window' });
  for (const c of clients) c.postMessage({ type: 'nouvelle-version' });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // on ne touche pas à Supabase, aux polices, etc.

  // Images et manifeste : cache d'abord. Ils ne changent pratiquement jamais
  // et pèsent lourd sur une connexion faible.
  if (/\.(png|ico|jpg|jpeg|svg|webp)$/i.test(url.pathname) || url.pathname === '/manifest.json') {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copie = res.clone(); caches.open(VERSION).then((c) => c.put(req, copie)); }
        return res;
      }).catch(() => hit))
    );
    return;
  }

  // L'APK : jamais mis en cache. Il pèse 25 Mo et remplirait l'espace du
  // téléphone pour rien, puisqu'on ne le télécharge qu'une fois.
  if (url.pathname.startsWith('/app/')) return;

  // La page : on rend ce qu'on a, on va chercher la suite derrière.
  if (req.mode === 'navigate') {
    e.respondWith(
      caches.match(PAGE).then((gardee) => {
        const frais = fetch(req)
          .then((res) => {
            if (res.ok) {
              const copie = res.clone();
              caches.open(VERSION).then(async (c) => {
                // On ne prévient que si la page a VRAIMENT changé : sinon le
                // visiteur verrait un bandeau à chaque visite.
                if (gardee) {
                  const [a, b] = await Promise.all([gardee.clone().text(), copie.clone().text()]);
                  if (a !== b) signalerMiseAJour();
                }
                c.put(PAGE, copie);
              });
            }
            return res;
          })
          .catch(() => gardee);          // réseau absent : on garde ce qu'on a rendu

        return gardee || frais;          // rien en cache : première visite, on attend
      })
    );
    return;
  }

  // Le reste : réseau d'abord, cache en secours.
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});
