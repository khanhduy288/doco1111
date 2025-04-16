import React, { useEffect, useState } from "react";

const History = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "https://6437c88f0c58d3b14579192a.mockapi.io/api/tour/contentvkhat";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const filtered = data.filter(post => post.category === "lich-su-hinh-thanh");
        setPosts(filtered);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">
          🏛️ Lịch sử hình thành
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-red-500">Không có bài viết nào.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {post.title}
              </h2>
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="rounded-xl w-full h-auto mb-4"
                />
              )}
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
