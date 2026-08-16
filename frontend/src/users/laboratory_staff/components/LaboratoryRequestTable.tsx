import { ChevronDown } from "lucide-react";
import { useState } from "react";

function LaboratoryRequestTable() {
  const requestCount = 10;
  const [activeMainFilter, setActiveMainFilter] =
    useState<string>("All Requests");
  return (
    <div className="w-full min-h-20 border rounded-3xl border-gray-300 flex flex-col items-center justify-around">
      {/* MAIN FILTERS */}
      <div className="flex w-full justify-around h-10 items-end border-b border-gray-300">
        <h1
          className={`px-5 py-1 text-sm ${
            activeMainFilter === "All Requests"
              ? "text-blue-600  border-blue-600 border-b"
              : null
          }`}
          onClick={() => setActiveMainFilter("All Requests")}
        >
          All Requests ({requestCount})
        </h1>
        <h1
          className={`px-5 py-1 text-sm ${
            activeMainFilter === "Waiting"
              ? "text-blue-600  border-blue-600 border-b"
              : null
          }`}
          onClick={() => setActiveMainFilter("Waiting")}
        >
          Waiting ({requestCount})
        </h1>
        <h1
          className={`px-5 py-1 text-sm ${
            activeMainFilter === "Priority"
              ? "text-blue-600  border-blue-600 border-b"
              : null
          }`}
          onClick={() => setActiveMainFilter("Priority")}
        >
          Priority ({requestCount})
        </h1>
        <h1
          className={`px-5 py-1 text-sm ${
            activeMainFilter === "In Progress"
              ? "text-blue-600  border-blue-600 border-b"
              : null
          }`}
          onClick={() => setActiveMainFilter("In Progress")}
        >
          In Progress ({requestCount})
        </h1>
        <h1
          className={`px-5 py-1 text-sm ${
            activeMainFilter === "Completed"
              ? "text-blue-600  border-blue-600 border-b"
              : null
          }`}
          onClick={() => setActiveMainFilter("Completed")}
        >
          Completed ({requestCount})
        </h1>
        <h1
          className={`px-5 py-1 text-sm ${
            activeMainFilter === "Skipped"
              ? "text-blue-600  border-blue-600 border-b"
              : null
          }`}
          onClick={() => setActiveMainFilter("Skipped")}
        >
          Skipped ({requestCount})
        </h1>
      </div>
      {/* SEARCH BAR AND ADDITIONAL FILTERS */}
      <div className="flex w-full items-center justify-start gap-3">
        <input
          type="text"
          placeholder="Search..."
          className="w-full max-w-56 border rounded-lg px-3 py-1"
        />
        <div className="flex border rounded-lg px-3 py-1 items-center justify-around">
          <h2>Priority</h2>
          <ChevronDown size={20} />
        </div>
        <div className="flex border min-w-36 rounded-lg px-3 py-1 items-center justify-around">
          <h2>Services: All</h2>
          <ChevronDown size={20} />
        </div>
        <div className="flex border min-w-44 rounded-lg px-3 py-1 items-center justify-around">
          <h2>Sort By: Newest</h2>
          <ChevronDown size={20} />
        </div>
      </div>
      {/* TABLE HEADERS */}
      <div></div>
      {/* TABLE DATA */}
      <div></div>
    </div>
  );
}

export default LaboratoryRequestTable;
