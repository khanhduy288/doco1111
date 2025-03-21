import React from "react";
import "../Layout/ManagerLayout.css";

const TopBar = ({ toggleNav }) => {
  return (
    <header>
      <div className="logosec">
        <div className="logo">Manager</div>
        <img
          src="https://media.geeksforgeeks.org/wp-content/uploads/20221210182541/Untitled-design-(30).png"
          className="icn menuicn"
          onClick={toggleNav}
          id="menuicn"
          alt="menu-icon"
        />
      </div>
      <div className="message">
        <div className="circle" />
        <img
          src="https://media.geeksforgeeks.org/wp-content/uploads/20221210183322/8.png"
          className="icn"
          alt=""
        />
        <div className="dp">
          <img
            src="https://media.geeksforgeeks.org/wp-content/uploads/20221210180014/profile-removebg-preview.png"
            className="dpicn"
            alt="dp"
          />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
