'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyOtpCode } from "../../lib/auth";

export default function VerifyOtpPage() {
    const [otp, setOtp] = useState("");
    const router = useRouter();

  const handleVerify = async () => {
    const email = localStorage.getItem("email_registro");

    const { ok, error } = await verifyOtpCode(email, otp);

    if (!ok) {
      alert(error);
      return;
    }

    router.push("/password/create-password");
  };

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