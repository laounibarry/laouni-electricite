-- QUI PEUT SE CONNECTER À L'ESPACE ADMIN
--
-- Ce fichier ne fait QUE regarder. Il ne modifie rien.
-- Copiez tout, collez dans Supabase → SQL Editor, puis Run.

select
  split_part(email, '@', 1)   as identifiant_a_taper,
  case when raw_user_meta_data->>'code' is null
       then 'pas de code enregistré'
       else raw_user_meta_data->>'code' end as code_enregistre,
  case when last_sign_in_at is null
       then 'JAMAIS CONNECTÉ'
       else to_char(last_sign_in_at, 'DD/MM/YYYY à HH24:MI') end as derniere_connexion,
  to_char(created_at, 'DD/MM/YYYY') as compte_cree_le
from auth.users
where email like '%@laouni.interne'
order by email;

-- Ce que vous devez voir : une ligne « admin », et une ligne par magasin.
--
-- Si « admin » n'apparaît PAS, le compte n'existe pas : dites-le moi, je
-- vous prépare la ligne pour le créer.
--
-- Si une ligne dit « JAMAIS CONNECTÉ », c'est que personne n'a encore
-- utilisé ce compte — ce n'est pas une erreur.
