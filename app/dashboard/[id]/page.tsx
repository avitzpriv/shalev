import prisma from "@/app/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getConfig } from "@/app/lib/config";
import { auth } from "@/app/lib/auth";

async function makeDecision(formData: FormData) {
  "use server";
  const session = await auth();

  if (!session || !session.user || !(session.user as any).id) {
    throw new Error("מזהה משתמש חסר. אנא בצעו יציאה וכניסה מחדש למערכת");
  }

  const questionnaireId = formData.get("questionnaireId") as string;
  const decisionType = formData.get("decisionType") as string;
  const argumentation = formData.get("argumentation") as string;

  await prisma.decision.create({
    data: {
      questionnaireId,
      doctorId: (session.user as any).id,
      decisionType,
      argumentation,
    },
  });

  await prisma.questionnaire.update({
    where: { id: questionnaireId },
    data: { status: "DECIDED" },
  });

  revalidatePath(`/dashboard/${questionnaireId}`);
  revalidatePath("/dashboard");
}

const STATUS_MAP: Record<string, string> = {
  NEW: "חדש",
  DECIDED: "התקבלה החלטה",
  PENDING_REVIEW: "בבדיקה",
  ARCHIVED: "ארכיון",
};

function statusChip(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    NEW:            { bg: "#ede7f6", color: "#6a1b9a" },
    DECIDED:        { bg: "#e8f5e9", color: "#2e7d32" },
    PENDING_REVIEW: { bg: "#fffde7", color: "#f57f17" },
  };
  const s = map[status] ?? { bg: "#f5f5f5", color: "#616161" };
  return (
    <span style={{
      display: "inline-block", padding: "3px 12px", borderRadius: "12px",
      fontSize: "0.8rem", fontWeight: 600, background: s.bg, color: s.color,
    }}>
      {STATUS_MAP[status] ?? status}
    </span>
  );
}

export default async function SubmissionDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = await prisma.questionnaire.findUnique({
    where: { id },
    include: {
      decisions: { include: { doctor: true }, orderBy: { timestamp: "desc" } },
      recommendations: { orderBy: { timestamp: "desc" } },
    },
  });

  if (!submission) notFound();

  const decisionTypes = await getConfig(
    "decision-types",
    "זימון לאינטייק, הפנייה לגורם בקהילה, דחיית פנייה, בקשת פרטים נוספים"
  );

  const scores = [
    { label: "בטיחות",      value: submission.scoreSafety },
    { label: "תפקוד",       value: submission.scoreFunctioning },
    { label: "גופני/סמים",  value: submission.scorePhysicalDrug },
    { label: "סביבה",       value: submission.scoreEnvironment },
    { label: "דחק",         value: submission.scoreStress },
    { label: "מוכנות",      value: submission.scoreReadiness },
  ];

  const personalDetails = [
    { icon: "🪪",  label: "ת.ז",           value: submission.idNumber },
    { icon: "🎂",  label: "תאריך לידה",    value: submission.dateOfBirth.toLocaleDateString("he-IL") },
    { icon: "👤",  label: "מגדר",           value: submission.gender },
    { icon: "🏙️", label: "יישוב",          value: submission.city },
    { icon: "🏥",  label: "קופת חולים",    value: submission.hmo },
    { icon: "🌐",  label: "שפה",            value: submission.language },
    { icon: "👥",  label: "מצב משפחתי",    value: submission.maritalStatus },
    { icon: "💼",  label: "תעסוקה",         value: submission.employmentStatus },
    { icon: "🪖",  label: "שירות צבאי",    value: submission.militaryService },
  ];

  return (
    <div className="container" style={{ maxWidth: "1100px" }}>

      {/* ── TOP BAR ── */}
      <div className="card" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 24px",
      }}>
        <Link href="/dashboard" className="btn" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          → חזרה לרשימה
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "50%",
            background: submission.scoreSafety === 5
              ? "linear-gradient(135deg,#ef5350,#c62828)"
              : "linear-gradient(135deg,var(--hy-blue),var(--hy-dark-blue))",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 800, fontSize: "1.1rem", flexShrink: 0,
          }}>
            {submission.fullName.charAt(0)}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.3rem" }}>{submission.fullName}</h1>
            <div style={{ marginTop: "4px" }}>{statusChip(submission.status)}</div>
          </div>
        </div>

        <Link href={`/dashboard/${submission.id}/edit`} className="btn">
          ✏️ עריכת נתונים
        </Link>
      </div>

      {/* ── SAFETY ALERT ── */}
      {submission.scoreSafety >= 4 && (
        <div className="card" style={{
          background: "#ffebee", border: "2px solid #ef9a9a", padding: "14px 20px",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <span style={{ fontSize: "1.6rem" }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, color: "#c62828", fontSize: "1rem" }}>
              שימו לב: ציון בטיחות גבוה ({submission.scoreSafety})
            </div>
            <div style={{ fontSize: "0.85rem", color: "#e53935" }}>נדרשת התייחסות דחופה!</div>
          </div>
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div className="grid-2">

        {/* Personal details */}
        <div className="card">
          <h2>חלק א׳ · פרטים אישיים</h2>
          <div style={{ display: "grid", gap: "8px" }}>
            {personalDetails.map(item => item.value && (
              <div key={item.label} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "9px 12px", background: "#f8fafc", borderRadius: "8px",
              }}>
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: "0.92rem", color: "var(--text-primary)", fontWeight: 500 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scores */}
        <div className="card">
          <h2>חלק ב׳ · ציוני הערכה (1–5)</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "20px" }}>
            {scores.map(s => {
              const urgent = s.label === "בטיחות" && s.value === 5;
              return (
                <div key={s.label} style={{
                  textAlign: "center", padding: "14px 8px", borderRadius: "10px",
                  background: urgent ? "#ffebee" : "#f0f7ff",
                  border: `1px solid ${urgent ? "#ffcdd2" : "#dbeafe"}`,
                }}>
                  <div style={{
                    fontSize: "1.8rem", fontWeight: 800, lineHeight: 1,
                    color: urgent ? "#c62828" : "var(--hy-blue)",
                  }}>{s.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "5px", fontWeight: 600 }}>
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* LOCUS recommendations */}
          <h3 style={{ marginBottom: "10px" }}>המלצות מערכת (LOCUS)</h3>
          {submission.recommendations.length > 0 ? (
            submission.recommendations.map((rec: any) => (
              <div key={rec.id} style={{
                padding: "12px 14px", background: "#f6ffed",
                borderRight: "4px solid #52c41a", borderRadius: "0 8px 8px 0",
                marginBottom: "8px",
              }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  רמת אינטנסיביות: {rec.intensityStr}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "3px" }}>
                  רמת LOCUS: {rec.locusLevel} · {rec.timestamp.toLocaleString("he-IL")}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>אין המלצות קיימות לפנייה זו</p>
          )}
        </div>
      </div>

      {/* ── BACKGROUND & NOTES ── */}
      <div className="card">
        <h2>חלק ג׳ ו-ד׳ · רקע והערות</h2>
        <div className="grid-2" style={{ marginBottom: "12px" }}>
          <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "3px" }}>סיבת פנייה</div>
            <div style={{ fontSize: "0.92rem" }}>{submission.reasonForReferral || "-"}</div>
          </div>
          <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "3px" }}>פנייה ראשונה</div>
            <div style={{ fontSize: "0.92rem" }}>{submission.isFirstVisit ? "כן" : "לא"}</div>
          </div>
        </div>
        <div className="grid-2" style={{ marginBottom: "12px" }}>
          <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "3px" }}>שימוש בסמים</div>
            <div style={{ fontSize: "0.92rem" }}>
              {submission.hasDrugUse ? `כן (${submission.drugType}, ${submission.drugFrequency})` : "לא"}
            </div>
          </div>
          <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "3px" }}>שימוש באלכוהול</div>
            <div style={{ fontSize: "0.92rem" }}>
              {submission.hasAlcoholUse ? `כן (${submission.alcoholType}, ${submission.alcoholFrequency})` : "לא"}
            </div>
          </div>
        </div>
        {submission.expectations && (
          <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "8px", marginBottom: "8px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "3px" }}>ציפיות מהטיפול</div>
            <div style={{ fontSize: "0.92rem" }}>{submission.expectations}</div>
          </div>
        )}
        {submission.notes && (
          <div style={{ padding: "10px 14px", background: "#fffde7", borderRadius: "8px", border: "1px solid #fff9c4" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "3px" }}>הערות נוספות</div>
            <div style={{ fontSize: "0.92rem" }}>{submission.notes}</div>
          </div>
        )}
      </div>

      {/* ── DECISIONS ── */}
      <div className="card">
        <h2>ניהול פנייה · החלטות רפואיות</h2>

        {submission.decisions.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ marginBottom: "10px" }}>היסטוריית החלטות</h3>
            {submission.decisions.map((d: any) => (
              <div key={d.id} style={{
                padding: "12px 14px",
                borderRight: "4px solid var(--hy-blue)",
                background: "#f5f9ff",
                borderRadius: "0 8px 8px 0",
                marginBottom: "10px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{d.decisionType}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    {d.timestamp.toLocaleString("he-IL")}
                  </div>
                </div>
                {d.argumentation && (
                  <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "5px" }}>
                    {d.argumentation}
                  </div>
                )}
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  ע"י {d.doctor.email}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
          <h3 style={{ marginBottom: "14px" }}>הוסף החלטה חדשה</h3>
          <form action={makeDecision}>
            <input type="hidden" name="questionnaireId" value={submission.id} />
            <label className="label">סוג החלטה</label>
            <select name="decisionType" className="input" required title="סוג החלטה">
              {decisionTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <label className="label">נימוק רפואי (אופציונלי)</label>
            <textarea name="argumentation" className="input" rows={3} title="נימוק רפואי" placeholder="הזן נימוק רפואי..." />
            <div style={{ marginTop: "16px" }}>
              <button type="submit" className="btn btn-primary">שמור החלטה</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
