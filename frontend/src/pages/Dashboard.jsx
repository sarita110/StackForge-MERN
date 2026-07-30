import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Code2,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 👈 Import auth context
import axios from "axios";

export default function Dashboard() {
  const { token } = useAuth(); // 👈 Extract session token

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Pass session token inside headers
        const response = await axios.get("http://localhost:5000/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(
          "Unable to connect to the backend server. Please verify your backend is running.",
        );
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 bg-gradient-to-r from-brand-panel to-brand-panel/40 border border-brand-border rounded-xl relative overflow-hidden">
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <Code2 className="w-40 h-40 text-brand-accent-light" />
        </div>
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-accent/10 border border-brand-accent/20 text-[10px] font-mono text-brand-accent-light uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Live Database Sync Active
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Your Learning Workspace
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Select an interactive course below to pull lessons and metadata
            dynamically from your active PostgreSQL database cluster.
          </p>
        </div>
      </div>

      {/* Dynamic Course Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Your Courses
        </h2>

        {loading && (
          <div className="flex items-center gap-3 py-8 text-brand-text-muted">
            <Loader2 className="w-5 h-5 animate-spin text-brand-accent-light" />
            <span className="text-sm">Fetching active courses...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-950/20 border border-red-900/30 text-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Connection Error</p>
              <p className="text-red-400/85 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <p className="text-brand-text-muted text-sm py-4">
            No courses found in database.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => {
            // Compute percentage math on-demand
            const percent =
              course.total_lessons > 0
                ? Math.round(
                    (course.completed_lessons / course.total_lessons) * 100,
                  )
                : 0;

            return (
              <div
                key={course.id}
                className="p-6 bg-brand-panel border border-brand-border hover:border-brand-accent/20 rounded-xl flex flex-col justify-between space-y-6 transition-all duration-300 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 bg-brand-bg border border-brand-border rounded-lg text-brand-accent-light">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono bg-brand-border text-slate-300 px-2 py-0.5 rounded uppercase">
                      {course.tech_stack}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-brand-accent-light transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-brand-text-muted line-clamp-2">
                    {course.description}
                  </p>
                </div>

                {/* Progress Bar Indicator Block */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-brand-text-muted">Progress</span>
                    <span className="text-white font-semibold">
                      {course.completed_lessons} / {course.total_lessons} (
                      {percent}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-brand-bg rounded-full overflow-hidden border border-brand-border/30">
                    <div
                      className="h-full bg-gradient-to-r from-brand-accent to-brand-accent-light rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                  <span className="text-xs text-brand-text-muted font-mono">
                    Database ID: #{course.id}
                  </span>
                  <Link
                    to={`/courses/${course.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-accent-light hover:text-white transition-colors"
                  >
                    Enter Course <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
