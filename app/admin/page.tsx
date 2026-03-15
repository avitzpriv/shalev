import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { createUser } from "@/app/actions/admin";
import UserTable from "./UserTable";

async function updateConfig(formData: FormData) {
  "use server";
  const key = formData.get("key") as string;
  const value = formData.get("value") as string;

  await prisma.configItem.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });

  revalidatePath("/admin");
}

export default async function AdminPage() {
  const configs = await prisma.configItem.findMany();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  return (
    <div className="container" style={{ maxWidth: '1200px' }}>
       <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/dashboard" className="btn">&larr; חזרה לדשבורד</Link>
        <h1>הגדרות אדמין</h1>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>ניהול פקדים וערכים</h2>
          <div style={{ marginTop: '20px' }}>
            <form action={updateConfig} style={{ marginBottom: '25px', padding: '15px', background: '#f8fbfc', borderRadius: '10px' }}>
              <label className="label">קופות חולים</label>
              <input type="hidden" name="key" value="hmo-options" />
              <input type="text" name="value" className="input" defaultValue={configs.find((c: any) => c.key === 'hmo-options')?.value || "כללית, מכבי, מאוחדת, לאומית"} />
              <button type="submit" className="btn btn-success" style={{ marginTop: '10px' }}>עדכן רשימה</button>
            </form>

            <form action={updateConfig} style={{ marginBottom: '25px', padding: '15px', background: '#f8fbfc', borderRadius: '10px' }}>
              <label className="label">סיבות פנייה</label>
              <input type="hidden" name="key" value="referral-reasons" />
              <input type="text" name="value" className="input" defaultValue={configs.find((c: any) => c.key === 'referral-reasons')?.value || "חרדה, דיכאון, טראומה, משבר חיים, אחר"} />
              <button type="submit" className="btn btn-success" style={{ marginTop: '10px' }}>עדכן רשימה</button>
            </form>

            <form action={updateConfig} style={{ marginBottom: '25px', padding: '15px', background: '#f8fbfc', borderRadius: '10px' }}>
              <label className="label">סוגי החלטות רופא</label>
              <input type="hidden" name="key" value="decision-types" />
              <input type="text" name="value" className="input" defaultValue={configs.find((c: any) => c.key === 'decision-types')?.value || "זימון לאינטייק, הפנייה לגורם בקהילה, דחיית פנייה, בקשת פרטים נוספים"} />
              <button type="submit" className="btn btn-success" style={{ marginTop: '10px' }}>עדכן רשימה</button>
            </form>
          </div>
        </div>

        <div className="card">
          <h2>הוספת משתמש חדש</h2>
          <form action={createUser} style={{ marginTop: '20px' }}>
            <div className="grid-2">
              <div>
                <label className="label mandatory">אימייל</label>
                <input type="email" name="email" className="input" required />
              </div>
              <div>
                <label className="label mandatory">סיסמה ראשונית</label>
                <input type="password" name="password" className="input" required />
              </div>
            </div>
            <div className="grid-2">
              <div>
                <label className="label mandatory">תפקיד</label>
                <select name="role" className="input">
                  <option value="CLERK">פקידה</option>
                  <option value="DOCTOR">רופא</option>
                  <option value="ADMIN">אדמין</option>
                </select>
              </div>
              <div>
                <label className="label">טלפון (ל-2FA)</label>
                <input type="text" name="phoneNumber" className="input" placeholder="0500000000" />
              </div>
            </div>
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" name="twoFactorEnabled" id="2fa" style={{ width: '20px', height: '20px' }} />
              <label htmlFor="2fa">הפעל אימות דו-שלבי (SMS)</label>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }}>צור משתמש</button>
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h2>ניהול משתמשים קיימים</h2>
        <UserTable users={users as any} />
      </div>
    </div>
  );
}
