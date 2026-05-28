// src/layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Navbar />
      <div className="app-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
