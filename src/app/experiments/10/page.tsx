"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Beaker } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TIME_POINTS = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
const TEAMS = ["Team 1", "Team 2", "Team 3", "Team 4"];

const TEAM_COLORS = {
  "Team 1": { small: "rgb(239, 68, 68)", large: "rgb(185, 28, 28)" },
  "Team 2": { small: "rgb(59, 130, 246)", large: "rgb(29, 78, 216)" },
  "Team 3": { small: "rgb(16, 185, 129)", large: "rgb(4, 120, 87)" },
  "Team 4": { small: "rgb(245, 158, 11)", large: "rgb(180, 83, 9)" },
};

const REFERENCE_DATA = {
  small: [0, 25, 42, 52, 57, 59, 60, 60, 60, 60, 60],
  large: [0, 12, 22, 31, 39, 45, 50, 54, 57, 59, 60],
};

type DataType = {
  time: number;
  small: number | "";
  large: number | "";
};

type ExperimentDataType = {
  [team: string]: DataType[];
};

export default function Experiment10Dashboard() {
  const [currentTab, setCurrentTab] = useState<"table" | "charts">("table");
  const [currentTeam, setCurrentTeam] = useState<string>(TEAMS[0]);
  const [showReference, setShowReference] = useState<boolean>(false);
  const [experimentData, setExperimentData] = useState<ExperimentDataType>({});

  // Initialize data
  useEffect(() => {
    const initialData: ExperimentDataType = {};
    TEAMS.forEach((team) => {
      initialData[team] = TIME_POINTS.map((time) => ({
        time: time,
        small: time === 0 ? 0 : "",
        large: time === 0 ? 0 : "",
      }));
    });
    setExperimentData(initialData);
  }, []);

  const handleDataChange = (
    timeIndex: number,
    type: "small" | "large",
    value: string
  ) => {
    setExperimentData((prev) => {
      const newData = { ...prev };
      const teamData = [...newData[currentTeam]];
      teamData[timeIndex] = {
        ...teamData[timeIndex],
        [type]: value === "" ? "" : Number(value),
      };
      newData[currentTeam] = teamData;
      return newData;
    });
  };

  const clearData = (type: "small" | "large") => {
    if (confirm(`Are you sure you want to clear all ${type} chips data for ALL teams?`)) {
      setExperimentData((prev) => {
        const newData = { ...prev };
        TEAMS.forEach((team) => {
          newData[team] = newData[team].map((row, i) =>
            i === 0 ? row : { ...row, [type]: "" }
          );
        });
        return newData;
      });
    }
  };

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: "rgba(255, 255, 255, 0.8)",
          font: { family: "'Inter', sans-serif", weight: 500 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time (min)",
          color: "rgba(255, 255, 255, 0.5)",
          font: { family: "'Inter', sans-serif", weight: 600 },
        },
        grid: { color: "rgba(255, 255, 255, 0.1)", drawBorder: false },
        ticks: { color: "rgba(255, 255, 255, 0.7)" },
      },
      y: {
        title: {
          display: true,
          text: "Volume of gas (cm³)",
          color: "rgba(255, 255, 255, 0.5)",
          font: { family: "'Inter', sans-serif", weight: 600 },
        },
        grid: { color: "rgba(255, 255, 255, 0.1)", drawBorder: false },
        ticks: { color: "rgba(255, 255, 255, 0.7)" },
        beginAtZero: true,
      },
    },
  };

  const getDatasets = (chipType: "small" | "large") => {
    if (!experimentData[TEAMS[0]]) return [];

    const datasets: any[] = TEAMS.map((team) => {
      const dataPoints = experimentData[team].map((row) =>
        row[chipType] === "" ? null : row[chipType]
      );

      return {
        label: team,
        data: dataPoints,
        borderColor: TEAM_COLORS[team as keyof typeof TEAM_COLORS][chipType],
        backgroundColor: TEAM_COLORS[team as keyof typeof TEAM_COLORS][chipType],
        borderWidth: 2,
        pointBackgroundColor: "#1e293b",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        spanGaps: true,
        borderDash: chipType === "large" ? [5, 5] : [],
      };
    });

    if (showReference) {
      datasets.push({
        label: "Expected Curve (Ideal)",
        data: REFERENCE_DATA[chipType],
        borderColor: "rgba(148, 163, 184, 0.7)",
        backgroundColor: "rgba(148, 163, 184, 0.05)",
        borderWidth: 3,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.4,
        fill: true,
      });
    }

    return datasets;
  };

  if (Object.keys(experimentData).length === 0) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="mb-8 pt-8">
          <Link
            href="/experiments"
            className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Experiments
          </Link>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Beaker className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Reaction Rate Experiment Analysis
            </h1>
          </div>
          <p className="text-slate-400 max-w-3xl text-lg">
            Record and compare the results of the "Reaction between marble chips and dilute hydrochloric acid" experiment.
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-900 p-1.5 rounded-xl shadow-inner border border-slate-800">
            <button
              onClick={() => setCurrentTab("table")}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                currentTab === "table"
                  ? "bg-slate-800 text-blue-400 shadow-sm border border-slate-700"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              Data Input (Table)
            </button>
            <button
              onClick={() => setCurrentTab("charts")}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                currentTab === "charts"
                  ? "bg-slate-800 text-emerald-400 shadow-sm border border-slate-700"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              Results Comparison (Charts)
            </button>
          </div>
        </div>

        <main>
          {/* TABLE VIEW */}
          {currentTab === "table" && (
            <div className="bg-slate-900/80 p-4 md:p-6 rounded-2xl shadow-xl border border-slate-800/80 animate-in fade-in duration-300">
              
              {/* Team Selector */}
              <div className="mb-6 flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
                {TEAMS.map((team) => (
                  <button
                    key={team}
                    onClick={() => setCurrentTeam(team)}
                    className={`px-5 py-2.5 rounded-t-lg font-medium transition-colors whitespace-nowrap border-b-2 ${
                      currentTeam === team
                        ? "bg-blue-500/10 text-blue-400 border-blue-500"
                        : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50"
                    }`}
                  >
                    {team}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/50 text-slate-300 border-b border-slate-800">
                      <th className="p-4 font-semibold w-1/3 text-center border-r border-slate-800">
                        Time (min)
                      </th>
                      <th className="p-4 font-semibold w-1/3 text-center border-r border-slate-800">
                        <div className="mb-2">Volume of gas (cm³)</div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Small chips
                        </span>
                      </th>
                      <th className="p-4 font-semibold w-1/3 text-center">
                        <div className="mb-2">Volume of gas (cm³)</div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          Large chips
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {experimentData[currentTeam]?.map((row, index) => {
                      const isZero = index === 0;
                      const inputClass = `w-full p-3 text-center bg-transparent border-2 border-transparent hover:border-slate-700 focus:border-blue-500 focus:bg-slate-950 focus:ring-4 focus:ring-blue-500/20 rounded-lg outline-none transition-all ${
                        isZero
                          ? "text-slate-600 font-semibold cursor-not-allowed"
                          : "text-white font-medium bg-slate-950/50"
                      }`;

                      return (
                        <tr
                          key={index}
                          className="hover:bg-slate-800/30 transition-colors border-b border-slate-800/50 last:border-0"
                        >
                          <td className="p-3 border-r border-slate-800/50 text-center font-medium text-slate-400 bg-slate-950/30">
                            {row.time.toFixed(1)}
                          </td>
                          <td className="p-2 border-r border-slate-800/50">
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={row.small}
                              onChange={(e) =>
                                handleDataChange(index, "small", e.target.value)
                              }
                              disabled={isZero}
                              className={inputClass}
                              placeholder={isZero ? "0" : ""}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={row.large}
                              onChange={(e) =>
                                handleDataChange(index, "large", e.target.value)
                              }
                              disabled={isZero}
                              className={inputClass}
                              placeholder={isZero ? "0" : ""}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-sm text-slate-500 italic bg-slate-950/50 p-3 rounded-lg border border-slate-800/50 inline-block">
                Results at 0 minutes are fixed at zero as the reaction has not yet started.
              </div>
            </div>
          )}

          {/* CHARTS VIEW */}
          {currentTab === "charts" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-end mb-6">
                <label className="inline-flex items-center cursor-pointer bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl shadow-lg">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showReference}
                    onChange={(e) => setShowReference(e.target.checked)}
                  />
                  <div className="relative w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-200 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className="ms-3 text-sm font-semibold text-slate-300">
                    Show Expected Reference Curves
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Small Chips Chart */}
                <div className="bg-slate-900/80 p-4 md:p-6 rounded-2xl shadow-xl border border-slate-800/80 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-200 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-3 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                      Small Chips
                    </h3>
                    <button
                      onClick={() => clearData("small")}
                      className="text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors border border-red-500/20"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex-grow min-h-[400px] relative w-full">
                    <Line
                      options={commonChartOptions}
                      data={{
                        labels: TIME_POINTS,
                        datasets: getDatasets("small"),
                      }}
                    />
                  </div>
                </div>

                {/* Large Chips Chart */}
                <div className="bg-slate-900/80 p-4 md:p-6 rounded-2xl shadow-xl border border-slate-800/80 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-200 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-red-500 mr-3 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                      Large Chips
                    </h3>
                    <button
                      onClick={() => clearData("large")}
                      className="text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors border border-red-500/20"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex-grow min-h-[400px] relative w-full">
                    <Line
                      options={commonChartOptions}
                      data={{
                        labels: TIME_POINTS,
                        datasets: getDatasets("large"),
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Analysis Questions */}
              <div className="mt-8 bg-blue-950/30 border border-blue-900/50 rounded-2xl p-6 md:p-8 shadow-xl">
                <h4 className="font-bold text-blue-400 mb-6 text-xl flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    ></path>
                  </svg>
                  Analysis Questions
                </h4>
                <ol className="list-decimal list-outside ml-6 space-y-4 text-slate-300 text-sm md:text-base leading-relaxed marker:text-blue-500 marker:font-bold">
                  <li className="pl-2">
                    Use your results to draw a graph of volume of gas against time for small chips and a similar graph for large chips on the same axes. Put time on the horizontal axis and volume of gas on the vertical axis. Join the points with a smooth line. <i className="text-slate-500">(Handled by the dashboard above)</i>
                  </li>
                  <li className="pl-2">
                    Explain how you can tell from the graphs when the reactions were finished.
                  </li>
                  <li className="pl-2">
                    Describe how the size of the marble chips is related to the surface area for a fixed mass of chips.
                  </li>
                  <li className="pl-2">
                    Compare the results of the different teams. How similar are they? What factors might have contributed to any differences?
                  </li>
                </ol>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
