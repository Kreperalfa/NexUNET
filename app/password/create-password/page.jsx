'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

import Card from "@/components/cards/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/buttons/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import PageTitle from "@/components/ui/PageTitle";

import styles from "./page.module.css";

export default function Page() {
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const router = useRouter();
    const supabase = getSupabaseBrowserClient();

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

    async function handleSave() {
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError("Error al guardar contraseña");
            console.log(error);
            return;
        }

        const flujo = localStorage.getItem("flujo");

        if (flujo === "registro") {
            router.push("/creacion-perfil");
        } else {
            router.push("/dashboard");
        }
    }

    async function manejoCrearPassword() {
        setError("");

        if (password !== passwordConfirm) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (!passwordRegex.test(password)) {
            setError(
                "La contraseña debe tener:\n- Al menos 1 mayúscula\n- Al menos 1 número\n- Al menos 1 caracter especial\n- Mínimo 6 caracteres"
            );
            return;
        }

        setCargando(true);
        await handleSave();
        setCargando(false);
    }

    return (
        <main className="pantalla-centrada">
            <Card>
                <PageTitle>Crear contraseña</PageTitle>

                <p className={styles.subtitulo}>
                    Ingresa y confirma tu nueva contraseña
                </p>

                <ErrorMessage mensaje={error} />

                <Input
                    id="password"
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                />

                <Input
                    id="passwordConfirm"
                    label="Confirmar contraseña"
                    type="password"
                    placeholder="••••••••"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                />

                <Button
                    type="button"
                    variante="primario"
                    disabled={cargando}
                    onClick={manejoCrearPassword}
                >
                    {cargando ? "Guardando..." : "Confirmar"}
                </Button>
            </Card>
        </main>
    );
}
