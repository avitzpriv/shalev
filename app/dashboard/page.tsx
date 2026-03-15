import prisma from "@/app/lib/db";
import DashboardTable from "./DashboardTable";
import { auth } from "@/app/lib/auth";

const ROLE_MAP: Record<string, string> = {
  ADMIN: 'מנהל',
  CLERK: 'פקידה',
  DOCTOR: 'רופא',
};

const MONTH_NAMES = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const DAY_NAMES = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];

export default async function Dashboard() {
  const session = await auth();
  const userId = session?.user?.id;
  const now = new Date();

  const [submissions, user] = await Promise.all([
    prisma.questionnaire.findMany({
      include: {
        decisions: { orderBy: { timestamp: 'desc' }, take: 1 },
        recommendations: { orderBy: { timestamp: 'desc' }, take: 1 }
      },
      orderBy: { submittedAt: 'desc' }
    }),
    userId ? prisma.user.findUnique({ where: { id: userId }, select: { role: true, dashboardColumns: true } }) : null
  ]);

  const initialColumns = user?.dashboardColumns ? user.dashboardColumns.split(',') : null;

  const userEmail = session?.user?.email || '';
  const userRole = (user?.role as string) || '';
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <div className="container" style={{ maxWidth: '1400px' }}>
      {/* Header card */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--hy-blue), var(--hy-dark-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1.4rem'
          }}>
            {userInitial}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              שלום, {userEmail}
            </div>
            <div style={{ marginTop: '6px' }}>
              {userRole && (
                <span style={{
                  display: 'inline-block', padding: '3px 12px', borderRadius: '12px',
                  fontSize: '0.8rem', fontWeight: 700,
                  background: '#e3f2fd', color: '#1565c0', border: '1px solid #90caf9'
                }}>
                  {ROLE_MAP[userRole] || userRole}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Date widget */}
        <div style={{
          background: 'var(--hy-dark-blue)', color: 'white',
          borderRadius: '12px', padding: '12px 24px', textAlign: 'center', minWidth: '100px'
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.85 }}>{DAY_NAMES[now.getDay()]}</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.1 }}>{now.getDate()}</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.85 }}>{MONTH_NAMES[now.getMonth()]}</div>
        </div>
      </div>

      <DashboardTable submissions={submissions as any} initialColumns={initialColumns} />
    </div>
  );
}
