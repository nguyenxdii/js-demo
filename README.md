## Hướng dẫn cài đặt và khởi chạy (3 bước)

Để đảm bảo hệ thống hoạt động chính xác, bạn hãy thực hiện theo đúng thứ tự 3 bước sau tại thư mục gốc của dự án:

### Bước 1: Cài đặt thư viện

```bash
npm run install:all
```

### Bước 2: Khởi tạo dữ liệu mẫu

Lệnh này sẽ nạp danh mục sản phẩm và phát sinh 15 đơn hàng mẫu thực tế để hiển thị trên Dashboard:

```bash
npm run seed
```

### Bước 3: Khởi chạy hệ thống

```bash
npm run dev:all
```

---

## Thông tin quản trị mặc định (Admin)

Sau khi chạy lệnh seed, bạn có thể đăng nhập vào trang quản trị:

- Trang quản trị: http://localhost:5173/admin/dashboard
- Email: admin@gmail.com
- Mật khẩu: 123qwe123

---

## Hướng dẫn cấu hình ngrok (Để thanh toán MoMo)

Do MoMo cần một URL công khai để gửi thông báo kết quả thanh toán (IPN callback), bạn cần sử dụng **ngrok** để đưa server local lên internet.

### Bước 1: Cài đặt và cấu hình ngrok
1. Tải ngrok tại: [ngrok.com/download](https://ngrok.com/download)
2. Đăng ký tài khoản và lấy **Authtoken** tại trang dashboard của ngrok.
3. Chạy lệnh sau để thiết lập Authtoken (chỉ cần làm 1 lần):
   ```bash
   ngrok config add-authtoken <YOUR_AUTHTOKEN>
   ```

### Bước 2: Khởi chạy ngrok cho Backend
Chạy lệnh sau để mở cổng 8080 cho Backend:
```bash
ngrok http 8080
```
Sau đó, ngrok sẽ cung cấp cho bạn một dải link dạng: `https://abcd-123.ngrok-free.app`

### Bước 3: Cập nhật biến môi trường
Mở file `backend/.env`, tìm và cập nhật dòng `MOMO_IPN_URL` bằng link ngrok mới nhất của bạn:
```env
MOMO_IPN_URL=https://<LINK_NGROK_CỦA_BẠN>/api/orders/momo-callback
```

---
