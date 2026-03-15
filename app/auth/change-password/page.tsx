"use client";

import React, { useState } from "react";
import { changePasswordAction } from "@/app/actions/changePassword";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirm) {
      setError("הסיסמאות אינן תואמות");
      return;
    }
    if (newPassword.length < 8) {
      setError("הסיסמה חייבת להכיל לפחות 8 תווים");
      return;
    }

    setLoading(true);
    const res = await changePasswordAction(newPassword);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="container" style={{ marginTop: "100px", maxWidth: "420px" }}>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          background: "linear-gradient(135deg, var(--hy-dark-blue), var(--hy-blue))",
          padding: "28px 32px", color: "white", textAlign: "center",
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🔐</div>
          <h1 style={{ margin: 0, color: "white", fontSize: "1.3rem" }}>נדרש לשנות סיסמה</h1>
          <p style={{ margin: "8px 0 0", opacity: 0.85, fontSize: "0.9rem" }}>
            זוהי הכניסה הראשונה שלך — אנא הגדר סיסמה אישית
          </p>
        </div>

        <div style={{ padding: "28px 32px" }}>
          {error && (
            <div style={{
              background: "#ffebee", border: "1px solid #ef9a9a", borderRadius: "8px",
              padding: "10px 14px", marginBottom: "16px",
              color: "#c62828", fontSize: "0.9rem", fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="label mandatory">סיסמה חדשה</label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="לפחות 8 תווים"
              required
              autoFocus
            />

            <label className="label mandatory">אימות סיסמה</label>
            <input
              type="password"
              className="input"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="הזן שוב את הסיסמה"
              required
            />

            <div style={{ marginTop: "24px" }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "12px" }}
                disabled={loading}
              >
                {loading ? "שומר..." : "שמור סיסמה וכנס למערכת"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
