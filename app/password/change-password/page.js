'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient  } from '../../../lib/supabase'

export default function ChangePassword() {

    function esCorreoUNET(email) {
        return email.toLowerCase().endsWith("@unet.edu.ve");
    }

    const [email, setEmail] = useState('')
    const redirigir = useRouter()

    // ✔ Cliente correcto (no global, no duplicado)
    const supabase = getSupabaseBrowserClient ()

    const manejoVerificacion = async () => {

        if (!esCorreoUNET(email)) {
            alert('Correo no permitido')
            return
        }

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false
            }
        })

        if (error) {
            if (error.message.includes("User not found")) {
                alert("Este correo no está registrado")
                return
            }

            alert("Error enviando OTP: " + error.message)
            return
        }

        alert("OTP enviado al email")
        localStorage.setItem("email_registro", email)
        redirigir.push('/verify-otp')
    }

    return(
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
    )
}
