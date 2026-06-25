'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient  } from '../../../lib/supabase'

export default function CreatePassword() {
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const redirigir = useRouter()

    // ✔ Cliente correcto (no global, no duplicado)
    const supabase = getSupabaseBrowserClient ()

    // ✔ Regex correcto
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

    async function handleSave() {
        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            alert('Error al guardar contraseña')
            console.log(error)
            return
        }

        redirigir.push('/creacion-perfil')
    }

    async function manejoCrearPassword() {
        if (password !== passwordConfirm) {
            alert('Las contraseñas no coinciden')
            return
        }

        if (!passwordRegex.test(password)) {
            alert(
                'La contraseña debe tener:\n- Al menos 1 mayúscula\n- Al menos 1 número\n- Al menos 1 caracter especial\n- Mínimo 6 caracteres'
            )
            return
        }

        await handleSave()
        alert('Contraseña creada')
    }

    return (
        <div>
            <h1>Crear Contraseña</h1>

            <p>Ingrese su contraseña</p>
            <input
                type="password"
                placeholder="Contraseña"
                onChange={(e) => setPassword(e.target.value)}
            />

            <p>Confirme su contraseña</p>
            <input
                type="password"
                placeholder="Confirmar contraseña"
                onChange={(e) => setPasswordConfirm(e.target.value)}
            />

            <button onClick={manejoCrearPassword}>Confirmar</button>
        </div>
    )
}
