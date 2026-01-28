import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Se as variáveis não estiverem configuradas, o app entra em modo offline
export const IS_OFFLINE_MODE = !supabaseUrl || !supabaseAnonKey;

// Em modo online, criamos normalmente o client do Supabase.
// Em modo offline, exportamos `supabase` como `null` e os services fazem fallback.
export const supabase: any = IS_OFFLINE_MODE
  ? null
  : createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
      auth: {
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
