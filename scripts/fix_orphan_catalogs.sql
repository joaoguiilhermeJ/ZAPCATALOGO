-- scripts/fix_orphan_catalogs.sql
-- Script seguro para associar catálogos órfãos a usuários quando houver
-- casamento exato de telefone. Também cria um usuário 'anon' e atribui os
-- restantes a ele. Executar com cuidado — faça backup antes.

-- 1) Faça backup externo antes de rodar:
-- pg_dump -Fc "$DATABASE_URL" -f /tmp/catalogos-backup.dump

BEGIN;

-- 2) Contagem inicial de órfãos
CREATE TEMP TABLE tmp_orphans AS
SELECT id, slug, nome_loja, whatsapp, usuario_id, created_at
FROM catalogos
WHERE usuario_id IS NULL;

-- Mostra quantos órfãos existem (psql exibirá o resultado)
SELECT count(*) AS orphan_count FROM tmp_orphans;

-- 3) Tentar associar por whatsapp (match exato após remover não dígitos)
-- Atualiza apenas quando houver correspondência única por usuário
WITH matched AS (
  SELECT c.id AS catalogo_id, u.id AS usuario_id
  FROM catalogos c
  JOIN usuarios u
    ON regexp_replace(u.whatsapp, '\\D', '', 'g') = regexp_replace(c.whatsapp, '\\D', '', 'g')
  WHERE c.usuario_id IS NULL
)
UPDATE catalogos c
SET usuario_id = m.usuario_id
FROM matched m
WHERE c.id = m.catalogo_id
RETURNING c.id, c.slug, c.whatsapp, c.usuario_id;

-- 4) Quantos ainda restam órfãos
SELECT count(*) AS remaining_orphans FROM catalogos WHERE usuario_id IS NULL;

-- 5) Create a stable 'anon' user if not exists, and use fixed UUID so script is idempotent
-- Ajuste os campos (nome/email) conforme seu schema de `usuarios`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = '00000000-0000-0000-0000-000000000000') THEN
    INSERT INTO usuarios (id, nome, email, created_at)
    VALUES ('00000000-0000-0000-0000-000000000000', 'anon', 'anon@example.com', now());
  END IF;
END$$;

-- 6) Atribuir todos os órfãos restantes ao usuário 'anon'
UPDATE catalogos
SET usuario_id = '00000000-0000-0000-0000-000000000000'
WHERE usuario_id IS NULL
RETURNING id, slug;

-- 7) Verificação final
SELECT count(*) AS final_orphan_count FROM catalogos WHERE usuario_id IS NULL;

COMMIT;

-- NOTAS:
-- - Execute este script em um ambiente de teste primeiro.
-- - Se preferir revisar apenas as instruções UPDATE, não rode o bloco que
--   altera `catalogos` e apenas inspecione os `matched` CTE results.
-- - Ajuste nomes de tabelas/colunas se seu schema for diferente.
