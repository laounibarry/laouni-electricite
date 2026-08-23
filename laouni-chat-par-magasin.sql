-- ═══════════════════════════════════════════════════════════════════════
--  LAOUNI ÉLECTRICITÉ — LE CHAT ARRIVE AU BON MAGASIN
--
--  À coller en entier dans Supabase → SQL Editor → Run.
--  Le fichier se vérifie lui-même : lisez le tableau affiché à la fin.
--  Le repasser deux fois ne casse rien.
--
--  DEUX PROBLÈMES, ET C'EST LE DEUXIÈME LE PLUS GRAVE
--
--  1. La table du chat n'avait AUCUNE colonne magasin. Un visiteur écrivait,
--     et rien ne disait à qui. Personne ne pouvait donc savoir que le
--     message lui était destiné.
--
--  2. Le visiteur pouvait ÉCRIRE, mais pas RELIRE. Vérifié : l'écriture
--     passe, la lecture ne rend rien du tout. Autrement dit, le message
--     partait bien — et la réponse du magasin n'arrivait JAMAIS chez le
--     client. Le chat ne fonctionnait que dans un sens, sans que personne
--     s'en aperçoive : le visiteur voyait sa propre phrase à l'écran, mais
--     elle était affichée par le téléphone, pas relue de la base. Elle
--     disparaissait dès qu'il fermait l'application.
--
--  CE QUE CE FICHIER FAIT
--  Il ajoute le magasin destinataire, et il ouvre la lecture au visiteur —
--  mais UNIQUEMENT sur sa propre conversation, jamais sur celle des autres.
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. Le magasin destinataire ────────────────────────────────────────
alter table public.chat_messages add column if not exists mag_id  text;
alter table public.chat_messages add column if not exists mag_nom text;

-- Retrouver rapidement les messages d'un magasin, et ceux d'une session.
create index if not exists chat_messages_mag_idx     on public.chat_messages (mag_id, created_at desc);
create index if not exists chat_messages_session_idx on public.chat_messages (session_id, created_at);

-- ── 2. Ménage : les deux lignes de test du diagnostic ─────────────────
delete from public.chat_messages where session_id in ('diag', 't');

-- ── 3. Le visiteur peut relire SA conversation, et elle seule ─────────
--
-- Une règle de sécurité ne peut pas vérifier « c'est bien lui » quand il n'y
-- a pas de compte. On passe donc par une fonction : elle demande
-- l'identifiant de conversation, et ne rend que les messages de CELUI-LÀ.
--
-- L'identifiant joue le rôle d'une clé : le téléphone du visiteur est le
-- seul à l'avoir, il est enregistré chez lui. Ouvrir la table en lecture à
-- tout le monde aurait laissé n'importe qui lire les conversations de tous
-- les clients — leurs demandes, leurs noms, leurs numéros.
-- « returns setof public.chat_messages » plutôt qu'une liste de colonnes
-- écrite à la main.
--
-- La première version déclarait chaque colonne avec son type, et se trompait
-- sur le premier : id est du texte, pas un nombre. Postgres refusait la
-- fonction (« return type mismatch »). Ici le type de retour EST celui de la
-- table : il ne peut plus diverger, et la fonction suivra toute seule si une
-- colonne est ajoutée un jour.
create or replace function public.lire_chat(p_session text)
returns setof public.chat_messages
language sql
security definer
set search_path = public
as $$
  select c.*
  from public.chat_messages c
  where c.session_id = p_session
    -- Un identifiant trop court serait devinable : on refuse de répondre.
    and length(coalesce(p_session, '')) >= 8
  order by c.created_at;
$$;

revoke all on function public.lire_chat(text) from public;
grant execute on function public.lire_chat(text) to anon, authenticated;

-- ── 4. Le visiteur écrit, mais ne peut pas se faire passer pour vous ──
--
-- L'écriture était déjà ouverte. Elle l'était trop : rien n'empêchait
-- d'insérer un message signé « magasin ». Un plaisantin pouvait donc écrire
-- une fausse réponse de votre part dans la conversation d'un client.
drop policy if exists "chat visiteur ecrit" on public.chat_messages;
create policy "chat visiteur ecrit"
  on public.chat_messages for insert
  to anon
  with check (de = 'visiteur');

-- Le personnel connecté écrit et lit tout : c'est son travail.
drop policy if exists "chat magasin ecrit" on public.chat_messages;
create policy "chat magasin ecrit"
  on public.chat_messages for insert
  to authenticated
  with check (true);

drop policy if exists "chat magasin lit" on public.chat_messages;
create policy "chat magasin lit"
  on public.chat_messages for select
  to authenticated
  using (true);

alter table public.chat_messages enable row level security;

-- ═══════════════════════════════════════════════════════════════════════
--  VÉRIFICATION — c'est ce tableau qui compte, pas le message « Success »
-- ═══════════════════════════════════════════════════════════════════════
select
  'Colonne du magasin destinataire' as "Ce qui est vérifié",
  case when exists (select 1 from information_schema.columns
                    where table_schema = 'public' and table_name = 'chat_messages'
                      and column_name = 'mag_id')
       then '✅ présente' else '❌ manquante — relancez le fichier' end as "Résultat"

union all select
  'Le visiteur peut relire sa conversation',
  case when exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                    where n.nspname = 'public' and p.proname = 'lire_chat')
       then '✅ oui — et uniquement la sienne'
       else '❌ non — la réponse du magasin n''arriverait pas' end

union all select
  'Personne ne peut signer un message à votre place',
  case when exists (select 1 from pg_policies
                    where schemaname = 'public' and tablename = 'chat_messages'
                      and policyname = 'chat visiteur ecrit')
       then '✅ règle posée' else '⚠️ à vérifier' end

union all select
  'Le personnel lit et répond',
  case when (select count(*) from pg_policies
             where schemaname = 'public' and tablename = 'chat_messages'
               and policyname like 'chat magasin%') = 2
       then '✅ les 2 règles' else '⚠️ incomplet' end

union all select
  'Lignes de test du diagnostic',
  case when exists (select 1 from public.chat_messages where session_id in ('diag','t'))
       then '⚠️ encore présentes' else '✅ supprimées' end

union all select
  'Messages dans le chat',
  (select count(*)::text from public.chat_messages);
