import { supabase } from './supabase';

export async function saveUserMemory(userId: string, key: string, value: string) {
  if (!userId || userId === "anonymous") return;
  await supabase.from('user_memory').upsert({
    user_id: userId,
    memory_key: key,
    memory_value: value,
    updated_at: new Date().toISOString(),
  });
}

export async function getUserMemory(userId: string) {
  if (!userId || userId === "anonymous") return "";
  const { data } = await supabase
    .from('user_memory')
    .select('memory_key, memory_value')
    .eq('user_id', userId);
  if (!data?.length) return "";
  return data.map(m => `${m.memory_key} is ${m.memory_value}`).join(". ");
}