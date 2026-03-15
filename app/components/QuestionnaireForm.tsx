"use client";

import React, { useState } from 'react';
import { submitQuestionnaire, updateQuestionnaire } from '@/app/actions/questionnaire';

interface QuestionnaireFormProps {
  hmoOptions: string[];
  referralReasons: string[];
  initialData?: any;
  isEdit?: boolean;
}

export default function QuestionnaireForm({ hmoOptions, referralReasons, initialData, isEdit }: QuestionnaireFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (date: any) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    idNumber: initialData?.idNumber || '',
    dateOfBirth: formatDate(initialData?.dateOfBirth),
    gender: initialData?.gender || 'זכר',
    city: initialData?.city || '',
    hmo: initialData?.hmo || hmoOptions[0] || 'כללית',
    language: initialData?.language || 'עברית',
    maritalStatus: initialData?.maritalStatus || 'רווק/ה',
    hasChildren: initialData?.hasChildren ? 'כן' : 'לא',
    childrenAges: initialData?.childrenAges || '',
    employmentStatus: initialData?.employmentStatus || 'עובד',
    receivesDisability: initialData?.receivesDisability ? 'כן' : 'לא',
    militaryService: initialData?.militaryService || 'מלא',

    scoreSafety: initialData?.scoreSafety ?? 5,
    scoreFunctioning: initialData?.scoreFunctioning ?? 5,
    scorePhysicalDrug: initialData?.scorePhysicalDrug ?? 5,
    scoreEnvironment: initialData?.scoreEnvironment ?? 5,
    scoreStress: initialData?.scoreStress ?? 5,
    scoreReadiness: initialData?.scoreReadiness ?? 5,

    hasDrugUse: initialData?.hasDrugUse ? 'כן' : 'לא',
    drugType: initialData?.drugType || '',
    drugFrequency: initialData?.drugFrequency || '',
    hasAlcoholUse: initialData?.hasAlcoholUse ? 'כן' : 'לא',
    alcoholType: initialData?.alcoholType || '',
    alcoholFrequency: initialData?.alcoholFrequency || '',
    expectations: initialData?.expectations || '',
    notes: initialData?.notes || '',

    isFirstVisit: initialData?.isFirstVisit === false ? 'חוזרת' : 'ראשונה',
    pastTreatment: initialData?.pastTreatment || '',
    rehabBasket: initialData?.rehabBasket ? 'כן' : 'לא',
    hasCoordinator: initialData?.hasCoordinator ? 'כן' : 'לא',
    referringSource: initialData?.referringSource || 'פנייה עצמית',
    reasonForReferral: initialData?.reasonForReferral || referralReasons[0] || 'חרדה',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let result;
    if (isEdit && initialData?.id) {
      result = await updateQuestionnaire(initialData.id, formData);
    } else {
      result = await submitQuestionnaire(formData);
    }

    setIsSubmitting(false);

    if (result.success) {
      if (isEdit) {
        alert('השאלון עודכן בהצלחה!');
        window.location.href = `/dashboard/${initialData.id}`;
      } else {
        setIsSubmitted(true);
        window.scrollTo(0, 0);
      }
    } else {
      alert('שגיאה בשמירת השאלון. נא לנסות שוב.');
    }
  };

  // ── Success screen ──
  if (isSubmitted) {
    return (
      <div className="container" style={{ maxWidth: '600px', marginTop: '60px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '60px 30px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
          <h1 style={{ color: 'var(--hy-green)', marginBottom: '12px' }}>תודה רבה!</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
            השאלון שלך נשלח בהצלחה וייבדק על ידי הצוות הרפואי.
          </p>
          <button type="button" className="btn btn-primary" style={{ padding: '12px 40px', fontSize: '1rem' }} onClick={() => window.location.reload()}>
            שלח שאלון חדש
          </button>
        </div>
      </div>
    );
  }

  const scoreItems = [
    { id: 'scoreSafety',      label: 'מידת ביטחון מפני פגיעה עצמית/אחרים' },
    { id: 'scoreFunctioning', label: 'יכולת ביצוע מטלות רגילות' },
    { id: 'scorePhysicalDrug',label: 'קושי עקב בעיות רפואיות/חומרים' },
    { id: 'scoreEnvironment', label: 'נוכחות אנשים קרובים לסיוע' },
    { id: 'scoreStress',      label: 'מידת הצפה מאירועי חיים' },
    { id: 'scoreReadiness',   label: 'פניות ומוכנות לטיפול' },
  ];

  return (
    <div className="container" style={{ maxWidth: '860px' }}>

      {/* ── Header ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--hy-dark-blue), var(--hy-blue))',
          padding: '28px 32px', color: 'white',
        }}>
          <h1 style={{ margin: 0, color: 'white', fontSize: '1.5rem' }}>
            {isEdit ? '✏️ עריכת שאלון פנייה' : 'שאלון פנייה לטיפול'}
          </h1>
          <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: '0.95rem' }}>
            המרכז הרפואי הלל יפה | מרכז שלו לבריאות הנפש
          </p>
        </div>
        <div style={{
          padding: '12px 32px', background: '#f8fafc',
          borderBottom: '1px solid var(--border-color)',
          fontSize: '0.85rem', color: 'var(--text-secondary)',
          display: 'flex', gap: '24px',
        }}>
          <span>📅 {new Date().toLocaleDateString('he-IL')}</span>
          <span>⏱ כ-10 דקות למילוי</span>
          <span>🔒 המידע חסוי</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ── Part A: Personal ── */}
        <div className="card">
          <h2>חלק א׳ · פרטים אישיים ומנהלתיים</h2>

          <div className="grid-2">
            <div>
              <label className="label mandatory">שם מלא</label>
              <input type="text" name="fullName" className="input" required value={formData.fullName} onChange={handleChange} placeholder="שם פרטי ומשפחה" />
            </div>
            <div>
              <label className="label mandatory">מספר ת.ז</label>
              <input type="text" name="idNumber" className="input" required value={formData.idNumber} onChange={handleChange} placeholder="9 ספרות" />
            </div>
            <div>
              <label className="label mandatory">תאריך לידה</label>
              <input type="date" name="dateOfBirth" className="input" required value={formData.dateOfBirth} onChange={handleChange} />
            </div>
            <div>
              <label className="label mandatory">מגדר</label>
              <select name="gender" className="input" onChange={handleChange} value={formData.gender}>
                <option value="זכר">זכר</option>
                <option value="נקבה">נקבה</option>
                <option value="אחר">אחר</option>
              </select>
            </div>
            <div>
              <label className="label mandatory">יישוב מגורים</label>
              <input type="text" name="city" className="input" required value={formData.city} onChange={handleChange} placeholder="שם הישוב" />
            </div>
            <div>
              <label className="label mandatory">קופת חולים</label>
              <select name="hmo" className="input" onChange={handleChange} value={formData.hmo}>
                {hmoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="label mandatory">שפה מועדפת</label>
              <select name="language" className="input" onChange={handleChange} value={formData.language}>
                <option value="עברית">עברית</option>
                <option value="ערבית">ערבית</option>
                <option value="אנגלית">אנגלית</option>
                <option value="אמהרית">אמהרית</option>
                <option value="רוסית">רוסית</option>
                <option value="אחר">אחר</option>
              </select>
            </div>
            <div>
              <label className="label mandatory">מצב משפחתי</label>
              <select name="maritalStatus" className="input" onChange={handleChange} value={formData.maritalStatus}>
                <option value="רווק/ה">רווק/ה</option>
                <option value="נשוי/ה">נשוי/ה</option>
                <option value="גרוש/ה">גרוש/ה</option>
                <option value="אלמן/ה">אלמן/ה</option>
              </select>
            </div>
            <div>
              <label className="label mandatory">ילדים</label>
              <select name="hasChildren" className="input" onChange={handleChange} value={formData.hasChildren}>
                <option value="לא">לא</option>
                <option value="כן">כן</option>
              </select>
            </div>
            {formData.hasChildren === 'כן' && (
              <div>
                <label className="label">גילאי ילדים</label>
                <input type="text" name="childrenAges" className="input" value={formData.childrenAges} onChange={handleChange} placeholder="לדוגמה: 3, 7, 12" />
              </div>
            )}
            <div>
              <label className="label mandatory">תעסוקה</label>
              <select name="employmentStatus" className="input" onChange={handleChange} value={formData.employmentStatus}>
                <option value="עובד">עובד/ת</option>
                <option value="לא עובד">לא עובד/ת</option>
                <option value="גמלאי">גמלאי/ת</option>
              </select>
            </div>
            <div>
              <label className="label mandatory">קצבת נכות נפשית</label>
              <select name="receivesDisability" className="input" onChange={handleChange} value={formData.receivesDisability}>
                <option value="לא">לא</option>
                <option value="כן">כן</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '4px' }}>
            <label className="label mandatory">שירות צבאי</label>
            <select name="militaryService" className="input" onChange={handleChange} value={formData.militaryService}>
              <option value="מלא">שירות מלא</option>
              <option value="חלקי">שירות חלקי</option>
              <option value="שירות לאומי">שירות לאומי</option>
              <option value="ללא שירות">ללא שירות</option>
              <option value="אחר">אחר</option>
            </select>
          </div>
        </div>

        {/* ── Part B: Scores ── */}
        <div className="card">
          <h2>חלק ב׳ · הערכת תפקוד ורווחה</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.92rem' }}>
            דרג מ-1 (קושי משמעותי) עד 5 (ללא קושי כלל) עבור 30 הימים האחרונים:
          </p>

          <div style={{ display: 'grid', gap: '16px' }}>
            {scoreItems.map(q => {
              const val = (formData as any)[q.id] as number;
              const isLow = val <= 2;
              return (
                <div key={q.id} style={{
                  padding: '16px 18px', borderRadius: '10px',
                  background: isLow ? '#fff8f8' : '#f8fafc',
                  border: `1px solid ${isLow ? '#ffcdd2' : 'var(--border-color)'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label className="label mandatory" style={{ margin: 0, fontSize: '0.92rem' }}>
                      {q.label}
                    </label>
                    <span style={{
                      fontSize: '1.5rem', fontWeight: 800, minWidth: '36px', textAlign: 'center',
                      color: isLow ? '#c62828' : val >= 4 ? '#2e7d32' : 'var(--hy-blue)',
                    }}>{val}</span>
                  </div>
                  <input
                    type="range"
                    name={q.id}
                    title={q.label}
                    min="1" max="5"
                    className="input"
                    style={{ marginTop: 0, padding: 0, cursor: 'pointer' }}
                    onChange={handleChange}
                    value={val}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '2px 2px 0' }}>
                    <span>1 — קושי משמעותי</span>
                    <span>5 — ללא קושי</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Part C: Background ── */}
        <div className="card">
          <h2>חלק ג׳ · רקע וסיבת הפנייה</h2>

          <div className="grid-2">
            <div>
              <label className="label mandatory">פנייה ראשונה?</label>
              <select name="isFirstVisit" className="input" onChange={handleChange} value={formData.isFirstVisit}>
                <option value="ראשונה">ראשונה</option>
                <option value="חוזרת">חוזרת</option>
              </select>
            </div>
            <div>
              <label className="label mandatory">טיפול נפשי בעבר?</label>
              <select name="pastTreatment" className="input" onChange={handleChange} value={formData.pastTreatment}>
                <option value="לא">לא</option>
                <option value="כן">כן</option>
              </select>
            </div>
            <div>
              <label className="label mandatory">סל שיקום?</label>
              <select name="rehabBasket" className="input" onChange={handleChange} value={formData.rehabBasket}>
                <option value="לא">לא</option>
                <option value="כן">כן</option>
              </select>
            </div>
            <div>
              <label className="label mandatory">מלווה / מתאם טיפול?</label>
              <select name="hasCoordinator" className="input" onChange={handleChange} value={formData.hasCoordinator}>
                <option value="לא">לא</option>
                <option value="כן">כן</option>
              </select>
            </div>
            <div>
              <label className="label mandatory">הגורם המפנה</label>
              <select name="referringSource" className="input" onChange={handleChange} value={formData.referringSource}>
                <option value="פנייה עצמית">פנייה עצמית</option>
                <option value="רופא משפחה">רופא משפחה</option>
                <option value="מחלקת אשפוז">מחלקת אשפוז</option>
                <option value="גורם אחר">גורם אחר</option>
              </select>
            </div>
            <div>
              <label className="label mandatory">סיבת פנייה עיקרית</label>
              <select name="reasonForReferral" className="input" onChange={handleChange} value={formData.reasonForReferral}>
                {referralReasons.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          {/* Drug use */}
          <div className="grid-2" style={{ marginTop: '8px' }}>
            <div>
              <label className="label mandatory">שימוש בסמים?</label>
              <select name="hasDrugUse" className="input" onChange={handleChange} value={formData.hasDrugUse}>
                <option value="לא">לא</option>
                <option value="כן">כן</option>
              </select>
            </div>
            {formData.hasDrugUse === 'כן' && (
              <div className="grid-2">
                <div>
                  <label className="label mandatory">סוג הסם</label>
                  <input type="text" name="drugType" className="input" required value={formData.drugType} onChange={handleChange} />
                </div>
                <div>
                  <label className="label mandatory">תדירות שימוש</label>
                  <select name="drugFrequency" className="input" required value={formData.drugFrequency} onChange={handleChange}>
                    <option value="">בחר תדירות...</option>
                    <option value="באופן מזדמן">באופן מזדמן</option>
                    <option value="פעם בשבוע">פעם בשבוע</option>
                    <option value="מספר פעמים בשבוע">מספר פעמים בשבוע</option>
                    <option value="באופן יומיומי">באופן יומיומי</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Alcohol use */}
          <div className="grid-2" style={{ marginTop: '8px' }}>
            <div>
              <label className="label mandatory">שימוש באלכוהול?</label>
              <select name="hasAlcoholUse" className="input" onChange={handleChange} value={formData.hasAlcoholUse}>
                <option value="לא">לא</option>
                <option value="כן">כן</option>
              </select>
            </div>
            {formData.hasAlcoholUse === 'כן' && (
              <div className="grid-2">
                <div>
                  <label className="label mandatory">סוג האלכוהול</label>
                  <input type="text" name="alcoholType" className="input" required value={formData.alcoholType} onChange={handleChange} />
                </div>
                <div>
                  <label className="label mandatory">תדירות שימוש</label>
                  <select name="alcoholFrequency" className="input" required value={formData.alcoholFrequency} onChange={handleChange}>
                    <option value="">בחר תדירות...</option>
                    <option value="באופן מזדמן">באופן מזדמן</option>
                    <option value="פעם בשבוע">פעם בשבוע</option>
                    <option value="מספר פעמים בשבוע">מספר פעמים בשבוע</option>
                    <option value="באופן יומיומי">באופן יומיומי</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '12px' }}>
            <label className="label">ציפיות מהטיפול (אופציונלי)</label>
            <textarea name="expectations" className="input" rows={3} value={formData.expectations} onChange={handleChange} placeholder="מה מטרתך בפנייה לטיפול?" />
          </div>
        </div>

        {/* ── Part D: Notes ── */}
        <div className="card">
          <h2>חלק ד׳ · הערות ומינהלה</h2>
          <label className="label">משהו נוסף שחשוב שנדע?</label>
          <textarea name="notes" className="input" rows={4} value={formData.notes} onChange={handleChange} placeholder="הערות נוספות..." />
        </div>

        {/* ── Submit ── */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '14px 60px', fontSize: '1.05rem', borderRadius: '8px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? '⏳ שומר...' : isEdit ? '✅ עדכן שאלון' : '📨 שלח שאלון'}
          </button>
        </div>

      </form>
    </div>
  );
}
