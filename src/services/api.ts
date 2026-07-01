import { supabase } from '../supabaseClient';

/**
 * Inicia sesión del operador verificando RUT y contraseña en 'usuarios' y 'interprete'.
 */
export const loginOperator = async (rut: string, password?: string) => {
  try {
    // 1. Buscar al usuario y verificar contraseña
    const { data: user, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('rut', rut)
      .eq('password', password)
      .single();

    if (userError || !user) {
      throw new Error('Credenciales incorrectas (RUT o contraseña).');
    }

    // 2. Verificar que el usuario sea un intérprete
    const { data: interprete, error: interpreteError } = await supabase
      .from('interprete')
      .select('*')
      .eq('rut', rut)
      .single();

    if (interpreteError || !interprete) {
      throw new Error('El usuario no está registrado como intérprete/operador.');
    }

    // Unir los datos para el estado local
    return { data: { ...user, phone: interprete.phone } };
  } catch (error: any) {
    console.error('❌ Error en el inicio de sesión:', error);
    throw error;
  }
};

/**
 * Envía la ubicación GPS del usuario a la tabla 'alertas' de Supabase.
 */
export const sendLocationData = async (lat: number, lng: number, rut?: string, name?: string, button?: string) => {
  try {
    const { data, error } = await supabase
      .from('alertas')
      .insert([{ lat, lng, user_rut: rut, user_name: name, button_color: button }]);

    if (error) throw error;

    console.log('📍 Ubicación de emergencia enviada correctamente:', { lat, lng });
    return data;
  } catch (error) {
    console.error('❌ Error enviando ubicación de emergencia:', error);
  }
};
