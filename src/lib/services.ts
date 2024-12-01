import { supabase } from './supabase';
import toast from 'react-hot-toast';

export interface SavedService {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  user_id: string;
  created_at: string;
}

export async function loadSavedServices(): Promise<SavedService[]> {
  try {
    const { data: services, error } = await supabase
      .from('saved_services')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return services || [];
  } catch (error) {
    console.error('Error loading saved services:', error);
    toast.error('Erreur lors du chargement des services sauvegardés');
    return [];
  }
}

export async function saveService(service: {
  name: string;
  description: string;
  price: number;
  icon: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('saved_services')
      .insert([{
        ...service,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }]);

    if (error) throw error;
    toast.success('Service sauvegardé avec succès');
    return true;
  } catch (error) {
    console.error('Error saving service:', error);
    toast.error('Erreur lors de la sauvegarde du service');
    return false;
  }
}