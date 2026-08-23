-- COMBIEN D'ÉTIQUETTES ONT DÉJÀ ÉTÉ IMPRIMÉES ?
--
-- Ce fichier ne fait que compter. Il ne modifie rien.
-- Copiez tout, collez dans Supabase → SQL Editor, puis Run.
--
-- Pourquoi cette question : les étiquettes déjà collées portent l'ancien
-- domaine, celui de Hostinger auquel vous n'avez plus accès. S'il n'y en a
-- aucune, il n'y a rien à réparer et vous pouvez oublier ce problème.

select
  (select count(*) from public.lots)          as arrivages_crees,
  (select count(*) from public.lot_unites)    as etiquettes_generees,
  (select count(*) from public.verifications) as scans_clients;

-- Ce que les chiffres veulent dire :
--
-- etiquettes_generees = 0
--   → Aucune étiquette n'a jamais été imprimée. Le problème du domaine
--     Hostinger ne vous concerne pas. Laissez ce domaine expirer.
--
-- etiquettes_generees > 0
--   → Ces étiquettes-là renvoient vers une page vide. Dites-moi le nombre,
--     on verra ensemble laquelle des solutions vaut le coup.
--
-- scans_clients > 0
--   → Des clients ont déjà scanné. Regardez l'écran « Vérifications
--     d'authenticité » dans l'application, onglet Registres.
