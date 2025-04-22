import React, { useEffect, useState } from "react";

const Phaply = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL =
    "https://6437c88f0c58d3b14579192a.mockapi.io/api/tour/contentvkhat";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const filtered = data.filter(
          (post) => post.category === "co-so-phap-ly" 
        );
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
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center">
         Cơ Sở Pháp Lý
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-red-500">Không có bài viết nào.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex flex-col items-center text-center gap-6 mb-10 w-[70%] mx-auto"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                {post.title}
              </h2>
              <p className="lead" style={{ maxWidth: "50%", margin: "0 auto" }}>
                {post.content}
              </p>

              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full rounded-xl shadow"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Phaply;
