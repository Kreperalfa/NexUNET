import { getSupabaseServerClient } from "./supabase";

// Crear un nuevo hilo
export async function crearHilo({ titulo, contenido, idUsuarioCreador, idCuentaCreador = null, idForoFuente }) {
  const supabase = getSupabaseServerClient();

  let idDepartamento = null;

  if (idCuentaCreador) {
    // Buscar el departamento vinculado a la cuenta
    const { data: departamento, error: depError } = await supabase
      .from("Departamento")
      .select("idDepartamento")
      .eq("idCuentaDepartamento", idCuentaCreador) // 👈 relación correcta
      .single();

    if (depError || !departamento) {
      console.error("Error obteniendo departamento desde cuenta:", depError);
      return { ok: false, mensaje: "No se encontró el departamento vinculado a la cuenta", error: depError };
    }

    idDepartamento = departamento.idDepartamento;
  }

  // Insertar hilo con idDepartamento incluido
  const { data, error } = await supabase
    .from("Hilo")
    .insert([
      {
        titulo,
        contenido,
        idUsuarioCreador,   // obligatorio
        idCuentaCreador,    // opcional
        idForoFuente,       // obligatorio
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creando hilo:", error);
    return { ok: false, mensaje: "Error al crear el hilo", error };
  }

  return { ok: true, mensaje: "Hilo creado exitosamente", hilo: data };
}

// Editar un hilo existente
export async function actualizarHilo(idHilo, { titulo, contenido }) {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("Hilo")
    .update({
      titulo,
      contenido,
    })
    .eq("idHilo", idHilo)
    .select()
    .single();

  if (error) {
    console.error("Error actualizando hilo:", error);
    return { ok: false, mensaje: "Error al actualizar el hilo", error };
  }

  return { ok: true, mensaje: "Hilo actualizado exitosamente", hilo: data };
}

// Eliminar un hilo existente
export async function eliminarHilo(idHilo) {
  const supabase = getSupabaseServerClient();

  const { error } = await supabase
    .from("Hilo")
    .delete()
    .eq("idHilo", idHilo);

  if (error) {
    console.error("Error eliminando hilo:", error);
    return { ok: false, mensaje: "Error al eliminar el hilo", error };
  }

  return { ok: true, mensaje: "Hilo eliminado exitosamente" };
}
