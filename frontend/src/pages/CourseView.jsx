import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  PlayCircle,
  CheckCircle2,
  Circle,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext"; // 👈 Import auth context for session token
import axios from "axios";
import ReactMarkdown from "react-markdown";

export default function CourseView() {
  const { id } = useParams();
  const { token } = useAuth(); // 👈 Destructure token to secure our requests

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  // State holds an array of completed lesson IDs: [1, 3]
  const [completedLessons, setCompletedLessons] = useState([]);
  const [toggling, setToggling] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      try {
        // 1. Fetch main course details (Updated to pass Bearer token!)
        const courseRes = await axios.get(`${API_URL}/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(courseRes.data);
        if (courseRes.data.lessons && courseRes.data.lessons.length > 0) {
          setActiveLesson(courseRes.data.lessons[0]);
        }

        // 2. Fetch completed progress array (Passing Bearer token)
        const progressRes = await axios.get(
          `${API_URL}/api/progress/course/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setCompletedLessons(progressRes.data);

        setLoading(false);
      } catch (err) {
        console.error("Error loading course environment:", err);
        setError("Failed to retrieve workspace data.");
        setLoading(false);
      }
    };

    fetchCourseAndProgress();
  }, [id, token]);

  // Handle toggle completion request
  const handleToggleProgress = async (lessonId) => {
    if (toggling) return;
    setToggling(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/progress/toggle`,
        { lesson_id: lessonId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Local state adjustment based on toggle action
      if (response.data.completed) {
        setCompletedLessons((prev) => [...prev, lessonId]);
      } else {
        setCompletedLessons((prev) => prev.filter((id) => id !== lessonId));
      }
    } catch (err) {
      console.error("Error toggling lesson progress:", err);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-brand-text-muted">
        <Loader2 className="w-6 h-6 animate-spin text-brand-accent-light" />
        <span className="text-sm">
          Assembling interactive syllabus and progress logs...
        </span>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-4 bg-red-950/20 border border-red-900/30 text-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold">Workspace Loading Error</p>
          <p className="text-red-400/85 mt-1">
            {error || "Course details missing"}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-brand-accent-light hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Return Navigation */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-all group"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />{" "}
        Back to Dashboard
      </Link>

      {/* Header Info Panel */}
      <div className="p-6 bg-brand-panel border border-brand-border rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white tracking-tight">
            {course.title}
          </h1>
          <p className="text-xs text-brand-text-muted font-mono">
            Relational Sync Progress: {completedLessons.length} /{" "}
            {course.lessons?.length || 0} Modules Completed
          </p>
        </div>
        <span className="inline-flex self-start px-2.5 py-1 rounded-md bg-brand-bg border border-brand-border font-mono text-xs text-brand-accent-light">
          {course.tech_stack}
        </span>
      </div>

      {/* Dynamic Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Syllabus Navigation Sidebar */}
        <div className="lg:col-span-4 bg-brand-panel border border-brand-border rounded-xl p-4 space-y-3.5">
          <div className="flex items-center gap-2.5 px-2 pb-2 border-b border-brand-border">
            <BookOpen className="w-4 h-4 text-brand-accent-light" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Course Syllabus
            </h3>
          </div>

          <div className="space-y-1">
            {course.lessons &&
              course.lessons.map((lesson) => {
                const isSelected =
                  activeLesson && activeLesson.id === lesson.id;
                const isCompleted = completedLessons.includes(lesson.id); // Check if lesson ID exists inside local state array

                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left px-3.5 py-3 rounded-lg text-xs font-medium transition-all flex items-center justify-between group border ${
                      isSelected
                        ? "bg-brand-bg text-white border-brand-border shadow-inner"
                        : "text-slate-400 hover:bg-brand-bg/40 hover:text-slate-200 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Render active checklist indicators */}
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <PlayCircle
                          className={`w-4 h-4 shrink-0 ${isSelected ? "text-brand-accent-light" : "text-slate-500 group-hover:text-slate-300"}`}
                        />
                      )}
                      <span className="line-clamp-1">{lesson.title}</span>
                    </div>
                    <span className="font-mono text-[10px] text-brand-text-muted">
                      #{lesson.order_number}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Right Side: Active Module Reading Room */}
        <div className="lg:col-span-8 bg-brand-panel border border-brand-border rounded-xl p-8 min-h-[450px] flex flex-col justify-between">
          {activeLesson ? (
            <div className="space-y-8 h-full flex flex-col justify-between">
              <div className="space-y-6">
                <div className="border-b border-brand-border pb-4 space-y-1">
                  <span className="text-[10px] font-mono text-brand-accent-light tracking-widest uppercase">
                    Module Workspace
                  </span>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {activeLesson.title}
                  </h2>
                </div>

                {/* Lesson Contents (Parsed dynamically from database markdown strings) */}
                <div className="min-h-[150px] text-slate-300">
                  <ReactMarkdown
                    components={{
                      h3: ({ node, ...props }) => (
                        <h3
                          className="text-lg font-bold text-white mt-6 mb-2 tracking-tight border-b border-brand-border/30 pb-1"
                          {...props}
                        />
                      ),
                      h4: ({ node, ...props }) => (
                        <h4
                          className="text-xs font-bold text-brand-accent-light mt-5 mb-1.5 font-mono uppercase tracking-wider"
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p
                          className="text-slate-300 leading-relaxed mb-4 text-xs sm:text-sm"
                          {...props}
                        />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          className="list-disc pl-5 mb-4 space-y-1.5 text-slate-300 text-xs sm:text-sm"
                          {...props}
                        />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          className="list-decimal pl-5 mb-4 space-y-1.5 text-slate-300 text-xs sm:text-sm"
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="mb-1 text-slate-300" {...props} />
                      ),
                      code: ({ node, inline, ...props }) =>
                        inline ? (
                          <code
                            className="bg-brand-bg px-1.5 py-0.5 rounded text-brand-accent-light font-mono text-[11px] border border-brand-border/50"
                            {...props}
                          />
                        ) : (
                          <pre
                            className="bg-brand-bg border border-brand-border p-4 rounded-lg overflow-x-auto text-xs font-mono text-slate-300 my-4 shadow-inner"
                            {...props}
                          />
                        ),
                    }}
                  >
                    {activeLesson.content}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Progress Completion Toggle Button Panel */}
              <div className="pt-6 border-t border-brand-border flex items-center justify-end">
                <button
                  onClick={() => handleToggleProgress(activeLesson.id)}
                  disabled={toggling}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    completedLessons.includes(activeLesson.id)
                      ? "bg-brand-bg hover:bg-brand-bg/50 text-emerald-400 border border-emerald-500/20 shadow-md shadow-emerald-500/5"
                      : "bg-brand-accent hover:bg-brand-accent-light text-brand-bg shadow-lg shadow-brand-accent/15"
                  }`}
                >
                  {toggling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                      Working...
                    </>
                  ) : completedLessons.includes(activeLesson.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />{" "}
                      Completed (Incomplete?)
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5 text-brand-bg" /> Mark as
                      Completed
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-brand-text-muted">
              <p className="text-xs">Syllabus node not found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
