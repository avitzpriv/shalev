import type { Metadata } from "next";
import "./globals.css";
import { auth, signOut } from "@/app/lib/auth";

export const metadata: Metadata = {
  title: "מרכז שלו - שאלון פנייה",
  description: "מערכת ניהול פניות למרכז לבריאות הנפש שלו",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="he" dir="rtl">
      <body>
        <nav className="navbar">
          <div className="nav-container">
            <div style={{ fontWeight: 800, color: 'var(--hy-blue)', fontSize: '1.2rem' }}>מרכז שלו</div>
            <div className="nav-links">
              {session && (
                <>
                  <a href="/patient" className="nav-link">טופס מטופל</a>
                  <a href="/dashboard" className="nav-link">רשימת פונים</a>
                  <a href="/admin" className="nav-link">אדמין</a>
                </>
              )}
            </div>
            {session ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                   שלום, {session.user?.email}
                </span>
                <form action={async () => {
                   "use server";
                   await signOut({ redirectTo: "/auth/login" });
                }}>
                  <button type="submit" className="btn" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>התנתק</button>
                </form>
              </div>
            ) : (
              <a href="/auth/login" className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>כניסת צוות</a>
            )}
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
