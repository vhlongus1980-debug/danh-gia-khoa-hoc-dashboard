"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { FeedbackRecord } from "@/lib/types";
import { parseScore } from "@/lib/analytics";

interface DashboardChartsProps {
  records: FeedbackRecord[];
}

export default function DashboardCharts({ records }: DashboardChartsProps) {
  const classChartData = useMemo(() => {
    const map = new Map<string, FeedbackRecord[]>();
    records.forEach((r) => {
      const key = r.maLop || "Khác";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });

    return Array.from(map.entries()).map(([maLop, list]) => {
      const n = list.length;
      const pct1HaiLong = Math.round((list.filter((i) => parseScore(i.haiLongChung) === 1).length / n) * 100);
      const pct1NoiDung = Math.round((list.filter((i) => parseScore(i.noiDung) === 1).length / n) * 100);
      const pct1GvNhietTinh = Math.round((list.filter((i) => parseScore(i.gvNhietTinh) === 1).length / n) * 100);
      const pct1UngDung = Math.round((list.filter((i) => parseScore(i.tinhUngDung) === 1).length / n) * 100);
      return {
        name: `${maLop} (n=${n})`,
        giangVien: list[0]?.giangVien || "",
        "Rất thỏa mãn (%)": pct1HaiLong,
        "Nội dung Rất tốt (%)": pct1NoiDung,
        "GV Nhiệt tình Rất tốt (%)": pct1GvNhietTinh,
        "Ứng dụng tốt (%)": pct1UngDung,
      };
    });
  }, [records]);

  const distributionData = useMemo(() => {
    const criteria: { label: string; getter: (r: FeedbackRecord) => string }[] = [
      { label: "Hài lòng chung", getter: (r) => r.haiLongChung },
      { label: "Nội dung ĐT", getter: (r) => r.noiDung },
      { label: "Phương pháp ĐT", getter: (r) => r.phuongPhapDaoTao },
      { label: "Tương tác lớp", getter: (r) => r.mucDoTuongTac },
      { label: "GV Kiến thức", getter: (r) => r.gvKienThuc },
      { label: "GV Nhiệt tình", getter: (r) => r.gvNhietTinh },
      { label: "GV Truyền đạt", getter: (r) => r.gvTruyenDat },
      { label: "Tính ứng dụng", getter: (r) => r.tinhUngDung },
    ];

    return criteria.map((c) => {
      let m1 = 0, m2 = 0, m3 = 0, m4 = 0;
      records.forEach((r) => {
        const s = parseScore(c.getter(r));
        if (s === 1) m1++;
        else if (s === 2) m2++;
        else if (s === 3) m3++;
        else if (s >= 4) m4++;
      });
      return {
        name: c.label,
        "Mức 1 (Rất tốt)": m1,
        "Mức 2 (Tốt / Thỏa mãn)": m2,
        "Mức 3 (Khá / Phù hợp)": m3,
        "Mức 4 (Bình thường)": m4,
      };
    });
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-sm">
        Không có dữ liệu phù hợp với bộ lọc hiện tại để hiển thị biểu đồ.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Tỷ lệ Mức 1 theo Mã lớp */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Tỷ lệ đánh giá Mức 1 (Cao nhất) theo Mã lớp (%)
        </h3>
        <p className="text-xs text-slate-500 mb-4">So sánh hiệu quả giữa các lớp học đang lọc</p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classChartData} margin={{ top: 10, right: 16, left: -12, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="Rất thỏa mãn (%)" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Nội dung Rất tốt (%)" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="GV Nhiệt tình Rất tốt (%)" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ứng dụng tốt (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Phân bổ số lượng phiếu theo 4 mức */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Phân bổ số phiếu theo từng mức đánh giá
        </h3>
        <p className="text-xs text-slate-500 mb-4">Tổng hợp trên {records.length} phản hồi đang hiển thị</p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} layout="vertical" margin={{ top: 5, right: 20, left: 25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="Mức 1 (Rất tốt)" stackId="a" fill="#16a34a" />
              <Bar dataKey="Mức 2 (Tốt / Thỏa mãn)" stackId="a" fill="#38bdf8" />
              <Bar dataKey="Mức 3 (Khá / Phù hợp)" stackId="a" fill="#fb923c" />
              <Bar dataKey="Mức 4 (Bình thường)" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
