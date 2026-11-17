import { FeedbackRecord, PeriodMetrics } from "./types";

// Scale in Excel: "1 - Rất tốt" = 1 (best), "2 - Tốt" = 2, "3 - khá" = 3, "4 - Bình thường" = 4
export function parseScore(val: string): number {
  const m = String(val || "").match(/^(\d+)/);
  return m ? Number(m[1]) : 0;
}

export function isMeaningfulFeedback(text: string): boolean {
  const clean = String(text || "").trim().toLowerCase();
  const ignoreList = ["", "không", "không có", "không ạ", "ko", "khong", "không có góp ý", "không ý kiến", "không có ý kiến", "khống có góp ý", "không có gì để góp ý ah", "n/a", "0", "."];
  return !ignoreList.includes(clean);
}

export function computePeriodMetrics(records: FeedbackRecord[], label: string): PeriodMetrics {
  const n = records.length;
  if (n === 0) {
    return {
      label,
      count: 0,
      avgHaiLong: 0,
      avgNoiDung: 0,
      avgPhuongPhap: 0,
      avgTuongTac: 0,
      avgGvKienThuc: 0,
      avgGvNhietTinh: 0,
      avgGvTruyenDat: 0,
      avgUngDung: 0,
      pctLevel1HaiLong: 0,
      pctLevel1UngDung: 0,
    };
  }

  const avg = (getter: (r: FeedbackRecord) => string) => {
    const valid = records.map((r) => parseScore(getter(r))).filter((s) => s > 0);
    if (valid.length === 0) return 0;
    return Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2));
  };

  const level1HaiLong = records.filter((r) => parseScore(r.haiLongChung) === 1).length;
  const level1UngDung = records.filter((r) => parseScore(r.tinhUngDung) === 1).length;

  return {
    label,
    count: n,
    avgHaiLong: avg((r) => r.haiLongChung),
    avgNoiDung: avg((r) => r.noiDung),
    avgPhuongPhap: avg((r) => r.phuongPhapDaoTao),
    avgTuongTac: avg((r) => r.mucDoTuongTac),
    avgGvKienThuc: avg((r) => r.gvKienThuc),
    avgGvNhietTinh: avg((r) => r.gvNhietTinh),
    avgGvTruyenDat: avg((r) => r.gvTruyenDat),
    avgUngDung: avg((r) => r.tinhUngDung),
    pctLevel1HaiLong: Number(((level1HaiLong / n) * 100).toFixed(1)),
    pctLevel1UngDung: Number(((level1UngDung / n) * 100).toFixed(1)),
  };
}

// Get previous comparable period (e.g., "11/2026" -> "10/2026" or "11/2025" for YoY)
export function getComparablePeriods(selectedMonth: string): { prevMonth: string; prevYear: string } {
  const [mmStr, yyyyStr] = selectedMonth.split("/");
  const mm = Number(mmStr);
  const yyyy = Number(yyyyStr);
  if (!mm || !yyyy) return { prevMonth: "", prevYear: "" };

  const prevM = mm === 1 ? 12 : mm - 1;
  const prevMY = mm === 1 ? yyyy - 1 : yyyy;
  return {
    prevMonth: `${String(prevM).padStart(2, "0")}/${prevMY}`,
    prevYear: `${String(mm).padStart(2, "0")}/${yyyy - 1}`,
  };
}
