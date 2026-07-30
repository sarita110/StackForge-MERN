import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-brand-bg text-slate-200 relative overflow-hidden">
      {/* Visual Enhancers: Grid layer & glowing ambient background dots */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none z-0" />
      <div className="absolute -top-40 left-1/3 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Navigation Layout */}
      <Sidebar />

      <div className="pl-64 flex flex-col min-h-screen relative z-10">
        <Navbar />
        {/* Dynamic page frame viewport */}
        <main className="flex-1 pt-24 px-8 pb-12 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
