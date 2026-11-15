// src/supabase.ts — DEPRECATED (re-export only)
// ⚠️ Purani file: ek alag `createClient()` instance bana rahi thi jo `services/sync/supabaseClient.ts`
//    ke singleton ke saath clash karta tha (do GoTrueClient, do autoRefresh timers, ek hi session) →
//    token refresh 429 → SIGNED_OUT → user automatically logout.
//
// Ab sirf EK client hai: services/sync/supabaseClient.ts
// Jo bhi file `./supabase` ya `../supabase` import karti hai (e.g. permanentMemory.ts) woh
// yahan se re-export hoke automatically sahi client par shift ho jayegi.
export { supabase } from './services/sync/supabaseClient';