import React, { useState } from "react";

const PostForm = () => {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = {
      category,
      title,
      content,
      image, // image là chuỗi link
    };

    try {
      const response = await fetch("https://6437c88f0c58d3b14579192a.mockapi.io/api/tour/contentvkhat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Lỗi khi gửi bài viết");
      }

      const result = await response.json();
      console.log("Đăng bài thành công:", result);
      alert("🎉 Đăng bài thành công!");

      // Reset form
      setCategory("");
      setTitle("");
      setContent("");
      setImage("");
    } catch (error) {
      console.error("Lỗi:", error);
      alert("❌ Đăng bài thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8 flex items-center justify-center gap-2">
          📝 Đăng bài viết
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">📂 Chọn hạng mục</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">-- Chọn --</option>
              <option value="lich-su-hinh-thanh">Lịch sử hình thành</option>
              <option value="co-so-phap-ly">Cơ sở pháp lý</option>
              <option value="tam-nhin-su-menh">Tầm nhìn – Sứ mệnh</option>
              <option value="doi-ngu-giang-vien">Đội ngũ giảng viên</option>
              <option value="van-hoa-doanh-nghiep">Văn hóa doanh nghiệp</option>
              <option value="nguyen-tac-hoat-dong">Nguyên tắc hoạt động</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">📝 Tiêu đề</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tiêu đề bài viết..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">✏️ Nội dung</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-xl h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Viết nội dung bài viết tại đây..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Image */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">🖼️ Link hình ảnh</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://link-to-image.jpg"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
          </div>

          {/* Submit */}
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${
                isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              } text-white font-bold py-3 px-6 rounded-full transition duration-300`}
            >
              {isSubmitting ? "Đang gửi..." : "🚀 Đăng bài"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;
