export function calculateLOCUS(scores: {
  scoreSafety: number;
  scoreFunctioning: number;
  scorePhysicalDrug: number;
  scoreEnvironment: number;
  scoreStress: number;
  scoreReadiness: number;
}, hasRehabBasket: boolean) {
  const {
    scoreSafety: s,
    scoreFunctioning: f,
    scorePhysicalDrug: h,
    scoreEnvironment: u,
    scoreStress: st,
    scoreReadiness: e
  } = scores;

  const totalSum = s + f + h + u + st + e;

  let locusLevel = 1;
  let intensityStr = "מרפאה / טיפול בקהילה (Level 1)";

  if (totalSum >= 24 || s >= 4) {
    locusLevel = 6;
    intensityStr = "אשפוז אינטנסיבי / השגחה מלאה (Level 6)";
  } else if (totalSum >= 20) {
    locusLevel = 5;
    intensityStr = "אשפוז סגור / טיפול אינטנסיבי (Level 5)";
  } else if (totalSum >= 16) {
    locusLevel = 4;
    intensityStr = "אשפוז יום / חלופת אשפוז (Level 4)";
  } else if (totalSum >= 12 || hasRehabBasket) {
    locusLevel = 2; // Level 2-3 as per user request
    intensityStr = "טיפול מרפאתי אינטנסיבי / ליווי שיקומי (Level 2-3)";
  }

  return { locusLevel, intensityStr };
}
