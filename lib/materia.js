import { getSupabaseBrowserClient } from "./supabase";

/* ============================================================
   Crear Materia
   - Obtiene el idDepartamento automáticamente desde la tabla Departamento
   - Guarda el usuario autenticado como idUsuarioCreado
   ============================================================ */
export async function crearMateria(nombreMateria, unidadCredito, idCuentaActual) {
  const supabase = getSupabaseBrowserClient();

  // Usuario autenticado
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return { ok: false, mensaje: "No hay usuario autenticado." };

  // Validaciones
  if (!nombreMateria.trim()) return { ok: false, mensaje: "Debes ingresar un nombre de materia." };
  if (!unidadCredito || unidadCredito <= 0) return { ok: false, mensaje: "Debes ingresar un número válido de créditos." };

  // Buscar departamento vinculado
  const { data: departamento, error: depError } = await supabase
    .from("Departamento")
    .select("idDepartamento")
    .eq("idCuentaDepartamento", idCuentaActual)
    .single();

  if (depError || !departamento) {
    return { ok: false, mensaje: "No se encontró el departamento vinculado a la cuenta." };
  }

  // Insertar materia
  const { data, error } = await supabase
    .from("Materia")
    .insert({
      nombreMateria: nombreMateria.trim(),
      unidadCredito,
      idDepartamento: departamento.idDepartamento,
      idUsuarioCreado: user.id,
      created_at: new Date()
    })
    .select();

  if (error) {
    console.error(error);
    return { ok: false, mensaje: "Error creando la materia." };
  }

  const materia = data[0];

  // Crear foros automáticamente
  const foros = [
    { tipo: "OFICIAL", idMateria: materia.idMateria, created_at: new Date() },
    { tipo: "NO_OFICIAL", idMateria: materia.idMateria, created_at: new Date() }
  ];

  const { error: foroError } = await supabase
    .from("Foro")
    .insert(foros);

  if (foroError) {
    console.error(foroError);
    return { ok: false, mensaje: "Materia creada pero error creando foros." };
  }

  return { ok: true, mensaje: "Materia y foros creados correctamente.", materia };
}

/* ============================================================
   Actualizar Materia
   ============================================================ */
export async function actualizarMateria(idMateria, datos) {
  const supabase = getSupabaseBrowserClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return { ok: false, mensaje: "No hay usuario autenticado." };

  // Verificar existencia
  const { data: materia } = await supabase
    .from("Materia")
    .select("*")
    .eq("idMateria", idMateria)
    .single();

  if (!materia) return { ok: false, mensaje: "La materia no existe." };

  // Actualizar datos
  const { error } = await supabase
    .from("Materia")
    .update({
      nombreMateria: datos.nombreMateria,
      unidadCredito: datos.unidadCredito
    })
    .eq("idMateria", idMateria);

  if (error) {
    console.error(error);
    return { ok: false, mensaje: "Error actualizando la materia." };
  }

  return { ok: true, mensaje: "Materia actualizada correctamente." };
}

// 1. Obtener carreras vinculadas a una materia
export async function obtenerCarrerasMateria(idMateria) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("Carrera_Materia")
    .select("idCarrera")
    .eq("idMateria", idMateria);

  if (error) {
    console.error(error);
    return [];
  }
  return data.map(c => c.idCarrera);
}

// 2. Actualizar vínculos de carreras para una materia
export async function actualizarCarrerasMateria(idMateria, carrerasSeleccionadas) {
  const supabase = getSupabaseBrowserClient();

  const { data: actuales, error: errAct } = await supabase
    .from("Carrera_Materia")
    .select("idCarrera")
    .eq("idMateria", idMateria);

  if (errAct) {
    console.error(errAct);
    return { ok: false, mensaje: "Error obteniendo carreras actuales." };
  }

  const actualesIds = actuales.map(c => c.idCarrera);

  const aBorrar = actualesIds.filter(id => !carrerasSeleccionadas.includes(id));
  const aAgregar = carrerasSeleccionadas.filter(id => !actualesIds.includes(id));

  if (aBorrar.length > 0) {
    const { error: errDel } = await supabase
      .from("Carrera_Materia")
      .delete()
      .eq("idMateria", idMateria)
      .in("idCarrera", aBorrar);

    if (errDel) {
      console.error(errDel);
      return { ok: false, mensaje: "Error borrando relaciones." };
    }
  }

  if (aAgregar.length > 0) {
    const nuevas = aAgregar.map(idCarrera => ({
      idMateria,
      idCarrera
    }));

    const { error: errIns } = await supabase
      .from("Carrera_Materia")
      .insert(nuevas);

    if (errIns) {
      console.error(errIns);
      return { ok: false, mensaje: "Error insertando nuevas relaciones." };
    }
  }

  return { ok: true, mensaje: "Relaciones actualizadas correctamente." };
}

// 3. Vincular carreras al crear materia
export async function vincularCarrerasMateria(idMateria, carrerasSeleccionadas) {
  const supabase = getSupabaseBrowserClient();

  const relaciones = carrerasSeleccionadas.map(idCarrera => ({
    idMateria,
    idCarrera
  }));

  const { error } = await supabase
    .from("Carrera_Materia")
    .insert(relaciones);

  if (error) {
    console.error(error);
    return { ok: false, mensaje: "Error vinculando carreras a la materia." };
  }

  return { ok: true, mensaje: "Carreras vinculadas correctamente." };
}
