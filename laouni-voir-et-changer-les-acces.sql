-- Vos accès à l'espace vendeur : les voir, et changer un mot de passe.
--
-- À coller dans Supabase → SQL Editor → Run.
-- Vous pouvez lancer la partie 1 seule, pour regarder sans rien changer.

-- ─────────────────────────────────────────────────────────────
-- 1. QUI PEUT SE CONNECTER
--
-- L'identifiant que vous tapez dans l'application (admin, MGC, MGL…) est
-- traduit en adresse interne « identifiant@laouni.interne ». C'est cette
-- adresse que Supabase connaît. Vous ne la tapez jamais.
-- ─────────────────────────────────────────────────────────────

select
  split_part(email, '@', 1) as identifiant_a_taper,
  email                     as adresse_interne,
  raw_user_meta_data->>'code' as code_enregistre,
  case when last_sign_in_at is null
       then 'jamais connecté'
       else to_char(last_sign_in_at, 'DD/MM/YYYY à HH24:MI') end as derniere_connexion,
  to_char(created_at, 'DD/MM/YYYY') as cree_le
from auth.users
where email like '%@laouni.interne'
order by email;

-- ─────────────────────────────────────────────────────────────
-- 2. CHANGER UN MOT DE PASSE
--
-- Remplacez les deux valeurs entre guillemets, puis lancez.
-- L'identifiant s'écrit en MINUSCULES ici, même si vous le tapez en
-- majuscules dans l'application.
--
-- Choisissez un vrai mot de passe : les anciens (Laouni2024!, conakry2024,
-- labe2024, lelouma2024) ont été lisibles publiquement dans le code du site.
-- Toute personne qui a visité le site a pu les lire.
-- ─────────────────────────────────────────────────────────────

update auth.users
set encrypted_password = crypt('METTEZ_ICI_LE_NOUVEAU_MOT_DE_PASSE', gen_salt('bf')),
    updated_at = now()
where email = 'admin@laouni.interne';   -- <— l'identifiant, en minuscules

-- Vérification : doit renvoyer 1 ligne avec une date de modification d'aujourd'hui
select split_part(email, '@', 1) as identifiant,
       to_char(updated_at, 'DD/MM/YYYY à HH24:MI') as modifie_le
from auth.users
where email = 'admin@laouni.interne';

-- ─────────────────────────────────────────────────────────────
-- 3. SI UN COMPTE MANQUE
--
-- La fiche d'un magasin (onglet Gérer → Magasins) ne crée PAS le compte de
-- connexion : ce sont deux choses séparées, exprès. Dites-moi quel magasin
-- a besoin d'un accès et je vous prépare la ligne à coller.
-- ─────────────────────────────────────────────────────────────

-- Pour info, les magasins enregistrés et leur identifiant :
select name as magasin, code as identifiant, actif
from public.magasins
order by name;
