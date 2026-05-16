import { supabase } from './supabase'

/**
 * JOGADORES
 */
export async function getJogadores() {
  const { data, error } = await supabase
    .from('jogadores')
    .select('*')
    .order('ano_entrada', { ascending: true })
  return { data, error }
}

/**
 * FOTOS
 */

// Buscar eventos de fotos com contagem de fotos
export async function getEventosFotos() {
  const { data, error } = await supabase
    .from('eventos_fotos')
    .select('*, fotos(count)')
    .order('data_evento', { ascending: false })
  return { data, error }
}

// Buscar fotos de um evento específico
export async function getFotosByEvento(eventoId) {
  const { data, error } = await supabase
    .from('fotos')
    .select('*')
    .eq('id_evento', eventoId)
    .order('criado_em', { ascending: true })
  return { data, error }
}

/**
 * VÍDEOS
 */

// Buscar eventos de vídeo
export async function getEventosVideos() {
  const { data, error } = await supabase
    .from('eventos_videos')
    .select(`
      *,
      videos(caminho_video, thumbnail, tipo)
    `)
    .order('data_evento', { ascending: false })
  return { data, error }
}

// Buscar vídeos de um evento
export async function getVideosByEvento(eventoId) {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id_evento', eventoId)
    .order('criado_em', { ascending: true })
  return { data, error }
}
