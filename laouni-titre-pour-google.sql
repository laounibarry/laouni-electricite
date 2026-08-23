-- ═══════════════════════════════════════════════════════════════════════
--  LAOUNI ÉLECTRICITÉ — LE TITRE DE LA PAGE D'ACCUEIL, POUR GOOGLE
--
--  À coller en entier dans Supabase → SQL Editor → Run.
--  Le fichier se vérifie lui-même : lisez le tableau affiché à la fin.
--  Le repasser deux fois ne casse rien.
--
--  POURQUOI CE FICHIER
--  Le grand titre de la page d'accueil disait :
--
--        L'ÉNERGIE
--        SOLAIRE
--        POUR TOUS
--
--  C'est le signal le plus fort de la page pour Google — et il ne désigne
--  ni un produit, ni un lieu. Personne ne tape « énergie solaire pour tous »
--  dans Google. On tape « énergie solaire Guinée », « panneau solaire
--  Conakry », « onduleur Conakry ».
--
--  Le titre devient :
--
--        L'ÉNERGIE SOLAIRE
--        EN GUINÉE
--        POUR TOUS
--
--  Votre slogan est conservé en entier. La deuxième ligne, qui répétait
--  simplement « SOLAIRE », porte maintenant le pays.
--
--  Ce texte est enregistré DANS LA BASE, pas dans le site : le corriger
--  seulement dans le fichier n'aurait servi à rien, la base l'aurait
--  réécrit au chargement de la page. C'est pour cela qu'il faut ce fichier.
--
--  Vous pouvez le remettre comme avant à tout moment : espace vendeur →
--  Site → Titre. Aucune donnée n'est perdue.
-- ═══════════════════════════════════════════════════════════════════════

update public.site_config
set data = jsonb_set(
      coalesce(data, '{}'::jsonb),
      '{heroT2}',
      '"EN GUINÉE"'::jsonb,
      true
    ),
    updated_at = now()
where id = 'main';

-- ═══════════════════════════════════════════════════════════════════════
--  VÉRIFICATION — c'est ce tableau qui compte, pas le message « Success »
-- ═══════════════════════════════════════════════════════════════════════
select
  'Ligne 1 du titre (dans le site)' as "Ce qui est vérifié",
  'L''ÉNERGIE SOLAIRE'              as "Résultat"

union all select
  'Ligne 2 du titre (dans la base)',
  coalesce(data ->> 'heroT2', '(vide)')
from public.site_config where id = 'main'

union all select
  'Ligne 3 du titre (votre slogan)',
  coalesce(data ->> 'heroT3', '(vide)')
from public.site_config where id = 'main'

union all select
  'Le pays apparaît-il dans le titre ?',
  case when (select data ->> 'heroT2' from public.site_config where id = 'main')
            ilike '%guin%'
       then '✅ oui — Google voit « énergie solaire en Guinée »'
       else '❌ non — relancez le fichier'
  end

union all select
  'Le slogan est-il conservé ?',
  case when (select data ->> 'heroT3' from public.site_config where id = 'main')
            ilike '%tous%'
       then '✅ oui — « POUR TOUS » est intact'
       else '⚠️ à vérifier dans l''espace vendeur'
  end;
