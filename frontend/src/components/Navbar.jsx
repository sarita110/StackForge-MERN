import React from "react";
import { Bell, Command, Search, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext"; // Import our global session hook

export default function Navbar() {
  const { user, logout } = useAuth(); // Extract active user and sign-out function

  // Generate clean two-letter initials for user profile badge
  const getAvatarInitials = (name) => {
    if (!name) return "GD";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-brand-panel/85 backdrop-blur-md border-b border-brand-border flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10 transition-all">
      {/* Search Input Bar */}
      <div className="relative w-72">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
          <Search className="w-3.5 h-3.5" />
        </div>
        <input
          type="text"
          placeholder="Search workspace..."
          disabled
          className="w-full bg-brand-bg/60 border border-brand-border rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-400 placeholder-slate-500 focus:outline-none cursor-not-allowed"
        />
        <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-medium text-slate-500 bg-brand-panel border border-brand-border rounded">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </div>
      </div>

      {/* Account Profile Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications Icon Button */}
        <button className="p-2 hover:bg-brand-bg/80 border border-transparent hover:border-brand-border rounded-lg transition-all text-slate-400 hover:text-white">
          <Bell className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-brand-border" />

        {/* Dynamic User Session Info */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            {/* Dynamic string injection representing active session user */}
            <span className="text-xs font-semibold text-white capitalize">
              {user?.username || "Guest"}
            </span>
            <span className="text-[10px] text-brand-text-muted font-mono">
              {user?.email || "guest@stackforge.local"}
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent-light font-mono text-xs font-bold uppercase">
            {getAvatarInitials(user?.username)}
          </div>
        </div>

        <div className="h-4 w-px bg-brand-border" />

        {/* Logout Interactive Action */}
        <button
          onClick={logout}
          title="Sign Out of Workspace"
          className="p-2 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 rounded-lg text-slate-400 hover:text-red-400 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
