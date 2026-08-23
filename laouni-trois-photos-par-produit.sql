-- TROIS PHOTOS PAR PRODUIT
--
-- Ce fichier ajoute deux colonnes. Il ne supprime rien et ne touche à aucune
-- de vos photos existantes : la première photo reste où elle est.
--
-- Copiez tout, collez dans Supabase → SQL Editor, puis Run.

alter table public.produits
  add column if not exists photo2 text,
  add column if not exists photo3 text;

-- Vérification : doit afficher « ✅ »
select case when (
         select count(*) from information_schema.columns
         where table_schema = 'public'
           and table_name   = 'produits'
           and column_name in ('photo','photo2','photo3')
       ) = 3
       then '✅ les trois emplacements photo existent'
       else '❌ il manque une colonne' end as resultat;

-- Combien de produits ont déjà une photo
select
  count(*)                                           as produits,
  count(*) filter (where coalesce(photo, '')  <> '') as avec_photo_1,
  count(*) filter (where coalesce(photo2, '') <> '') as avec_photo_2,
  count(*) filter (where coalesce(photo3, '') <> '') as avec_photo_3
from public.produits;

-- Note : le site public n'affiche que la première photo. C'est voulu —
-- l'ajouter aux trois emplacements alourdirait le catalogue sur une
-- connexion faible. L'application, elle, les montre toutes les trois : le
-- client fait glisser du doigt.
