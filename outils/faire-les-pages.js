/* Fabrique les pages de destination du site.
 *
 * POURQUOI UN GENERATEUR PLUTOT QUE HUIT FICHIERS ECRITS A LA MAIN
 * Les huit pages partagent le meme en-tete, le meme pied de page, les memes
 * coordonnees des trois magasins et le meme style. Ecrites separement, elles
 * divergent : on corrige un numero de telephone dans six fichiers sur huit,
 * et les deux oublies restent faux pendant un an.
 *
 * Ici, les coordonnees sont ecrites UNE fois, en haut de ce fichier.
 *
 * REGLES QUE CES PAGES NE VIOLENT JAMAIS
 *   Aucune balise <script>. Aucun appel a la base. Du texte fige : il ne
 *   peut pas se casser, il ne peut pas devenir faux tout seul.
 *   Aucun prix, nulle part — c'est la regle du magasin.
 *   Aucun calculateur recopie : une copie du simulateur diverge de
 *   l'original en six mois. On explique, et on renvoie vers l'accueil.
 *   Un seul h1 par page, et une adresse canonique qui pointe sur elle-meme.
 *
 * POUR LANCER :  node outils/faire-les-pages.js
 */
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const SITE = 'https://www.laouni-electricitemoderne.com';
const WA = '224610111015';

const MAGASINS = [
  {
    cle: 'conakry',
    ville: 'Conakry',
    adresse: 'Quartier Kaloum, Conakry',
    tel: '+224 629 415 967',
    telBrut: '+224629415967',
    horaires: 'Du lundi au samedi de 8 h à 19 h, le dimanche de 10 h à 15 h',
    maps: 'https://maps.google.com/?q=Kaloum+Conakry',
    ouverture: [
      { jours: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], de: '08:00', a: '19:00' },
      { jours: 'Sunday', de: '10:00', a: '15:00' },
    ],
  },
  {
    cle: 'labe',
    ville: 'Labé',
    adresse: 'Centre-ville, Labé',
    tel: '+224 610 111 015',
    telBrut: '+224610111015',
    horaires: 'Du lundi au samedi de 8 h à 18 h',
    maps: 'https://maps.google.com/?q=Labe+Guinee',
    ouverture: [
      { jours: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], de: '08:00', a: '18:00' },
    ],
  },
  {
    cle: 'lelouma',
    ville: 'Lelouma',
    adresse: 'Lelouma, région de Labé',
    tel: '+224 621 861 912',
    telBrut: '+224621861912',
    horaires: 'Du lundi au samedi de 8 h à 18 h',
    maps: 'https://maps.google.com/?q=Lelouma+Guinee',
    ouverture: [
      { jours: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], de: '08:00', a: '18:00' },
    ],
  },
];

const parVille = (c) => MAGASINS.find((m) => m.cle === c);

/** Le lien WhatsApp, avec le message deja ecrit : le client n'a plus qu'a envoyer. */
const wa = (texte) => `https://wa.me/${WA}?text=${encodeURIComponent(texte)}`;

const STYLE = `
:root{--o:#f97316;--of:#ea580c;--s:#0f172a;--g:#64748b;--b:#e5e7eb}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1f2937;line-height:1.7;background:#fff;-webkit-text-size-adjust:100%}
.bandeau{background:var(--s);color:#fff;padding:.7rem 1rem;font-size:.82rem;text-align:center}
.bandeau a{color:var(--o);text-decoration:none;font-weight:700}
header{border-bottom:1px solid var(--b);padding:1rem;position:sticky;top:0;background:#fff;z-index:5}
header .in{max-width:820px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:1rem}
.marque{font-family:'Syne',system-ui,sans-serif;font-weight:800;font-size:1.05rem;color:var(--s);text-decoration:none;line-height:1.2}
.marque span{color:var(--o)}
.retour{font-size:.82rem;color:var(--g);text-decoration:none;white-space:nowrap}
main{max-width:820px;margin:0 auto;padding:1.6rem 1.1rem 3rem}
.fil{font-size:.78rem;color:var(--g);margin-bottom:1.2rem}
.fil a{color:var(--g)}
h1{font-family:'Syne',system-ui,sans-serif;font-size:clamp(1.5rem,5.2vw,2.3rem);line-height:1.2;font-weight:800;color:var(--s);margin-bottom:.9rem}
h2{font-family:'Syne',system-ui,sans-serif;font-size:clamp(1.15rem,3.6vw,1.45rem);font-weight:800;color:var(--s);margin:2.2rem 0 .7rem}
h3{font-family:'Syne',system-ui,sans-serif;font-size:1.02rem;font-weight:700;color:var(--s);margin:1.4rem 0 .4rem}
p{margin-bottom:.95rem}
ul,ol{margin:0 0 1rem 1.15rem}
li{margin-bottom:.45rem}
.chapeau{font-size:1.05rem;color:#374151;background:#fff7ed;border-left:4px solid var(--o);padding:.9rem 1rem;border-radius:0 10px 10px 0;margin-bottom:1.6rem}
.encadre{background:#f8fafc;border:1px solid var(--b);border-radius:13px;padding:1rem 1.1rem;margin:1.3rem 0}
.encadre h3{margin-top:0}
.alerte{background:#fef2f2;border:1px solid #fecaca;border-radius:13px;padding:1rem 1.1rem;margin:1.3rem 0}
.vert{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:13px;padding:1rem 1.1rem;margin:1.3rem 0}
table{width:100%;border-collapse:collapse;font-size:.9rem;margin:1rem 0;display:block;overflow-x:auto;white-space:nowrap}
th{text-align:left;font-family:'Syne',system-ui,sans-serif;font-weight:800;padding:.5rem .6rem;border-bottom:2px solid var(--b);color:var(--s)}
td{padding:.5rem .6rem;border-bottom:1px solid #f1f5f9}
.wa{display:block;text-align:center;background:#25d366;color:#fff;font-weight:800;text-decoration:none;padding:.95rem 1.2rem;border-radius:13px;margin:1.6rem 0;font-size:1rem}
.wa small{display:block;font-weight:400;font-size:.78rem;opacity:.92;margin-top:.15rem}
.liens{display:grid;gap:.55rem;margin:1.2rem 0}
.liens a{display:block;border:1px solid var(--b);border-radius:11px;padding:.7rem .9rem;text-decoration:none;color:var(--s);font-weight:600;font-size:.92rem}
.liens a span{display:block;font-weight:400;font-size:.8rem;color:var(--g);margin-top:.1rem}
footer{border-top:1px solid var(--b);background:#f8fafc;padding:2rem 1.1rem 2.5rem;font-size:.87rem;color:var(--g)}
footer .in{max-width:820px;margin:0 auto}
.mags{display:grid;gap:.9rem;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));margin:1rem 0 1.5rem}
.mag{background:#fff;border:1px solid var(--b);border-radius:11px;padding:.85rem}
.mag b{color:var(--s);font-family:'Syne',system-ui,sans-serif}
.mag a{color:var(--of);text-decoration:none;font-weight:600}
`.trim();

/** L'ossature commune. Le contenu de chaque page vient s'y poser. */
function page({ fichier, title, description, h1, corps, filAriane, schemaSup }) {
  const url = `${SITE}/${fichier}/`;

  const fil = [
    { nom: 'Accueil', url: `${SITE}/` },
    ...(filAriane || []),
    { nom: h1.length > 60 ? h1.slice(0, 57) + '…' : h1, url },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: fil.map((f, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: f.nom,
          item: f.url,
        })),
      },
      ...(schemaSup || []),
    ],
  };

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="geo.region" content="GN">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Laouni Électricité Moderne">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="fr_GN">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>${STYLE}</style>
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>

<div class="bandeau">Nos prix sont donnés sur demande — <a href="${wa('Bonjour Laouni Électricité, je voudrais un renseignement.')}" rel="noopener">écrivez-nous sur WhatsApp</a></div>

<header><div class="in">
  <a class="marque" href="/">LAOUNI <span>ÉLECTRICITÉ MODERNE</span></a>
  <a class="retour" href="/">← Accueil</a>
</div></header>

<main>
<nav class="fil">${fil.map((f, i) =>
    i === fil.length - 1 ? f.nom : `<a href="${f.url}">${f.nom}</a> ›`
  ).join(' ')}</nav>

<h1>${h1}</h1>
${corps}

<h2>Nos trois magasins</h2>
<div class="mags">
${MAGASINS.map((m) => `  <div class="mag"><b>${m.ville}</b><br>${m.adresse}<br>
    <a href="tel:${m.telBrut}">${m.tel}</a><br>
    <small>${m.horaires}</small></div>`).join('\n')}
</div>

<a class="wa" href="${wa('Bonjour Laouni Électricité, je voudrais un devis.')}" rel="noopener">
  Demander un devis sur WhatsApp
  <small>Dites-nous ce que vous voulez faire marcher, on vous répond</small>
</a>

</main>

<footer><div class="in">
  <p><b>Laouni Électricité Moderne</b> — onduleurs hybrides, batteries lithium et GEL,
  panneaux solaires, câbles et appareillage. Vente et installation à Conakry, Labé et Lelouma.</p>
  <div class="liens">
    <a href="/">L'accueil et les outils de calcul<span>Simulateur, autonomie de batterie, comparateurs, guide de sécurité</span></a>
    <a href="/delestage-conakry/">Délestage : avoir le courant chez soi<span>Ce que coûtent les coupures, et comment tenir la nuit</span></a>
    <a href="/batterie-lithium-gel-ou-acide/">Quelle batterie choisir<span>Lithium, GEL ou acide : laquelle dure vraiment ici</span></a>
    <a href="/panne-onduleur-batterie/">Mon onduleur bipe, ma batterie ne charge plus<span>Les pannes courantes et ce qu'il faut vérifier</span></a>
    <a href="/choisir-panneau-solaire/">Bien choisir ses panneaux solaires<span>Grade A ou B, double face, noir ou bleu — ce que l'étiquette ne dit pas</span></a>
    <a href="/grandes-marques-solaire/">Les grandes marques du solaire<span>Panneaux, onduleurs, batteries — qui fabrique quoi, et gare aux copies</span></a>
    <a href="/nos-methodes-de-calcul/">Comment nos calculs sont faits<span>Les normes suivies, et quoi faire si un résultat vous étonne</span></a>
  </div>
  <p style="font-size:.8rem">Les prix ne sont pas affichés : ils dépendent de ce que vous voulez
  alimenter et changent avec le cours. Écrivez-nous, on répond avec le tarif du jour.</p>
</div></footer>

</body>
</html>`;
}

/** Le bloc de donnees d'un magasin, pour les pages ville. */
function schemaMagasin(m) {
  return {
    '@type': 'ElectronicsStore',
    '@id': `${SITE}/magasin-${m.cle}/#magasin`,
    name: `Laouni Électricité Moderne — ${m.ville}`,
    parentOrganization: { '@id': `${SITE}/#entreprise` },
    url: `${SITE}/magasin-${m.cle}/`,
    telephone: m.telBrut,
    image: `${SITE}/og-image.png`,
    priceRange: '$$',
    currenciesAccepted: 'GNF',
    paymentAccepted: 'Espèces, Mobile Money',
    address: {
      '@type': 'PostalAddress',
      streetAddress: m.adresse,
      addressLocality: m.ville,
      addressCountry: 'GN',
    },
    hasMap: m.maps,
    openingHoursSpecification: m.ouverture.map((o) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: o.jours,
      opens: o.de,
      closes: o.a,
    })),
  };
}

/** Les sept familles vendues. Ecrites une fois, reprises sur les pages ville. */
const FAMILLES = `
<ul>
  <li><b>Onduleurs hybrides MPPT</b> — ils font trois choses à la fois : ils prennent
      le courant du panneau, ils chargent la batterie et ils alimentent la maison. Quand
      EDG lâche, ils basculent tout seuls, sans que personne touche à rien.</li>
  <li><b>Batteries lithium LiFePO₄</b> — notre marque. On en sort 90 % de ce qu'il y a
      dedans, et elles tiennent des milliers de cycles.</li>
  <li><b>Batteries GEL</b> — plomb étanche, sans entretien. Moins chères à l'achat,
      elles conviennent aux petites installations et aux onduleurs 12 V et 24 V.</li>
  <li><b>Panneaux solaires</b> — plusieurs puissances, du petit panneau pour l'éclairage
      jusqu'aux modules de forte puissance pour une maison entière.</li>
  <li><b>Câbles solaires et câbles de batterie</b> — la section compte autant que le
      reste : un câble trop fin chauffe, perd de l'énergie et finit par brûler.</li>
  <li><b>Disjoncteurs, coffrets et parafoudres</b> — protection continue et alternative,
      c'est ce qui empêche un défaut de devenir un incendie.</li>
  <li><b>Outillage d'électricien</b> — multimètre, pince ampèremétrique, testeur de
      câbles : le matériel de mesure pour installer et dépanner proprement.</li>
</ul>
<p>Chaque produit de notre marque porte un code-barres. Vous pouvez le taper sur la page
d'accueil pour vérifier qu'il sort bien de chez nous — c'est notre réponse aux
contrefaçons qui circulent sur le marché.</p>`;

/** Ce que le magasin fait chez le client. */
const INSTALLATION = `
<p>Nous ne vendons pas seulement le matériel : nous le posons. Une installation qui
marche, ce n'est pas une addition de bons appareils, c'est un ensemble calculé — la
puissance des panneaux, la capacité de la batterie, la section des câbles et les
protections doivent aller ensemble.</p>
<p>Ce que nous faisons : le calcul de ce qu'il vous faut à partir de vos appareils, la
pose des panneaux, le câblage, le coffret de protection, la mise en service et
l'explication du fonctionnement à quelqu'un de la maison.</p>
<p>Ce que vous préparez de votre côté : un endroit couvert et <b>aéré</b> pour les
batteries — pas un cagibi fermé sous tôle, la chaleur y coupe la durée de vie de moitié —
et un accès au toit ou à la cour pour les panneaux.</p>`;

const CONTREFACON = `
<div class="alerte">
<h3 style="margin-top:0">Une grande marque à prix cassé, c'est une contrefaçon</h3>
<p>Si on vous propose une grande marque mondiale nettement moins cher qu'ailleurs, ce
n'est pas une bonne affaire : c'est presque toujours une copie. Ces marques-là sont les
plus imitées au monde, justement parce que leur nom se vend tout seul.</p>
<p><b>Entre ces deux choix :</b></p>
<ul>
  <li>une <b>marque standard, à un prix raisonnable</b>, avec une fiche technique et une
      garantie que quelqu'un assume ;</li>
  <li>une <b>grande marque mondiale à prix réduit</b>, sans preuve que le produit est
      authentique.</li>
</ul>
<p style="margin-bottom:0">Le second est de loin le plus risqué. Le premier vous donne ce
qu'il annonce. Le second vous donne une étiquette — et vous ne le saurez qu'au bout de six
mois, quand la batterie sera morte ou que le panneau produira la moitié de ce qui est
écrit dessus.</p>
</div>`;

/// Le rappel court, a glisser en bas d une page sans l alourdir.
const RAPPEL_CONTREFACON = `
<div class="alerte" style="padding:.8rem 1rem">
<p style="margin:0;font-size:.88rem"><b>⚠ Rappel :</b> une marque standard à prix
raisonnable vaut mieux qu'une grande marque à prix cassé — la deuxième est presque
toujours une copie.</p>
</div>`;

const PAGES = [];

// ─────────────────────────── les trois magasins ───────────────────────────

const SPECIFIQUE = {
  conakry: {
    title: 'Panneaux solaires et onduleurs à Conakry — Laouni',
    description:
      'Magasin Laouni Électricité Moderne à Conakry : onduleurs hybrides MPPT, batteries lithium LiFePO4, panneaux solaires, câbles. Devis sur WhatsApp.',
    h1: 'Énergie solaire à Conakry : onduleurs, batteries lithium, panneaux solaires',
    chapeau:
      'Notre magasin de Conakry vend et installe le matériel solaire : onduleurs hybrides, batteries lithium et GEL, panneaux, câbles et protections. On vous dit ce qu\'il vous faut à partir de vos appareils, pas à partir d\'un catalogue.',
    local: `
<h2>Pourquoi acheter en magasin plutôt qu'au marché</h2>
<p>Au marché on trouve de tout, y compris des batteries reconditionnées vendues pour
neuves et des onduleurs dont la puissance annoncée n'a jamais été mesurée. Le prix paraît
meilleur le jour de l'achat. Il l'est beaucoup moins quand la batterie meurt en huit mois.</p>
<p>Chez nous, chaque produit de notre marque porte un code-barres que vous vérifiez
vous-même sur ce site, et vous savez où nous retrouver si quelque chose ne va pas.
Un magasin qui a pignon sur rue à Kaloum ne disparaît pas pendant la nuit.</p>

<h2>Questions qu'on nous pose au comptoir</h2>
<h3>Vous vendez des plaques solaires à Conakry ?</h3>
<p>Oui, plusieurs puissances, ainsi que tout ce qui va avec : onduleur, batteries,
câbles, disjoncteurs et supports.</p>
<h3>Vous faites l'installation ?</h3>
<p>Oui, à Conakry et dans les environs. Nous calculons d'abord ce qu'il vous faut, puis
nous posons.</p>
<h3>Ça peut faire marcher un climatiseur ?</h3>
<p>Oui, mais c'est l'appareil qui décide de la taille de toute l'installation. Un
climatiseur demande beaucoup au démarrage et tourne longtemps : il faut un onduleur plus
grand et une batterie plus grosse. Dites-nous le modèle, nous ferons le calcul.</p>
<h3>Combien de temps ça tient la nuit ?</h3>
<p>Cela dépend de ce que vous laissez branché. L'outil « Ma batterie tient combien de
temps » sur la page d'accueil vous donne la réponse en cochant vos appareils.</p>`,
  },
  labe: {
    title: 'Panneaux solaires et batteries à Labé — Laouni',
    description:
      'Magasin Laouni Électricité Moderne à Labé : onduleurs hybrides, batteries lithium et GEL, panneaux solaires, installation au Fouta. Devis WhatsApp.',
    h1: 'Énergie solaire à Labé : onduleurs, batteries, panneaux solaires',
    chapeau:
      'Notre magasin de Labé sert la ville et le Fouta. Matériel solaire complet, calcul de votre installation, pose et dépannage — sans avoir à descendre à Conakry.',
    local: `
<h2>Le solaire au Fouta : ce qui change par rapport à Conakry</h2>
<p>Le Fouta est en altitude, et les nuits y sont nettement plus fraîches qu'à Conakry.
C'est une bonne nouvelle pour les batteries : la chaleur est ce qui les tue le plus vite,
et un local qui redescend la nuit fait durer un parc sensiblement plus longtemps qu'un
cagibi sous tôle de la capitale.</p>
<p>Le revers, c'est la saison des pluies. Plusieurs jours de ciel couvert d'affilée, cela
veut dire plusieurs jours où les panneaux produisent peu. Une installation dimensionnée
au plus juste pour la saison sèche laisse son propriétaire dans le noir en août. Nous
prévoyons cette marge dès le calcul — c'est la principale différence entre une
installation qui tient l'année et une installation qui déçoit.</p>
<p>Autre point qui compte ici : beaucoup de villages n'ont pas de réseau du tout. Il ne
s'agit alors pas de compléter EDG mais de produire toute l'électricité de la maison.
Le calcul n'est pas le même, et la batterie compte davantage que les panneaux.</p>

<h2>Questions qu'on nous pose à Labé</h2>
<h3>Vous livrez dans les villages autour ?</h3>
<p>Écrivez-nous sur WhatsApp en indiquant le village : nous vous dirons ce qui est
possible et comment le matériel vous parvient.</p>
<h3>Il n'y a pas de courant du tout chez moi, ça marche quand même ?</h3>
<p>Oui. C'est même le cas où le solaire est le plus utile : vous ne complétez pas un
réseau, vous le remplacez. Il faut alors calculer la batterie plus large.</p>`,
  },
  lelouma: {
    title: 'Matériel solaire à Lelouma — Laouni Électricité',
    description:
      'Magasin Laouni Électricité Moderne à Lelouma : panneaux solaires, batteries, onduleurs. Installations dans les villages. Devis sur WhatsApp.',
    h1: 'Énergie solaire à Lelouma : panneaux, batteries et onduleurs',
    chapeau:
      'Notre magasin de Lelouma sert la préfecture et les villages alentour. Là où le réseau n\'arrive pas, le solaire n\'est pas un complément : c\'est toute l\'électricité de la maison.',
    local: `
<h2>Quand il n'y a pas de réseau du tout</h2>
<p>Dans beaucoup de villages de la préfecture, la question n'est pas « comment tenir
pendant les coupures » mais « comment avoir du courant, tout simplement ». Cela change
le calcul du tout au tout.</p>
<p>Quand on complète EDG, la batterie ne sert que quelques heures et se recharge sur le
réseau en cas de besoin. Sans réseau, elle est la seule réserve : s'il pleut trois jours,
il n'y a rien d'autre. Une installation autonome se dimensionne donc sur les mauvais
jours, pas sur les bons.</p>
<p>C'est aussi pour cela que nous insistons sur la qualité de la batterie ici plus
qu'ailleurs. Une batterie bon marché qui meurt en dix-huit mois, dans un village à
plusieurs heures de route, ce n'est pas une économie : c'est un déplacement, une attente,
et des semaines sans lumière.</p>

<h2>Ce qui change une installation de village</h2>
<ul>
  <li><b>Les mauvais jours décident de la taille</b>, pas la moyenne de l'année.</li>
  <li><b>Ce qui se répare sur place vaut mieux que ce qui doit revenir en ville.</b>
      Nous vous montrons ce que vous pouvez vérifier vous-même.</li>
  <li><b>Le local à batteries</b> doit être aéré et à l'abri du soleil direct. C'est
      gratuit, et cela change la durée de vie du simple au double.</li>
  <li><b>Les protections ne sont pas facultatives.</b> La foudre en saison des pluies
      est la première cause de matériel grillé au Fouta.</li>
</ul>`,
  },
};

for (const m of MAGASINS) {
  const s = SPECIFIQUE[m.cle];
  PAGES.push({
    fichier: `magasin-${m.cle}`,
    title: s.title,
    description: s.description,
    h1: s.h1,
    schemaSup: [schemaMagasin(m)],
    corps: `
<p class="chapeau">${s.chapeau}</p>

<h2>Où nous trouver à ${m.ville}</h2>
<div class="encadre">
  <p style="margin:0"><b>Laouni Électricité Moderne — ${m.ville}</b><br>
  ${m.adresse}<br>
  Téléphone : <a href="tel:${m.telBrut}">${m.tel}</a><br>
  ${m.horaires}<br>
  <a href="${m.maps}" rel="noopener">Voir sur la carte</a></p>
</div>

<h2>Ce que vous trouvez en magasin</h2>
${FAMILLES}

${RAPPEL_CONTREFACON}

<h2>Nous installons chez vous à ${m.ville}</h2>
${INSTALLATION}
${s.local}

<a class="wa" href="${wa(`Bonjour, magasin de ${m.ville} — je voudrais un devis.`)}" rel="noopener">
  Écrire au magasin de ${m.ville}
  <small>Dites-nous vos appareils, on vous répond avec le devis</small>
</a>

<h2>Calculer avant d'acheter</h2>
<p>Sur la page d'accueil, trois outils répondent aux questions qu'on nous pose le plus
souvent, sans avoir à se déplacer :</p>
<div class="liens">
  <a href="/#simulation">Le simulateur d'installation<span>Cochez vos appareils, il calcule les panneaux, la batterie et l'onduleur</span></a>
  <a href="/#autonomie">Ma batterie tient combien de temps ?<span>La réponse en secondes, selon ce qui tourne la nuit</span></a>
  <a href="/#batteries">Lithium, GEL ou acide ?<span>Durée, poids, nombre de rachats sur dix ans</span></a>
</div>`,
  });
}

// ─────────────────────────────── délestage ───────────────────────────────

PAGES.push({
  fichier: 'delestage-conakry',
  title: 'Délestage à Conakry : avoir le courant chez soi',
  description:
    'Le courant part tous les jours à Conakry ? Ce que le délestage coûte vraiment, et comment tenir la nuit avec un onduleur et des batteries.',
  h1: 'Délestage à Conakry : comment avoir le courant chez vous quand le courant part',
  corps: `
<p class="chapeau">Quand le courant part, ce n'est pas seulement la lumière qui s'éteint :
c'est le congélateur qui dégèle, le poste de soudure qui s'arrête et la boutique qui ne
vend plus. Voici ce que cela coûte, et ce qu'il faut pour que la maison ne s'arrête pas.</p>

<h2>Ce que le délestage vous coûte vraiment</h2>
<p>On compte rarement le prix d'une coupure, parce qu'il ne sort pas du portefeuille : il
se perd en route. Pourtant il est bien réel.</p>
<ul>
  <li><b>Le congélateur d'une boutique</b> qui dégèle une fois de trop, c'est la viande et
      le poisson à jeter — et le client qui va acheter ailleurs la semaine suivante.</li>
  <li><b>Un atelier de soudure</b> à l'arrêt, c'est une journée de travail perdue et un
      client mécontent, pas seulement quelques heures sans courant.</li>
  <li><b>Une couturière, un coiffeur, un cybercafé</b> : le métier s'arrête net. La
      clientèle, elle, prend l'habitude d'aller chez celui qui a le courant.</li>
  <li><b>Une chambre froide</b> qui remonte en température, c'est un stock entier.</li>
  <li><b>À la maison</b>, c'est les devoirs à la bougie, les téléphones déchargés, et la
      nuit sans ventilateur pendant la saison chaude.</li>
</ul>
<p>Beaucoup de gens répondent au délestage en achetant un groupe électrogène. Le prix
d'achat se voit une fois ; le carburant, lui, part tous les jours. Nous avons fait le
calcul sur cinq ans dans un outil séparé — la différence surprend la plupart des gens.</p>

<h2>Ce qu'il faut pour que la maison ne s'arrête pas</h2>
<p>Trois pièces, et une seule chose importante à comprendre.</p>
<ul>
  <li><b>Les panneaux</b> produisent, mais seulement pendant la journée.</li>
  <li><b>Les batteries</b> gardent ce qui a été produit pour le rendre la nuit.</li>
  <li><b>L'onduleur hybride</b> est le chef d'orchestre : il transforme le courant continu
      des panneaux et des batteries en courant normal pour vos prises.</li>
</ul>
<div class="vert">
<h3>Le point que les gens ne savent pas</h3>
<p style="margin:0">Un onduleur hybride <b>bascule tout seul</b>. Quand EDG lâche, vous ne
faites rien : pas d'interrupteur à tourner, pas de démarreur à tirer. La télévision ne
s'éteint même pas. Et quand le courant revient, il repasse dessus sans que personne s'en
aperçoive. C'est la différence de fond avec un groupe électrogène.</p>
</div>

<h2>Ce qu'il faut pour qu'une boutique ne s'arrête pas</h2>
<p>Une boutique n'a pas les mêmes besoins qu'une maison. Ce qui compte, c'est ce qui ne
doit <b>jamais</b> s'arrêter : le froid d'abord, la lumière ensuite.</p>
<p>Un congélateur ne consomme pas en continu — il s'arrête quand il a atteint sa
température et redémarre plus tard. Mais il demande beaucoup au démarrage, et c'est ce
pic qui décide de la taille de l'onduleur, pas sa consommation moyenne. C'est l'erreur
la plus fréquente : un onduleur choisi sur la puissance écrite sur l'étiquette du
congélateur, qui disjoncte à chaque démarrage.</p>

<h2>Combien de temps vous tiendrez la nuit</h2>
<p>Cela dépend uniquement de deux choses : ce que vous laissez branché, et la taille de
la batterie. Quelques repères, du plus petit au plus grand :</p>
<table>
  <tr><th>Ce qui tourne la nuit</th><th>Taille de l'installation</th></tr>
  <tr><td>6 lampes, un ventilateur, les téléphones</td><td>Petite</td></tr>
  <tr><td>+ télévision et décodeur</td><td>Petite à moyenne</td></tr>
  <tr><td>+ congélateur ou réfrigérateur</td><td>Moyenne</td></tr>
  <tr><td>+ climatiseur de chambre</td><td>Grande</td></tr>
  <tr><td>Boutique avec vitrine réfrigérée</td><td>Grande</td></tr>
</table>
<p>Pour avoir le chiffre exact plutôt qu'un ordre de grandeur, l'outil de la page
d'accueil vous le donne en cochant vos appareils.</p>
<div class="liens">
  <a href="/#autonomie">Ma batterie tient combien de temps ?<span>Cochez ce qui tourne la nuit, la réponse est immédiate</span></a>
  <a href="/#simulation">Le simulateur d'installation<span>Il calcule les panneaux, la batterie et l'onduleur qu'il vous faut</span></a>
</div>

<h2>Groupe électrogène : pourquoi ce n'est pas la bonne réponse ici</h2>
<p>Un groupe dépanne, et il a ses usages. Mais comme réponse à un délestage quotidien,
il pose quatre problèmes que le solaire n'a pas : il faut être là pour le démarrer, il
consomme du carburant chaque jour d'utilisation, il fait du bruit toute la nuit, et il
demande de l'entretien — vidange, filtres, bougies — que personne ne fait vraiment.</p>
<p>Le calcul complet, carburant compris, est sur la page d'accueil.</p>
<div class="liens">
  <a href="/#economie">Groupe électrogène ou solaire ?<span>Ce que votre carburant coûte réellement sur cinq ans</span></a>
</div>

<div class="alerte">
<h3>Ce qu'il ne faut pas faire</h3>
<ul style="margin-bottom:0">
  <li>Brancher un climatiseur sur un onduleur trop petit : il disjonctera au démarrage,
      et à force, quelque chose finira par lâcher.</li>
  <li>Mettre les batteries dans une pièce fermée sans air. La chaleur est ce qui les tue
      le plus vite, et les batteries à bouchons dégagent de l'hydrogène en fin de charge.</li>
  <li>Acheter la batterie la moins chère. C'est celle qu'on rachète le plus souvent —
      nous avons chiffré combien de fois.</li>
  <li>Faire le montage sans protections. Un défaut sans disjoncteur, c'est un incendie.</li>
</ul>
</div>

<a class="wa" href="${wa('Bonjour, à cause du délestage je voudrais une installation. Voici mes appareils : ')}" rel="noopener">
  Envoyez la liste de vos appareils
  <small>On vous répond avec ce qu'il vous faut et le devis</small>
</a>`,
});

// ─────────────────────────────── pannes ───────────────────────────────

PAGES.push({
  fichier: 'panne-onduleur-batterie',
  title: 'Onduleur qui bipe, batterie qui ne charge plus',
  description:
    'Onduleur qui bipe ou qui coupe, batterie qui se vide vite, panneau qui ne charge pas : les causes, ce qu\'il faut vérifier, et quand nous appeler.',
  h1: 'Pannes courantes : onduleur qui bipe, batterie qui ne charge plus',
  corps: `
<p class="chapeau">Avant d'appeler quelqu'un, il y a trois ou quatre choses que vous pouvez
vérifier vous-même en cinq minutes. Elles règlent une panne sur deux — et quand elles ne
la règlent pas, vous saurez quoi nous dire.</p>

<h2>L'onduleur bipe sans arrêt</h2>
<p>Un bip n'est pas une panne : c'est un message. L'appareil vous dit quelque chose, et
le nombre de bips ou la couleur du voyant indique quoi.</p>
<p><b>Les trois causes de loin les plus fréquentes :</b></p>
<ol>
  <li><b>La batterie est basse.</b> C'est le cas le plus courant. L'onduleur prévient
      avant de couper pour ne pas détruire la batterie. Si cela arrive tous les soirs de
      plus en plus tôt, la batterie est en fin de vie.</li>
  <li><b>Il est surchargé.</b> Vous avez branché plus que ce qu'il peut fournir.
      Débranchez le gros appareil — fer à repasser, plaque, climatiseur, pompe : si le bip
      s'arrête, vous avez trouvé.</li>
  <li><b>Il est trop chaud.</b> Regardez si son ventilateur tourne et si l'air circule
      autour. Un onduleur collé au mur dans un placard fermé finit toujours par se mettre
      en sécurité.</li>
</ol>
<p><b>Ce que vous pouvez faire :</b> débranchez tout, attendez que le bip s'arrête, puis
rebranchez appareil par appareil. Celui qui déclenche le bip est le coupable.</p>

<h2>L'onduleur coupe tout seul quand un gros appareil démarre</h2>
<p>Ce n'est presque jamais l'onduleur qui est en cause : c'est le <b>pic de démarrage</b>.
Un moteur — congélateur, pompe, climatiseur — demande trois à six fois sa puissance
normale pendant la seconde où il démarre. Un congélateur marqué 150 W peut réclamer 900 W
au démarrage.</p>
<p>Si votre onduleur coupe systématiquement au démarrage d'un appareil précis, il est
sous-dimensionné pour cet appareil-là. Ce n'est pas réparable : il faut un onduleur plus
grand, ou renoncer à mettre cet appareil dessus.</p>

<h2>La batterie se vide beaucoup plus vite qu'avant</h2>
<p>Une batterie ne meurt pas d'un coup : elle perd sa capacité petit à petit. Vous vous en
apercevez le jour où elle ne tient plus la nuit alors qu'elle la tenait il y a six mois.</p>
<p><b>À vérifier dans l'ordre :</b></p>
<ul>
  <li><b>Les cosses.</b> Desserrées ou couvertes d'un dépôt blanc ou vert, elles font
      chuter la tension. C'est gratuit à corriger et c'est plus fréquent qu'on ne croit.</li>
  <li><b>Le niveau d'eau</b>, si c'est une batterie à bouchons. Un élément découvert est
      un élément perdu, et il entraîne les autres. À 35 °C l'eau part deux fois plus vite
      qu'à 25 °C.</li>
  <li><b>La chaleur du local.</b> Une batterie plomb dans un cagibi sous tôle perd la
      moitié de sa durée de vie. Si le local est chaud, c'est très probablement la cause.</li>
  <li><b>Les nouveaux appareils.</b> Un congélateur ajouté il y a deux mois explique à lui
      seul une autonomie divisée par deux.</li>
</ul>

<h2>Le panneau ne recharge plus la batterie</h2>
<p>Avant de conclure à une panne, regardez le panneau lui-même :</p>
<ul>
  <li><b>La poussière.</b> En saison sèche, la poussière de harmattan forme un voile qui
      fait perdre beaucoup de production. Un chiffon humide règle le problème.</li>
  <li><b>Une ombre.</b> Un mur, un arbre qui a poussé, une antenne. Attention : sur
      beaucoup de panneaux, une ombre sur un coin fait chuter la production du panneau
      <b>entier</b>, pas seulement du coin.</li>
  <li><b>Le disjoncteur du côté panneaux.</b> S'il s'est ouvert, plus rien n'arrive.</li>
  <li><b>Les connecteurs.</b> Un contact desserré ou de l'eau entrée dans un connecteur
      coupe la production, souvent par intermittence — ça marche le matin, plus l'après-midi.</li>
</ul>

<h2>La batterie a gonflé ou elle chauffe</h2>
<div class="alerte">
<p style="margin:0"><b>Arrêtez tout.</b> Une batterie qui gonfle ou qui devient chaude au
toucher est dangereuse. Coupez le disjoncteur, ne la rechargez plus, ne la percez pas, ne
la mettez pas dans une pièce fermée. Sortez-la à l'air libre, à l'ombre, loin du passage,
et appelez-nous. Une batterie gonflée ne se répare pas et ne se rattrape pas.</p>
</div>

<h2>Ce qu'il ne faut jamais faire soi-même</h2>
<ul>
  <li><b>Ouvrir un onduleur.</b> Il garde de la tension dans ses condensateurs même
      débranché, parfois longtemps.</li>
  <li><b>Toucher les deux bornes d'une batterie avec le même outil.</b> Un court-circuit
      de batterie fait fondre une clé et projette du métal.</li>
  <li><b>Ajouter de l'acide</b> dans une batterie à bouchons. On ajoute de l'eau
      distillée, jamais d'acide.</li>
  <li><b>Mélanger des batteries neuves et usagées</b> dans le même parc. La plus faible
      tire toutes les autres vers le bas.</li>
</ul>

<a class="wa" href="${wa('Bonjour, j\'ai un problème avec mon installation. Voici ce qui se passe : ')}" rel="noopener">
  Envoyez-nous une photo ou une vidéo
  <small>Le voyant, le nombre de bips, ce qui est branché — on vous répond</small>
</a>
<p style="font-size:.9rem;color:#64748b">Une petite vidéo du bip ou une photo du voyant
nous en dit plus qu'une longue explication. Précisez aussi depuis quand cela dure, et ce
qui a changé récemment dans la maison.</p>`,
});

// ─────────────────────── groupe électrogène ou solaire ───────────────────────

PAGES.push({
  fichier: 'groupe-electrogene-ou-solaire',
  title: 'Groupe électrogène ou solaire : le calcul en litres',
  description:
    'Le prix d\'achat d\'un groupe se voit une fois. Le carburant part tous les jours. Le calcul complet sur cinq ans, en litres et en heures.',
  h1: 'Groupe électrogène ou solaire en Guinée : le calcul en litres de carburant',
  corps: `
<p class="chapeau">La réponse en deux lignes : un groupe coûte moins cher à l'achat et
beaucoup plus cher à l'usage. Le point de bascule arrive en général la deuxième année —
après quoi tout ce que vous mettez dans le réservoir est de l'argent que le solaire ne
vous aurait pas demandé.</p>

<h2>Le prix d'achat se voit une fois, le carburant part tous les jours</h2>
<p>C'est le piège de la comparaison. On met côte à côte deux prix d'achat, le groupe est
moins cher, et la décision est prise en trente secondes. Personne ne pose sur la table la
troisième colonne : ce que l'appareil coûte <b>chaque jour</b> pendant cinq ans.</p>
<p>Un groupe consomme dès qu'il tourne, et il consomme d'autant plus mal qu'il est peu
chargé. Un groupe de 5 kVA qui alimente trois lampes et un ventilateur brûle presque
autant de carburant que s'il était plein — c'est une caractéristique des moteurs, pas un
défaut de réglage.</p>
<p>Le soleil, lui, ne se facture pas. C'est toute la question.</p>

<h2>Ce qu'un groupe coûte en plus du carburant</h2>
<p>Le carburant est la partie visible. Il y a le reste :</p>
<ul>
  <li><b>Les vidanges.</b> Un groupe demande une vidange toutes les 100 à 200 heures de
      marche. À raison de quelques heures par jour, cela revient souvent — et un groupe
      qu'on ne vidange pas ne dure pas.</li>
  <li><b>Les filtres, les bougies, la batterie de démarrage.</b></li>
  <li><b>Quelqu'un pour le démarrer.</b> S'il n'y a personne à la maison quand le courant
      part, le congélateur dégèle quand même.</li>
  <li><b>Le bruit.</b> Toute la nuit, pour vous et pour les voisins.</li>
  <li><b>Les fumées</b>, si le groupe est près des fenêtres ou dans une cour fermée.</li>
</ul>

<h2>Ce que le solaire coûte, et ce qu'il ne coûte pas</h2>
<p>Le solaire coûte cher une fois : les panneaux, les batteries, l'onduleur, le câblage et
la pose. Ensuite, il ne consomme rien. Il n'y a ni carburant, ni vidange, ni filtre, ni
démarrage.</p>
<p>La seule dépense qui revient, c'est le remplacement des batteries — et c'est là que le
choix de la batterie décide de tout. Une batterie plomb bon marché se rachète plusieurs
fois pendant qu'une batterie lithium tient encore. Nous avons chiffré la différence.</p>
<div class="liens">
  <a href="/batterie-lithium-gel-ou-acide/">Lithium, GEL ou acide : laquelle dure vraiment<span>Cycles, chaleur, poids et nombre de rachats sur dix ans</span></a>
</div>

<h2>Faites le calcul avec vos propres chiffres</h2>
<p>Nous ne vous demandons pas de nous croire. Sur la page d'accueil, entrez ce que vous
mettez réellement dans votre groupe chaque jour : l'outil vous donne le total sur cinq
ans, en litres et en francs guinéens, avec vos chiffres et non les nôtres.</p>
<div class="liens">
  <a href="/#economie">Le comparateur carburant<span>Combien de litres par jour ? Voici le total sur cinq ans</span></a>
  <a href="/#simulation">Le simulateur d'installation<span>Ce qu'il faudrait en panneaux, batterie et onduleur pour remplacer le groupe</span></a>
</div>

<h2>Quand le groupe reste le bon choix</h2>
<p>Nous ne dirons pas que le solaire gagne toujours. Il y a des cas où le groupe garde
l'avantage, et il vaut mieux le savoir avant d'acheter :</p>
<ul>
  <li><b>Un besoin très ponctuel</b> — un chantier de quelques semaines, un événement.</li>
  <li><b>Une très forte puissance sur une courte durée</b> : soudure lourde,
      bétonnière, atelier de menuiserie. Couvrir ces pointes en solaire coûte cher.</li>
  <li><b>Un usage rare</b>, quelques heures par mois : le carburant reste marginal et
      l'investissement solaire ne se rentabilise jamais.</li>
</ul>
<p>Beaucoup d'installations sérieuses gardent d'ailleurs les deux : le solaire fait le
travail de tous les jours, et le groupe reste en secours pour les cas extrêmes. Un
onduleur hybride sait gérer les deux sources.</p>

<a class="wa" href="${wa('Bonjour, j\'ai un groupe électrogène et je voudrais savoir ce que le solaire me coûterait. Je mets environ ... litres par jour.')}" rel="noopener">
  Dites-nous ce que vous mettez en carburant
  <small>On vous dit ce que le solaire remplacerait, et ce qu'il faut</small>
</a>`,
});

// ─────────────────────────────── prix ───────────────────────────────

PAGES.push({
  fichier: 'prix-solaire-conakry',
  title: 'Prix du solaire à Conakry : ce qui fait le prix',
  description:
    'Pourquoi personne ne peut vous donner un prix au téléphone, les cinq postes qui font le prix d\'une installation, et comment reconnaître un devis truqué.',
  h1: 'Prix du solaire à Conakry : ce qui fait vraiment le prix d\'une installation',
  corps: `
<p class="chapeau">Nous n'affichons pas de prix, et cette page explique pourquoi — ainsi
que ce qui fait monter ou descendre la facture, pour que vous puissiez lire un devis, le
nôtre comme celui d'un autre, sans vous faire avoir.</p>

<h2>Pourquoi personne ne peut vous donner un prix au téléphone</h2>
<p>« C'est combien une installation solaire ? » est une question sans réponse, au même
titre que « c'est combien une maison ? ». Deux installations qui se ressemblent de
l'extérieur peuvent aller du simple au quintuple selon ce qu'elles doivent alimenter.</p>
<p>Ce qui décide, ce n'est pas la surface du toit ni le nombre de pièces : c'est la liste
de vos appareils et le nombre d'heures pendant lesquelles ils doivent tourner sans soleil.
Un ventilateur et six lampes, ce n'est pas la même installation qu'un congélateur, et un
congélateur n'est pas un climatiseur.</p>
<p>Un vendeur qui vous annonce un prix sans avoir posé ces questions vend un carton, pas
une installation. Le jour où votre onduleur coupera au démarrage du congélateur, il vous
expliquera que ce n'était pas prévu.</p>

<h2>Les cinq postes qui font le prix</h2>
<ol>
  <li><b>La puissance des panneaux.</b> Elle dépend de l'énergie à produire chaque jour.
      C'est souvent le poste le plus visible, rarement le plus déterminant.</li>
  <li><b>La capacité et la chimie de la batterie.</b> Le poste le plus lourd, et de loin
      celui où le choix a le plus de conséquences sur dix ans.</li>
  <li><b>L'onduleur.</b> Sa taille est décidée par le <b>pic de démarrage</b> de vos
      moteurs, pas par leur consommation moyenne. C'est l'erreur la plus fréquente des
      devis bon marché.</li>
  <li><b>Le câblage et les protections.</b> Sections de câble, disjoncteurs continus et
      alternatifs, parafoudre, coffret, mise à la terre. Le poste qu'on rogne en premier,
      et celui qui provoque les incendies.</li>
  <li><b>La pose.</b> Supports, étanchéité des passages de toiture, mise en service,
      réglages de l'onduleur et explication du fonctionnement.</li>
</ol>

<h2>Pourquoi la batterie pas chère revient plus cher</h2>
<p>C'est le calcul que presque personne ne fait, et c'est celui qui change tout.</p>
<p>Une batterie plomb ne rend que la moitié de ce qui est écrit dessus : on ne la
descend pas plus bas sans la détruire. Pour sortir la même énergie chaque nuit, il en faut
donc <b>deux fois plus</b> qu'en lithium. Ensuite, elle tient beaucoup moins longtemps —
et dans un local chaud, encore moins.</p>
<p>Sur dix ans, le parc bon marché se rachète plusieurs fois pendant que l'autre tient
encore. Nous avons mis le calcul complet, avec les cycles, la chaleur du local et le
nombre de rachats, dans un outil où vous pouvez même régler vous-même l'écart de prix
entre les deux technologies.</p>
<div class="liens">
  <a href="/#batteries">Le comparateur de batteries<span>Réglez l'écart de prix vous-même, la conclusion suit le calcul</span></a>
</div>

${CONTREFACON}

<h2>Comment reconnaître un devis truqué</h2>
<p>Quelques signaux qui doivent vous faire poser des questions :</p>
<ul>
  <li><b>Aucune liste d'appareils.</b> Si personne ne vous a demandé ce que vous voulez
      faire marcher, le devis a été fait au hasard.</li>
  <li><b>La capacité de la batterie annoncée sans la chimie ni la tension.</b> « 200 Ah »
      ne veut rien dire tout seul : en plomb, cela fait 100 Ah utilisables.</li>
  <li><b>Un onduleur choisi sur la consommation, pas sur le démarrage.</b> Demandez ce
      qui a été prévu pour le pic du congélateur ou de la pompe.</li>
  <li><b>Pas de ligne pour les protections.</b> Un devis sans disjoncteurs ni parafoudre
      est un devis incomplet, pas un devis moins cher.</li>
  <li><b>Aucune section de câble indiquée.</b> Un câble sous-dimensionné chauffe, fait
      perdre de l'énergie et finit par brûler.</li>
  <li><b>Une garantie annoncée à l'oral.</b> Ce qui n'est pas écrit n'existe pas.</li>
</ul>

<h2>Comment nous faisons un devis</h2>
<ol>
  <li>Vous nous envoyez la liste de vos appareils sur WhatsApp — ou vous passez au
      magasin avec les étiquettes.</li>
  <li>Nous calculons ce qu'il faut réellement produire et stocker.</li>
  <li>Nous vous donnons le matériel poste par poste, avec le prix du jour.</li>
  <li>Vous décidez. Rien n'oblige à tout faire d'un coup : beaucoup d'installations se
      montent en deux temps.</li>
</ol>
<p>Vous pouvez aussi faire le premier calcul vous-même avant de nous écrire :</p>
<div class="liens">
  <a href="/#simulation">Le simulateur d'installation<span>Cochez vos appareils, il calcule panneaux, batterie et onduleur</span></a>
</div>

<a class="wa" href="${wa('Bonjour, je voudrais un devis pour une installation solaire. Voici mes appareils : ')}" rel="noopener">
  Demander le prix du jour
  <small>Envoyez la liste de vos appareils, on vous répond avec le devis</small>
</a>`,
});

// ─────────────────────────────── batteries ───────────────────────────────

PAGES.push({
  fichier: 'batterie-lithium-gel-ou-acide',
  title: 'Batterie lithium, GEL ou acide : laquelle dure ?',
  description:
    'Lithium, GEL ou plomb ouvert : ce que chacune rend vraiment en Guinée, ce que la chaleur leur fait, et combien de fois vous la rachèterez.',
  h1: 'Batterie lithium, GEL ou acide : laquelle dure vraiment en Guinée',
  corps: `
<p class="chapeau">La réponse en deux lignes : le lithium coûte deux à trois fois plus cher
à l'achat et revient nettement moins cher sur dix ans, parce qu'il faut racheter le parc
plomb plusieurs fois pendant qu'il tient encore. Mais tout dépend de la chaleur de votre
local — et c'est là que ça se joue en Guinée.</p>

<h2>Un cycle, ce n'est pas une journée</h2>
<p>C'est le chiffre le plus mal lu de toutes les fiches techniques, et celui qui fait
prendre les mauvaises décisions.</p>
<p><b>Un cycle, c'est une charge suivie d'une décharge.</b> Pas un jour. Si vous chargez
aujourd'hui et que la batterie ne se vide qu'après-demain, vous n'avez consommé qu'un seul
cycle en deux jours — et votre batterie durera deux fois plus longtemps en années.</p>
<p>Une batterie annoncée à 6 000 cycles, vidée chaque nuit, cela fait 365 cycles par an,
soit seize ans de nuits. Une batterie annoncée à 600 cycles, dans le même usage, tient un
peu plus d'un an et demi. C'est pour cela qu'on ne compare jamais deux batteries sur leur
prix d'achat.</p>
<div class="encadre">
<h3>Attention au raisonnement inverse</h3>
<p style="margin:0">Cycler moins souvent ne fait pas durer indéfiniment : une batterie
vieillit aussi en restant chargée, sans rien faire. Au bout d'un certain nombre d'années,
c'est l'âge qui décide, plus l'usure. L'outil de la page d'accueil affiche les deux, et
vous dit lequel des deux tombe en premier dans votre cas.</p>
</div>

<h2>Ce que la chaleur fait à chaque type de batterie</h2>
<p>C'est le point que presque personne ne dit aux clients, et c'est celui qui compte le
plus sous notre climat.</p>
<p>Le plomb suit une règle connue depuis toujours : sa durée de vie est <b>divisée par
deux</b> pour chaque tranche de dix degrés au-dessus de 25 °C. Un local maçonné et ventilé
n'est pas le même monde qu'un cagibi fermé sous tôle, où l'on dépasse allègrement 35 °C
toute la journée. Entre les deux, on parle du simple au double sur la durée de vie.</p>
<p>Le lithium souffre aussi de la chaleur — nous refusons de prétendre le contraire — mais
il en souffre moins, et il part de beaucoup plus haut.</p>
<div class="vert">
<p style="margin:0"><b>Ce qui ne coûte rien et change tout :</b> mettez les batteries dans
un endroit <b>aéré</b> et à l'ombre. Pas dans un placard fermé, pas contre un mur exposé
au soleil, pas collées les unes aux autres. C'est la décision la moins chère de toute
l'installation et l'une des plus rentables.</p>
</div>

<h2>Combien de fois vous rachèterez chaque batterie</h2>
<p>C'est la question qui décide vraiment, et c'est celle qu'on ne pose jamais au moment de
l'achat.</p>
<p>Pour sortir la même énergie chaque nuit, il faut <b>deux fois plus</b> de plomb que de
lithium — parce qu'on ne descend pas une batterie plomb en dessous de la moitié sans la
détruire. Ensuite, on la remplace beaucoup plus souvent. Sur une même durée, le compte de
parcs achetés n'est pas du tout le même.</p>
<p>Plutôt que de vous donner notre chiffre, nous vous donnons l'outil : il calcule tout —
capacité à acheter, poids du parc, cycles tenus à la température de <b>votre</b> local,
durée avant remplacement et nombre de rachats. Et vous pouvez régler vous-même l'écart de
prix entre lithium et plomb, pour ne pas avoir à nous croire sur parole.</p>
<div class="liens">
  <a href="/#batteries">Le comparateur de batteries<span>Vos chiffres, votre local, votre écart de prix — la conclusion suit le calcul</span></a>
</div>

<h2>Ce qu'on peut dire de chacune, honnêtement</h2>

<h3>Lithium LiFePO₄ — notre marque</h3>
<p><b>Pour :</b> on en sort 90 % au lieu de 50 %, elle tient dix à quinze fois plus de
cycles que le plomb ouvert, elle est cinq à six fois plus légère à capacité utile égale,
elle se recharge vite, elle ne craint pas de rester à moitié chargée, et elle ne demande
aucun entretien.</p>
<p><b>Contre :</b> deux à trois fois plus chère à l'achat — c'est le vrai obstacle, et
nous ne le minimisons pas. Elle demande un onduleur 48 V : le 12 V et le 24 V ne
conviennent pas. Et elle ne se répare pas : une cellule morte, c'est le module à changer.</p>

<h3>Plomb GEL</h3>
<p><b>Pour :</b> nettement moins chère à l'achat, aucun entretien, étanche — donc pas de
vapeur d'acide dans le local — et elle fonctionne avec les onduleurs 12 V et 24 V les plus
courants. On la trouve partout.</p>
<p><b>Contre :</b> la moitié seulement de sa capacité est utilisable, une tension de charge
trop haute la tue en quelques semaines, elle est trois fois plus lourde à capacité utile
égale, et elle se recharge lentement.</p>

<h3>Plomb ouvert (à bouchons)</h3>
<p><b>Pour :</b> la moins chère à l'achat, de loin, et on la trouve dans n'importe quelle
ville. Une eau refaite à temps rattrape parfois une charge ratée.</p>
<p><b>Contre :</b> c'est celle qui meurt le plus vite en usage solaire quotidien. Le niveau
d'eau est à refaire, et une seule fois oubliée peut suffire à la perdre — à 35 °C l'eau
part deux fois plus vite qu'à 25 °C. Elle dégage de l'hydrogène en fin de charge : le
local doit être ventilé, ce n'est pas une recommandation de confort. Et c'est elle qui
demande le plus de panneaux, parce que son rendement est le plus faible.</p>

${RAPPEL_CONTREFACON}

<h2>Nos batteries lithium</h2>
<div class="vert">
<p><b>Le lithium dont parle cette page, c'est le nôtre.</b> Les batteries et les onduleurs
Laouni sont notre propre marque — nous ne revendons pas ce que nous n'assumons pas, et
nous le disons franchement plutôt que de laisser croire à un conseil désintéressé.</p>
<ul style="margin-bottom:0">
  <li><b>Un code-barres sur chaque batterie</b>, que vous vérifiez vous-même sur la page
      d'accueil. Sur un marché où circulent des batteries reconditionnées vendues pour
      neuves, c'est la seule preuve qui vaut quelque chose.</li>
  <li><b>Trois magasins où nous retrouver</b> — Conakry, Labé, Lelouma. Un vendeur du
      marché disparaît ; un magasin, non.</li>
  <li><b>Nous posons aussi</b> : le calcul, le câblage, les protections et la mise en
      service. La garantie reste entière.</li>
</ul>
</div>
<p>C'est aussi pour cela que le comparateur vous laisse régler l'écart de prix vous-même :
si le lithium cesse d'être le meilleur choix avec vos chiffres, l'outil vous le dira.</p>

<a class="wa" href="${wa('Bonjour, je voudrais savoir quelle batterie choisir. Voici ce que je veux faire marcher la nuit : ')}" rel="noopener">
  Demander conseil sur WhatsApp
  <small>Dites-nous ce qui tourne la nuit et où seront posées les batteries</small>
</a>`,
});

// ──────────────────── les grandes marques mondiales ────────────────────
//
// Page de reference volontairement NEUTRE : ni Laouni ni aucun magasin
// guineen n y figure. Elle sert a reconnaitre un materiel dont la fiche
// existe vraiment, et a comprendre qui fait quoi — fabriquer les cellules,
// assembler la batterie et fabriquer l onduleur sont trois metiers.

// ─────────────── les marques les plus copiees ───────────────
//
// La page n est PAS la pour recommander ces marques. Elle est la parce que
// ce sont les quatre noms les plus copies du marche du panneau solaire :
// les connaitre, c est savoir reconnaitre le moment ou on essaie de vous en
// vendre une fausse.
//
// Le meme avertissement est repris mot pour mot ailleurs sur le site. Ecrit
// une fois ici, il ne peut pas se contredire d une page a l autre.

// Trois metiers, trois listes. Ce ne sont pas les memes fabricants, et un
// vendeur qui melange les trois ne sait pas de quoi il parle.
//
// Cote PANNEAUX, seuls les quatre les plus imites sont retenus : une liste
// plus longue diluerait l avertissement sur la contrefacon.
const MARQUES = [
  {
    famille: 'Panneaux solaires — les quatre plus copiés',
    intro:
      'Parmi les plus grands fabricants mondiaux de modules. Leur nom se vend tout seul : c\'est exactement ce qui en fait des cibles.',
    liste: [
      ['LONGi', 'Chine', 'Parmi les tout premiers fabricants mondiaux de modules et de plaquettes de silicium.'],
      ['JinkoSolar', 'Chine', 'Autre géant du module solaire, présent sur tous les continents.'],
      ['Trina Solar', 'Chine', 'Fabricant historique de modules, très largement diffusé.'],
      ['Canadian Solar', 'Canada / Chine', 'Fabricant de modules bien implanté à l\'international.'],
    ],
  },
  {
    famille: 'Onduleurs et onduleurs hybrides',
    intro:
      'La pièce qui transforme le courant continu des panneaux et des batteries en courant utilisable, et qui bascule quand le réseau part.',
    liste: [
      ['Huawei', 'Chine', 'L\'un des deux plus gros fabricants mondiaux d\'onduleurs solaires. Gamme FusionSolar, du résidentiel aux grandes centrales.'],
      ['Sungrow', 'Chine', 'L\'autre géant mondial de l\'onduleur, présent du toit de maison à la centrale au sol.'],
      ['Deye', 'Chine', 'Devenu une référence de l\'onduleur HYBRIDE — celui qui gère à la fois les panneaux, les batteries et le réseau. Très répandu dans les installations africaines hors réseau ou à réseau instable.'],
      ['Growatt', 'Chine', 'Très présent sur le résidentiel et l\'hybride, avec une large gamme de petites et moyennes puissances. Une des marques les plus vues en Afrique de l\'Ouest.'],
      ['SMA', 'Allemagne', 'Le fabricant historique de l\'onduleur solaire, référence de longévité et de documentation technique. Gammes Sunny Boy et Sunny Island.'],
      ['Fronius', 'Autriche', 'Fabricant européen reconnu pour sa qualité de fabrication et le suivi des installations.'],
    ],
  },
  {
    famille: 'Cellules et batteries lithium',
    intro:
      'Attention à la distinction : certains fabriquent les CELLULES, d\'autres assemblent des batteries à partir de cellules achetées. Ce ne sont pas les mêmes chiffres.',
    liste: [
      ['CATL', 'Chine', 'Le plus gros fabricant mondial de cellules de batteries, tous usages confondus.'],
      ['BYD', 'Chine', 'Fabricant de cellules et de systèmes de stockage complets.'],
      ['EVE Energy', 'Chine', 'Fabricant de cellules prismatiques LiFePO₄, dont les références servent de base à une grande partie du stockage solaire.'],
      ['Pylontech', 'Chine', 'Spécialiste des batteries lithium en rack pour le stockage résidentiel.'],
      ['Victron Energy', 'Pays-Bas', 'Référence de l\'installation hors réseau : onduleurs-chargeurs, régulateurs, batteries et supervision. Documentation technique très complète, souvent citée par les installateurs.'],
    ],
  },
];

PAGES.push({
  fichier: 'grandes-marques-solaire',
  title: 'Grandes marques du solaire : qui fabrique quoi',
  description:
    'LONGi, Jinko, Deye, Growatt, Huawei, CATL, Victron : qui fabrique quoi. Et pourquoi un prix cassé sur une grande marque doit vous alerter.',
  h1: 'Les grandes marques du solaire : qui fabrique quoi, et gare aux copies',
  corps: `
<p class="chapeau">Les fabricants mondiaux de référence, par métier : panneaux, onduleurs,
cellules et batteries. Ce sont aussi les noms les plus <b>copiés</b> du marché — les
connaître sert à reconnaître un matériel dont la fiche technique existe vraiment, et à
repérer le moment où l'on essaie de vous en vendre une fausse. Aucun magasin guinéen n'y
figure, le nôtre compris.</p>

${CONTREFACON}

${MARQUES.map((f) => `
<h2>${f.famille}</h2>
<p>${f.intro}</p>
${f.liste.map(([nom, pays, quoi]) => `<div class="encadre" style="margin:.7rem 0">
  <h3 style="margin-top:0">${nom} <span style="font-weight:400;font-size:.8rem;color:#64748b">— ${pays}</span></h3>
  <p style="margin-bottom:0">${quoi}</p>
</div>`).join('\n')}`).join('\n')}

<h2>Trois métiers, à ne pas confondre</h2>
<p>Fabriquer les cellules, assembler la batterie et fabriquer l'onduleur sont trois
métiers différents. Un vendeur qui les mélange ne sait pas de quoi il parle — et un
assembleur qui annonce les cycles de la cellule nue oublie qu'un parc meurt avec sa
cellule la plus faible.</p>

<h2>Comment se protéger, concrètement</h2>
<ul>
  <li><b>Méfiez-vous du prix trop bas.</b> C'est le premier signal, et le plus fiable. Un
      fabricant mondial ne brade pas sa production.</li>
  <li><b>Demandez la fiche technique du modèle exact</b>, avec sa référence. Un vendeur
      sérieux l'a ; un revendeur de copies change de sujet.</li>
  <li><b>Vérifiez que la puissance annoncée correspond à la taille du panneau.</b> Une
      copie annonce souvent une puissance que sa surface ne peut pas produire.</li>
  <li><b>Demandez qui assure la garantie, et pendant combien de temps.</b> Une garantie de
      fabricant qu'aucun magasin local n'applique ne vaut rien.</li>
  <li><b>Préférez un vendeur que vous pouvez retrouver.</b> Un magasin avec une adresse
      répond de ce qu'il vend ; un étal disparaît.</li>
</ul>

<h2>La question à poser, quelle que soit la marque</h2>
<div class="vert">
<p style="margin:0">Demandez les <b>conditions de mesure</b>. Un nombre de cycles ne veut
rien dire sans la profondeur de décharge, la température et le critère de fin de vie.
« 6 000 cycles » mesurés à décharge complète sur une cellule sous presse, et
« 600 cycles » mesurés à moitié de décharge sur une batterie complète, ne se comparent
pas — et c'est exactement là que se cachent les écarts.</p>
</div>
<p>C'est pour cette raison que nos propres écrans de calcul affichent la condition à côté
de chaque chiffre. Posez-nous la question aussi.</p>
<div class="liens">
  <a href="/batterie-lithium-gel-ou-acide/">Lithium, GEL ou acide : laquelle dure vraiment<span>Chaque chiffre y est donné avec sa condition de mesure</span></a>
  <a href="/prix-solaire-conakry/">Ce qui fait le prix d'une installation<span>Et comment reconnaître un devis truqué</span></a>
</div>`,
});

// ─────────────────── bien choisir ses panneaux ───────────────────

PAGES.push({
  fichier: 'choisir-panneau-solaire',
  title: 'Bien choisir ses panneaux solaires en Guinée',
  description:
    'Grade A ou grade B, double face ou simple face, noir ou bleu : ce que l\'étiquette ne dit pas, et ce qui change vraiment sous le soleil guinéen.',
  h1: 'Bien choisir ses panneaux solaires : ce que l\'étiquette ne dit pas',
  corps: `
<p class="chapeau">Deux panneaux marqués « 550 W » peuvent produire très différemment sous
le soleil de Guinée, et vieillir encore plus différemment. Quatre choses décident, et
aucune n'est écrite en gros sur l'emballage.</p>

<h2>1. Grade A ou grade B : la qualité des cellules</h2>
<p>À la sortie de l'usine, les cellules sont triées. Celles qui passent tous les contrôles
sont dites de <b>grade A</b> ; celles qui ont un défaut sont écartées et revendues moins
cher — c'est ce qu'on appelle le <b>grade B</b>.</p>
<table>
  <tr><th></th><th>Grade A</th><th>Grade B</th></tr>
  <tr><td>Aspect</td><td>Couleur uniforme, aucun éclat</td><td>Nuances, coins ébréchés, micro-fissures</td></tr>
  <tr><td>Puissance réelle</td><td>Conforme à l'étiquette</td><td>Souvent en dessous</td></tr>
  <tr><td>Vieillissement</td><td>Perte lente et régulière</td><td>Plus rapide, les fissures s'agrandissent</td></tr>
  <tr><td>Garantie</td><td>Écrite, 20 à 25 ans</td><td>Souvent aucune</td></tr>
</table>

<div class="alerte">
<h3 style="margin-top:0">Pourquoi une seule mauvaise cellule coûte cher</h3>
<p style="margin-bottom:0">Dans un panneau, les cellules sont branchées à la suite, comme
les wagons d'un train. Le courant qui traverse l'ensemble est celui que laisse passer la
<b>plus faible</b>. Une cellule de grade B au milieu de cellules correctes ne coûte pas un
peu de production : elle plafonne tout le panneau.</p>
</div>

<div class="encadre">
<h3 style="margin-top:0">Le piège : « grade A » n'est pas une norme</h3>
<p>Aucune règle internationale ne définit ce mot, et personne ne contrôle qui l'écrit sur
un carton. Un vendeur peut l'imprimer sans mentir légalement.</p>
<p style="margin-bottom:0">Ce qui vaut vraiment : <b>la fiche technique du modèle exact</b>,
<b>la garantie écrite avec le nom de celui qui l'applique</b>, et un prix cohérent avec le
marché. Un panneau « grade A » à moitié prix n'est pas de grade A.</p>
</div>

<h2>2. Face simple ou double face</h2>
<p>Un panneau simple face ne produit que par l'avant : son dos est une feuille opaque. Un
panneau double face est en verre des deux côtés, et capte aussi la lumière qui remonte du
sol.</p>
<table>
  <tr><th></th><th>Double face</th><th>Simple face</th></tr>
  <tr><td>Production</td><td>+5 à 15 % — mais seulement bien posé</td><td>Ce qui est écrit sur l'étiquette</td></tr>
  <tr><td>Ce qu'il lui faut</td><td>De la hauteur, un sol clair</td><td>Rien de particulier</td></tr>
  <tr><td>Solidité</td><td>Verre des deux côtés</td><td>Feuille arrière, plus sensible</td></tr>
  <tr><td>Poids</td><td>Plus lourd</td><td>Plus léger</td></tr>
</table>
<div class="alerte">
<p style="margin:0"><b>Le gain de la double face se perd très facilement.</b> Posé à plat
contre une tôle sombre, un panneau double face ne rapporte presque rien de plus qu'un
simple face — vous avez payé un dos vitré pour rien. Il lui faut de l'espace derrière et
une surface claire en dessous : ciment clair, gravier blanc, tôle claire. C'est la pose qui
décide, pas le panneau.</p>
</div>

<h2>3. Noir, bleu, ou plein de traits blancs</h2>
<p>Attention à ne pas confondre deux choses différentes : la couleur des <b>cellules</b>,
qui dit la technologie et décide du rendement — et la couleur du <b>fond</b>, qui ne joue
que sur la chaleur.</p>
<div class="vert">
<h3 style="margin-top:0">C'est la cellule qui décide du rendement</h3>
<p style="margin-bottom:0">Cellules <b>noires</b> = monocristallin. Cellules <b>bleues et
mouchetées</b> = polycristallin, une technologie plus ancienne. L'écart entre les deux est
important : à surface de toit égale, le monocristallin donne nettement plus de watts. Un
panneau tout noir est monocristallin — <b>son rendement est donc élevé</b>, et bien
meilleur que celui d'un bleu.</p>
</div>
<div class="vert">
<h3 style="margin-top:0">Cellules noires, fond blanc — le meilleur choix ici</h3>
<p style="margin-bottom:0">Cellules monocristallines sur un fond blanc qu'on voit entre
elles. Excellent rendement, et le fond clair renvoie une partie de la chaleur : le panneau
travaille quelques degrés plus frais. C'est la combinaison qui produit le plus sous un
climat chaud.</p>
</div>
<div class="encadre">
<h3 style="margin-top:0">Tout noir (full black)</h3>
<p style="margin-bottom:0">Cellules noires ET fond noir ET cadre noir. Mêmes cellules
monocristallines, donc <b>un très bon rendement lui aussi</b> — nettement meilleur qu'un
panneau bleu. Face au même modèle à fond blanc, il est en général donné pour quelques watts
de moins et chauffe un peu plus. L'écart est petit, mais il travaille toute l'année sous
notre soleil.</p>
</div>
<div class="encadre">
<h3 style="margin-top:0">Cellules bleues (polycristallin)</h3>
<p style="margin-bottom:0">Aspect bleuté et moucheté, technologie plus ancienne. C'est ici
que l'écart est vraiment important : rendement nettement plus faible, il faut donc plus de
surface de toit pour la même puissance. Encore très vendu parce que moins cher à
produire.</p>
</div>
<p><b>Le fond noir, ce que ça change vraiment :</b> un panneau chaud produit moins, environ
0,4 % de perte par degré au-dessus de 25 °C, et sous notre soleil un module monte
facilement à 60 °C. Le fond blanc renvoie une partie de la lumière et de la chaleur, le
fond noir les absorbe — c'est pourquoi les fabricants donnent souvent leur version tout
noir pour quelques watts de moins que la même en fond blanc.</p>
<p>Mais c'est un écart de quelques pour cent <b>entre deux bons panneaux</b>, sans commune
mesure avec l'écart entre monocristallin et polycristallin. <b>Ne refusez jamais un tout
noir pour prendre un bleu</b> : vous y perdriez beaucoup plus.</p>

<h2>4. Les traits fins sur les cellules</h2>
<p>Ce sont les <b>barres</b> qui ramassent le courant produit par la cellule. À ne pas
confondre avec le blanc du fond, qui se voit entre les cellules.</p>
<p>Les anciens panneaux en avaient 3 ou 4, larges. Les récents en ont 9, 12 ou davantage,
très fines. Plus il y en a, plus le courant a de chemins pour sortir :</p>
<ul>
  <li>moins de perte en chaleur dans le panneau lui-même, le trajet du courant est plus
      court ;</li>
  <li>une micro-fissure coupe moins de chemins : le panneau continue de produire là où un
      modèle à 3 barres aurait perdu tout un morceau ;</li>
  <li>moins d'ombre portée par les barres elles-mêmes, puisqu'elles sont plus fines.</li>
</ul>
<p>Beaucoup de traits fins n'est donc pas un défaut d'aspect : <b>c'est le signe d'un
panneau de conception récente</b>.</p>

<h2>Ce qu'il faut retenir</h2>
<ul>
  <li>Cellules <b>noires</b> plutôt que bleues : c'est le choix qui compte le plus. Bien
      plus de watts sur la même surface de toit — et un tout noir en fait partie.</li>
  <li>À modèle égal, fond <b>blanc</b> plutôt que fond noir : quelques watts et quelques
      degrés de mieux. Mais c'est un détail à côté du point précédent.</li>
  <li>Beaucoup de <b>barres fines</b> plutôt que trois larges.</li>
  <li><b>Double face</b> uniquement si vous pouvez le poser en hauteur au-dessus d'une
      surface claire. Sinon, gardez votre argent.</li>
  <li>La <b>garantie écrite</b> et la <b>fiche technique</b> valent plus que le mot
      « grade A » imprimé sur un carton.</li>
</ul>

${RAPPEL_CONTREFACON}

<div class="liens">
  <a href="/grandes-marques-solaire/">Les grandes marques du solaire<span>Qui fabrique quoi, et comment ne pas acheter une copie</span></a>
  <a href="/batterie-lithium-gel-ou-acide/">Lithium, GEL ou acide : laquelle dure vraiment<span>Le même travail, côté batteries</span></a>
  <a href="/#simulation">Le simulateur d'installation<span>Combien de panneaux pour vos appareils</span></a>
</div>`,
});

// ─────────────────── comment ces calculs sont faits ───────────────────

PAGES.push({
  fichier: 'nos-methodes-de-calcul',
  title: 'Comment nos calculs sont faits — normes suivies',
  description:
    'Qui a conçu ces outils, sur quelles normes internationales ils reposent, et quoi faire si un résultat contredit ce que vous constatez sur le terrain.',
  h1: 'Comment ces calculs sont faits, et sur quelles normes',
  corps: `
<p class="chapeau">Ce site et notre application ont été conçus par des professionnels du
génie informatique, avec les électriciens du magasin. Chaque écran de calcul applique des
formules écrites, testées et vérifiables — pas des ordres de grandeur choisis au jugé.</p>

<h2>Sur quelles normes</h2>
<p>Les calculs suivent des normes et des références internationales, nommées à l'écran
chaque fois que c'est utile pour que vous puissiez les retrouver.</p>
<h3>NF C 15-100 — installations électriques basse tension</h3>
<p>Sections de câble, calibres de disjoncteur, courants admissibles, correction en
température et en groupement de conducteurs, courbes B, C et D. C'est la référence des
calculs de chantier.</p>
<h3>Fiches techniques des fabricants de cellules et de batteries</h3>
<p>Profondeur de décharge admissible, nombre de cycles, rendement aller-retour, courant de
charge. Chaque chiffre est affiché avec la condition dans laquelle il a été mesuré — sans
elle, un nombre de cycles ne veut rien dire.</p>
<h3>La règle des 10 °C pour le vieillissement du plomb</h3>
<p>Admise depuis toujours : la durée de vie à l'arrêt est divisée par deux pour chaque
tranche de dix degrés au-dessus de 25 °C. Elle est mesurée batterie maintenue chargée —
c'est pourquoi nous ne l'appliquons pas telle quelle au nombre de cycles.</p>
<h3>Heures de plein soleil, et non durée du jour</h3>
<p>Le dimensionnement retient 5 heures équivalentes plein soleil pour la Guinée, pas les
douze heures de clarté. C'est la seule base qui donne un parc qui tient réellement la
nuit.</p>
<h3>Sécurité : hydrogène, ventilation et mise à la terre</h3>
<p>Les batteries ouvertes dégagent de l'hydrogène en fin de charge et imposent un local
ventilé. Les cadres de panneaux se raccordent au piquet de terre. Ce ne sont pas des
recommandations de confort.</p>

<h2>Si un résultat contredit ce que vous savez</h2>
<div class="encadre">
<p>Ces normes sont internationales. Elles sont écrites ailleurs, à partir de mesures faites
ailleurs, et sur du matériel qui n'est pas toujours celui qui se vend ici.</p>
<p>Le terrain guinéen a ses raisons : le matériel réellement disponible, la chaleur des
locaux, la poussière de l'harmattan, les coupures qui font redémarrer un onduleur dix fois
par jour, les habitudes d'atelier. Un électricien qui pose depuis quinze ans à Conakry
sait des choses qu'aucune norme n'écrit.</p>
<p style="margin-bottom:0"><b>Alors si un chiffre ne correspond pas à ce que vous
constatez, ne le mettez pas de côté : dites-le-nous.</b> Nous ne partons pas du principe
que la norme a toujours raison contre l'expérience — nous vérifions, et nous corrigeons.</p>
</div>
<p>Ce n'est pas une formule de politesse : plusieurs chiffres de nos outils ont déjà été
corrigés parce qu'ils ne tenaient pas devant le terrain — la consommation réelle d'une
moto, le poids d'une batterie plomb, la durée de vie d'un parc dans un local chaud.</p>

<a class="wa" href="${wa('Bonjour, dans vos outils de calcul un résultat ne correspond pas à ce que je constate sur le terrain. Voici lequel, et ce que je vois en réalité : ')}" rel="noopener">
  Nous signaler un écart
  <small>Dites-nous quel calcul, et ce que vous constatez en réalité</small>
</a>

<h2>Où sont les outils</h2>
<div class="liens">
  <a href="/#simulation">Le simulateur d'installation<span>Cochez vos appareils, il calcule panneaux, batterie et onduleur</span></a>
  <a href="/#autonomie">Ma batterie tient combien de temps ?<span>Selon ce qui tourne la nuit</span></a>
  <a href="/#batteries">Lithium, GEL ou acide ?<span>Durée, poids, rachats — avec les conditions de mesure</span></a>
  <a href="/grandes-marques-solaire/">Les grandes marques du solaire<span>Qui fabrique quoi, et comment ne pas acheter une copie</span></a>
</div>`,
});

// ─────────────────────────────── écriture ───────────────────────────────

let ecrites = 0;
for (const p of PAGES) {
  const dossier = path.join(RACINE, p.fichier);
  fs.mkdirSync(dossier, { recursive: true });
  const html = page(p);
  fs.writeFileSync(path.join(dossier, 'index.html'), html, 'utf8');
  ecrites++;
  const mots = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;
  console.log(
    `  /${p.fichier}/`.padEnd(38) +
      `${String(mots).padStart(4)} mots   title ${p.title.length} car.   descr ${p.description.length} car.`
  );
}

// ─────────────────────────────── plan du site ───────────────────────────────

const aujourdhui = process.env.DATE_PUBLICATION || new Date().toISOString().slice(0, 10);
const urls = [
  { loc: `${SITE}/`, prio: '1.0', freq: 'weekly' },
  ...PAGES.map((p) => ({ loc: `${SITE}/${p.fichier}/`, prio: '0.8', freq: 'monthly' })),
];

fs.writeFileSync(
  path.join(RACINE, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${aujourdhui}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.prio}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`,
  'utf8'
);

console.log(`\n${ecrites} pages écrites, sitemap.xml à ${urls.length} adresses.`);
