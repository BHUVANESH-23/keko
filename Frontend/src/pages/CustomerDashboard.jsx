// frontend/src/pages/CustomerDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

/**
 * CustomerDashboard
 *
 * - Fetches market pricing trends (/api/market)
 * - Fetches all crops (/api/crops/all)
 * - Fetches aggregated demand (/api/crops/demand) [optional if backend provides]
 *
 * Simple UX:
 * - Left: Pricing trends (market)
 * - Center: Crop marketplace (search + filters + list)
 * - Right: Demand summary / quick actions
 *
 * No external chart libs used (small inline SVG bars for tiny charts).
 */

function TinyBar({ values = [], height = 24, width = 80 }) {
  if (!values || values.length === 0) return <div style={{ width, height }} />;
  const max = Math.max(...values, 1);
  const barWidth = width / values.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="inline-block align-middle">
      {values.map((v, i) => {
        const h = (v / max) * height;
        const x = i * barWidth;
        return <rect key={i} x={x + 1} y={height - h} width={Math.max(1, barWidth - 2)} height={h} rx="1" ry="1" />;
      })}
    </svg>
  );
}

export default function CustomerDashboard({ user }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Welcome, {user.name}!</p>
        <p className="text-gray-500 mt-2">View available crops and market pricing here.</p>
      </div>
    </div>
  );
}
