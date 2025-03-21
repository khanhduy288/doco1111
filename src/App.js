import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Pages/Home/Home.js";
import Menu from "./components/Pages/Home/Menu.js";
import Reservation from "./components/Pages/Home/Reservation.js";
import Blog from "./components/Pages/Home/Blog.js";
import Contact from "./components/Pages/Home/Contact.js";
import LoginSignup from "./components/Pages/Auth/LoginSignUp.js";
import Layout from "./components/Pages/Layout/Layout.js";
import ForgetPassword from "./components/Pages/Auth/ForgetPassword.js";
import DishDetails from "./components/Pages/Home/DishDetails.js";
import BlogDetails from "./components/Pages/Home/BlogDetails.js";
import { CartProvider } from "./components/Pages/Cart/CartContext.js";
import AdminLayout from "./components/Pages/Role/AdminRole/Layout/AdminLayout.js";
import AllDish from "./components/Pages/Role/AdminRole/Pages/AllDish.js";
import AllCategories from "./components/Pages/Role/AdminRole/Pages/AllCategory.js";
import AllRestaurant from "./components/Pages/Role/AdminRole/Pages/AllRestaurant.js";
import AllArea from "./components/Pages/Role/AdminRole/Pages/AllArea.js";
import AllTable from "./components/Pages/Role/AdminRole/Pages/AllTable.js";
import AllBlogs from "./components/Pages/Role/AdminRole/Pages/AllBlog.js";
import WaiterLayout from "./components/Pages/Role/WaiterRole/Layout/WaiterLayout.js";
import ListReservationWaiter from "./components/Pages/Role/WaiterRole/Pages/ListReservationWaiter.js";
import AcceptstateWaiter from "./components/Pages/Role/WaiterRole/Pages/AcceptStateWaiter.js";
import ChooseDish from "./components/Pages/Role/WaiterRole/Pages/ChooseDish.js";
import ListReservationReceptionist from "./components/Pages/Role/ReceptionistRole/Pages/ListReservationReceptionist.js";
import Waitstate from "./components/Pages/Role/ReceptionistRole/Pages/Waitstate.js";
import ArrangeTable from "./components/Pages/Role/ReceptionistRole/Pages/ArrangeTable.js";
import ManagerLayout from "./components/Pages/Role/ManagerRole/Layout/ManagerLayout.js";
import ListStaff from "./components/Pages/Role/ManagerRole/Pages/ListStaff.js";
import ListTableReservation from "./components/Pages/Role/ManagerRole/Pages/ListTableReservation.js";
import ManagerProfile from "./components/Pages/Role/ManagerRole/Pages/ManagerProfile.js";
import ReservationDetail from "./components/Pages/Home/ReservationDetails.js";
import CustomerLayout from "./components/Pages/Role/CustomerRole/Layout/CustomerLayout.js";
import BookedTable from "./components/Pages/Role/CustomerRole/Pages/BookedTable.js";
import Profile from "./components/Pages/Role/CustomerRole/Pages/Profile.js";
import BookedDetails from "./components/Pages/Role/CustomerRole/Pages/BookedDetails.js";
import ChangePassword from "./components/Pages/Role/CustomerRole/Pages/ChangePassoword.js";
import ReceptionistLayout from "./components/Pages/Role/ReceptionistRole/Layout/ReceptionistLayout.js";
import DetailReservation from "./components/Pages/Role/ManagerRole/Pages/DetailReservation.js";
import { ReservationProvider } from "./components/Pages/Home/ReservationContext.js";
import Dashboard from "./components/Pages/Role/ManagerRole/Pages/Dashboard.js";
import OwnerLayout from "./components/Pages/Role/OwnerRole/Layout/OwnerLayout.js";
import OwnerDashboard from "./components/Pages/Role/OwnerRole/Pages/OwnerDashboard.js";
import OwnerListTableReservation from "./components/Pages/Role/OwnerRole/Pages/ListTableReservation.js";
import withAuth from "./components/Pages/Author/withAuth.js";
import NotFound from "./components/Pages/Shared/NotFound.js";
import AdminProfile from "./components/Pages/Role/AdminRole/Pages/AdminProfile.js";
import OwnerProfile from "./components/Pages/Role/OwnerRole/Pages/OwnerProfile.js";
import ReceptionistProfile from "./components/Pages/Role/ReceptionistRole/Pages/ReceptionistProfile.js";
import WaiterProfile from "./components/Pages/Role/WaiterRole/Pages/WaiterProfile.js";
import AllStaff from "./components/Pages/Role/AdminRole/Pages/AllStaff.js";
import AllCustomer from "./components/Pages/Role/AdminRole/Pages/AllCustomer.js";
import OwnerDetailReservation from "./components/Pages/Role/OwnerRole/Pages/OwnerDetailReservation.js";
import AdminChangePassword from "./components/Pages/Role/AdminRole/Pages/AdminChangePassword.js";
import ManagerChangePassword from "./components/Pages/Role/ManagerRole/Pages/ManagerChangePassword.js";
import OwnerChangePassword from "./components/Pages/Role/OwnerRole/Pages/OwnerChangePassword.js";
import ReceptionistChangePassword from "./components/Pages/Role/ReceptionistRole/Pages/ReceptionistChangePassword.js";
import WaiterChangePassword from "./components/Pages/Role/WaiterRole/Pages/WaiterChangePassword.js";
import ResetPassword from "./components/Pages/Auth/ResetPassword.js";

function App() {
  const ProtectedAdminLayout = withAuth(["Admin"])(AdminLayout);
  const ProtectedManagerLayout = withAuth(["Manager"])(ManagerLayout);
  const ProtectedReceptionistLayout = withAuth(["Receptionist"])(
    ReceptionistLayout
  );
  const ProtectedWaiterLayout = withAuth(["Waiter"])(WaiterLayout);
  const ProtectedOwnerLayout = withAuth(["Owner"])(OwnerLayout);
  const ProtectedCustomerLayout = withAuth(["Customer"])(CustomerLayout);
  return (
    <ReservationProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/authentication" element={<LoginSignup />} />
            <Route path="/forgetPassword" element={<ForgetPassword />} />
            <Route path="/resetPassword*" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />

            <Route path="/admin" element={<ProtectedAdminLayout />}>
              <Route path="dish" element={<AllDish />} />
              <Route path="category" element={<AllCategories />} />
              <Route path="restaurant" element={<AllRestaurant />} />
              <Route path="area" element={<AllArea />} />
              <Route path="table" element={<AllTable />} />
              <Route path="blog" element={<AllBlogs />} />
              <Route path="" element={<AdminProfile />} />
              <Route path="staff" element={<AllStaff />} />
              <Route path="customer" element={<AllCustomer />} />
              <Route path="changepw" element={<AdminChangePassword />} />
            </Route>

            <Route path="/manager" element={<ProtectedManagerLayout />}>
              <Route path="/manager" element={<Dashboard />} />
              <Route path="staff" element={<ListStaff />} />
              <Route
                path="tableReservation"
                element={<ListTableReservation />}
              />
              <Route path="profile" element={<ManagerProfile />} />
              <Route path="details/:id" element={<DetailReservation />} />
              <Route path="profile" element={<ManagerProfile />} />
              <Route path="changepw" element={<ManagerChangePassword />} />
            </Route>

            <Route
              path="/receptionist"
              element={<ProtectedReceptionistLayout />}
            >
              <Route index element={<ListReservationReceptionist />} />
              <Route path="waitstate/:id" element={<Waitstate />} />
              <Route
                path="arrange/:orderId/:restaurantID"
                element={<ArrangeTable />}
              />
              <Route path="profile" element={<ReceptionistProfile />} />
              <Route path="changepw" element={<ReceptionistChangePassword />} />
            </Route>

            <Route path="/waiter" element={<ProtectedWaiterLayout />}>
              <Route index element={<ListReservationWaiter />} />
              <Route path="acceptstate/:id" element={<AcceptstateWaiter />} />
              <Route path="choosedish/:id" element={<ChooseDish />} />
              <Route path="profile" element={<WaiterProfile />} />
              <Route path="changepw" element={<WaiterChangePassword />} />
            </Route>

            <Route path="/owner" element={<ProtectedOwnerLayout />}>
              <Route path="/owner" element={<OwnerDashboard />} />
              <Route
                path="tableReservation"
                element={<OwnerListTableReservation />}
              />
              <Route path="details/:id" element={<OwnerDetailReservation />} />
              <Route path="profile" element={<OwnerProfile />} />
              <Route path="changepw" element={<OwnerChangePassword />} />
            </Route>

            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/details/:id" element={<DishDetails />} />
              <Route path="/reservation" element={<Reservation />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blogDetails/:id" element={<BlogDetails />} />
              <Route path="/contact" element={<Contact />} />
              <Route
                path="/reservationDetail"
                element={<ReservationDetail />}
              />

              <Route path="/customer" element={<ProtectedCustomerLayout />}>
                <Route path="bookedtable" element={<BookedTable />} />
                <Route path="profile" element={<Profile />} />
                <Route path="bookeddetail/:id" element={<BookedDetails />} />
                <Route path="changepassword" element={<ChangePassword />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </ReservationProvider>
  );
}

export default App;
