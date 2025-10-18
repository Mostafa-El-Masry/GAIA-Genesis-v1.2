"use client";
import { useState } from "react";

export default function TimelinePage() {
  // === Static events ===
  const events = [
    {
      id: 1,
      title: "The Big Bang",
      date: "13.8 Billion BC",
      category: "global",
      description: "The universe begins. Matter, energy, and time come into existence.",
    },
    {
      id: 2,
      title: "Formation of Earth",
      date: "4.5 Billion BC",
      category: "global",
      description: "Earth forms from cosmic dust and begins its long evolution.",
    },
    {
      id: 3,
      title: "First Life",
      date: "3.5 Billion BC",
      category: "global",
      description: "Single-celled organisms appear in Earth’s early oceans.",
    },
    {
      id: 4,
      title: "GAIA Genesis Project Launched",
      date: "Oct 12 2025",
      category: "personal",
      description: "The vision to build a complete life-management system begins.",
    },
    {
      id: 5,
      title: "Gallery Module Completed",
      date: "Oct 18 2025",
      category: "personal",
      description: "GAIA learns to see — the first component built and deployed locally.",
    },
    {
      id: 6,
      title: "Health Tracker Operational",
      date: "Oct 25 2025",
      category: "personal",
      description: "GAIA learns to monitor — first data persistence and metrics recording.",
    },
    {
      id: 7,
      title: "Apollo Archive Activated",
      date: "Nov 2 2025",
      category: "personal",
      description: "GAIA gains memory — the archive of all notes and logs comes alive.",
    },
  ];

  // === Filters and search ===
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredEvents = events.filter((e) => {
    const matchCat = filter === "all" || e.category === filter;
    const matchText =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchText;
  });

  // === UI ===
  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-gray-50 rounded-lg shadow">
      <h2 className="text-3xl font-bold text-center mb-6">🕰️ Timeline Viewer</h2>

      {/* Search / Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-1 w-full md:w-1/2"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="all">All Events</option>
          <option value="global">Global</option>
          <option value="personal">Personal</option>
        </select>
      </div>

      {/* Timeline Spine */}
      <div className="relative border-l-2 border-gray-300 pl-6">
        {filteredEvents.map((e, i) => (
          <div key={e.id} className="mb-8 ml-2 relative">
            <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-gray-800"></div>
            <div
              className={`bg-white border rounded-lg p-4 shadow-sm ${
                i % 2 === 0 ? "ml-4" : "ml-10"
              }`}
            >
              <p className="text-sm text-gray-400">{e.date}</p>
              <h3 className="text-lg font-bold text-gray-800">{e.title}</h3>
              <p className="text-gray-700 text-sm mt-1">{e.description}</p>
              <span
                className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                  e.category === "global"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {e.category}
              </span>
            </div>
          </div>
        ))}
        {filteredEvents.length === 0 && (
          <p className="text-center text-gray-400">No events found.</p>
        )}
      </div>
    </div>
  );
}
