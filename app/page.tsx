"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  Plus,
  RotateCcw,
  Calendar,
  TrendingUp,
  Grid,
  CalendarDays,
} from "lucide-react";
import {
  format,
  isToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  isSameDay,
} from "date-fns";
import {
  fetchUsageLogs,
  logUsage,
  fetchAppState,
  updateAppState,
  clearAllData,
  type UsageLog,
} from "@/lib/api";

export default function Home() {
  const [usageCount, setUsageCount] = useState(0);
  const [usageLog, setUsageLog] = useState<UsageLog[]>([]);
  const [lastUsed, setLastUsed] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"main" | "calendar">("main");
  const [loading, setLoading] = useState(true);

  // Load data from database on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [logs, state] = await Promise.all([
          fetchUsageLogs(),
          fetchAppState(),
        ]);

        setUsageLog(logs);
        setUsageCount(parseInt(state.usageCount || "0"));
        setLastUsed(state.lastUsed || null);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogUsage = async () => {
    const today = format(new Date(), "yyyy-MM-dd");

    try {
      const updatedLog = await logUsage(today, 1);

      // Update local state
      setUsageLog((prev) => {
        const existingIndex = prev.findIndex((log) => log.date === today);
        if (existingIndex >= 0) {
          return prev.map((log, index) =>
            index === existingIndex ? updatedLog : log
          );
        } else {
          return [...prev, updatedLog];
        }
      });

      setUsageCount((prev) => prev + 1);
      setLastUsed(today);

      // Update app state in database
      await Promise.all([
        updateAppState("usageCount", usageCount + 1),
        updateAppState("lastUsed", today),
      ]);
    } catch (error) {
      console.error("Error logging usage:", error);
    }
  };

  const resetCounter = async () => {
    try {
      await updateAppState("usageCount", 0);
      setUsageCount(0);
      // Keep historical data but reset the counter for new lenses
      // Don't clear usageLog or lastUsed - preserve history
    } catch (error) {
      console.error("Error resetting counter:", error);
    }
  };

  const clearHistory = async () => {
    try {
      await clearAllData();
      setUsageLog([]);
      setLastUsed(null);
      setUsageCount(0);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  const getTodayUsage = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayLog = usageLog.find((log) => log.date === today);
    return todayLog ? todayLog.count : 0;
  };

  const getWeeklyUsage = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return usageLog
      .filter((log) => new Date(log.date) >= oneWeekAgo)
      .reduce((sum, log) => sum + log.count, 0);
  };

  const getTotalHistoricalUsage = () => {
    return usageLog.reduce((sum, log) => sum + log.count, 0);
  };

  const getUsageForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const log = usageLog.find((log) => log.date === dateStr);
    return log ? log.count : 0;
  };

  const getCalendarDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const CalendarView = () => {
    const days = getCalendarDays();
    const startOfWeek = new Date(days[0]);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h2 className="text-xl font-semibold text-gray-800">
            {format(currentMonth, "MMMM yyyy")}
          </h2>

          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const usage = getUsageForDate(day);
            const isCurrentDay = isToday(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={index}
                className={`
                  aspect-square p-1 text-center relative
                  ${isCurrentMonth ? "text-gray-800" : "text-gray-300"}
                  ${isCurrentDay ? "bg-blue-100 rounded-lg" : ""}
                `}
              >
                <div className="text-sm font-medium mb-1">
                  {format(day, "d")}
                </div>
                {usage > 0 && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {usage}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 rounded"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                1
              </div>
              <span>Usage count</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MainView = () => (
    <>
      {/* Main Counter Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {usageCount}
          </div>
          <p className="text-gray-600 mb-4">Current lens uses</p>

          <div className="flex gap-3 mb-4">
            <button
              onClick={handleLogUsage}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Log Today
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetCounter}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Counter
            </button>

            <button
              onClick={clearHistory}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear All
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-500 text-center">
            <p>
              • <strong>Reset Counter:</strong> For new lenses (keeps history)
            </p>
            <p>
              • <strong>Clear All:</strong> Removes all data
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">Today</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {getTodayUsage()}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-600">This Week</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {getWeeklyUsage()}
          </div>
        </div>
      </div>

      {/* Historical Usage */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-5 h-5 text-indigo-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="text-sm text-gray-600">All-Time Total</span>
        </div>
        <div className="text-2xl font-bold text-gray-800">
          {getTotalHistoricalUsage()}
        </div>
      </div>

      {/* Last Used Info */}
      {lastUsed && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Last Used</h3>
          <p className="text-gray-600">
            {isToday(new Date(lastUsed))
              ? "Today"
              : format(new Date(lastUsed), "MMM dd, yyyy")}
          </p>
        </div>
      )}

      {/* Recent Usage Log */}
      {usageLog.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Recent Usage</h3>
          <div className="space-y-2">
            {usageLog
              .slice(-5)
              .reverse()
              .map((log) => (
                <div
                  key={log.date}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-gray-600">
                    {isToday(new Date(log.date))
                      ? "Today"
                      : format(new Date(log.date), "MMM dd")}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {log.count} uses
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Contact Lens Tracker
          </h1>
          <p className="text-gray-600">Track your daily lens usage</p>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-xl shadow-md p-2 mb-6">
          <div className="flex">
            <button
              onClick={() => setViewMode("main")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                viewMode === "main"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Grid className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                viewMode === "calendar"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Calendar
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your data...</p>
          </div>
        ) : viewMode === "main" ? (
          <MainView />
        ) : (
          <CalendarView />
        )}
      </div>
    </div>
  );
}
