"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { crearPublicacion } from "../../../../../../lib/publicacion";

export default function PublicarNoticia() {
  const router = useRouter();
  const params = useParams();
  const idCuenta = params.idCuenta;

  const [contenido, setContenido] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarPublicacion() {
    try {
      setCargando(true);

      // Crear publicación
      const idPublicacion = await crearPublicacion({
        contenido,
        idCuenta
      });

      console.log("Publicación creada con ID:", idPublicacion);

      // Redirigir al feed de la cuenta
      router.push(`/dashboard/cuenta/abrir-cuenta/${idCuenta}/principal-cuenta`);

    } catch (error) {
      console.error(error);
      alert("Error creando publicación");
    } finally {
      setCargando(false);
    }
  }

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
