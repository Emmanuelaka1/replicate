-- ============================================
-- Script de création de la base de données
-- Application de Suivi des Réplications
-- ============================================

-- Suppression des tables existantes (si nécessaire)
DROP TABLE IF EXISTS replication_status_history CASCADE;
DROP TABLE IF EXISTS replications CASCADE;
DROP TABLE IF EXISTS boites CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- Table des utilisateurs
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    habilitation INTEGER DEFAULT 100 CHECK (habilitation IN (100, 200, 900)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table des boîtes applicatives
-- ============================================
CREATE TABLE boites (
    code VARCHAR(50) PRIMARY KEY,
    libelle VARCHAR(200) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table des réplications
-- ============================================
CREATE TABLE replications (
    id SERIAL PRIMARY KEY,
    code_boite VARCHAR(50) NOT NULL REFERENCES boites(code) ON DELETE CASCADE,
    app VARCHAR(100) NOT NULL,
    database_name VARCHAR(100) NOT NULL,
    support_type VARCHAR(50) NOT NULL CHECK (support_type IN ('POSTGRESQL', 'ORACLE', 'MYSQL', 'SQLSERVER', 'MONGODB')),
    schema_name VARCHAR(100) NOT NULL,
    support_conceptuel VARCHAR(200) NOT NULL,
    client_type VARCHAR(20) NOT NULL CHECK (client_type IN ('SOURCE', 'CIBLE')),
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    
    -- Contrainte d'unicité
    UNIQUE(code_boite, app, database_name, schema_name, support_conceptuel, client_type)
);

-- ============================================
-- Table de l'historique des statuts
-- ============================================
CREATE TABLE replication_status_history (
    id SERIAL PRIMARY KEY,
    replication_id INTEGER NOT NULL REFERENCES replications(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'ERROR', 'PENDING', 'MAINTENANCE')),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(100),
    comment TEXT,
    
    -- Index pour les recherches fréquentes
    INDEX idx_status_replication (replication_id),
    INDEX idx_status_date (changed_at DESC)
);

-- ============================================
-- Index pour optimiser les performances
-- ============================================

-- Index sur les recherches par boîte
CREATE INDEX idx_replications_boite ON replications(code_boite);

-- Index sur les recherches par application
CREATE INDEX idx_replications_app ON replications(app);

-- Index sur les recherches par base de données
CREATE INDEX idx_replications_database ON replications(database_name);

-- Index sur les recherches par schéma
CREATE INDEX idx_replications_schema ON replications(schema_name);

-- Index sur les recherches par support conceptuel
CREATE INDEX idx_replications_support ON replications(support_conceptuel);

-- Index sur les recherches par type de client
CREATE INDEX idx_replications_client_type ON replications(client_type);

-- Index composite pour les recherches fréquentes
CREATE INDEX idx_replications_boite_app ON replications(code_boite, app);

-- Index sur les dates de création
CREATE INDEX idx_replications_created ON replications(created_at DESC);

-- ============================================
-- Vue pour récupérer les réplications avec leur statut actuel
-- ============================================
CREATE OR REPLACE VIEW v_replications_with_status AS
SELECT 
    r.*,
    (
        SELECT status 
        FROM replication_status_history 
        WHERE replication_id = r.id 
        ORDER BY changed_at DESC 
        LIMIT 1
    ) AS current_status,
    (
        SELECT changed_at 
        FROM replication_status_history 
        WHERE replication_id = r.id 
        ORDER BY changed_at DESC 
        LIMIT 1
    ) AS status_changed_at
FROM replications r;

-- ============================================
-- Vue pour les statistiques
-- ============================================
CREATE OR REPLACE VIEW v_replication_statistics AS
SELECT 
    COUNT(*) AS total_replications,
    COUNT(CASE WHEN client_type = 'SOURCE' THEN 1 END) AS total_sources,
    COUNT(CASE WHEN client_type = 'CIBLE' THEN 1 END) AS total_cibles,
    COUNT(DISTINCT code_boite) AS total_boites,
    COUNT(DISTINCT app) AS total_apps
FROM replications;

-- ============================================
-- Fonction trigger pour mettre à jour updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur les tables
CREATE TRIGGER update_replications_updated_at
    BEFORE UPDATE ON replications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boites_updated_at
    BEFORE UPDATE ON boites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Fonction pour dupliquer une réplication
-- ============================================
CREATE OR REPLACE FUNCTION duplicate_replication(
    p_replication_id INTEGER,
    p_new_support_conceptuel VARCHAR(200),
    p_created_by VARCHAR(100)
)
RETURNS INTEGER AS $$
DECLARE
    v_new_id INTEGER;
    v_original RECORD;
BEGIN
    -- Récupérer la réplication originale
    SELECT * INTO v_original FROM replications WHERE id = p_replication_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Réplication % non trouvée', p_replication_id;
    END IF;
    
    -- Créer la copie
    INSERT INTO replications (
        code_boite,
        app,
        database_name,
        support_type,
        schema_name,
        support_conceptuel,
        client_type,
        created_by,
        updated_by
    ) VALUES (
        v_original.code_boite,
        v_original.app,
        v_original.database_name,
        v_original.support_type,
        v_original.schema_name,
        COALESCE(p_new_support_conceptuel, v_original.support_conceptuel || ' (copie)'),
        v_original.client_type,
        p_created_by,
        p_created_by
    )
    RETURNING id INTO v_new_id;
    
    -- Copier l'historique des statuts
    INSERT INTO replication_status_history (replication_id, status, changed_by, comment)
    SELECT v_new_id, status, p_created_by, 'Copié depuis réplication ' || p_replication_id
    FROM replication_status_history
    WHERE replication_id = p_replication_id
    ORDER BY changed_at DESC
    LIMIT 1;
    
    RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Fonction pour ajouter un statut
-- ============================================
CREATE OR REPLACE FUNCTION add_replication_status(
    p_replication_id INTEGER,
    p_status VARCHAR(20),
    p_changed_by VARCHAR(100),
    p_comment TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_status_id INTEGER;
BEGIN
    -- Vérifier que la réplication existe
    IF NOT EXISTS (SELECT 1 FROM replications WHERE id = p_replication_id) THEN
        RAISE EXCEPTION 'Réplication % non trouvée', p_replication_id;
    END IF;
    
    -- Ajouter le nouveau statut
    INSERT INTO replication_status_history (
        replication_id,
        status,
        changed_by,
        comment
    ) VALUES (
        p_replication_id,
        p_status,
        p_changed_by,
        p_comment
    )
    RETURNING id INTO v_status_id;
    
    RETURN v_status_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Fonction de recherche globale
-- ============================================
CREATE OR REPLACE FUNCTION search_replications(p_search_term VARCHAR)
RETURNS TABLE (
    id INTEGER,
    code_boite VARCHAR(50),
    app VARCHAR(100),
    database_name VARCHAR(100),
    schema_name VARCHAR(100),
    support_conceptuel VARCHAR(200),
    client_type VARCHAR(20),
    match_field VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.code_boite,
        r.app,
        r.database_name,
        r.schema_name,
        r.support_conceptuel,
        r.client_type,
        CASE 
            WHEN r.code_boite ILIKE '%' || p_search_term || '%' THEN 'code_boite'
            WHEN r.app ILIKE '%' || p_search_term || '%' THEN 'app'
            WHEN r.database_name ILIKE '%' || p_search_term || '%' THEN 'database'
            WHEN r.schema_name ILIKE '%' || p_search_term || '%' THEN 'schema'
            WHEN r.support_conceptuel ILIKE '%' || p_search_term || '%' THEN 'support_conceptuel'
            ELSE 'other'
        END AS match_field
    FROM replications r
    WHERE 
        r.code_boite ILIKE '%' || p_search_term || '%' OR
        r.app ILIKE '%' || p_search_term || '%' OR
        r.database_name ILIKE '%' || p_search_term || '%' OR
        r.schema_name ILIKE '%' || p_search_term || '%' OR
        r.support_conceptuel ILIKE '%' || p_search_term || '%';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Insertion de données de test
-- ============================================

-- Boîtes applicatives
INSERT INTO boites (code, libelle, description) VALUES
('AAAA', 'Base A - Application principale', 'Environnement de production principal'),
('BBBB', 'Base B - Application secondaire', 'Environnement de tests et développement'),
('CCCC', 'Base C - Tests', 'Environnement de tests unitaires');

-- Utilisateurs
INSERT INTO users (email, username, habilitation) VALUES
('admin@example.com', 'Administrateur', 900),
('user@example.com', 'Utilisateur', 200),
('viewer@example.com', 'Observateur', 100);

-- Réplications de test
INSERT INTO replications (code_boite, app, database_name, support_type, schema_name, support_conceptuel, client_type, created_by) VALUES
('AAAA', 'cardvirtrplsource', 'V01DBA', 'POSTGRESQL', 'public', 'T05CARV', 'SOURCE', 'admin@example.com'),
('AAAA', 'cardvirtrplcible', 'V01DBA', 'POSTGRESQL', 'public', 'T05CARV_COPY', 'CIBLE', 'admin@example.com'),
('BBBB', 'testrplsource', 'TESTDB', 'POSTGRESQL', 'public', 'TEST_TABLE', 'SOURCE', 'user@example.com'),
('BBBB', 'testrplcible', 'TESTDB', 'POSTGRESQL', 'public', 'TEST_TABLE_COPY', 'CIBLE', 'user@example.com');

-- Statuts initiaux
INSERT INTO replication_status_history (replication_id, status, changed_by, comment) VALUES
(1, 'ACTIVE', 'admin@example.com', 'Activation initiale'),
(2, 'ACTIVE', 'admin@example.com', 'Activation initiale'),
(3, 'ACTIVE', 'user@example.com', 'Activation pour tests'),
(4, 'INACTIVE', 'user@example.com', 'En attente de validation');

-- ============================================
-- Affichage des statistiques
-- ============================================
SELECT 'Statistiques de la base:' AS info;
SELECT * FROM v_replication_statistics;

SELECT 'Nombre de boîtes:' AS info, COUNT(*) AS count FROM boites;
SELECT 'Nombre d''utilisateurs:' AS info, COUNT(*) AS count FROM users;
SELECT 'Nombre de réplications:' AS info, COUNT(*) AS count FROM replications;
SELECT 'Nombre d''entrées d''historique:' AS info, COUNT(*) AS count FROM replication_status_history;

-- ============================================
-- Exemples de requêtes utiles
-- ============================================

-- Récupérer toutes les réplications avec leur statut actuel
-- SELECT * FROM v_replications_with_status;

-- Rechercher des réplications
-- SELECT * FROM search_replications('CARV');

-- Dupliquer une réplication
-- SELECT duplicate_replication(1, 'T05CARV_NEW', 'admin@example.com');

-- Ajouter un statut
-- SELECT add_replication_status(1, 'MAINTENANCE', 'admin@example.com', 'Maintenance programmée');

-- Obtenir l'historique complet d'une réplication
-- SELECT * FROM replication_status_history WHERE replication_id = 1 ORDER BY changed_at DESC;

-- Statistiques par boîte
-- SELECT code_boite, COUNT(*) as total FROM replications GROUP BY code_boite;

-- Statistiques par type de client
-- SELECT client_type, COUNT(*) as total FROM replications GROUP BY client_type;
