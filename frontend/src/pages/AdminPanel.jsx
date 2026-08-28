import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  FileText,
  CheckCircle,
  Ban,
  Trash2,
  Edit2,
  Plus,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function AdminPanel() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("users"); // 'users', 'courses', 'lessons'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Core Management States
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);

  // Course Form States
  const [courseForm, setCourseForm] = useState({
    id: null,
    title: "",
    description: "",
    tech_stack: "",
  });
  const [showCourseForm, setShowCourseForm] = useState(false);

  // Lesson Form States
  const [lessonForm, setLessonForm] = useState({
    id: null,
    title: "",
    content: "",
    order_number: "",
  });
  const [showLessonForm, setShowLessonForm] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch initial dataset on tab mounts
  useEffect(() => {
    fetchData();
  }, [activeTab, token]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "users") {
        const res = await axios.get(
          `${API_URL}/api/admin/users`,
          axiosConfig,
        );
        setUsers(res.data);
      } else if (activeTab === "courses") {
        const res = await axios.get(
          `${API_URL}/api/courses`,
          axiosConfig,
        );
        setCourses(res.data);
      } else if (activeTab === "lessons") {
        const res = await axios.get(
          `${API_URL}/api/courses`,
          axiosConfig,
        );
        setCourses(res.data);
        if (res.data.length > 0 && !selectedCourse) {
          setSelectedCourse(res.data[0]);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch administrative data.");
      setLoading(false);
    }
  };

  // Fetch lessons dynamically when course selection shifts
  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse.id);
    }
  }, [selectedCourse]);

  const fetchLessons = async (courseId) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/courses/${courseId}`,
        axiosConfig,
      );
      setLessons(res.data.lessons || []);
    } catch (err) {
      console.error(err);
    }
  };

  // --- 1. USER METHODS ---
  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/users/${userId}/status`,
        { status: newStatus },
        axiosConfig,
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  // --- 2. COURSE CRUD ---
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (courseForm.id) {
        // Edit Course
        await axios.put(
          `${API_URL}/api/courses/${courseForm.id}`,
          courseForm,
          axiosConfig,
        );
      } else {
        // Create Course
        await axios.post(
          `${API_URL}/api/courses`,
          courseForm,
          axiosConfig,
        );
      }
      setCourseForm({ id: null, title: "", description: "", tech_stack: "" });
      setShowCourseForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCourseDelete = async (courseId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this course and all associated lessons?",
      )
    )
      return;
    try {
      await axios.delete(
        `${API_URL}/api/courses/${courseId}`,
        axiosConfig,
      );
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // --- 3. LESSON CRUD ---
  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    try {
      if (lessonForm.id) {
        // Edit Lesson
        await axios.put(
          `${API_URL}/api/courses/${selectedCourse.id}/lessons/${lessonForm.id}`,
          lessonForm,
          axiosConfig,
        );
      } else {
        // Create Lesson
        await axios.post(
          `${API_URL}/api/courses/${selectedCourse.id}/lessons`,
          lessonForm,
          axiosConfig,
        );
      }
      setLessonForm({ id: null, title: "", content: "", order_number: "" });
      setShowLessonForm(false);
      fetchLessons(selectedCourse.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLessonDelete = async (lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;
    try {
      await axios.delete(
       `${API_URL}/api/courses/${selectedCourse.id}/lessons/${lessonId}`,
        axiosConfig,
      );
      fetchLessons(selectedCourse.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand-accent/15 border border-brand-accent/30 rounded-lg text-brand-accent-light">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            Admin Control Portal
          </h1>
          <p className="text-slate-400 text-sm">
            Approve user accounts, manage dynamic courses, and organize syllabi.
          </p>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-brand-border gap-2">
        {[
          { id: "users", label: "Manage Users", icon: Users },
          { id: "courses", label: "Manage Courses", icon: BookOpen },
          { id: "lessons", label: "Manage Lessons", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setLoading(true);
              }}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider font-mono transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "border-brand-accent-light text-brand-accent-light"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Loaders / Errors */}
      {loading && (
        <div className="flex items-center gap-3 py-12 text-brand-text-muted">
          <Loader2 className="w-5 h-5 animate-spin text-brand-accent-light" />
          <span className="text-sm">Fetching management records...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/30 text-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* TAB CONTENTS */}
      {!loading && !error && (
        <div className="space-y-6">
          {/* 1. USERS WORKSPACE */}
          {activeTab === "users" && (
            <div className="bg-brand-panel border border-brand-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-brand-bg/40 text-brand-text-muted font-mono uppercase tracking-wider border-b border-brand-border">
                  <tr>
                    <th className="p-4">Username</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Privilege</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-brand-bg/10">
                      <td className="p-4 font-semibold text-white">
                        {u.username}
                      </td>
                      <td className="p-4 text-slate-300">{u.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${u.is_admin ? "bg-amber-500/10 text-amber-400 border border-amber-500/25" : "bg-slate-800 text-slate-400"}`}
                        >
                          {u.is_admin ? "ADMIN" : "STUDENT"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            u.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : u.status === "blocked"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-yellow-500/10 text-yellow-400"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        {u.status !== "approved" && (
                          <button
                            onClick={() =>
                              handleUserStatusChange(u.id, "approved")
                            }
                            className="p-1.5 bg-brand-bg hover:bg-emerald-500/10 border border-brand-border hover:border-emerald-500/25 text-slate-400 hover:text-emerald-400 rounded transition-all cursor-pointer"
                            title="Approve User"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {u.status !== "blocked" && !u.is_admin && (
                          <button
                            onClick={() =>
                              handleUserStatusChange(u.id, "blocked")
                            }
                            className="p-1.5 bg-brand-bg hover:bg-red-500/10 border border-brand-border hover:border-red-500/25 text-slate-400 hover:text-red-400 rounded transition-all cursor-pointer"
                            title="Block User"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. COURSES WORKSPACE */}
          {activeTab === "courses" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setCourseForm({
                      id: null,
                      title: "",
                      description: "",
                      tech_stack: "",
                    });
                    setShowCourseForm(true);
                  }}
                  className="px-4 py-2.5 bg-brand-accent hover:bg-brand-accent-light text-brand-bg text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer shadow-lg shadow-brand-accent/20"
                >
                  <Plus className="w-4 h-4" /> Add New Course
                </button>
              </div>

              {showCourseForm && (
                <form
                  onSubmit={handleCourseSubmit}
                  className="p-6 bg-brand-panel border border-brand-border rounded-xl space-y-4"
                >
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    {courseForm.id ? "Edit Course" : "Create New Course"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Course Title"
                      value={courseForm.title}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, title: e.target.value })
                      }
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-accent-light"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Tech Stack (e.g., React, PostgreSQL)"
                      value={courseForm.tech_stack}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          tech_stack: e.target.value,
                        })
                      }
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-accent-light"
                    />
                  </div>
                  <textarea
                    required
                    placeholder="Course Description"
                    rows="3"
                    value={courseForm.description}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-accent-light"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCourseForm(false)}
                      className="px-4 py-2 bg-brand-bg border border-brand-border rounded-lg text-xs text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-accent text-brand-bg font-semibold rounded-lg text-xs"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="p-6 bg-brand-panel border border-brand-border rounded-xl flex flex-col justify-between h-48"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono bg-brand-bg border border-brand-border px-2 py-0.5 rounded text-brand-accent-light">
                          {c.tech_stack}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setCourseForm(c);
                              setShowCourseForm(true);
                            }}
                            className="p-1 text-slate-500 hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleCourseDelete(c.id)}
                            className="p-1 text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-white line-clamp-1">
                        {c.title}
                      </h3>
                      <p className="text-xs text-brand-text-muted line-clamp-2">
                        {c.description}
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-brand-text-muted pt-4 border-t border-brand-border/40">
                      DATABASE ID: #{c.id}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. LESSONS WORKSPACE */}
          {activeTab === "lessons" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-brand-panel border border-brand-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold font-mono text-slate-400 uppercase">
                    Target Course:
                  </span>
                  <select
                    value={selectedCourse?.id || ""}
                    onChange={(e) =>
                      setSelectedCourse(
                        courses.find((c) => c.id === parseInt(e.target.value)),
                      )
                    }
                    className="bg-brand-bg border border-brand-border text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    setLessonForm({
                      id: null,
                      title: "",
                      content: "",
                      order_number: "",
                    });
                    setShowLessonForm(true);
                  }}
                  className="px-4 py-2.5 bg-brand-accent hover:bg-brand-accent-light text-brand-bg text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" /> Add Lesson to Syllabus
                </button>
              </div>

              {showLessonForm && (
                <form
                  onSubmit={handleLessonSubmit}
                  className="p-6 bg-brand-panel border border-brand-border rounded-xl space-y-4"
                >
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    {lessonForm.id ? "Edit Lesson" : "Create New Lesson"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Lesson Title"
                      value={lessonForm.title}
                      onChange={(e) =>
                        setLessonForm({ ...lessonForm, title: e.target.value })
                      }
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none md:col-span-3"
                    />
                    <input
                      type="number"
                      required
                      placeholder="Order Number (e.g., 1)"
                      value={lessonForm.order_number}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          order_number: e.target.value,
                        })
                      }
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <textarea
                    required
                    placeholder="Lesson Content (Markdown syntax supported)"
                    rows="5"
                    value={lessonForm.content}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, content: e.target.value })
                    }
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowLessonForm(false)}
                      className="px-4 py-2 bg-brand-bg border border-brand-border rounded-lg text-xs text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-accent text-brand-bg font-semibold rounded-lg text-xs"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-brand-panel border border-brand-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-brand-bg/40 text-brand-text-muted font-mono uppercase tracking-wider border-b border-brand-border">
                    <tr>
                      <th className="p-4 w-16">Index</th>
                      <th className="p-4">Lesson Title</th>
                      <th className="p-4">Content Excerpt</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/40">
                    {lessons.map((l) => (
                      <tr key={l.id} className="hover:bg-brand-bg/10">
                        <td className="p-4 font-mono font-semibold text-brand-accent-light">
                          #{l.order_number}
                        </td>
                        <td className="p-4 font-semibold text-white">
                          {l.title}
                        </td>
                        <td className="p-4 text-slate-400 line-clamp-1 max-w-xs">
                          {l.content}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setLessonForm(l);
                                setShowLessonForm(true);
                              }}
                              className="p-1.5 hover:bg-brand-bg border border-transparent hover:border-brand-border rounded text-slate-400 hover:text-white"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleLessonDelete(l.id)}
                              className="p-1.5 hover:bg-brand-bg border border-transparent hover:border-brand-border rounded text-slate-400 hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
