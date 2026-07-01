"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { crearPublicacion, obtenerTodosLosHashtags, asignarHashtagsPublicacion } from "../../../../../../lib/publicacion";
import { obtenerCuentaCompleta } from "../../../../../../lib/cuenta"; // ← IMPORTANTE

export default function PublicarNoticia() {
  const router = useRouter();
  const params = useParams();
  const idCuenta = params.idCuenta;

  const [contenido, setContenido] = useState("");
  const [cargando, setCargando] = useState(false);

  // Hashtags
  const [hashtags, setHashtags] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);

  // Archivos multimedia
  const [archivos, setArchivos] = useState([]);

  // Nombre de la cuenta (lo necesitamos para la ruta del bucket)
  const [cuenta, setCuenta] = useState(null);

  /* ============================================================
     CARGAR INFO DE LA CUENTA (CORREGIDO)
     ============================================================ */
  useEffect(() => {
    const cargarCuenta = async () => {
      const respuesta = await obtenerCuentaCompleta(idCuenta);

      if (!respuesta.ok) {
        console.error("Error cargando cuenta:", respuesta.mensaje);
        return;
      }

      setCuenta(respuesta.cuenta); // ← AQUÍ VIENE cuenta.nombre
    };

    cargarCuenta();
  }, [idCuenta]);

  /* ============================================================
     CARGAR TODOS LOS HASHTAGS
     ============================================================ */
  useEffect(() => {
    const cargarHashtags = async () => {
      try {
        const data = await obtenerTodosLosHashtags();
        setHashtags(data);
      } catch (error) {
        console.error("Error cargando hashtags:", error);
      }
    };

    cargarHashtags();
  }, []);

  /* ============================================================
     SELECCIONAR / DESELECCIONAR HASHTAG
     ============================================================ */
  const toggleHashtag = (idHashtag) => {
    setSeleccionados((prev) =>
      prev.includes(idHashtag)
        ? prev.filter((id) => id !== idHashtag)
        : [...prev, idHashtag]
    );
  };

  /* ============================================================
     MANEJAR ARCHIVOS
     ============================================================ */
  const manejarArchivos = (e) => {
    const files = Array.from(e.target.files);
    setArchivos(files);
  };

  /* ============================================================
     MANEJAR PUBLICACIÓN
     ============================================================ */
  async function manejarPublicacion() {
    try {
      setCargando(true);

      if (!cuenta) {
        alert("Error: No se pudo obtener la información de la cuenta.");
        return;
      }

      // 1) Crear publicación con multimedia
      const idPublicacion = await crearPublicacion({
        contenido,
        idCuenta,
        archivos,
        nombreCuenta: cuenta.nombre // ← AHORA SÍ FUNCIONA
      });

      console.log("Publicación creada con ID:", idPublicacion);

      // 2) Asignar hashtags (si hay)
      if (seleccionados.length > 0) {
        await asignarHashtagsPublicacion(idPublicacion, seleccionados);
      }

      // 3) Redirigir al feed
      router.push(`/dashboard/cuenta/abrir-cuenta/${idCuenta}/principal-cuenta`);

    } catch (error) {
      console.error(error);
      alert("Error creando publicación");
    } finally {
      setCargando(false);
    }
  }

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        Publicar noticia
      </h1>

      {/* Contenido */}
      <textarea
        placeholder="Escribe el contenido de la noticia..."
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        style={{
          width: "100%",
          height: "150px",
          marginTop: "20px",
          padding: "10px",
          fontSize: "16px"
        }}
      />

      {/* ============================================================
         ARCHIVOS MULTIMEDIA
         ============================================================ */}
      <h3 style={{ marginTop: "25px" }}>Agregar imágenes o videos</h3>

      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={manejarArchivos}
        style={{ marginTop: "10px" }}
      />

      {/* Previsualización */}
      {archivos.length > 0 && (
        <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {archivos.map((file, index) => (
            <div key={index}>
              {file.type.startsWith("image") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "8px"
                  }}
                />
              ) : (
                <video
                  src={URL.createObjectURL(file)}
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "8px"
                  }}
                  muted
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ============================================================
         HASHTAGS
         ============================================================ */}
      <h3 style={{ marginTop: "25px" }}>Seleccionar hashtags</h3>

      <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {hashtags.map((h) => {
          const activo = seleccionados.includes(h.idHashtag);

          return (
            <button
              key={h.idHashtag}
              onClick={() => toggleHashtag(h.idHashtag)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                background: activo ? "#4caf50" : "#f44336",
                color: "white",
                fontSize: "14px"
              }}
            >
              #{h.nombre}
            </button>
          );
        })}
      </div>

      {/* Botón publicar */}
      <button
        onClick={manejarPublicacion}
        disabled={cargando}
        style={{
          marginTop: "30px",
          padding: "12px 20px",
          background: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        {cargando ? "Publicando..." : "Publicar noticia"}
      </button>
    </div>
  );
}
