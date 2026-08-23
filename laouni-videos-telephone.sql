-- ═══════════════════════════════════════════════════════════════════════
--  LAOUNI ÉLECTRICITÉ — POUVOIR ENVOYER UNE VIDÉO DEPUIS LE TÉLÉPHONE
--
--  À coller en entier dans Supabase → SQL Editor → Run.
--  Le fichier se vérifie lui-même : lisez le tableau affiché à la fin.
--  Le repasser deux fois ne casse rien.
--
--  POURQUOI CE FICHIER
--  Une vidéo ne peut pas être rangée dans une colonne de la base comme une
--  photo. Une photo de produit pèse 40 ko ; trente secondes filmées avec un
--  téléphone en pèsent 20 000. Mise dans une colonne, elle serait
--  retéléchargée en entier à chaque ouverture du catalogue, par chaque
--  client, sur un réseau guinéen.
--
--  Les vidéos vont donc dans le magasin de fichiers de Supabase, et la base
--  ne garde que l'adresse — quelques dizaines de caractères.
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. Le bac à vidéos ────────────────────────────────────────────────
--
-- « public = true » : n'importe quel client peut REGARDER une vidéo sans
-- compte. C'est le but — elles sont sur la vitrine. Publier n'est pas
-- ouvert : c'est la règle 3 plus bas qui décide qui peut envoyer.
--
-- La limite de 60 Mo est un garde-fou côté serveur : l'application refuse
-- déjà au-delà de 25 Mo, mais rien n'empêcherait quelqu'un d'appeler le
-- serveur directement.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'videos', 'videos', true, 62914560,
  array['video/mp4','video/quicktime','video/3gpp','video/3gpp2',
        'video/x-matroska','video/webm','video/x-msvideo']
)
on conflict (id) do update
  set public            = true,
      file_size_limit   = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ── 2. Qui peut REGARDER : tout le monde ──────────────────────────────
drop policy if exists "videos lecture publique" on storage.objects;
create policy "videos lecture publique"
  on storage.objects for select
  using (bucket_id = 'videos');

-- ── 3. Qui peut ENVOYER : uniquement un compte connecté ───────────────
--
-- C'est-à-dire vous et vos trois gérants. Un visiteur du site ne peut rien
-- déposer : sans cette règle, n'importe qui pourrait remplir votre stockage
-- avec n'importe quoi, et vous le payeriez.
drop policy if exists "videos envoi magasin" on storage.objects;
create policy "videos envoi magasin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'videos');

-- ── 4. Qui peut REMPLACER ou SUPPRIMER : un compte connecté ───────────
drop policy if exists "videos modification magasin" on storage.objects;
create policy "videos modification magasin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'videos')
  with check (bucket_id = 'videos');

drop policy if exists "videos suppression magasin" on storage.objects;
create policy "videos suppression magasin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'videos');

-- ── 5. La colonne qui garde l'adresse ─────────────────────────────────
--
-- Elle existe peut-être déjà : le fichier laouni-ajouter-video-galerie.sql
-- l'avait ajoutée. On la remet sans rien casser si elle est là.
alter table public.galerie add column if not exists video text;
alter table public.produits add column if not exists video text;

-- ═══════════════════════════════════════════════════════════════════════
--  VÉRIFICATION — c'est ce tableau qui compte, pas le message « Success »
-- ═══════════════════════════════════════════════════════════════════════
select
  'Le bac à vidéos' as "Ce qui est vérifié",
  case when exists (select 1 from storage.buckets where id = 'videos')
       then '✅ créé'
       else '❌ MANQUANT — relancez le fichier'
  end as "Résultat"

union all select
  'Ouvert à la lecture publique',
  case when exists (select 1 from storage.buckets where id = 'videos' and public)
       then '✅ oui — les clients peuvent regarder'
       else '❌ non — les clients verraient une erreur'
  end

union all select
  'Règles de sécurité posées',
  case when (select count(*) from pg_policies
             where schemaname = 'storage' and tablename = 'objects'
               and policyname like 'videos %') = 4
       then '✅ les 4 règles'
       else '⚠️ ' || (select count(*)::text from pg_policies
                      where schemaname = 'storage' and tablename = 'objects'
                        and policyname like 'videos %') || ' sur 4'
  end

union all select
  'Colonne vidéo de la galerie',
  case when exists (select 1 from information_schema.columns
                    where table_schema = 'public' and table_name = 'galerie'
                      and column_name = 'video')
       then '✅ présente' else '❌ manquante' end

union all select
  'Colonne vidéo des produits',
  case when exists (select 1 from information_schema.columns
                    where table_schema = 'public' and table_name = 'produits'
                      and column_name = 'video')
       then '✅ présente' else '❌ manquante' end

union all select
  'Taille maximale acceptée',
  coalesce((select (file_size_limit / 1048576)::text || ' Mo par vidéo'
            from storage.buckets where id = 'videos'), '—')

union all select
  'Vidéos déjà déposées',
  coalesce((select count(*)::text from storage.objects where bucket_id = 'videos'), '0');
