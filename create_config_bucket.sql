-- 1. Criar o bucket config
INSERT INTO storage.buckets (id, name, public)
VALUES ('config', 'config', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de Acesso
DROP POLICY IF EXISTS "Public Read Config" ON storage.objects;
CREATE POLICY "Public Read Config" ON storage.objects 
FOR SELECT TO anon, authenticated USING (bucket_id = 'config');

DROP POLICY IF EXISTS "Auth Manage Config" ON storage.objects;
CREATE POLICY "Auth Manage Config" ON storage.objects 
FOR ALL TO authenticated USING (bucket_id = 'config') WITH CHECK (bucket_id = 'config');
