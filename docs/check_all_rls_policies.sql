-- ============================================
-- CONSULTA SIMPLE DE POLÍTICAS RLS
-- Ejecutar esto en el SQL Editor de Supabase
-- ============================================

-- 1. Todas las políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
ORDER BY schemaname, tablename, cmd, policyname;
