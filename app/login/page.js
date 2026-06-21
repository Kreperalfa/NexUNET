'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient  } from '../../lib/supabase'

export default function Login(){
    const correosPermitidos = ['milangelloomar@gmail.com', 'mjaimesmoncada@gmail.com']

    function esCorreoUNET(email) {
        return email.toLowerCase().endsWith("@unet.edu.ve");
    }

    function esCorreoPermitido(email){
        return correosPermitidos.includes(email.toLowerCase())
    }

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const redirigir = useRouter()

    // ✔ Cliente correcto
    const supabase = getSupabaseBrowserClient ()

    const manejoLogin = async () =>{
        if(!esCorreoUNET(email) && !esCorreoPermitido(email)){
            alert('Correo no permitido')
            return
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if(error){
            alert('Error al iniciar sesión')
            return
        }

        redirigir.push('/dashboard')
    }

    const manejoRegisro = () => redirigir.push('/register')
    const cambiarcontraseña = () => redirigir.push('/password/change-password')

    return (
    <div>
        <h1>Login</h1>
        <p>Ingrese su correo</p>
        <input
            type="email"
            placeholder="Dirección de correo"
            onChange={(e) => setEmail(e.target.value)}
        />
        <p>Ingrese su contraseña</p>
        <input
            type="password"
            placeholder="Contraseña"
            onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button onClick={manejoLogin}>Iniciar Sesion</button>
        <button onClick={manejoRegisro}>Registrate</button>
        <button onClick={cambiarcontraseña}>Cambiar contraseña</button>
    </div>
    )
}
