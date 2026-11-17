"use client";

import React, { useState, useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, Minus, CalendarRange } from "lucide-react";
import { FeedbackRecord } from "@/lib/types";
import { computePeriodMetrics } from "@/lib/analytics";

interface PeriodComparisonProps {
  records: FeedbackRecord[];
  availableMonths: string[];
  availableClasses: string[];
  availableLecturers: string[];
}

export default function PeriodComparison({
  records,
  availableMonths,
  availableClasses,
  availableLecturers,
}: PeriodComparisonProps) {
  const [compareMode, setCompareMode] = useState<"month" | "class" | "lecturer">("month");

  // Default periods from actual dataset (e.g., 11/2026 vs 10/2026)
  const [periodA, setPeriodA] = useState<string>(availableMonths[availableMonths.length - 1] || "11/2026");
  const [periodB, setPeriodB] = useState<string>(availableMonths[0] || "10/2026");

  const options = useMemo(() => {
    if (compareMode === "month") return availableMonths;
    if (compareMode === "class") return availableClasses;
    return availableLecturers;
  }, [compareMode, availableMonths, availableClasses, availableLecturers]);

  const handleModeChange = (mode: "month" | "class" | "lecturer") => {
    setCompareMode(mode);
    const list = mode === "month" ? availableMonths : mode === "class" ? availableClasses : availableLecturers;
    setPeriodA(list[list.length - 1] || "");
    setPeriodB(list[0] || "");
  };

  const metricsA = useMemo(() => {
    const filtered = records.filter((r) => {
      if (compareMode === "month") return r.thangDaoTao === periodA;
      if (compareMode === "class") return r.maLop === periodA;
      return r.giangVien === periodA;
    });
    return computePeriodMetrics(filtered, periodA || "Kỳ hiện tại");
  }, [records, compareMode, periodA]);

  const metricsB = useMemo(() => {
    const filtered = records.filter((r) => {
      if (compareMode === "month") return r.thangDaoTao === periodB;
      if (compareMode === "class") return r.maLop === periodB;
      return r.giangVien === periodB;
    });
    return computePeriodMetrics(filtered, periodB || "Kỳ đối chiếu");
  }, [records, compareMode, periodB]);

  // Note: In our scale, 1.00 = Best (Rất tốt), 4.00 = Worst. Lower score = better performance!
  const rows = [
    { label: "Số lượng phiếu phản hồi", valA: metricsA.count, valB: metricsB.count, isCount: true, suffix: " phiếu" },
    { label: "Tỷ lệ Rất thỏa mãn (Mức 1)", valA: metricsA.pctLevel1HaiLong, valB: metricsB.pctLevel1HaiLong, higherIsBetter: true, suffix: "%" },
    { label: "Tỷ lệ Ứng dụng tốt (Mức 1)", valA: metricsA.pctLevel1UngDung, valB: metricsB.pctLevel1UngDung, higherIsBetter: true, suffix: "%" },
    { label: "Điểm TB Hài lòng chung (1 = Tốt nhất)", valA: metricsA.avgHaiLong, valB: metricsB.avgHaiLong, higherIsBetter: false, suffix: "" },
    { label: "Điểm TB Nội dung đào tạo", valA: metricsA.avgNoiDung, valB: metricsB.avgNoiDung, higherIsBetter: false, suffix: "" },
    { label: "Điểm TB Phương pháp đào tạo", valA: metricsA.avgPhuongPhap, valB: metricsB.avgPhuongPhap, higherIsBetter: false, suffix: "" },
    { label: "Điểm TB Mức độ tương tác", valA: metricsA.avgTuongTac, valB: metricsB.avgTuongTac, higherIsBetter: false, suffix: "" },
    { label: "Điểm TB GV - Kiến thức", valA: metricsA.avgGvKienThuc, valB: metricsB.avgGvKienThuc, higherIsBetter: false, suffix: "" },
    { label: "Điểm TB GV - Sự nhiệt tình", valA: metricsA.avgGvNhietTinh, valB: metricsB.avgGvNhietTinh, higherIsBetter: false, suffix: "" },
    { label: "Điểm TB GV - Phương pháp truyền đạt", valA: metricsA.avgGvTruyenDat, valB: metricsB.avgGvTruyenDat, higherIsBetter: false, suffix: "" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Phân tích So sánh Cùng kỳ & Đối chuẩn</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh trực tiếp biến động chất lượng giữa 2 tháng đào tạo, 2 mã lớp hoặc 2 giảng viên (Thang điểm: 1.00 là cao nhất)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-medium">
            <button
              onClick={() => handleModeChange("month")}
              className={`px-3 py-1.5 rounded-md transition ${compareMode === "month" ? "bg-white text-indigo-700 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900"}`}
            >
              Theo Tháng / Cùng kỳ
            </button>
            <button
              onClick={() => handleModeChange("class")}
              className={`px-3 py-1.5 rounded-md transition ${compareMode === "class" ? "bg-white text-indigo-700 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900"}`}
            >
              Theo Mã lớp
            </button>
            <button
              onClick={() => handleModeChange("lecturer")}
              className={`px-3 py-1.5 rounded-md transition ${compareMode === "lecturer" ? "bg-white text-indigo-700 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900"}`}
            >
              Theo Giảng viên
            </button>
          </div>
        </div>
      </div>

      {/* Period Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
        <div>
          <label className="block text-xs font-semibold text-indigo-700 mb-1">
            Kỳ phân tích / Đối tượng A (Hiện tại)
          </label>
          <select
            value={periodA}
            onChange={(e) => setPeriodA(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Kỳ đối chiếu / Cùng kỳ B (So sánh với)
          </label>
          <select
            value={periodB}
            onChange={(e) => setPeriodB(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 bg-slate-50/70">
              <th className="py-3 px-4 font-semibold">Tiêu chí đánh giá</th>
              <th className="py-3 px-4 font-semibold text-indigo-700 text-right">{periodA || "Kỳ A"}</th>
              <th className="py-3 px-4 font-semibold text-slate-700 text-right">{periodB || "Kỳ B"}</th>
              <th className="py-3 px-4 font-semibold text-right">Chênh lệch (A vs B)</th>
              <th className="py-3 px-4 font-semibold text-center">Xu hướng chất lượng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => {
              const diff = Number((r.valA - r.valB).toFixed(2));
              let status: "better" | "worse" | "neutral" = "neutral";
              if (!r.isCount && diff !== 0 && r.valA > 0 && r.valB > 0) {
                if (r.higherIsBetter) {
                  status = diff > 0 ? "better" : "worse";
                } else {
                  // Lower score means closer to 1.00 ("Rất tốt")
                  status = diff < 0 ? "better" : "worse";
                }
              }

              return (
                <tr key={r.label} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-medium text-slate-800">{r.label}</td>
                  <td className="py-3 px-4 text-right font-bold text-indigo-700">
                    {r.valA}{r.suffix}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-600">
                    {r.valB}{r.suffix}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs">
                    {diff > 0 ? `+${diff}${r.suffix}` : `${diff}${r.suffix}`}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {r.isCount ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        Quy mô mẫu
                      </span>
                    ) : status === "better" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ArrowUpRight className="w-3.5 h-3.5" /> Cải thiện tốt hơn
                      </span>
                    ) : status === "worse" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <ArrowDownRight className="w-3.5 h-3.5" /> Cần lưu ý
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        <Minus className="w-3.5 h-3.5" /> Ổn định
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
