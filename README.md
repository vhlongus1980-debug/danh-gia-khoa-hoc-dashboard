# Hệ thống Dashboard Thống kê & Quản lý Đánh giá Khóa học (Next.js + Excel)

Ứng dụng web xây dựng bằng **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Recharts** và **SheetJS (`xlsx`)**, được thiết kế khớp 100% với cấu trúc 15 cột của file `DANH GIA KHOA HOC (Responses).xlsx`.

## Tính năng chính
1. **Liên kết dữ liệu 2 chiều với Excel (`.xlsx`)**:
   - Nạp sẵn toàn bộ **57 bản ghi** từ file `DANH GIA KHOA HOC (Responses).xlsx` ngay khi khởi chạy.
   - Hỗ trợ **Import Excel** để cập nhật dữ liệu mới từ Google Forms và **Export Excel** xuất lại đúng cấu trúc sheet `Form Responses 1`.
2. **Dashboard Thống kê & Trực quan hóa**:
   - Thẻ KPI tự động tính tỷ lệ mức cao nhất (`1 - Rất thỏa mãn`, `1 - Rất tốt`, `1 - Ứng dụng tốt`) và điểm trung bình theo thang ngược (`1.00` là tốt nhất).
   - Biểu đồ so sánh tỷ lệ đạt Mức 1 theo từng Mã lớp (`KT01`, `KT02`, `KT07`, `KT10`) và phân bổ 4 mức đánh giá.
   - Tự động trích lọc các ý kiến góp ý thực tế (loại bỏ các dòng ghi "Không" / trống).
3. **Thêm / Sửa / Xóa (CRUD) đầy đủ**:
   - Biểu mẫu nhập liệu và chỉnh sửa chi tiết đủ 15 trường khảo sát, tự động lưu vào `localStorage` của trình duyệt.
4. **Bộ lọc chuyên sâu & Tìm kiếm đa điều kiện**:
   - Lọc đồng thời theo **Giảng viên**, **Mã lớp**, **Tháng đào tạo**, **Mức độ hài lòng**, **Chỉ phiếu có góp ý** và tìm kiếm từ khóa tự do.
5. **So sánh cùng kỳ & Đối chuẩn**:
   - So sánh trực tiếp chênh lệch điểm trung bình và tỷ lệ đạt chuẩn giữa 2 tháng (`11/2026` vs `10/2026`), 2 mã lớp hoặc 2 giảng viên.

## Hướng dẫn chạy Local & Deploy lên Vercel

### 1. Chạy trên máy cá nhân (Local)
```bash
npm install
npm run dev
```
Mở trình duyệt tại `http://localhost:3000`.

### 2. Deploy lên Vercel
1. Đẩy thư mục mã nguồn này lên một repository trên **GitHub / GitLab / Bitbucket**.
2. Truy cập [vercel.com](https://vercel.com), chọn **Add New Project** -> Import repository vừa tạo.
3. Vercel tự động nhận diện framework **Next.js** — nhấn **Deploy** (không cần cấu hình thêm biến môi trường).
