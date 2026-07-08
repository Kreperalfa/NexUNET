'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";
import { actualizarUltimaSesion } from "@/lib/perfil";

import Card from "@/components/cards/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/buttons/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import PageTitle from "@/components/ui/PageTitle";

import styles from "./page.module.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const router = useRouter();

    const manejoLogin = async (e) => {
        e.preventDefault();
        setError("");
        setCargando(true);

        const { ok, error } = await loginUser(email, password);

        if (!ok) {
            setError(error);
            setCargando(false);
            return;
        }

        await actualizarUltimaSesion();
        router.push("/dashboard");
    };

    return (
        <main className="pantalla-centrada">
            <Card>
                <form onSubmit={manejoLogin} noValidate>
                    
                    <PageTitle>Iniciar sesión</PageTitle>
                    <p className={styles.subtitulo}>Ingresa tus datos para continuar</p>

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

                    <Input
                        id="password"
                        label="Contraseña"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />

                    <Button type="submit" variante="primario" disabled={cargando}>
                        {cargando ? "Ingresando..." : "Iniciar sesión"}
                    </Button>

                    <Button
                        type="button"
                        variante="enlace"
                        onClick={() => router.push("/password/change-password")}
                    >
                        ¿Olvidaste tu contraseña?
                    </Button>

                    <div className={styles.pie}>
                        <span>¿No tienes cuenta?</span>
                        <Button
                            type="button"
                            variante="enlaceDestacado"
                            onClick={() => router.push("/register")}
                        >
                            Regístrate
                        </Button>
                    </div>
                </form>
            </Card>
        </main>
    );
}
