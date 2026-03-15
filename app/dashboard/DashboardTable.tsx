"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { saveDashboardColumns } from '@/app/actions/user';

interface Questionnaire {
  id: string;
  submittedAt: Date;
  status: string;
  fullName: string;
  idNumber: string;
  gender: string;
  city: string;
  hmo: string;
  language: string;
  maritalStatus: string;
  employmentStatus: string;
  priority: number | null;
  scoreSafety: number;
  scoreFunctioning: number;
  scorePhysicalDrug: number;
  scoreEnvironment: number;
  scoreStress: number;
  scoreReadiness: number;
  reasonForReferral: string;
  decisions?: { decisionType: string }[];
  recommendations?: { intensityStr: string }[];
}

const ALL_COLUMNS = [
  { key: 'submittedAt', label: 'תאריך' },
  { key: 'status', label: 'סטטוס', options: ['חדש', 'התקבלה החלטה'] },
  { key: 'fullName', label: 'שם מלא' },
  { key: 'latestDecision', label: 'החלטה אחרונה' },
  { key: 'latestRecommendation', label: 'המלצה אחרונה' },
  { key: 'idNumber', label: 'ת.ז' },
  { key: 'gender', label: 'מגדר', options: ['זכר', 'נקבה', 'אחר'] },
  { key: 'city', label: 'עיר' },
  { key: 'hmo', label: 'קופת חולים' },
  { key: 'language', label: 'שפה', options: ['עברית', 'ערבית', 'אנגלית', 'אמהרית', 'רוסית', 'אחר'] },
  { key: 'maritalStatus', label: 'מצב משפחתי', options: ['רווק/ה', 'נשוי/ה', 'גרוש/ה', 'אלמן/ה'] },
  { key: 'employmentStatus', label: 'תעסוקה', options: ['עובד', 'לא עובד', 'גמלאי'] },
  { key: 'priority', label: 'עדיפות' },
  { key: 'scoreSafety', label: 'בטיחות', options: ['1','2','3','4','5'] },
  { key: 'scoreFunctioning', label: 'תפקוד', options: ['1','2','3','4','5'] },
  { key: 'scorePhysicalDrug', label: 'גופני/סמים', options: ['1','2','3','4','5'] },
  { key: 'scoreEnvironment', label: 'סביבה', options: ['1','2','3','4','5'] },
  { key: 'scoreStress', label: 'דחק', options: ['1','2','3','4','5'] },
  { key: 'scoreReadiness', label: 'מוכנות', options: ['1','2','3','4','5'] },
  { key: 'reasonForReferral', label: 'סיבת פנייה' },
];

const DEFAULT_COLUMNS = ['submittedAt', 'fullName', 'idNumber', 'status', 'latestDecision', 'latestRecommendation'];

const STATUS_MAP: Record<string, string> = {
  NEW: 'חדש',
  DECIDED: 'התקבלה החלטה',
  PENDING_REVIEW: 'בבדיקה',
  ARCHIVED: 'ארכיון',
};

function getStatusChipStyle(status: string): React.CSSProperties {
  if (status === 'NEW') return { background: '#ede7f6', color: '#6a1b9a' };
  if (status === 'DECIDED') return { background: '#e8f5e9', color: '#2e7d32' };
  if (status === 'PENDING_REVIEW') return { background: '#fffde7', color: '#f57f17' };
  return { background: '#f5f5f5', color: '#616161' };
}

function getRowBg(sub: Questionnaire, isSelected: boolean): string {
  if (sub.scoreSafety === 5) return isSelected ? '#ffcdd2' : '#ffebee';
  if (sub.status === 'NEW') return isSelected ? '#e1bee7' : '#f3e5f5';
  if (sub.status === 'DECIDED') return isSelected ? '#c8e6c9' : '#f1f8e9';
  if (sub.status === 'PENDING_REVIEW') return isSelected ? '#fff9c4' : '#fffde7';
  return isSelected ? '#e3f2fd' : '#ffffff';
}

const SCORES = [
  { label: 'בטיחות', key: 'scoreSafety' },
  { label: 'תפקוד', key: 'scoreFunctioning' },
  { label: 'גופני/סמים', key: 'scorePhysicalDrug' },
  { label: 'סביבה', key: 'scoreEnvironment' },
  { label: 'דחק', key: 'scoreStress' },
  { label: 'מוכנות', key: 'scoreReadiness' },
] as const;

export default function DashboardTable({
  submissions,
  initialColumns,
}: {
  submissions: Questionnaire[];
  initialColumns?: string[] | null;
}) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>(initialColumns || DEFAULT_COLUMNS);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(submissions[0]?.id ?? null);

  const toggleColumn = async (key: string) => {
    const next = visibleColumns.includes(key)
      ? visibleColumns.filter(k => k !== key)
      : [...visibleColumns, key];
    setVisibleColumns(next);
    try { await saveDashboardColumns(next); } catch { /* noop */ }
  };

  const handleSort = (key: string) => {
    setSortConfig(prev =>
      prev?.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const processedData = useMemo(() => {
    let result = submissions.filter(sub =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        let v: any;
        if (key === 'latestDecision') v = sub.decisions?.[0]?.decisionType || '';
        else if (key === 'latestRecommendation') v = sub.recommendations?.[0]?.intensityStr || '';
        else if (key === 'status') v = STATUS_MAP[sub.status] || sub.status;
        else v = (sub as any)[key];
        return v != null && v.toString().includes(value);
      })
    );
    if (sortConfig) {
      result = [...result].sort((a, b) => {
        let av: any, bv: any;
        if (sortConfig.key === 'latestDecision') { av = a.decisions?.[0]?.decisionType || ''; bv = b.decisions?.[0]?.decisionType || ''; }
        else if (sortConfig.key === 'latestRecommendation') { av = a.recommendations?.[0]?.intensityStr || ''; bv = b.recommendations?.[0]?.intensityStr || ''; }
        else if (sortConfig.key === 'status') { av = STATUS_MAP[a.status] || a.status; bv = STATUS_MAP[b.status] || b.status; }
        else { av = (a as any)[sortConfig.key]; bv = (b as any)[sortConfig.key]; }
        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
        if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [submissions, filters, sortConfig]);

  const selected = useMemo(() => submissions.find(s => s.id === selectedId), [submissions, selectedId]);

  const detailItems = selected ? [
    { icon: '🪪', label: 'ת.ז', value: selected.idNumber },
    { icon: '📅', label: 'תאריך פנייה', value: new Date(selected.submittedAt).toLocaleDateString('he-IL') },
    { icon: '🏙️', label: 'עיר', value: selected.city },
    { icon: '🏥', label: 'קופת חולים', value: selected.hmo },
    { icon: '👥', label: 'מצב משפחתי', value: selected.maritalStatus },
    { icon: '💼', label: 'תעסוקה', value: selected.employmentStatus },
    { icon: '🌐', label: 'שפה', value: selected.language },
  ] : [];

  return (
    <div>
      {/* ── TOP CARD — table ── */}
      <div className="card" style={{ overflow: 'visible', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: 0 }}>רשימת פונים</h3>
            <span style={{
              background: 'var(--hy-blue)', color: 'white',
              borderRadius: '12px', padding: '2px 9px', fontSize: '0.75rem', fontWeight: 700,
            }}>{processedData.length}</span>
          </div>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn"
              onClick={() => setShowColumnSelector(s => !s)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              ⚙️ עמודות
            </button>
            {showColumnSelector && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, background: 'white',
                border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px',
                zIndex: 100, boxShadow: 'var(--shadow-md)', minWidth: '200px',
                maxHeight: '360px', overflowY: 'auto',
              }}>
                {ALL_COLUMNS.map(col => (
                  <div key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                    <input
                      type="checkbox"
                      id={`col-${col.key}`}
                      checked={visibleColumns.includes(col.key)}
                      onChange={() => toggleColumn(col.key)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor={`col-${col.key}`} style={{ cursor: 'pointer', fontSize: '0.88rem' }}>{col.label}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ background: 'var(--hy-light-blue)' }}>
                {visibleColumns.map(colId => {
                  const col = ALL_COLUMNS.find(c => c.key === colId);
                  return (
                    <th key={colId} style={{ padding: '10px 12px', whiteSpace: 'nowrap', borderBottom: '2px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', userSelect: 'none' }}
                          onClick={() => handleSort(colId)}
                        >
                          {col?.label}
                          {sortConfig?.key === colId
                            ? <span style={{ color: 'var(--hy-blue)' }}>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                            : <span style={{ color: '#ccc', fontSize: '0.7rem' }}> ⇅</span>
                          }
                        </div>
                        {col?.options ? (
                          <select
                            title={`סינון לפי ${col.label}`}
                            className="input"
                            style={{ padding: '4px 6px', fontSize: '0.72rem', marginTop: 0, height: 'auto' }}
                            value={filters[colId] || ''}
                            onChange={e => setFilters(prev => ({ ...prev, [colId]: e.target.value }))}
                            onClick={e => e.stopPropagation()}
                          >
                            <option value="">הכל</option>
                            {col.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (colId === 'latestDecision' || colId === 'latestRecommendation' || colId === 'reasonForReferral') ? (
                          <select
                            title={`סינון לפי ${col?.label ?? colId}`}
                            className="input"
                            style={{ padding: '4px 6px', fontSize: '0.72rem', marginTop: 0, height: 'auto' }}
                            value={filters[colId] || ''}
                            onChange={e => setFilters(prev => ({ ...prev, [colId]: e.target.value }))}
                            onClick={e => e.stopPropagation()}
                          >
                            <option value="">הכל</option>
                            {Array.from(new Set(submissions.map(sub => {
                              if (colId === 'latestDecision') return sub.decisions?.[0]?.decisionType;
                              if (colId === 'latestRecommendation') return sub.recommendations?.[0]?.intensityStr;
                              return sub.reasonForReferral;
                            }).filter(Boolean))).sort().map(val => (
                              <option key={val} value={val!}>{val}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder="חיפוש..."
                            className="input"
                            style={{ padding: '4px 6px', fontSize: '0.72rem', marginTop: 0, height: 'auto' }}
                            value={filters[colId] || ''}
                            onChange={e => setFilters(prev => ({ ...prev, [colId]: e.target.value }))}
                            onClick={e => e.stopPropagation()}
                          />
                        )}
                      </div>
                    </th>
                  );
                })}
                <th style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                  {Object.values(filters).some(v => v) && (
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setFilters({})}
                      style={{ fontSize: '0.7rem', padding: '2px 8px', color: '#ff4d4f', borderColor: '#ffa39e' }}
                    >
                      נקה
                    </button>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {processedData.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 1} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    לא נמצאו פניות תואמות לסינון
                  </td>
                </tr>
              ) : processedData.map(sub => (
                <tr
                  key={sub.id}
                  onClick={() => setSelectedId(sub.id)}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: getRowBg(sub, selectedId === sub.id),
                    cursor: 'pointer',
                    borderRight: selectedId === sub.id ? '4px solid var(--hy-blue)' : '4px solid transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {visibleColumns.map(colId => (
                    <td key={colId} style={{ padding: '10px 12px', fontSize: '0.88rem' }}>
                      {colId === 'submittedAt' ? (
                        new Date(sub.submittedAt).toLocaleDateString('he-IL')
                      ) : colId === 'status' ? (
                        <span style={{
                          padding: '3px 9px', fontSize: '0.72rem',
                          borderRadius: '12px', fontWeight: 600,
                          ...getStatusChipStyle(sub.status),
                        }}>
                          {STATUS_MAP[sub.status] || sub.status}
                        </span>
                      ) : colId === 'latestDecision' ? (
                        sub.decisions?.[0]?.decisionType || '-'
                      ) : colId === 'latestRecommendation' ? (
                        sub.recommendations?.[0]?.intensityStr || '-'
                      ) : (
                        (sub as any)[colId] ?? '-'
                      )}
                    </td>
                  ))}
                  <td style={{ padding: '10px 12px' }}>
                    <Link
                      href={`/dashboard/${sub.id}`}
                      className="btn btn-primary"
                      style={{ padding: '3px 10px', fontSize: '0.78rem' }}
                      onClick={e => e.stopPropagation()}
                    >
                      פתח תיק
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── BOTTOM CARD — selected patient detail ── */}
      {selected ? (
        <div className="card">
          {/* Patient header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                background: selected.scoreSafety === 5
                  ? 'linear-gradient(135deg,#ef5350,#c62828)'
                  : 'linear-gradient(135deg,var(--hy-blue),var(--hy-dark-blue))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: '1.2rem',
              }}>
                {selected.fullName.charAt(0)}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{selected.fullName}</h2>
                <span style={{
                  display: 'inline-block', marginTop: '4px',
                  padding: '2px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600,
                  ...getStatusChipStyle(selected.status),
                }}>
                  {STATUS_MAP[selected.status] || selected.status}
                </span>
              </div>
            </div>
            <Link href={`/dashboard/${selected.id}`} className="btn btn-primary" style={{ padding: '8px 20px' }}>
              פתח תיק מלא ←
            </Link>
          </div>

          {/* Safety alert */}
          {selected.scoreSafety === 5 && (
            <div style={{
              background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: '8px',
              padding: '12px 16px', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontSize: '1.4rem' }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 700, color: '#c62828', fontSize: '0.9rem' }}>שימו לב: ציון בטיחות גבוה (5)</div>
                <div style={{ fontSize: '0.8rem', color: '#e53935' }}>נדרשת התייחסות דחופה!</div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Detail items */}
            <div style={{ display: 'grid', gap: '8px' }}>
              {detailItems.map(item => item.value && (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '9px 12px', background: '#f8fafc', borderRadius: '8px',
                }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scores + decision/rec */}
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '12px' }}>
                {SCORES.map(({ label, key }) => {
                  const val = (selected as any)[key] as number;
                  const urgent = key === 'scoreSafety' && val === 5;
                  return (
                    <div key={key} style={{
                      textAlign: 'center', padding: '8px 4px', borderRadius: '8px',
                      background: urgent ? '#ffebee' : '#f0f7ff',
                      border: `1px solid ${urgent ? '#ffcdd2' : '#dbeafe'}`,
                    }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: urgent ? '#c62828' : 'var(--hy-blue)' }}>{val}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{label}</div>
                    </div>
                  );
                })}
              </div>

              {(selected.decisions?.[0] || selected.recommendations?.[0]) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {selected.decisions?.[0] && (
                    <div style={{ padding: '10px 12px', background: '#e8f5e9', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#2e7d32', fontWeight: 700, marginBottom: '3px' }}>החלטה אחרונה</div>
                      <div style={{ fontSize: '0.85rem', color: '#1b5e20', fontWeight: 600 }}>{selected.decisions[0].decisionType}</div>
                    </div>
                  )}
                  {selected.recommendations?.[0] && (
                    <div style={{ padding: '10px 12px', background: '#e3f2fd', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#1565c0', fontWeight: 700, marginBottom: '3px' }}>המלצת LOCUS</div>
                      <div style={{ fontSize: '0.85rem', color: '#0d47a1', fontWeight: 600 }}>{selected.recommendations[0].intensityStr}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
          <div style={{ fontWeight: 600 }}>לחץ על שורה ברשימה לצפייה בפרטי הפנייה</div>
        </div>
      )}
    </div>
  );
}
