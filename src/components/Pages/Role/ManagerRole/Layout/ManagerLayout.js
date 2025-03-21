import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from '../Components/SideBar'; 
import TopBar from '../Components/TopBar'; 
import './ManagerLayout.css';

const ManagerLayout = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <>
      <TopBar toggleNav={toggleNav} />
      <div className="main-container">
        <SideBar isNavOpen={isNavOpen} />
        <div className="main">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default ManagerLayout;
