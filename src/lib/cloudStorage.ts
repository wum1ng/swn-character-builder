import { supabase } from '$lib/supabase';
import type { Character } from '$types/character';

export interface CloudCharacter {
  id: string;
  user_id: string;
  data: Character;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export async function fetchCloudCharacters(): Promise<Character[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch cloud characters:', error);
    return [];
  }

  return (data as CloudCharacter[]).map(row => row.data);
}

export async function saveCloudCharacter(character: Character): Promise<boolean> {
  if (!supabase) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('characters')
    .upsert({
      id: character.id,
      user_id: user.id,
      data: character,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    });

  if (error) {
    console.error('Failed to save cloud character:', error);
    return false;
  }

  return true;
}

export async function deleteCloudCharacter(characterId: string): Promise<boolean> {
  if (!supabase) return false;

  // Soft delete
  const { error } = await supabase
    .from('characters')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', characterId);

  if (error) {
    console.error('Failed to delete cloud character:', error);
    return false;
  }

  return true;
}

export async function hardDeleteCloudCharacter(characterId: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('id', characterId);

  if (error) {
    console.error('Failed to hard delete cloud character:', error);
    return false;
  }

  return true;
}
