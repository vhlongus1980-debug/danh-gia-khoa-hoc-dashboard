"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FileSpreadsheet,
  Upload,
  Download,
  Plus,
  Search,
  Filter,
  RotateCcw,
  Pencil,
  Trash2,
  BarChart3,
  MessageSquareQuote,
  Users,
  Award,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import initialData from "@/data/initialData.json";
import { FeedbackRecord, FilterState } from "@/lib/types";
import { parseExcelBuffer, exportToExcelFile } from "@/lib/excelUtils";
import { computePeriodMetrics, isMeaningfulFeedback, parseScore } from "@/lib/analytics";
import DashboardCharts from "@/components/DashboardCharts";
import PeriodComparison from "@/components/PeriodComparison";
import FeedbackModal from "@/components/FeedbackModal";

const STORAGE_KEY = "danh_gia_khoa_hoc_records_v1";

export default function TrainingFeedbackDashboard() {
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "comparison" | "table">("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FeedbackRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    giangVien: "ALL",
    maLop: "ALL",
    thangDaoTao: "ALL",
    haiLongChung: "ALL",
    tinhUngDung: "ALL",
    chiCoGopY: false,
  });

  // Load initial 57 records from localStorage or embedded Excel seed
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecords(parsed);
          setIsLoaded(true);
          return;
        }
      }
    } catch {
      // ignore storage errors
    }
    setRecords(initialData as FeedbackRecord[]);
    setIsLoaded(true);
  }, []);

  // Sync changes to localStorage automatically
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // ignore
    }
  }, [records, isLoaded]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Distinct dropdown filter values
  const availableLecturers = useMemo(
    () => Array.from(new Set(records.map((r) => r.giangVien).filter(Boolean))).sort(),
    [records]
  );
  const availableClasses = useMemo(
    () => Array.from(new Set(records.map((r) => r.maLop).filter(Boolean))).sort(),
    [records]
  );
  const availableMonths = useMemo(
    () => Array.from(new Set(records.map((r) => r.thangDaoTao).filter(Boolean))).sort(),
    [records]
  );

  // Deep multi-criteria filtering
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filters.giangVien !== "ALL" && r.giangVien !== filters.giangVien) return false;
      if (filters.maLop !== "ALL" && r.maLop !== filters.maLop) return false;
      if (filters.thangDaoTao !== "ALL" && r.thangDaoTao !== filters.thangDaoTao) return false;
      if (filters.haiLongChung !== "ALL" && r.haiLongChung !== filters.haiLongChung) return false;
      if (filters.tinhUngDung !== "ALL" && r.tinhUngDung !== filters.tinhUngDung) return false;
      if (filters.chiCoGopY && !isMeaningfulFeedback(r.gopY)) return false;

      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const haystack = [
          r.tenLop,
          r.maLop,
          r.giangVien,
          r.ngayDaoTao,
          r.lyDo,
          r.gopY,
          r.haiLongChung,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [records, filters]);

  const summary = useMemo(
    () => computePeriodMetrics(filteredRecords, "Bộ lọc hiện tại"),
    [filteredRecords]
  );

  const meaningfulFeedbacks = useMemo(
    () => filteredRecords.filter((r) => isMeaningfulFeedback(r.gopY)),
    [filteredRecords]
  );

  // Excel Import Handler (.xlsx / .xls)
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const imported = parseExcelBuffer(buffer);
      if (imported.length === 0) {
        showToast("File Excel không có dữ liệu hợp lệ.");
        return;
      }
      setRecords(imported);
      showToast(`Đã nạp thành công ${imported.length} dòng từ file "${file.name}"`);
    } catch (err) {
      console.error(err);
      showToast("Lỗi đọc file Excel. Vui lòng kiểm tra đúng định dạng .xlsx");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Add or Edit Save
  const handleSaveRecord = (record: FeedbackRecord) => {
    setRecords((prev) => {
      const exists = prev.some((item) => item.id === record.id);
      if (exists) {
        showToast(`Đã cập nhật phản hồi ${record.id}`);
        return prev.map((item) => (item.id === record.id ? record : item));
      }
      showToast(`Đã thêm mới phản hồi ${record.id}`);
      return [record, ...prev];
    });
  };

  // Delete Record
  const handleDeleteRecord = (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phiếu đánh giá này không?")) return;
    setRecords((prev) => prev.filter((r) => r.id !== id));
    showToast(`Đã xóa bản ghi ${id}`);
  };

  // Reset to original 57 records from DANH GIA KHOA HOC (Responses).xlsx
  const handleResetDefault = () => {
    if (!window.confirm("Khôi phục lại 57 bản ghi gốc từ file DANH GIA KHOA HOC (Responses).xlsx?")) return;
    setRecords(initialData as FeedbackRecord[]);
    resetFilters();
    showToast("Đã khôi phục 57 bản ghi dữ liệu gốc.");
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      giangVien: "ALL",
      maLop: "ALL",
      thangDaoTao: "ALL",
      haiLongChung: "ALL",
      tinhUngDung: "ALL",
      chiCoGopY: false,
    });
  };

  const getBadgeColor = (val: string) => {
    const score = parseScore(val);
    if (score === 1) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score === 2) return "bg-sky-50 text-sky-700 border-sky-200";
    if (score === 3) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                Hệ thống Thống kê & Quản lý Đánh giá Khóa học
              </h1>
              <p className="text-xs text-slate-500">
                Liên kết trực tiếp Excel (Form Responses 1) • Next.js App Router • Sẵn sàng Deploy Vercel
              </p>
            </div>
          </div>

          {/* Excel & CRUD Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition"
              title="Nạp file Excel mới để cập nhật dữ liệu"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              Import Excel
            </button>

            <button
              onClick={() => exportToExcelFile(filteredRecords)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition"
              title="Xuất dữ liệu đang lọc ra file .xlsx"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Export Excel ({filteredRecords.length})
            </button>

            <button
              onClick={handleResetDefault}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              title="Khôi phục dữ liệu gốc 57 dòng"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Dữ liệu gốc
            </button>

            <button
              onClick={() => {
                setEditingRecord(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Thêm phản hồi
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Deep Filter Bar */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Bộ lọc chuyên sâu & Tìm kiếm đa điều kiện</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên lớp, lý do, nội dung góp ý..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter by Giảng viên */}
            <div>
              <select
                value={filters.giangVien}
                onChange={(e) => setFilters({ ...filters, giangVien: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="ALL">Tất cả Giảng viên ({availableLecturers.length})</option>
                {availableLecturers.map((gv) => (
                  <option key={gv} value={gv}>{gv}</option>
                ))}
              </select>
            </div>

            {/* Filter by Mã lớp */}
            <div>
              <select
                value={filters.maLop}
                onChange={(e) => setFilters({ ...filters, maLop: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="ALL">Tất cả Mã lớp ({availableClasses.length})</option>
                {availableClasses.map((ml) => (
                  <option key={ml} value={ml}>Lớp {ml}</option>
                ))}
              </select>
            </div>

            {/* Filter by Tháng đào tạo */}
            <div>
              <select
                value={filters.thangDaoTao}
                onChange={(e) => setFilters({ ...filters, thangDaoTao: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="ALL">Tất cả Tháng ({availableMonths.length})</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
            </div>

            {/* Filter by Hài lòng chung */}
            <div>
              <select
                value={filters.haiLongChung}
                onChange={(e) => setFilters({ ...filters, haiLongChung: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="ALL">Mọi mức hài lòng</option>
                <option value="1 - Rất thỏa mãn">1 - Rất thỏa mãn</option>
                <option value="2 - Thỏa mãn">2 - Thỏa mãn</option>
                <option value="3 - Phù hợp">3 - Phù hợp</option>
              </select>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={filters.chiCoGopY}
                onChange={(e) => setFilters({ ...filters, chiCoGopY: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Chỉ hiển thị phiếu có góp ý chi tiết (lọc bỏ "Không" / trống)</span>
            </label>

            <span className="text-slate-500">
              Đang hiển thị <strong className="text-slate-900">{filteredRecords.length}</strong> / {records.length} phản hồi
            </span>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Tổng phản hồi</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{summary.count}</span>
              <span className="text-xs text-slate-500">phiếu đánh giá</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Trên {new Set(filteredRecords.map((r) => r.maLop)).size} mã lớp & {new Set(filteredRecords.map((r) => r.giangVien)).size} giảng viên
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Rất thỏa mãn (Mức 1)</span>
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600">{summary.pctLevel1HaiLong}%</span>
              <span className="text-xs text-slate-500">TB: {summary.avgHaiLong}/4</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Điểm TB càng gần 1.00 càng tốt</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">GV Nhiệt tình (TB)</span>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{summary.avgGvNhietTinh}</span>
              <span className="text-xs text-emerald-600 font-semibold">/ 1.00 tối đa</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Kiến thức: {summary.avgGvKienThuc} • Truyền đạt: {summary.avgGvTruyenDat}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Ứng dụng tốt tại đơn vị</span>
              <MessageSquareQuote className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-indigo-600">{summary.pctLevel1UngDung}%</span>
              <span className="text-xs text-slate-500">TB: {summary.avgUngDung}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Có <strong>{meaningfulFeedbacks.length}</strong> góp ý cải tiến cần lưu ý
            </p>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Biểu đồ & Góp ý nổi bật
          </button>

          <button
            onClick={() => setActiveTab("comparison")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === "comparison"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Award className="w-4 h-4" />
            So sánh cùng kỳ & Đối chuẩn
          </button>

          <button
            onClick={() => setActiveTab("table")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === "table"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Dữ liệu chi tiết & Thêm/Sửa/Xóa ({filteredRecords.length})
          </button>
        </div>

        {/* Tab 1: Overview Charts & Qualitative Feedback */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <DashboardCharts records={filteredRecords} />

            {/* Highlighted Qualitative Feedback */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Tổng hợp Góp ý cải tiến của Học viên ({meaningfulFeedbacks.length} ý kiến cụ thể)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Tự động trích lọc từ Câu hỏi 5 (loại bỏ các phản hồi "Không" / "Không có")
              </p>

              {meaningfulFeedbacks.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Không có góp ý chi tiết nào trong tập dữ liệu đang lọc.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {meaningfulFeedbacks.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-2"
                    >
                      <p className="text-sm font-medium text-slate-800">“{item.gopY}”</p>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                        <span>
                          <strong className="text-slate-700">{item.maLop}</strong> • GV: {item.giangVien}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full border font-medium ${getBadgeColor(item.haiLongChung)}`}>
                          {item.haiLongChung}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Period-over-Period Comparison */}
        {activeTab === "comparison" && (
          <PeriodComparison
            records={records}
            availableMonths={availableMonths}
            availableClasses={availableClasses}
            availableLecturers={availableLecturers}
          />
        )}

        {/* Tab 3: Full CRUD Data Table */}
        {activeTab === "table" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                    <th className="py-3 px-3 font-semibold">Mã lớp</th>
                    <th className="py-3 px-3 font-semibold min-w-[200px]">Tên Khóa học</th>
                    <th className="py-3 px-3 font-semibold">Giảng viên</th>
                    <th className="py-3 px-3 font-semibold">Ngày ĐT</th>
                    <th className="py-3 px-3 font-semibold">Hài lòng chung</th>
                    <th className="py-3 px-3 font-semibold">Nội dung</th>
                    <th className="py-3 px-3 font-semibold">GV Nhiệt tình</th>
                    <th className="py-3 px-3 font-semibold">Tính ứng dụng</th>
                    <th className="py-3 px-3 font-semibold min-w-[180px]">Lý do & Góp ý (Q2 & Q5)</th>
                    <th className="py-3 px-3 font-semibold text-right sticky right-0 bg-slate-50">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-blue-50/30 transition">
                      <td className="py-3 px-3 font-bold text-blue-700 whitespace-nowrap">{r.maLop || "—"}</td>
                      <td className="py-3 px-3 font-medium text-slate-900">{r.tenLop}</td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">{r.giangVien}</td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{r.ngayDaoTao}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full border font-medium ${getBadgeColor(r.haiLongChung)}`}>
                          {r.haiLongChung}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">{r.noiDung}</td>
                      <td className="py-3 px-3 whitespace-nowrap">{r.gvNhietTinh}</td>
                      <td className="py-3 px-3 whitespace-nowrap">{r.tinhUngDung}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {r.lyDo && <div className="line-clamp-2"><strong className="text-slate-700">Lý do:</strong> {r.lyDo}</div>}
                        {isMeaningfulFeedback(r.gopY) && (
                          <div className="mt-1 text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                            <strong>Góp ý:</strong> {r.gopY}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap sticky right-0 bg-white">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingRecord(r);
                              setModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Sửa phản hồi"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(r.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Xóa phản hồi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500">
                        Không tìm thấy bản ghi nào khớp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal Add / Edit */}
      <FeedbackModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveRecord}
        editingRecord={editingRecord}
      />
    </div>
  );
}
