import React from "react";
import {
  LayoutDashboard,
  Terminal,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 👈 Import auth context

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth(); // 👈 Destructure active user

  const menuItems = [{ name: "Dashboard", path: "/", icon: LayoutDashboard }];

  return (
    <aside className="w-64 bg-brand-panel border-r border-brand-border text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="h-16 px-6 border-b border-brand-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-brand-accent to-brand-accent-light flex items-center justify-center shadow-lg shadow-brand-accent/20">
            <Terminal className="w-3.5 h-3.5 text-brand-bg font-bold" />
          </div>
          <span className="text-sm font-semibold tracking-wider text-white uppercase font-mono">
            Stack<span className="text-brand-accent-light">Forge</span>
          </span>
        </div>
        <span className="text-[10px] bg-brand-border px-1.5 py-0.5 rounded font-mono text-brand-text-muted">
          v0.1
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        <div className="text-[10px] font-mono tracking-widest text-brand-text-muted uppercase px-3 mb-2 block">
          Core Workspace
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative ${
                isActive
                  ? "bg-brand-bg text-white border border-brand-border shadow-inner"
                  : "hover:bg-brand-bg/50 text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${isActive ? "text-brand-accent-light" : "text-slate-500 group-hover:text-slate-300"}`}
                />
                <span className="font-medium">{item.name}</span>
              </div>

              {isActive ? (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-light shadow-md shadow-brand-accent-light/50" />
              ) : (
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-slate-500 transition-opacity" />
              )}
            </Link>
          );
        })}

        {/* 👈 RESTRICTED NAV ELEMENT: Rendered only if user is an Administrator */}
        {user?.is_admin && (
          <>
            <div className="text-[10px] font-mono tracking-widest text-brand-text-muted uppercase px-3 pt-6 mb-2 block">
              Management Panel
            </div>
            <Link
              to="/admin"
              className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative ${
                location.pathname === "/admin"
                  ? "bg-brand-bg text-white border border-brand-border shadow-inner"
                  : "hover:bg-brand-bg/50 text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert
                  className={`w-4 h-4 ${location.pathname === "/admin" ? "text-brand-accent-light" : "text-slate-500 group-hover:text-slate-300"}`}
                />
                <span className="font-medium">Admin Control</span>
              </div>
              {location.pathname === "/admin" && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-light shadow-md shadow-brand-accent-light/50" />
              )}
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-brand-border bg-brand-bg/30">
        <div className="flex items-center gap-3.5 px-2 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <div className="text-xs">
            <p className="text-slate-300 font-medium font-mono text-[11px]">
              DB Cluster Active
            </p>
            <p className="text-[10px] text-brand-text-muted">
              Port 5434 connected
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
