-- URGENT — Le domaine enregistré dans les réglages est un domaine parqué.
--
-- La base contient : laouni-electricite-moderne.com
-- Ce domaine affiche « Parked Domain name on Hostinger DNS system » — ce
-- n'est pas votre site.
--
-- Or c'est CE domaine qui est gravé dans les QR codes que vous imprimez sur
-- vos produits. Un client qui scanne une étiquette pour vérifier que son
-- onduleur est authentique tombe donc sur une page vide.
--
-- Votre vrai domaine est laouni-electricitemoderne.com (sans tiret entre
-- « electricite » et « moderne »). Vérifié : il répond et affiche le site.
--
-- À coller dans Supabase → SQL Editor → Run.

-- Ce qu'il y a avant
select data->>'domain' as domaine_avant
from public.site_config where id = 'main';

-- La correction
update public.site_config
set data = jsonb_set(data::jsonb, '{domain}', '"laouni-electricitemoderne.com"'),
    updated_at = now()
where id = 'main';

-- Vérification : doit afficher laouni-electricitemoderne.com
select data->>'domain' as domaine_apres
from public.site_config where id = 'main';

-- ATTENTION : les étiquettes DÉJÀ IMPRIMÉES portent l'ancien domaine.
-- Elles continueront de mener à la page parquée. Deux solutions :
--   1. réimprimer les étiquettes concernées, ou
--   2. faire rediriger laouni-electricite-moderne.com vers votre vrai site
--      (à faire chez Hostinger, là où ce domaine est enregistré).
-- La solution 2 est la plus sûre : elle rattrape tout ce qui circule déjà.
