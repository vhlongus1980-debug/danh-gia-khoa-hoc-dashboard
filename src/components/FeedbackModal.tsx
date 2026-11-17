"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { FeedbackRecord } from "@/lib/types";
import { extractMonthYear } from "@/lib/excelUtils";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: FeedbackRecord) => void;
  editingRecord: FeedbackRecord | null;
}

const RATING_Q1 = ["1 - Rất thỏa mãn", "2 - Thỏa mãn", "3 - Phù hợp", "4 - Không thỏa mãn"];
const RATING_Q3_Q4 = ["1 - Rất tốt", "2 - Tốt", "3 - khá", "4 - Bình thường"];
const RATING_Q6 = ["1 - Ứng dụng tốt tại đơn vị", "2 - Ứng dụng được tại đơn vị", "3 - Cần nghiên cứu thêm"];

export default function FeedbackModal({ isOpen, onClose, onSave, editingRecord }: FeedbackModalProps) {
  const [form, setForm] = useState<FeedbackRecord>({
    id: "",
    timestamp: "",
    tenLop: "",
    maLop: "",
    giangVien: "",
    ngayDaoTao: "",
    thangDaoTao: "",
    haiLongChung: "1 - Rất thỏa mãn",
    lyDo: "",
    noiDung: "1 - Rất tốt",
    phuongPhapDaoTao: "1 - Rất tốt",
    mucDoTuongTac: "1 - Rất tốt",
    gvKienThuc: "1 - Rất tốt",
    gvNhietTinh: "1 - Rất tốt",
    gvTruyenDat: "1 - Rất tốt",
    gopY: "",
    tinhUngDung: "1 - Ứng dụng tốt tại đơn vị",
  });

  useEffect(() => {
    if (editingRecord) {
      setForm(editingRecord);
    } else {
      const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
      setForm({
        id: `REC-${Date.now().toString(36).toUpperCase()}`,
        timestamp: nowStr,
        tenLop: "",
        maLop: "",
        giangVien: "",
        ngayDaoTao: "",
        thangDaoTao: "",
        haiLongChung: "1 - Rất thỏa mãn",
        lyDo: "",
        noiDung: "1 - Rất tốt",
        phuongPhapDaoTao: "1 - Rất tốt",
        mucDoTuongTac: "1 - Rất tốt",
        gvKienThuc: "1 - Rất tốt",
        gvNhietTinh: "1 - Rất tốt",
        gvTruyenDat: "1 - Rất tốt",
        gopY: "",
        tinhUngDung: "1 - Ứng dụng tốt tại đơn vị",
      });
    }
  }, [editingRecord, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const computedMonth = extractMonthYear(form.ngayDaoTao, form.timestamp);
    onSave({
      ...form,
      thangDaoTao: computedMonth,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingRecord ? `Chỉnh sửa phản hồi (${editingRecord.id})` : "Thêm mới phiếu đánh giá khóa học"}
            </h2>
            <p className="text-xs text-slate-500">Cấu trúc chuẩn 15 trường theo biểu mẫu Excel khảo sát học viên</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Thông tin khóa học */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Lớp *</label>
              <input
                required
                type="text"
                placeholder="VD: Hiệu chuẩn dụng cụ đo độ dài"
                value={form.tenLop}
                onChange={(e) => setForm({ ...form, tenLop: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mã lớp *</label>
              <input
                required
                type="text"
                placeholder="VD: KT07"
                value={form.maLop}
                onChange={(e) => setForm({ ...form, maLop: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Giảng viên *</label>
              <input
                required
                type="text"
                placeholder="VD: Huỳnh Thị Thu Vân"
                value={form.giangVien}
                onChange={(e) => setForm({ ...form, giangVien: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày đào tạo *</label>
              <input
                required
                type="text"
                placeholder="VD: 26-29/10/2026"
                value={form.ngayDaoTao}
                onChange={(e) => setForm({ ...form, ngayDaoTao: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian gửi (Timestamp)</label>
              <input
                type="text"
                value={form.timestamp}
                onChange={(e) => setForm({ ...form, timestamp: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
              />
            </div>
          </div>

          {/* Đánh giá chung & Tính ứng dụng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Câu 1: Hài lòng chung</label>
              <select
                value={form.haiLongChung}
                onChange={(e) => setForm({ ...form, haiLongChung: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {RATING_Q1.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Câu 6: Tính ứng dụng tại đơn vị</label>
              <select
                value={form.tinhUngDung}
                onChange={(e) => setForm({ ...form, tinhUngDung: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {RATING_Q6.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Câu 3 & Câu 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Câu 3: Nội dung</label>
              <select
                value={form.noiDung}
                onChange={(e) => setForm({ ...form, noiDung: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {RATING_Q3_Q4.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Câu 3: Phương pháp ĐT</label>
              <select
                value={form.phuongPhapDaoTao}
                onChange={(e) => setForm({ ...form, phuongPhapDaoTao: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {RATING_Q3_Q4.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Câu 3: Mức độ tương tác</label>
              <select
                value={form.mucDoTuongTac}
                onChange={(e) => setForm({ ...form, mucDoTuongTac: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {RATING_Q3_Q4.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Câu 4: GV Kiến thức</label>
              <select
                value={form.gvKienThuc}
                onChange={(e) => setForm({ ...form, gvKienThuc: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {RATING_Q3_Q4.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Câu 4: GV Sự nhiệt tình</label>
              <select
                value={form.gvNhietTinh}
                onChange={(e) => setForm({ ...form, gvNhietTinh: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {RATING_Q3_Q4.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Câu 4: GV Truyền đạt</label>
              <select
                value={form.gvTruyenDat}
                onChange={(e) => setForm({ ...form, gvTruyenDat: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {RATING_Q3_Q4.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          {/* Lý do & Góp ý */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Câu 2: Lý do chọn mức phản hồi</label>
              <textarea
                rows={2}
                placeholder="VD: Thầy dạy rất chi tiết, giải đáp tận tình..."
                value={form.lyDo}
                onChange={(e) => setForm({ ...form, lyDo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Câu 5: Góp ý nội dung bài giảng & Giảng viên</label>
              <textarea
                rows={2}
                placeholder="VD: Thực hành nhiều hơn, tài liệu rõ nét hơn..."
                value={form.gopY}
                onChange={(e) => setForm({ ...form, gopY: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              {editingRecord ? "Lưu thay đổi" : "Thêm phản hồi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
