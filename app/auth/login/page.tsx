"use client";

import React, { useState } from "react";
import { loginAction, verify2FAAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1); // 1: Login, 2: 2FA
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const res = await loginAction({ email, password });
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else if (res?.twoFactor) {
      setStep(2);
    } else if (res?.success) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await verify2FAAction(email, code, password);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="container" style={{ marginTop: "100px", maxWidth: "400px" }}>
      <div className="card">
        <h1 className="title-center">כניסה למערכת</h1>
        <p className="title-center" style={{ color: "var(--text-secondary)" }}>
          {step === 1 ? "אנא הזן פרטי התחברות" : `קוד אימות נשלח ל-${email}`}
        </p>

        {error && (
          <div style={{ color: "red", textAlign: "center", marginBottom: "10px", fontWeight: "bold" }}>
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleLogin}>
            <label className="label">אימייל</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="label">סיסמה</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div style={{ marginTop: "30px" }}>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                {loading ? "מתחבר..." : "התחבר"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify2FA}>
            <label className="label">קוד אימות (6 ספרות)</label>
            <input
              type="text"
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
              autoFocus
            />
            <div style={{ marginTop: "30px" }}>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                {loading ? "מאמת..." : "אמת וסיים"}
              </button>
              <button
                type="button"
                className="btn"
                style={{ width: "100%", marginTop: "10px" }}
                onClick={() => setStep(1)}
              >
                חזור
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
