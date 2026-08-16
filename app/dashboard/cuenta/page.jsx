"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function CuentasPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [departamentos, setDepartamentos] = useState([]);
  const [institucionales, setInstitucionales] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [mostrarMasDept, setMostrarMasDept] = useState(false);
  const [mostrarMasInst, setMostrarMasInst] = useState(false);

  useEffect(() => {
    const cargarCuentas = async () => {
      const { data, error } = await supabase
        .from("Cuenta")
        .select(`
          idCuenta,
          nombre,
          descripcion,
          imagenCuenta,
          cuentaDepartamento,
          admin:Usuario!Cuenta_idAdmin_fkey(id, nombre, imagenPerfil)
        `)
        .order("nombre", { ascending: true });

      if (error) {
        console.error("Error cargando cuentas:", error);
        return;
      }

      const dept = data.filter((c) => c.cuentaDepartamento);
      const inst = data.filter((c) => !c.cuentaDepartamento);

      setDepartamentos(dept);
      setInstitucionales(inst);
    };

    cargarCuentas();
  }, []);

  const abrirCuenta = (idCuenta) => {
    router.push(`/dashboard/cuenta/abrir-cuenta/${idCuenta}`);
  };

  const filtrar = (lista) =>
    lista.filter((c) =>
      c.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    );

  const limitar = (lista, mostrarMas) =>
    mostrarMas ? lista : lista.slice(0, 3);

  return (
    <div className={styles.contenedor}>
      <h2 className={styles.titulo}>Departamentos</h2>

      {/* BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar departamento o cuenta..."
        className={styles.buscador}
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* DEPARTAMENTOS */}
      <div className={styles.gridCuentas}>
        {limitar(filtrar(departamentos), mostrarMasDept).map((c) => (
          <div
            key={c.idCuenta}
            className={styles.card}
            onClick={() => abrirCuenta(c.idCuenta)}
          >
            <img
              src={c.imagenCuenta || "/default-department.png"}
              className={styles.cardImagen}
            />

            <div className={styles.cardInfo}>
              <p className={styles.cardNombre}>{c.nombre}</p>

              {c.descripcion && (
                <p className={styles.cardDescripcion}>{c.descripcion}</p>
              )}

              {c.admin && (
                <div className={styles.adminBox}>
                  <img
                    src={c.admin.imagenPerfil || "/default-user.png"}
                    className={styles.adminAvatar}
                  />
                  <span className={styles.adminNombre}>
                    Admin: {c.admin.nombre}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* BOTÓN VER MÁS DEPARTAMENTOS */}
      {filtrar(departamentos).length > 3 && (
        <button
          className={styles.verMas}
          onClick={() => setMostrarMasDept(!mostrarMasDept)}
        >
          {mostrarMasDept ? "Ver menos" : "Ver más departamentos"}
        </button>
      )}

      {/* CUENTAS INSTITUCIONALES */}
      <h2 className={styles.titulo} style={{ marginTop: "32px" }}>
        Cuentas Institucionales
      </h2>

      <div className={styles.gridCuentas}>
        {limitar(filtrar(institucionales), mostrarMasInst).map((c) => (
          <div
            key={c.idCuenta}
            className={styles.card}
            onClick={() => abrirCuenta(c.idCuenta)}
          >
            <img
              src={c.imagenCuenta || "/default-department.png"}
              className={styles.cardImagen}
            />

            <div className={styles.cardInfo}>
              <p className={styles.cardNombre}>{c.nombre}</p>

              {c.descripcion && (
                <p className={styles.cardDescripcion}>{c.descripcion}</p>
              )}

              {c.admin && (
                <div className={styles.adminBox}>
                  <img
                    src={c.admin.imagenPerfil || "/default-user.png"}
                    className={styles.adminAvatar}
                  />
                  <span className={styles.adminNombre}>
                    Admin: {c.admin.nombre}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* BOTÓN VER MÁS INSTITUCIONALES */}
      {filtrar(institucionales).length > 3 && (
        <button
          className={styles.verMas}
          onClick={() => setMostrarMasInst(!mostrarMasInst)}
        >
          {mostrarMasInst ? "Ver menos" : "Ver más cuentas"}
        </button>
      )}
    </div>
  );
}
