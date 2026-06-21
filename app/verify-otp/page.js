"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabase";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const router = useRouter();

  // ✔ Cliente estable, no se recrea, no rompe Turbopack
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  async function handleVerify() {
    const email = localStorage.getItem("email_registro");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      alert("Código incorrecto");
      console.log(error);
      return;
    }

    router.push("/password/create-password");
  }

  return (
    <div>
      <h1>Ingresa tu código OTP</h1>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Código"
      />
      <button onClick={handleVerify}>Verificar</button>
    </div>
  );
}
