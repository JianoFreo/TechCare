type SideBarProps = {
  open: boolean;
  page: string;
  setPage: (page: string) => void;
};

function SideBar({ open, page, setPage }: SideBarProps) {
  const baseClasses =
    " border-2 cursor-pointer p-4 text-md flex items-center gap-2";
  const activeClasses = " border-black rounded-3xl text-black";
  const inactiveClasses = "border-transparent text-gray-500 hover:text-black";

  return (
    <aside
      className={`bg-white border-r border-gray-300 text-black h-auto overflow-hidden min-h-screen transition-all duration-300 ${
        open ? "w-64" : "w-0"
      }`}
    >
      {open && (
        <>
          <div className="flex items-center justify-left border-b border-gray-300 h-24 p-5 gap-5 mb-3">
            <img
              src="../../../../public/assets/images.jpg"
              alt="logo"
              className="w-12 h-auto"
            />
            <p className="text-3xl font-bold">Reyna G</p>
          </div>

          <nav className="flex flex-col gap-3 p-3">
            <button
              type="button"
              className={`${baseClasses} ${
                page === "dashboard" ? activeClasses : inactiveClasses
              }`}
              onClick={() => setPage("dashboard")}
            >
              <img
                src="../../../../public/assets/images.jpg"
                alt="logo"
                className="w-8 h-auto"
              />
              Dashboard
            </button>

            <button
              type="button"
              className={`${baseClasses} ${
                page === "laboratory-requests" ? activeClasses : inactiveClasses
              }`}
              onClick={() => setPage("laboratory-requests")}
            >
              <img
                src="../../../../public/assets/images.jpg"
                alt="logo"
                className="w-8 h-auto"
              />
              Laboratory Requests
            </button>

            <button
              type="button"
              className={`${baseClasses}  ${
                page === "laboratory-results" ? activeClasses : inactiveClasses
              }`}
              onClick={() => setPage("laboratory-results")}
            >
              <img
                src="../../../../public/assets/images.jpg"
                alt="logo"
                className="w-8 h-auto"
              />
              Laboratory Results
            </button>
            <button
              type="button"
              className={`${baseClasses} mt-auto ${
                page === "settings" ? activeClasses : inactiveClasses
              }`}
              onClick={() => setPage("settings")}
            >
              <img
                src="../../../../public/assets/images.jpg"
                alt="logo"
                className="w-8 h-auto"
              />
              Settings
            </button>
          </nav>
        </>
      )}
    </aside>
  );
}

export default SideBar;
