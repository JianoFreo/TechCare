import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flag,
  FlaskConical,
  Search,
  TestTubeDiagonal,
} from "lucide-react";
import type {
  AnalysisRequest,
  AnalysisStatus,
} from "../../../../interface/LaboratoryAnalysis";
import { collectionDay } from "./laboratoryAnalysis";
import { AnalysisButton, AnalysisNotice, FlaskBadge } from "./AnalysisUi";

export function formatLabDate(value: string) {
  if (!value || !Number.isFinite(new Date(value).getTime())) {
    return "Not recorded";
  }

  const date = new Date(
    /(Z|[+-]\d{2}:?\d{2})$/i.test(value)
      ? value
      : `${value.replace(" ", "T")}+08:00`,
  );

  if (!Number.isFinite(date.getTime())) {
    return "Not recorded";
  }

  return date.toLocaleString("en-US", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type CategoryBadgeProps = {
  request: AnalysisRequest;
  compact?: boolean;
};

export function CategoryBadge({
  request,
  compact = false,
}: CategoryBadgeProps) {
  const colors = {
    Normal: "bg-gray-100 text-gray-600",
    "Senior Citizen": "bg-amber-50 text-amber-600",
    Pregnant: "bg-pink-50 text-pink-400",
    PWD: "bg-purple-50 text-purple-400",
    Priority: "bg-orange-50 text-orange-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] whitespace-nowrap ${compact ? "" : "min-w-[105px]"} ${colors[request.category]}`}
    >
      {request.category !== "Normal" && (
        <i className="size-1.5 shrink-0 rounded-full bg-current" />
      )}
      {request.category}
    </span>
  );
}

const TABS: AnalysisStatus[] = [
  "Ready for Analysis",
  "In Progress",
  "Completed",
];
const COUNT_COLORS = ["bg-[#39b1e5]", "bg-[#ff8b25]", "bg-[#42c33f]"];
const PAGE_SIZE = 9;
const filterClass =
  "flex h-[33px] min-w-0 items-center gap-2 rounded-lg border border-[#cbd0d6] px-2.5 text-[#89939e] focus-within:border-sky-400 focus-within:ring-1 focus-within:ring-sky-100";

type AnalysisListProps = {
  requests: AnalysisRequest[];
  loading: boolean;
  error: string | null;
  room: string;
  onEnter: (request: AnalysisRequest) => void;
  onPrintPreview: (request: AnalysisRequest) => void;
  onRetry: () => void;
  entryDisabled?: boolean;
  selectedTab?: AnalysisStatus;
  onTabChange?: (tab: AnalysisStatus) => void;
};

export default function AnalysisList({
  requests,
  loading,
  error,
  room,
  onEnter,
  onPrintPreview,
  onRetry,
  entryDisabled = false,
  selectedTab,
  onTabChange,
}: AnalysisListProps) {
  const [localTab, setLocalTab] =
    useState<AnalysisStatus>("Ready for Analysis");
  const tab = selectedTab ?? localTab;
  function setTab(next: AnalysisStatus) {
    setLocalTab(next);
    onTabChange?.(next);
  }
  const [search, setSearch] = useState("");
  const [test, setTest] = useState("");
  const [priority, setPriority] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const roomName = /^Laboratory Room\s/i.test(room)
    ? room
    : `Laboratory Room ${Number(room.split("-")[1]) || room}`;

  const testNames = useMemo(
    () =>
      [
        ...new Set(
          requests.flatMap((request) => request.tests.map((item) => item.name)),
        ),
      ].sort(),
    [requests],
  );

  const filtered = useMemo(
    () =>
      requests.filter((request) => {
        const query = search.trim().toLowerCase();

        return (
          request.accepted &&
          request.sampleCollected &&
          (!query ||
            [
              request.requestId,
              request.patientId,
              request.patientName,
              ...request.tests.map((item) => item.name),
            ].some((value) => value.toLowerCase().includes(query))) &&
          (!test || request.tests.some((item) => item.name === test)) &&
          (!priority ||
            (priority === "Priority"
              ? request.priority
              : priority === "Normal"
                ? !request.priority
                : request.category === priority)) &&
          (!date || collectionDay(request.collectedAt) === date)
        );
      }),
    [requests, search, test, priority, date],
  );

  const rows = filtered.filter((request) => request.status === tab);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = rows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const changeFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setTest("");
    setPriority("");
    setDate("");
    setPage(1);
  };

  const hasFilters = Boolean(search || test || priority || date);

  return (
    <section
      aria-labelledby="analysis-heading"
      className="min-w-0 bg-white font-sans text-xs text-[#253c60]"
    >
      <div className="flex min-h-[88px] items-center gap-4 px-0 pt-2 pb-6 sm:px-4">
        <FlaskBadge />
        <div>
          <h1
            id="analysis-heading"
            tabIndex={-1}
            className="text-xl font-bold tracking-tight outline-none"
          >
            Ready for Analysis
          </h1>
          <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-[#839abe]">
            {roomName}
            {
              " — Requests with completed sample collection, ready for laboratory analysis and result encoding."
            }
          </p>
        </div>
        <span className="ml-auto hidden items-center gap-1.5 rounded-full bg-[#e1f5ff] px-3 py-1 text-[10px] whitespace-nowrap text-[#16a3ef] xl:flex">
          <i className="size-1.5 rounded-full bg-current" />
          {roomName}
        </span>
      </div>
      <div
        className="flex flex-wrap items-center gap-2.5 border-y border-[#d8dce1] px-0 py-3 sm:px-4"
        aria-label="Filter laboratory requests"
      >
        <label className={`${filterClass} w-full sm:w-[245px]`}>
          <Search size={17} />
          <input
            className="h-full w-full min-w-0 border-0 bg-transparent text-[#747c87] outline-none placeholder:text-[#8c929b]"
            aria-label="Search patient, request ID, or test"
            value={search}
            onChange={(event) => changeFilter(setSearch, event.target.value)}
            placeholder="Search patient, request ID, test..."
          />
        </label>
        <label className={filterClass}>
          <TestTubeDiagonal size={15} />
          <select
            className="h-full min-w-0 max-w-[190px] border-0 bg-transparent pr-2 text-[#747c87] outline-none"
            aria-label="Test type"
            value={test}
            onChange={(event) => changeFilter(setTest, event.target.value)}
          >
            <option value="">All Test Types</option>
            {testNames.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <label className={filterClass}>
          <Flag size={15} />
          <select
            className="h-full min-w-0 border-0 bg-transparent pr-2 text-[#747c87] outline-none"
            aria-label="Priority or category"
            value={priority}
            onChange={(event) => changeFilter(setPriority, event.target.value)}
          >
            <option value="">All Priorities</option>
            <option>Normal</option>
            <option>Priority</option>
            <option>Senior Citizen</option>
            <option>Pregnant</option>
            <option>PWD</option>
          </select>
        </label>
        <label className={filterClass}>
          <CalendarDays size={16} />
          <input
            className="h-full w-32 border-0 bg-transparent text-[#747c87] outline-none"
            type="date"
            aria-label="Sample collection date"
            value={date}
            onChange={(event) => changeFilter(setDate, event.target.value)}
          />
        </label>
        {hasFilters && (
          <AnalysisButton variant="link" onClick={clearFilters}>
            Clear filters
          </AnalysisButton>
        )}
      </div>
      <div
        className="flex items-stretch gap-5 overflow-x-auto border-b border-[#d7dce1] sm:gap-7 sm:pl-4"
        role="tablist"
        aria-label="Analysis status"
      >
        {TABS.map((status, index) => (
          <button
            key={status}
            id={`analysis-tab-${index}`}
            type="button"
            role="tab"
            tabIndex={tab === status ? 0 : -1}
            aria-selected={tab === status}
            aria-controls="analysis-panel"
            className={`flex cursor-pointer items-center justify-center gap-2 border-b-2 bg-transparent px-1 pt-4 pb-3.5 text-[11px] font-semibold whitespace-nowrap outline-sky-400 ${tab === status ? "border-[#24acef] text-[#24acef]" : "border-[#c8c8c8] text-[#292b30]"}`}
            onClick={() => {
              setTab(status);
              setPage(1);
            }}
            onKeyDown={(event) => {
              const next =
                event.key === "ArrowRight"
                  ? (index + 1) % TABS.length
                  : event.key === "ArrowLeft"
                    ? (index + TABS.length - 1) % TABS.length
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? TABS.length - 1
                        : -1;

              if (next < 0) {
                return;
              }

              event.preventDefault();
              setTab(TABS[next]);
              setPage(1);
              event.currentTarget.parentElement
                ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
                [next]?.focus();
            }}
          >
            {status}
            <span
              className={`min-w-5 rounded-full px-1.5 py-px text-center text-[9px] text-white ${COUNT_COLORS[index]}`}
            >
              {filtered.filter((request) => request.status === status).length}
            </span>
          </button>
        ))}
      </div>
      <div
        id="analysis-panel"
        role="tabpanel"
        aria-labelledby={`analysis-tab-${TABS.indexOf(tab)}`}
        aria-busy={loading}
      >
        {error ? (
          <div className="py-4">
            <AnalysisNotice error>{error}</AnalysisNotice>
            <AnalysisButton variant="secondary" onClick={onRetry}>
              Try again
            </AnalysisButton>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1020px] border-collapse text-left text-[11px]">
              <thead>
                <tr>
                  {[
                    "Request No.",
                    "Patient Name",
                    "Patient ID",
                    "Age/Sex",
                    "Requested Lab Test",
                    "Sample Collected",
                    "Priority / Category",
                    "Status",
                    "Action",
                  ].map((heading) => (
                    <th
                      className="border-b border-[#d0d4d9] bg-[#f6f6f6] px-3 py-3 font-normal whitespace-nowrap text-[#85888f] first:pl-4"
                      key={heading}
                      scope="col"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="h-48 text-center text-[#8099ba]">
                      Loading laboratory requests...
                    </td>
                  </tr>
                ) : !visible.length ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="flex min-h-48 flex-col items-center justify-center gap-2.5 px-5 py-9 text-center text-[#8099ba]">
                        <FlaskConical size={32} strokeWidth={1.2} />
                        <strong className="text-sm font-semibold text-[#375174]">
                          {hasFilters
                            ? "No matching requests"
                            : `No ${tab.toLowerCase()} requests`}
                        </strong>
                        <p className="max-w-sm leading-relaxed">
                          {hasFilters
                            ? "Try changing or clearing your filters."
                            : "Only accepted requests with collected samples appear here."}
                        </p>
                        {hasFilters && (
                          <AnalysisButton variant="link" onClick={clearFilters}>
                            Clear filters
                          </AnalysisButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  visible.map((request) => (
                    <tr
                      className="border-b border-[#d0d4d9] even:bg-[#f7fcff] hover:bg-[#f0f8ff]"
                      key={`${request.requestId}:${request.status}`}
                    >
                      <td className="py-3.5 pr-3 pl-4 whitespace-nowrap">
                        {request.requestId}
                      </td>
                      <td className="min-w-[135px] px-3 py-3.5 font-semibold">
                        {request.patientName || "Name not provided"}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {request.patientId || "—"}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {request.age ?? "—"}
                        {" / "}
                        {request.sex
                          ? request.sex.charAt(0).toUpperCase()
                          : "—"}
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="block min-w-[130px] max-w-[230px]">
                          {request.tests.map((item) => item.name).join(", ") ||
                            "Test not specified"}
                        </span>
                        <small className="mt-1 block text-[9px] text-[#859bbd]">
                          {request.tests[0]?.description || "Laboratory test"}
                        </small>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {formatLabDate(request.collectedAt)}
                      </td>
                      <td className="px-3 py-3.5">
                        <CategoryBadge request={request} />
                      </td>
                      <td className="px-3 py-3.5">
                        <span
                          className={`inline-block rounded px-2 py-1 text-[10px] whitespace-nowrap ${request.status === "Completed" ? "bg-green-50 text-green-600" : request.status === "In Progress" ? "bg-orange-50 text-orange-600" : "bg-[#dbf2ff] text-[#11a3ec]"}`}
                        >
                          {request.status === "Ready for Analysis"
                            ? "Ready"
                            : request.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        {request.status === "Completed" ? (
                          <AnalysisButton
                            compact
                            onClick={() => onPrintPreview(request)}
                            aria-label={`Preview and print result for ${request.patientName || request.patientId}, ${request.requestId}`}
                          >
                            <Eye size={12} />
                            Preview / Print
                          </AnalysisButton>
                        ) : (
                          <AnalysisButton
                            compact
                            onClick={() => onEnter(request)}
                            disabled={entryDisabled}
                            aria-label={`Enter result for ${request.patientName || request.patientId}, ${request.requestId}`}
                          >
                            {request.status === "In Progress"
                              ? "Continue Result"
                              : "Enter Result"}
                          </AnalysisButton>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-4 px-0 py-3 text-[10px] text-[#8198ba] sm:px-4">
        <span aria-live="polite">
          {loading
            ? "Loading results..."
            : `Showing ${rows.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}${rows.length ? `–${Math.min(currentPage * PAGE_SIZE, rows.length)}` : ""} of ${rows.length} results for ${roomName}`}
        </span>
        <nav className="flex items-center gap-1" aria-label="Request pages">
          <AnalysisButton
            compact
            variant="secondary"
            disabled={currentPage === 1 || loading}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft size={13} />
            Previous
          </AnalysisButton>
          <span
            className="rounded bg-[#188bff] px-2.5 py-1.5 text-white"
            aria-current="page"
          >
            {currentPage}
          </span>
          <AnalysisButton
            compact
            variant="secondary"
            disabled={currentPage >= pageCount || loading}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
            <ChevronRight size={13} />
          </AnalysisButton>
        </nav>
      </footer>
    </section>
  );
}
