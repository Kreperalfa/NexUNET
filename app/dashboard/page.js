'use client'

import { logoutUser } from "../../lib/auth";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();

    const manejoLogout = async () => {
    const { ok, error } = await logoutUser();

    if (!ok) {
        alert(error);
        return;
    }

    router.push("/login");
    };

    return (
        <div>
        <h1>Dashboard</h1>
        <p>pagina*</p>

        {/* Botón temporal */}
        <button onClick={manejoLogout}>Cerrar sesión</button>
        </div>
    );
}