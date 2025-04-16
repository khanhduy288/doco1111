import React, { useState, useEffect } from "react";
import { Pagination } from "antd";

// Danh sách 64 tỉnh thành Việt Nam và các quận/huyện (dữ liệu tham khảo; bạn có thể cập nhật lại nếu cần)
const provincesData = [
  {
    name: "An Giang",
    districts: [
      "Thành phố Long Xuyên",
      "Thành phố Châu Đốc",
      "Huyện An Phú",
      "Huyện Châu Phú",
      "Huyện Chợ Mới",
      "Huyện Phú Tân",
      "Huyện Thoại Sơn",
      "Huyện Tịnh Biên",
      "Huyện Tri Tôn"
    ],
  },
  {
    name: "Bà Rịa - Vũng Tàu",
    districts: [
      "Thành phố Vũng Tàu",
      "Thành phố Bà Rịa",
      "Huyện Châu Đức",
      "Huyện Côn Đảo",
      "Huyện Đất Đỏ",
      "Huyện Long Điền",
      "Huyện Xuyên Mộc"
    ],
  },
  {
    name: "Bắc Giang",
    districts: [
      "Thành phố Bắc Giang",
      "Huyện Yên Thế",
      "Huyện Lạng Giang",
      "Huyện Lục Nam",
      "Huyện Lục Ngạn",
      "Huyện Sơn Động",
      "Huyện Tân Yên",
      "Huyện Hiệp Hòa"
    ],
  },
  {
    name: "Bắc Kạn",
    districts: [
      "Thành phố Bắc Kạn",
      "Huyện Pác Nặm",
      "Huyện Ba Bể",
      "Huyện Chợ Đồn",
      "Huyện Ngân Sơn",
      "Huyện Nguyên Khê",
      "Huyện Na Rì",
      "Huyện Ngân Sơn"
    ],
  },
  {
    name: "Bạc Liêu",
    districts: [
      "Thành phố Bạc Liêu",
      "Huyện Hồng Dân",
      "Huyện Phước Long",
      "Huyện Vĩnh Lợi",
      "Huyện Đông Hải",
      "Huyện Giá Rai"
    ],
  },
  {
    name: "Bắc Ninh",
    districts: [
      "Thành phố Bắc Ninh",
      "Huyện Yên Phong",
      "Huyện Quế Võ",
      "Huyện Tiên Du",
      "Huyện Từ Sơn",
      "Huyện Thuận Thành",
      "Huyện Gia Bình",
      "Huyện Lương Tài"
    ],
  },
  {
    name: "Bến Tre",
    districts: [
      "Thành phố Bến Tre",
      "Huyện Châu Thành",
      "Huyện Giồng Trôm",
      "Huyện Mỏ Cày",
      "Huyện Mỏ Cày Bắc",
      "Huyện Mỏ Cày Nam",
      "Huyện Chợ Lách",
      "Huyện Ba Tri",
      "Huyện Thạnh Phú"
    ],
  },
  {
    name: "Bình Định",
    districts: [
      "Thành phố Quy Nhơn",
      "Huyện An Lão",
      "Huyện Hoài Nhơn",
      "Huyện Hoài Ân",
      "Huyện Phù Cát",
      "Huyện Tuy Phước",
      "Huyện An Nhơn",
      "Huyện Vĩnh Thạnh"
    ],
  },
  {
    name: "Bình Dương",
    districts: [
      "Thành phố Thủ Dầu Một",
      "Huyện Bàu Bàng",
      "Huyện Dầu Tiếng",
      "Huyện Phú Giáo",
      "Thành phố Dĩ An",
      "Thành phố Thuận An",
      "Huyện Bến Cát",
      "Huyện Tân Uyên",
      "Huyện Hiệp Đức"
    ],
  },
  {
    name: "Bình Phước",
    districts: [
      "Thành phố Bình Long",
      "Huyện Bình Tân",
      "Huyện Bù Đăng",
      "Huyện Bù Đáp",
      "Huyện Chơn Thành",
      "Huyện Hớn Quản",
      "Huyện Lộc Ninh",
      "Huyện Phú Riềng"
    ],
  },
  {
    name: "Bình Thuận",
    districts: [
      "Thành phố Phan Thiết",
      "Huyện La Gi",
      "Huyện Tuy Phong",
      "Huyện Bắc Bình",
      "Huyện Hàm Thuận Bắc",
      "Huyện Hàm Thuận Nam",
      "Huyện Tánh Linh",
      "Huyện Đức Linh",
      "Huyện Hàm Tân"
    ],
  },
  {
    name: "Cà Mau",
    districts: [
      "Thành phố Cà Mau",
      "Huyện U Minh",
      "Huyện Thới Bình",
      "Huyện Trần Văn Thời",
      "Huyện Đầm Dơi",
      "Huyện Năm Căn"
    ],
  },
  {
    name: "Cần Thơ",
    districts: [
      "Quận Ninh Kiều",
      "Quận Bình Thuỷ",
      "Quận Cái Răng",
      "Huyện Ô Môn",
      "Huyện Thốt Nốt",
      "Huyện Vĩnh Thạnh"
    ],
  },
  {
    name: "Cao Bằng",
    districts: [
      "Thành phố Cao Bằng",
      "Huyện Bảo Lạc",
      "Huyện Bảo Lâm",
      "Huyện Nguyên Binh",
      "Huyện Hạ Lang",
      "Huyện Thông Nông",
      "Huyện Trùng Khánh",
      "Huyện Hòa An",
      "Huyện Quảng Uyên",
      "Huyện Trà Lĩnh"
    ],
  },
  {
    name: "Đà Nẵng",
    districts: [
      "Quận Hải Châu",
      "Quận Sơn Trà",
      "Quận Ngũ Hành Sơn",
      "Quận Liên Chiểu",
      "Quận Cẩm Lệ",
      "Quận Thanh Khê"
    ],
  },
  {
    name: "Đắk Lắk",
    districts: [
      "Thành phố Buôn Ma Thuột",
      "Thành phố Buôn Hồ",
      "Huyện Buôn Đôn",
      "Huyện Cư Kuin",
      "Huyện Cư M'gar",
      "Huyện Ea H'leo",
      "Huyện Ea Kar",
      "Huyện M'Đrắk",
      "Huyện Krông Búk",
      "Huyện Krông Năng",
      "Huyện Lắk"
    ],
  },
  {
    name: "Đắk Nông",
    districts: [
      "Thành phố Đắk Nông",
      "Huyện Cư Jút",
      "Huyện Đắk Mil",
      "Huyện Krông Nô",
      "Huyện Tuy Đức",
      "Huyện Đắk Song"
    ],
  },
  {
    name: "Điện Biên",
    districts: [
      "Thành phố Điện Biên Phủ",
      "Huyện Mường Lay",
      "Huyện Điện Biên",
      "Huyện Điện Biên Đông",
      "Huyện Mường Chà",
      "Huyện Tủa Chùa",
      "Huyện Tuần Giáo"
    ],
  },
  {
    name: "Đồng Nai",
    districts: [
      "Thành phố Biên Hòa",
      "Thành phố Long Khánh",
      "Huyện Long Thành",
      "Huyện Xuân Lộc",
      "Huyện Nhơn Trạch",
      "Huyện Thống Nhất",
      "Huyện Cẩm Mỹ",
      "Huyện Trảng Bom",
      "Huyện Vĩnh Cửu"
    ],
  },
  {
    name: "Đồng Tháp",
    districts: [
      "Thành phố Cao Lãnh",
      "Thành phố Sa Đéc",
      "Huyện Hồng Ngự",
      "Huyện Tam Nông",
      "Huyện Tháp Mười",
      "Huyện Châu Thành",
      "Huyện Lấp Vò",
      "Huyện Tân Hồng"
    ],
  },
  {
    name: "Gia Lai",
    districts: [
      "Thành phố Pleiku",
      "Huyện An Khê",
      "Huyện Ayun Pa",
      "Huyện Kông Chro",
      "Huyện Mang Yang",
      "Huyện Kbang",
      "Huyện Đắk Pơ",
      "Huyện Đak Đoa",
      "Huyện Phú Thiện"
    ],
  },
  {
    name: "Hà Giang",
    districts: [
      "Thành phố Hà Giang",
      "Huyện Đồng Văn",
      "Huyện Mèo Vạc",
      "Huyện Yên Minh",
      "Huyện Quản Bạ",
      "Huyện Vị Xuyên",
      "Huyện Bắc Mê",
      "Huyện Hoàng Su Phì",
      "Huyện Xín Mần"
    ],
  },
  {
    name: "Hà Nam",
    districts: [
      "Thành phố Phủ Lý",
      "Huyện Duy Tiên",
      "Huyện Kim Bảng",
      "Huyện Lý Nhân",
      "Huyện Thanh Liêm",
      "Huyện Bình Lục"
    ],
  },
  {
    name: "Hà Nội",
    districts: [
        "Ba Đình",
        "Cầu Giấy",
        "Đống Đa",
        "Hai Bà Trưng",
        "Hoàn Kiếm",
        "Thanh Xuân",
        "Hoàng Mai",
        "Long Biên",
        "Hà Đông",
        "Tây Hồ",
        "Nam Từ Liêm",
        "Bắc Từ Liêm",
        // Các huyện và thị xã
        "Thanh Trì",
        "Ba Vì",
        "Đan Phượng",
        "Gia Lâm",
        "Đông Anh",
        "Thường Tín",
        "Thanh Oai",
        "Chương Mỹ",
        "Hoài Đức",
        "Mỹ Đức",
        "Phúc Thọ",
        "Thạch Thất",
        "Quốc Oai",
        "Phú Xuyên",
        "Ứng Hòa",
        "Mê Linh",
        "Sóc Sơn",
        "Sơn Tây"
    ],
  },
  {
    name: "Hà Tĩnh",
    districts: [
      "Thành phố Hà Tĩnh",
      "Huyện Hồng Lĩnh",
      "Huyện Kỳ Anh",
      "Huyện Lộc Hà",
      "Huyện Thạch Hà",
      "Huyện Cẩm Xuyên",
      "Huyện Can Lộc",
      "Huyện Hương Khê",
      "Huyện Đức Thọ"
    ],
  },
  {
    name: "Hải Dương",
    districts: [
      "Thành phố Hải Dương",
      "Huyện Chí Linh",
      "Huyện Nam Sách",
      "Huyện Kinh Môn",
      "Huyện Thanh Hà",
      "Huyện Cẩm Giàng",
      "Huyện Bình Giang",
      "Huyện Gia Lộc",
      "Huyện Tứ Kỳ",
      "Huyện Ninh Giang"
    ],
  },
  {
    name: "Hải Phòng",
    districts: [
      "Quận Hồng Bàng",
      "Quận Lê Chân",
      "Quận Ngô Quyền",
      "Quận Kiến An",
      "Quận Cát Hải",
      "Huyện An Dương",
      "Huyện An Lão"
    ],
  },
  {
    name: "Hậu Giang",
    districts: [
      "Thành phố Vị Thanh",
      "Thị xã Ngã Bảy",
      "Huyện Châu Thành",
      "Huyện Long Mỹ"
    ],
  },
  {
    name: "Hòa Bình",
    districts: [
      "Thành phố Hòa Bình",
      "Huyện Đà Bắc",
      "Huyện Lương Sơn",
      "Huyện Kim Bôi",
      "Huyện Cao Phong",
      "Huyện Tân Lạc",
      "Huyện Lạc Sơn",
      "Huyện Yên Thủy"
    ],
  },
  {
    name: "Hưng Yên",
    districts: [
      "Thành phố Hưng Yên",
      "Huyện Mỹ Hào",
      "Huyện Văn Lâm",
      "Huyện Đông Hưng",
      "Huyện Tiên Lữ",
      "Huyện Phù Cừ"
    ],
  },
  {
    name: "Khánh Hòa",
    districts: [
        "Thành phố Nha Trang",
        "Thành phố Cam Ranh",
        "Thị xã Ninh Hòa",
        "Huyện Diên Khánh",
        "Huyện Vạn Ninh",
        "Huyện Cam Lâm",
        "Huyện Khánh Vĩnh",
        "Huyện Khánh Sơn",
        "Huyện đảo Trường Sa"
    ],
  },
  {
    name: "Kiên Giang",
    districts: [
      "Thành phố Rạch Giá",
      "Thị xã Hòn Đất",
      "Huyện Kiên Lương",
      "Huyện Hòn Đất",
      "Huyện Tân Hiệp",
      "Huyện Châu Thành",
      "Huyện An Biên",
      "Huyện An Minh",
      "Huyện Vĩnh Thuận",
      "Huyện Giồng Riềng",
      "Huyện Gò Quao"
    ],
  },
  {
    name: "Kon Tum",
    districts: [
      "Thành phố Kon Tum",
      "Huyện Đắk Glei",
      "Huyện Ngọc Hồi",
      "Huyện Kon Plông",
      "Huyện Đắk Tô"
    ],
  },
  {
    name: "Lai Châu",
    districts: [
      "Thành phố Lai Châu",
      "Huyện Sìn Hồ",
      "Huyện Phong Thổ",
      "Huyện Tam Đường",
      "Huyện Than Uyên"
    ],
  },
  {
    name: "Lâm Đồng",
    districts: [
      "Thành phố Đà Lạt",
      "Thành phố Bảo Lộc",
      "Huyện Đam Rông",
      "Huyện Lạc Dương",
      "Huyện Đơn Dương",
      "Huyện Di Linh",
      "Huyện Đình Loan"
    ],
  },
  {
    name: "Lạng Sơn",
    districts: [
      "Thành phố Lạng Sơn",
      "Huyện Bắc Sơn",
      "Huyện Hữu Lũng",
      "Huyện Chi Lăng",
      "Huyện Tràng Định",
      "Huyện Văn Lãng",
      "Huyện Đình Lập"
    ],
  },
  {
    name: "Lào Cai",
    districts: [
      "Thành phố Lào Cai",
      "Huyện Bát Xát",
      "Huyện Mường Khương",
      "Huyện Si Ma Cai",
      "Huyện Bắc Hà",
      "Huyện Bảo Thắng",
      "Huyện Sa Pa",
      "Huyện Văn Bàn"
    ],
  },
  {
    name: "Long An",
    districts: [
      "Thành phố Tân An",
      "Huyện Vĩnh Hưng",
      "Huyện Mộc Hóa",
      "Huyện Thạnh Hóa",
      "Huyện Thủ Thừa",
      "Huyện Bến Lức",
      "Huyện Cần Đước",
      "Huyện Cần Giuộc",
      "Huyện Châu Thành"
    ],
  },
  {
    name: "Nam Định",
    districts: [
      "Thành phố Nam Định",
      "Huyện Mỹ Lộc",
      "Huyện Vụ Bản",
      "Huyện Ý Yên",
      "Huyện Nghĩa Hưng",
      "Huyện Trực Ninh",
      "Huyện Xuân Trường",
      "Huyện Giao Thủy",
      "Huyện Lộc Bình"
    ],
  },
  {
    name: "Nghệ An",
    districts: [
      "Thành phố Vinh",
      "Huyện Cửa Lò",
      "Huyện Đô Lương",
      "Huyện Hoàng Mai",
      "Huyện Quỳnh Lưu",
      "Huyện Nghĩa Đàn",
      "Huyện Quỳ Hợp",
      "Huyện Nghi Lộc",
      "Huyện Yên Thành",
      "Huyện Quỳ Châu"
    ],
  },
  {
    name: "Ninh Bình",
    districts: [
      "Thành phố Ninh Bình",
      "Huyện Tam Điệp",
      "Huyện Nho Quan",
      "Huyện Gia Viễn",
      "Huyện Hoa Lư",
      "Huyện Yên Khánh",
      "Huyện Kim Sơn",
      "Huyện Yên Mô"
    ],
  },
  {
    name: "Ninh Thuận",
    districts: [
      "Thành phố Phan Rang",
      "Huyện Bác Ái",
      "Huyện Ninh Hải",
      "Huyện Ninh Phước",
      "Huyện Thuận Bắc",
      "Huyện Thuận Nam"
    ],
  },
  {
    name: "Phú Thọ",
    districts: [
      "Thành phố Việt Trì",
      "Huyện Phù Ninh",
      "Huyện Đoan Hùng",
      "Huyện Thanh Ba",
      "Huyện Hạ Hòa",
      "Huyện Cẩm Khê",
      "Huyện Tam Nông",
      "Huyện Lâm Thao"
    ],
  },
  {
    name: "Phú Yên",
    districts: [
      "Thành phố Tuy Hòa",
      "Huyện Sông Cầu",
      "Huyện Đồng Xuân",
      "Huyện Sơn Hòa",
      "Huyện Sông Hinh",
      "Huyện Tây Hòa",
      "Huyện Phú Hòa"
    ],
  },
  {
    name: "Quảng Bình",
    districts: [
      "Thành phố Đồng Hới",
      "Huyện Minh Hóa",
      "Huyện Tuyên Hóa",
      "Huyện Quảng Trạch",
      "Huyện Bố Trạch",
      "Huyện Lệ Thủy"
    ],
  },
  {
    name: "Quảng Nam",
    districts: [
      "Thành phố Tam Kỳ",
      "Thành phố Hội An",
      "Huyện Đại Lộc",
      "Huyện Điện Bàn",
      "Huyện Duy Xuyên",
      "Huyện Quế Sơn",
      "Huyện Nam Giang",
      "Huyện Điện Phước",
      "Huyện Phước Sơn",
      "Huyện Hiệp Đức"
    ],
  },
  {
    name: "Quảng Ngãi",
    districts: [
      "Thành phố Quảng Ngãi",
      "Huyện Bình Sơn",
      "Huyện Trà Bồng",
      "Huyện Sơn Tịnh",
      "Huyện Tư Nghĩa",
      "Huyện Minh Long",
      "Huyện Nghĩa Chánh",
      "Huyện Mộ Đức"
    ],
  },
  {
    name: "Quảng Ninh",
    districts: [
      "Thành phố Hạ Long",
      "Thành phố Cẩm Phả",
      "Huyện Uông Bí",
      "Huyện Móng Cái",
      "Huyện Cô Tô",
      "Huyện Hải Hà",
      "Huyện Tiên Yên",
      "Huyện Đông Triều",
      "Huyện Quảng Yên"
    ],
  },
  {
    name: "Quảng Trị",
    districts: [
      "Thành phố Đông Hà",
      "Huyện Quảng Trị",
      "Huyện Vĩnh Linh",
      "Huyện Hướng Hóa",
      "Huyện Gio Linh",
      "Huyện Cam Lộ"
    ],
  },
  {
    name: "Sóc Trăng",
    districts: [
      "Thành phố Sóc Trăng",
      "Huyện Kế Sách",
      "Huyện Mỹ Tú",
      "Huyện Cù Lao Dung",
      "Huyện Long Phú",
      "Huyện Châu Thành"
    ],
  },
  {
    name: "Sơn La",
    districts: [
      "Thành phố Sơn La",
      "Huyện Quỳnh Nhai",
      "Huyện Mộc Châu",
      "Huyện Yên Châu",
      "Huyện Mai Châu",
      "Huyện Sông Mã",
      "Huyện Bắc Yên",
      "Huyện Phù Yên"
    ],
  },
  {
    name: "Tây Ninh",
    districts: [
      "Thành phố Tây Ninh",
      "Huyện Tân Biên",
      "Huyện Tân Châu",
      "Huyện Châu Thành"
    ],
  },
  {
    name: "Thái Bình",
    districts: [
      "Thành phố Thái Bình",
      "Huyện Hưng Hà",
      "Huyện Kiến Xương",
      "Huyện Thái Thụy",
      "Huyện Quỳnh Phụ"
    ],
  },
  {
    name: "Thái Nguyên",
    districts: [
      "Thành phố Thái Nguyên",
      "Huyện Phổ Yên",
      "Huyện Định Hóa",
      "Huyện Đại Từ",
      "Huyện Phú Bình",
      "Huyện Đô Lương" // Sửa lại theo dữ liệu thực tế nếu cần
    ],
  },
  {
    name: "Thanh Hóa",
    districts: [
        "Thành phố Thanh Hóa",
        "Thành phố Sầm Sơn",
        "Thị xã Nghi Sơn",
        "Thị xã Bỉm Sơn",
        "Huyện Mường Lát",
        "Huyện Quan Sơn",
        "Huyện Quan Hóa",
        "Huyện Bá Thước",
        "Huyện Lang Chánh",
        "Huyện Thường Xuân",
        "Huyện Như Xuân",
        "Huyện Như Thanh",
        "Huyện Ngọc Lặc",
        "Huyện Thọ Xuân",
        "Huyện Thạch Thành",
        "Huyện Cẩm Thủy",
        "Huyện Vĩnh Lộc",
        "Huyện Yên Định",
        "Huyện Thiệu Hóa",
        "Huyện Triệu Sơn",
        "Huyện Đông Sơn",
        "Huyện Hà Trung",
        "Huyện Nga Sơn",
        "Huyện Hậu Lộc",
        "Huyện Hoằng Hóa",
        "Huyện Quảng Xương",
        "Huyện Nông Cống"
    ],
  },
  {
    name: "Thừa Thiên Huế",
    districts: [
      "Thành phố Huế",
      "Huyện Phong Điền",
      "Huyện Phú Vang",
      "Huyện Hương Trà",
      "Huyện Hương Thủy",
      "Huyện A Lưới",
      "Huyện Nam Đông"
    ],
  },
  {
    name: "Tiền Giang",
    districts: [
      "Thành phố Tiền Giang",
      "Thành phố Mỹ Tho",
      "Huyện Cái Bè",
      "Huyện Cai Lậy",
      "Huyện Châu Thành",
      "Huyện Gò Công",
      "Huyện Tân Phước"
    ],
  },
  {
    name: "TP. Hồ Chí Minh",
    districts: [
      "Quận 1",
      "Quận 2",
      "Quận 3",
      "Quận 4",
      "Quận 5",
      "Quận 6",
      "Quận 7",
      "Quận 8",
      "Quận 9",
      "Quận 10",
      "Quận 11",
      "Quận 12",
      "Quận Bình Tân",
      "Quận Bình Thạnh",
      "Quận Gò Vấp",
      "Quận Phú Nhuận",
      "Quận Tân Bình",
      "Quận Tân Phú",
      "Quận Thủ Đức"
    ],
  },
  {
    name: "Trà Vinh",
    districts: [
      "Thành phố Trà Vinh",
      "Huyện Cầu Ngang",
      "Huyện Duyên Hải",
      "Huyện Trà Cú",
      "Huyện Châu Thành"
    ],
  },
  {
    name: "Tuyên Quang",
    districts: [
      "Thành phố Tuyên Quang",
      "Huyện Na Hang",
      "Huyện Chiêm Hóa",
      "Huyện Hàm Yên"
    ],
  },
  {
    name: "Vĩnh Long",
    districts: [
      "Thành phố Vĩnh Long",
      "Huyện Vũng Liêm",
      "Huyện Long Hồ",
      "Huyện Mang Thít",
      "Huyện Trà Ôn"
    ],
  },
  {
    name: "Vĩnh Phúc",
    districts: [
      "Thành phố Vĩnh Yên",
      "Huyện Vĩnh Tường",
      "Huyện Yên Lạc",
      "Huyện Lập Thạch",
      "Huyện Sông Lô"
    ],
  },
  {
    name: "Yên Bái",
    districts: [
      "Thành phố Yên Bái",
      "Huyện Nghĩa Lộ",
      "Huyện Lục Yên",
      "Huyện Văn Yên",
      "Huyện Mù Căng Chải",
      "Huyện Trấn Yên",
      "Huyện Trạm Tấu"
    ],
  }
];

const Dashboard = () => {
    const [lessons, setLessons] = useState([]);
    const [formData, setFormData] = useState({
      date: "",
      skill: "",
      className: "",
      teacher: "",
      locationProvince: "", 
      locationDistrict: "",
      note: "",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [editId, setEditId] = useState(null);
    const pageSize = 5;
  
    const baseUrl = "https://67ec9492aa794fb3222e24a5.mockapi.io/Blog/schedule";
  
    useEffect(() => {
      fetchData();
    }, []);
  
    const fetchData = async () => {
      try {
        const response = await fetch(baseUrl);
        if (!response.ok) {
          throw new Error("Lỗi khi lấy dữ liệu");
        }
        const data = await response.json();
        setLessons(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
  
    const handleProvinceChange = (e) => {
      setFormData({
        ...formData,
        locationProvince: e.target.value,
        locationDistrict: "",
      });
    };
  
    const handleDistrictChange = (e) => {
      setFormData({ ...formData, locationDistrict: e.target.value });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.date || !formData.skill || !formData.locationProvince || !formData.locationDistrict) {
        return alert("Vui lòng điền đầy đủ thông tin, bao gồm địa chỉ!");
      }
  
      try {
        const method = editId ? "PUT" : "POST";
        const url = editId ? `${baseUrl}/${editId}` : baseUrl;
  
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
  
        if (!response.ok) throw new Error("Lỗi khi gửi dữ liệu");
  
        fetchData();
        setFormData({ date: "", skill: "", className: "", teacher: "", locationProvince: "", locationDistrict: "", note: "" });
        setEditId(null);
      } catch (error) {
        console.error("Error submitting data:", error);
      }
    };
  
    const handleEdit = (lesson) => {
      setFormData({
        date: lesson.date,
        skill: lesson.skill,
        className: lesson.className,
        teacher: lesson.teacher,
        locationProvince: lesson.locationProvince,
        locationDistrict: lesson.locationDistrict,
        note: lesson.note,
      });
      setEditId(lesson.id);
    };
  
    const handleDelete = async (id) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa không?")) {
        try {
          await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
          fetchData();
        } catch (error) {
          console.error("Error deleting data:", error);
        }
      }
    };
  
    const startIndex = (currentPage - 1) * pageSize;
    const currentLessons = lessons.slice(startIndex, startIndex + pageSize);
  
    return (
      <>
        {/* Thanh menu riêng ở đầu trang */}
        <div className="bg-light border-bottom mb-4 px-4 py-3 d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Trang Quản Lý Buổi Dạy</h4>
          <a href="/postform" className="btn btn-outline-primary btn-sm">
            ➕ Đăng nội dung mới
          </a>
        </div>
    
        {/* Nội dung chính */}
        <div style={{ padding: "5%", margin: "auto" }}>
          <h2 className="text-center mb-4">Quản Lý Buổi Dạy Kỹ Năng An Toàn</h2>
    
          <form onSubmit={handleSubmit} style={{ marginBottom: "30px", marginTop: "60px" }}>
            <div className="row g-3">
              <div className="col-md-4">
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-4">
                <input type="text" name="skill" placeholder="Kỹ năng" value={formData.skill} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-4">
                <input type="text" name="className" placeholder="Lớp học" value={formData.className} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-md-4">
                <input type="text" name="teacher" placeholder="Giáo viên" value={formData.teacher} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-md-4">
                <select name="locationProvince" value={formData.locationProvince} onChange={handleProvinceChange} className="form-control" required>
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provincesData.map((province) => (
                    <option key={province.name} value={province.name}>{province.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <select name="locationDistrict" value={formData.locationDistrict} onChange={handleDistrictChange} className="form-control" required disabled={!formData.locationProvince}>
                  <option value="">Chọn quận/huyện</option>
                  {formData.locationProvince && provincesData.find((p) => p.name === formData.locationProvince)?.districts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <input type="text" name="note" placeholder="Ghi chú" value={formData.note} onChange={handleChange} className="form-control" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-3">
              {editId ? "Lưu chỉnh sửa" : "Thêm buổi dạy"}
            </button>
          </form>
    
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Ngày</th>
                  <th>Kỹ năng</th>
                  <th>Lớp</th>
                  <th>GV</th>
                  <th>Địa điểm</th>
                  <th>Ghi chú</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentLessons.length > 0 ? (
                  currentLessons.map((lesson) => (
                    <tr key={lesson.id}>
                      <td>{lesson.date}</td>
                      <td>{lesson.skill}</td>
                      <td>{lesson.className}</td>
                      <td>{lesson.teacher}</td>
                      <td>{lesson.locationProvince} - {lesson.locationDistrict}</td>
                      <td>{lesson.note}</td>
                      <td>
                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(lesson)}>Sửa</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(lesson.id)}>Xoá</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">Chưa có buổi dạy nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
    
          {lessons.length > pageSize && (
            <div className="text-center mt-4">
              <Pagination current={currentPage} pageSize={pageSize} total={lessons.length} onChange={(page) => setCurrentPage(page)} />
            </div>
          )}
        </div>
      </>
    );
  };
  
  export default Dashboard;
  