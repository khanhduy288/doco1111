import { Navigate } from "react-router-dom";

const ProtectedRouteAdmin = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("SEPuser"));

  if (!user || user.level !== 6) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRouteAdmin;
