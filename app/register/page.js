'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient  } from '../../lib/supabase'

export default function Register() {

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
                shouldCreateUser: true
            }
        })

        if (error) {
            alert('Error enviando el OTP: ' + error.message)
            return
        }

        alert('OTP enviado al email')
        localStorage.setItem("email_registro", email)
        redirigir.push('/verify-otp')
    }

    return (
        <div>
            <h1>Registro</h1>
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
