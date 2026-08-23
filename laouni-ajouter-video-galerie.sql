-- AJOUTER LA VIDÉO À LA GALERIE
--
-- Ce fichier ajoute une colonne. Il ne supprime rien et ne modifie aucune
-- de vos photos existantes.
--
-- Copiez tout, collez dans Supabase → SQL Editor, puis Run.

-- Une colonne « video » qui contiendra le lien YouTube de la réalisation.
-- Elle reste vide pour toutes les photos déjà publiées.
alter table public.galerie
  add column if not exists video text;

-- Vérification : doit afficher « ✅ la colonne existe »
select case when exists (
         select 1 from information_schema.columns
         where table_schema = 'public'
           and table_name   = 'galerie'
           and column_name  = 'video')
       then '✅ la colonne video existe — l''application peut publier des vidéos'
       else '❌ la colonne n''a pas été créée' end as resultat;

-- Combien de photos et de vidéos vous avez aujourd'hui
select
  count(*)                                          as total,
  count(*) filter (where coalesce(video,'') <> '')  as avec_video,
  count(*) filter (where publie)                    as publiees
from public.galerie;
