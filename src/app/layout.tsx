import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hệ thống Thống kê & Quản lý Đánh giá Khóa học",
  description: "Dashboard phân tích phản hồi học viên, lọc chuyên sâu, so sánh cùng kỳ và đồng bộ dữ liệu Excel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
