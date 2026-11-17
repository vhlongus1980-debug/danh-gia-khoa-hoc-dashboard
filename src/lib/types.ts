export interface FeedbackRecord {
  id: string;
  timestamp: string;
  tenLop: string;
  maLop: string;
  giangVien: string;
  ngayDaoTao: string;
  thangDaoTao: string; // e.g., "10/2026" or "11/2026"
  haiLongChung: string;
  lyDo: string;
  noiDung: string;
  phuongPhapDaoTao: string;
  mucDoTuongTac: string;
  gvKienThuc: string;
  gvNhietTinh: string;
  gvTruyenDat: string;
  gopY: string;
  tinhUngDung: string;
}

export interface FilterState {
  search: string;
  giangVien: string;
  maLop: string;
  thangDaoTao: string;
  haiLongChung: string;
  tinhUngDung: string;
  chiCoGopY: boolean;
}

export interface PeriodMetrics {
  label: string;
  count: number;
  avgHaiLong: number;
  avgNoiDung: number;
  avgPhuongPhap: number;
  avgTuongTac: number;
  avgGvKienThuc: number;
  avgGvNhietTinh: number;
  avgGvTruyenDat: number;
  avgUngDung: number;
  pctLevel1HaiLong: number;
  pctLevel1UngDung: number;
}
