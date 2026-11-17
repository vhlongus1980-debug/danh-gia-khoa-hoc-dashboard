import * as XLSX from "xlsx";
import { FeedbackRecord } from "./types";

// Exact column mapping matching 'DANH GIA KHOA HOC (Responses).xlsx'
export const EXCEL_COLUMNS = {
  timestamp: "Timestamp",
  tenLop: "Tên Lớp",
  maLop: "Mã lớp",
  giangVien: "Giảng viên",
  ngayDaoTao: "Ngày đào tạo",
  haiLongChung: "Câu hỏi 1: Nhìn chung mức độ hài lòng của Anh Chị về khóa học [Đánh giá chung]",
  lyDo: "Câu hỏi 2: Lý do Anh Chị chọn mức phản hồi trên",
  noiDung: "Câu hỏi 3: Đánh giá của Anh Chị về nội dung và phương pháp đào tạo [Nội dung]",
  phuongPhapDaoTao: "Câu hỏi 3: Đánh giá của Anh Chị về nội dung và phương pháp đào tạo [Phương pháp đào tạo]",
  mucDoTuongTac: "Câu hỏi 3: Đánh giá của Anh Chị về nội dung và phương pháp đào tạo [Mức độ tương tác về các nội dung đào tạo]",
  gvKienThuc: "Câu hỏi 4: Đánh giá của Anh Chị về Giảng viên [Kiến thức về bài giảng]",
  gvNhietTinh: "Câu hỏi 4: Đánh giá của Anh Chị về Giảng viên [Sự nhiệt tình]",
  gvTruyenDat: "Câu hỏi 4: Đánh giá của Anh Chị về Giảng viên [Phương pháp truyền đạt]",
  gopY: "Câu hỏi 5: Anh Chị có góp ý gì cho nội dung bài giảng và Giảng viên không?",
  tinhUngDung: "Câu hỏi 6: Mức độ cần thiết và hữu ít của nội dung khóa học đối với công việc của Anh Chị?",
};

export function extractMonthYear(ngayDaoTao: string, timestamp?: string): string {
  // Parse formats like "26-29/10/2026" or "09-12/11/2026" or "15/10/2025"
  const match = String(ngayDaoTao || "").match(/(\d{1,2})\/(\d{4})/);
  if (match) {
    const mm = match[1].padStart(2, "0");
    return `${mm}/${match[2]}`;
  }
  if (timestamp) {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) {
      return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    }
  }
  return "Không xác định";
}

export function parseExcelBuffer(buffer: ArrayBuffer): FeedbackRecord[] {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

  return rows.map((row, idx) => {
    const rawTs = row[EXCEL_COLUMNS.timestamp];
    const timestamp =
      rawTs instanceof Date
        ? rawTs.toISOString().replace("T", " ").slice(0, 19)
        : String(rawTs || new Date().toISOString());

    const tenLop = String(row[EXCEL_COLUMNS.tenLop] || "").trim();
    let maLop = String(row[EXCEL_COLUMNS.maLop] || "").trim();
    if (!maLop && tenLop.includes("ISO 16140-3")) {
      maLop = "KT10";
    }
    const ngayDaoTao = String(row[EXCEL_COLUMNS.ngayDaoTao] || "").trim();

    return {
      id: `REC-${String(idx + 1).padStart(3, "0")}-${Date.now().toString(36).slice(-3)}`,
      timestamp,
      tenLop,
      maLop,
      giangVien: String(row[EXCEL_COLUMNS.giangVien] || "").trim(),
      ngayDaoTao,
      thangDaoTao: extractMonthYear(ngayDaoTao, timestamp),
      haiLongChung: String(row[EXCEL_COLUMNS.haiLongChung] || "").trim(),
      lyDo: String(row[EXCEL_COLUMNS.lyDo] || "").trim(),
      noiDung: String(row[EXCEL_COLUMNS.noiDung] || "").trim(),
      phuongPhapDaoTao: String(row[EXCEL_COLUMNS.phuongPhapDaoTao] || "").trim(),
      mucDoTuongTac: String(row[EXCEL_COLUMNS.mucDoTuongTac] || "").trim(),
      gvKienThuc: String(row[EXCEL_COLUMNS.gvKienThuc] || "").trim(),
      gvNhietTinh: String(row[EXCEL_COLUMNS.gvNhietTinh] || "").trim(),
      gvTruyenDat: String(row[EXCEL_COLUMNS.gvTruyenDat] || "").trim(),
      gopY: String(row[EXCEL_COLUMNS.gopY] || "").trim(),
      tinhUngDung: String(row[EXCEL_COLUMNS.tinhUngDung] || "").trim(),
    };
  });
}

export function exportToExcelFile(records: FeedbackRecord[], filename = "DANH_GIA_KHOA_HOC_Export.xlsx") {
  const sheetData = records.map((r) => ({
    [EXCEL_COLUMNS.timestamp]: r.timestamp,
    [EXCEL_COLUMNS.tenLop]: r.tenLop,
    [EXCEL_COLUMNS.maLop]: r.maLop,
    [EXCEL_COLUMNS.giangVien]: r.giangVien,
    [EXCEL_COLUMNS.ngayDaoTao]: r.ngayDaoTao,
    [EXCEL_COLUMNS.haiLongChung]: r.haiLongChung,
    [EXCEL_COLUMNS.lyDo]: r.lyDo,
    [EXCEL_COLUMNS.noiDung]: r.noiDung,
    [EXCEL_COLUMNS.phuongPhapDaoTao]: r.phuongPhapDaoTao,
    [EXCEL_COLUMNS.mucDoTuongTac]: r.mucDoTuongTac,
    [EXCEL_COLUMNS.gvKienThuc]: r.gvKienThuc,
    [EXCEL_COLUMNS.gvNhietTinh]: r.gvNhietTinh,
    [EXCEL_COLUMNS.gvTruyenDat]: r.gvTruyenDat,
    [EXCEL_COLUMNS.gopY]: r.gopY,
    [EXCEL_COLUMNS.tinhUngDung]: r.tinhUngDung,
  }));

  const ws = XLSX.utils.json_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Form Responses 1");
  XLSX.writeFile(wb, filename);
}
