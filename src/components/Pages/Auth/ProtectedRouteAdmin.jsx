import { Navigate } from "react-router-dom";

const ProtectedRouteAdmin = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("SEPuser"));

  if (!user || user.level !== 6) {
    // Không phải admin thì chuyển về home hoặc trang login
    return <Navigate to="/" />;
  }

  // Nếu là admin thì cho phép vào
  return children;
};

export default ProtectedRouteAdmin;
