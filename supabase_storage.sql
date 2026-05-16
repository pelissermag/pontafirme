-- ############################################################
-- STORAGE CONFIGURATION - PONTA FIRME FC
-- ############################################################

-- 1. Criação dos Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('fotos', 'fotos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('videos', 'videos', true, 524288000, ARRAY['video/mp4', 'video/webm', 'image/jpeg', 'image/png']),
  ('jogadores', 'jogadores', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- 2. Políticas de Storage - BUCKET: fotos
CREATE POLICY "Public Read Fotos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'fotos');
CREATE POLICY "Auth Upload Fotos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'fotos');
CREATE POLICY "Auth Update Fotos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'fotos');
CREATE POLICY "Auth Delete Fotos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'fotos');

-- 3. Políticas de Storage - BUCKET: videos
CREATE POLICY "Public Read Videos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'videos');
CREATE POLICY "Auth Upload Videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos');
CREATE POLICY "Auth Update Videos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'videos');
CREATE POLICY "Auth Delete Videos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'videos');

-- 4. Políticas de Storage - BUCKET: jogadores
CREATE POLICY "Public Read Jogadores" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'jogadores');
CREATE POLICY "Auth Upload Jogadores" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'jogadores');
CREATE POLICY "Auth Update Jogadores" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'jogadores');
CREATE POLICY "Auth Delete Jogadores" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'jogadores');
