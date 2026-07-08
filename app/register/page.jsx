'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";

import Card from "@/components/cards/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/buttons/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import PageTitle from "@/components/ui/PageTitle";

import styles from "./page.module.css";

export default function Register() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const router = useRouter();

    const manejoVerificacion = async (e) => {
        e.preventDefault();
        setError("");
        setCargando(true);

        const { ok, error } = await registerUser(email);

        if (!ok) {
            setError(error);
            setCargando(false);
            return;
        }

        localStorage.setItem("email_registro", email);
        localStorage.setItem("flujo", "registro");

        router.push("/verify-otp");
    };

    return (
        <main className="pantalla-centrada">
            <Card>
                <form onSubmit={manejoVerificacion} noValidate>

                    <PageTitle>Crear cuenta</PageTitle>
                    <p className={styles.subtitulo}>
                        Ingresa tu correo para comenzar el registro
                    </p>

                    <ErrorMessage mensaje={error} />

                    <Input
                        id="email"
                        label="Correo electrónico"
                        type="email"
                        placeholder="nombre@unet.edu.ve"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />

                    <Button type="submit" variante="primario" disabled={cargando}>
                        {cargando ? "Enviando..." : "Enviar código de verificación"}
                    </Button>

                    <div className={styles.pie}>
                        <span>¿Ya tienes cuenta?</span>
                        <Button
                            type="button"
                            variante="enlaceDestacado"
                            onClick={() => router.push("/login")}
                        >
                            Inicia sesión
                        </Button>
                    </div>
                </form>
            </Card>
        </main>
    );
}

