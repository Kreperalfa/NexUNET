'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtpForPasswordChange } from "../../../lib/auth";

export default function ChangePassword() {
    const [email, setEmail] = useState("");
    const router = useRouter();

    const manejoVerificacion = async () => {
        const { ok, error } = await sendOtpForPasswordChange(email);

        if (!ok) {
            alert(error);
            return;
        }

        alert("OTP enviado al email");
        localStorage.setItem("email_registro", email);
        router.push("/verify-otp");
    };
    return (
        <div>
            <h1>Cambio de contraseña</h1>
            <p>Ingrese su correo</p>

            <input
                type="email"
                placeholder="Dirección de correo"
                onChange={(e) => setEmail(e.target.value)}
            />

            <button onClick={manejoVerificacion}>
                Enviar código de verificación
            </button>
        </div>
    );
}

