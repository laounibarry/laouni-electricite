-- Retire les deux lignes de contrôle technique créées le 22/08/2026
-- pendant la vérification de l'enregistrement des recherches.
--
-- À coller dans Supabase → SQL Editor → Run. Rien d'autre n'est touché.

delete from public.recherches
where terme in ('test technique claude', 'zzz-controle-securite');

-- Vérification : doit renvoyer 0
select count(*) as lignes_de_test_restantes
from public.recherches
where terme in ('test technique claude', 'zzz-controle-securite');
