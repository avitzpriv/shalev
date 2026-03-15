"use client";

import { deleteUser, updateUserRole, resetPassword } from "@/app/actions/admin";

interface User {
  id: string;
  email: string;
  role: string;
  phoneNumber: string | null;
  lastLoginAt: Date | null;
}

export default function UserTable({ users }: { users: User[] }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: '20px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--hy-blue)', color: 'white', textAlign: 'right' }}>
            <th style={{ padding: '12px' }}>אימייל</th>
            <th style={{ padding: '12px' }}>תפקיד</th>
            <th style={{ padding: '12px' }}>טלפון</th>
            <th style={{ padding: '12px' }}>התחברות אחרונה</th>
            <th style={{ padding: '12px' }}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px' }}>{user.email}</td>
              <td style={{ padding: '12px' }}>
                <select 
                  defaultValue={user.role} 
                  className="input" 
                  style={{ padding: '4px', fontSize: '0.8rem' }}
                  onChange={async (e) => {
                    await updateUserRole(user.id, e.target.value);
                  }}
                >
                  <option value="CLERK">פקידה</option>
                  <option value="DOCTOR">רופא</option>
                  <option value="ADMIN">אדמין</option>
                </select>
              </td>
              <td style={{ padding: '12px' }}>{user.phoneNumber || '-'}</td>
              <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('he-IL') : 'מעולם לא'}
              </td>
              <td style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                <form action={async (formData) => {
                  const newPass = formData.get('newPassword') as string;
                  if (newPass) {
                    await resetPassword(user.id, newPass);
                    alert('סיסמה אופסה בהצלחה');
                  }
                }} style={{ display: 'flex', gap: '5px' }}>
                  <input type="password" name="newPassword" placeholder="סיסמה חדשה" className="input" style={{ padding: '4px', fontSize: '0.7rem', width: '80px' }} />
                  <button type="submit" className="btn" style={{ fontSize: '0.7rem', padding: '4px 8px' }}>אפס</button>
                </form>
                
                <button 
                  onClick={async () => {
                    if (confirm('בטוח שברצונך למחוק?')) {
                      await deleteUser(user.id);
                    }
                  }} 
                  className="btn" 
                  style={{ background: '#ff4d4f', color: 'white', fontSize: '0.7rem', padding: '4px 8px' }}
                >
                  מחיקה
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
