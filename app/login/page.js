'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../../lib/auth";
import { actualizarUltimaSesion } from "../../lib/perfil"; // ← IMPORTANTE

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const manejoLogin = async () => {
        const { ok, error } = await loginUser(email, password);

        if (!ok) {
            alert(error);
            return;
        }

        // ⭐ Aquí el usuario YA inició sesión correctamente
        await actualizarUltimaSesion();

        router.push("/dashboard");
    };

    // Botones temporales (UI provisional)
    const manejoRegistro = () => router.push("/register");
    const manejoCambioPassword = () => router.push("/password/change-password");

    return (
        <div>
            <h1>Login</h1>

            <p>Ingrese su correo</p>
            <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
            />

            <p>Ingrese su contraseña</p>
            <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
            />

            <br />

            <button onClick={manejoLogin}>Iniciar Sesión</button>

            {/* Botones temporales */}
            <button onClick={manejoRegistro}>Registrarse</button>
            <button onClick={manejoCambioPassword}>Cambiar contraseña</button>
        </div>
    );
}
