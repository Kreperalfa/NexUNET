'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtpForPasswordChange } from "@/lib/auth";

import Card from "@/components/cards/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/buttons/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import PageTitle from "@/components/ui/PageTitle";

import styles from "./page.module.css";

export default function ChangePassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const router = useRouter();

    const manejoVerificacion = async (e) => {
        e.preventDefault();
        setError("");
        setCargando(true);

        const { ok, error } = await sendOtpForPasswordChange(email);

        if (!ok) {
            setError(error);
            setCargando(false);
            return;
        }

        localStorage.setItem("email_registro", email);
        localStorage.setItem("flujo", "cambio-password");

        router.push("/verify-otp");
    };

    return (
        <main className="pantalla-centrada">
            <Card>
                <form onSubmit={manejoVerificacion} noValidate>

                    <PageTitle>Cambiar contraseña</PageTitle>
                    <p className={styles.subtitulo}>
                        Ingresa tu correo y te enviaremos un código de verificación
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

                    <Button
                        type="button"
                        variante="enlace"
                        onClick={() => router.push("/login")}
                    >
                        Volver a iniciar sesión
                    </Button>
                </form>
            </Card>
        </main>
    );
}

