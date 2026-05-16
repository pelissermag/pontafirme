-- ############################################################
-- SEQUENCE FIX - PONTA FIRME FC
-- Rode isso APÓS importar os dados para que o ID automático continue do último valor
-- ############################################################

SELECT setval(pg_get_serial_sequence('eventos_fotos', 'id'), coalesce(max(id), 0) + 1, false) FROM eventos_fotos;
SELECT setval(pg_get_serial_sequence('fotos', 'id'), coalesce(max(id), 0) + 1, false) FROM fotos;
SELECT setval(pg_get_serial_sequence('eventos_videos', 'id'), coalesce(max(id), 0) + 1, false) FROM eventos_videos;
SELECT setval(pg_get_serial_sequence('videos', 'id'), coalesce(max(id), 0) + 1, false) FROM videos;
SELECT setval(pg_get_serial_sequence('jogadores', 'id'), coalesce(max(id), 0) + 1, false) FROM jogadores;
SELECT setval(pg_get_serial_sequence('patrocinadores', 'id'), coalesce(max(id), 0) + 1, false) FROM patrocinadores;
SELECT setval(pg_get_serial_sequence('admins', 'id'), coalesce(max(id), 0) + 1, false) FROM admins;
