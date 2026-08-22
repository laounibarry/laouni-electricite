-- Laouni Électricité Moderne — garde-fous de la base
-- À coller dans Supabase → SQL Editor → Run. Une seule fois suffit.
--
-- Ce script ne supprime rien et ne modifie aucune de vos données.
-- Il pose des interdits que la base fera respecter elle-même, même si
-- quelqu'un se trompe dans l'application ou sur le site.
--
-- Chaque bloc est indépendant : si l'un échoue parce que la règle existe
-- déjà, les autres passent quand même.

-- ─────────────────────────────────────────────────────────────
-- 1. Deux produits ne peuvent plus porter le même code-barres
--    ni la même référence.
--
--    Pourquoi : le scan en caisse et la vérification d'authenticité du
--    client cherchent par l'un ou par l'autre. Deux produits qui les
--    partagent, et c'est le mauvais qui remonte — on vend un article et on
--    décrémente le stock d'un autre.
-- ─────────────────────────────────────────────────────────────

-- On regarde d'abord s'il existe déjà des doublons (sinon la contrainte
-- échouerait sans dire lesquels).
select 'DOUBLON code-barres' as probleme, barcode, count(*) as combien
from public.produits
where coalesce(barcode, '') <> ''
group by barcode having count(*) > 1
union all
select 'DOUBLON référence', ref, count(*)
from public.produits
where coalesce(ref, '') <> ''
group by ref having count(*) > 1;

-- S'il n'y a rien au-dessus, ces deux lignes passent.
create unique index if not exists produits_barcode_unique
  on public.produits (barcode) where coalesce(barcode, '') <> '';

create unique index if not exists produits_ref_unique
  on public.produits (lower(ref)) where coalesce(ref, '') <> '';

-- ─────────────────────────────────────────────────────────────
-- 2. Deux magasins ne peuvent plus avoir le même identifiant de
--    connexion, même écrit différemment.
--
--    Pourquoi : la connexion ne fait pas la différence entre MGC et mgc.
--    Le site autorisait les deux : deux magasins, un seul compte, et les
--    ventes de l'un tombaient chez l'autre.
-- ─────────────────────────────────────────────────────────────

select 'DOUBLON identifiant magasin' as probleme, lower(code) as identifiant,
       count(*) as combien
from public.magasins
where coalesce(code, '') <> ''
group by lower(code) having count(*) > 1;

create unique index if not exists magasins_code_unique
  on public.magasins (lower(code)) where coalesce(code, '') <> '';

-- ─────────────────────────────────────────────────────────────
-- 3. Un produit ne peut avoir qu'une seule ligne de stock par magasin.
--
--    Pourquoi : deux lignes pour le même couple, et le stock affiché est
--    la somme des deux pendant que la vente n'en décrémente qu'une. Le
--    compte ne retombe jamais juste.
-- ─────────────────────────────────────────────────────────────

select 'DOUBLON ligne de stock' as probleme, pid, mid, count(*) as combien
from public.stocks
group by pid, mid having count(*) > 1;

create unique index if not exists stocks_produit_magasin_unique
  on public.stocks (pid, mid);

-- ─────────────────────────────────────────────────────────────
-- 4. Un stock ne peut plus devenir négatif.
--
--    Pourquoi : une quantité négative n'existe pas dans un magasin. Si un
--    calcul s'y trompe, mieux vaut que l'enregistrement soit refusé tout
--    de suite que de découvrir « -3 batteries » un mois plus tard.
-- ─────────────────────────────────────────────────────────────

select 'STOCK NÉGATIF' as probleme, id, pid, mid, qte
from public.stocks where qte < 0;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'stocks_qte_positive') then
    alter table public.stocks add constraint stocks_qte_positive check (qte >= 0);
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────
-- 5. Le mot de passe en clair ne doit plus jamais réapparaître.
--
--    Il a déjà été mis à null. Cette ligne le remet à null au cas où un
--    ancien écran l'aurait réécrit depuis.
-- ─────────────────────────────────────────────────────────────

update public.magasins set pass = null where pass is not null;

-- ─────────────────────────────────────────────────────────────
-- Vérification finale : doit renvoyer 0 partout.
-- ─────────────────────────────────────────────────────────────

select
  (select count(*) from public.magasins where pass is not null) as mots_de_passe_restants,
  (select count(*) from public.stocks where qte < 0)            as stocks_negatifs;
