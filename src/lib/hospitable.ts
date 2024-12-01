import { supabase } from './supabase';

export const syncHospitableProperties = async () => {
  try {
    const { error } = await supabase.functions.invoke('sync-properties');
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error syncing properties:', error);
    throw error;
  }
};

export const handleHospitableCallback = async (code: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const { error } = await supabase.functions.invoke('hospitable-callback', {
      body: { 
        code,
        state: session.user.id
      }
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error handling callback:', error);
    throw error;
  }
};