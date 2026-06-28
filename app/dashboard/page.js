'use client'

import { logoutUser } from "../../lib/auth";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const redirigir = useRouter();
    const listaUsuarios = async () =>{
        redirigir.push("/dashboard/perfil/lista-usuarios")
    }
    const manejoLogout = async () => {
    const { ok, error } = await logoutUser();

    if (!ok) {
        alert(error);
        return;
    }

    redirigir.push("/login");
    };

    return (
        <div>
        <h1>Dashboard</h1>
        <p>pagina*</p>

        {/* Botón temporal */}
        <button onClick={manejoLogout}>Cerrar sesión</button>
        <button onClick={listaUsuarios}>Lista Usuarios</button>
        </div>
    );
}