# Ce dossier

## `faire-les-pages.js`

Fabrique les huit pages de destination du site (magasins, délestage, pannes,
comparaisons, prix) à partir d'un seul gabarit.

```bash
node outils/faire-les-pages.js
```

Il réécrit les huit dossiers de pages **et** `sitemap.xml`.

Les coordonnées des trois magasins — adresse, téléphone, horaires — sont
écrites **une seule fois**, en haut du fichier. C'est toute la raison d'être
du générateur : écrites huit fois, elles auraient divergé au premier
changement de numéro, et on aurait corrigé six fichiers sur huit sans jamais
savoir lesquels manquaient.

Règles que ces pages ne violent jamais :

- aucune balise `<script>`, aucun appel à la base — du texte figé ne peut
  pas se casser ni devenir faux tout seul ;
- aucun prix, nulle part ;
- aucun calculateur recopié : une copie du simulateur diverge de l'original
  en six mois. Les pages expliquent et renvoient vers l'outil de l'accueil ;
- un seul `h1` par page, et une adresse canonique qui pointe sur elle-même.

## `../vercel.json`

**Ne jamais y mettre de commentaire.** Vercel valide ce fichier contre un
schéma strict et refuse toute clé qu'il ne connaît pas — y compris une clé
`"//"` utilisée comme commentaire. Le déploiement échoue alors en silence :
le site continue de servir l'ancienne version, et rien n'indique pourquoi.
C'est arrivé le 23 août 2026, et les huit pages sont restées en 404 pendant
qu'on croyait le site à jour.

Ce que ce fichier fait :

- `laouni-electricite.vercel.app` redirige en 308 vers le domaine du client,
  pour que Google ne voie pas deux sites identiques ;
- `index.html` n'est jamais gardé en cache, pour que les mises à jour
  arrivent tout de suite ;
- les images et icônes sont gardées un an — elles ne changent jamais, et
  chaque téléchargement évité compte sur une connexion guinéenne.

Le domaine sans `www` redirige déjà tout seul : Vercel s'en charge, il n'y a
rien à ajouter pour lui.
