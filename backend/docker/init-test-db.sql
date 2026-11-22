-- Exécuté une seule fois, à la création du conteneur PostgreSQL.
-- Base séparée pour les tests : ils peuvent la vider sans toucher aux données de développement.
CREATE DATABASE lepetitgrain_test OWNER lpg;
