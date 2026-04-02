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
