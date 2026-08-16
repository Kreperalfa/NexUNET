'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyOtpCode } from "@/lib/auth";
import { actualizarUltimaSesion } from "@/lib/perfil";

import Card from "@/components/cards/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/buttons/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import PageTitle from "@/components/ui/PageTitle";

import styles from "./page.module.css";

export default function Page() {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const router = useRouter();

    const handleVerify = async () => {
        setError("");
        setCargando(true);

        const email = localStorage.getItem("email_registro");
        const { ok, error } = await verifyOtpCode(email, otp);

        if (!ok) {
            setError(error);
            setCargando(false);
            return;
        }

        await actualizarUltimaSesion();
        router.push("/password/create-password");
    };

    return (
        <main className="pantalla-centrada">
            <Card>
                <PageTitle>Verificación OTP</PageTitle>
                <p className={styles.subtitulo}>
                    Ingresa el código enviado a tu correo institucional
                </p>

                <ErrorMessage mensaje={error} />

                <Input
                    id="otp"
                    label="Código OTP"
                    type="text"
                    placeholder="Ej: 482913"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    autoComplete="one-time-code"
                />

                <Button
                    type="button"
                    variante="primario"
                    disabled={cargando}
                    onClick={handleVerify}
                >
                    {cargando ? "Verificando..." : "Verificar código"}
                </Button>

                <div className={styles.pie}>
                    <span>¿No recibiste el código?</span>
                    <Button
                        type="button"
                        variante="enlaceDestacado"
                        onClick={() => router.push("/password/change-password")}
                    >
                        Reenviar OTP
                    </Button>
                </div>
            </Card>
        </main>
    );
}
