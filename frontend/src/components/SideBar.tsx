type SideBarProps = {
  open: boolean;
  page: string;
  setPage: (page: string) => void;
  navItems: { page: string; label: string; icon: React.ReactNode }[];
};

function SideBar({ open, page, setPage, navItems }: SideBarProps) {
  return (
    <aside
      className={`bg-white border-right-1 text-black h-screen overflow-hidden transition-all duration-300 ${
        open ? "w-64 p-6" : "w-0 p-0"
      }`}
    >
      {open && (
        <>
          <div className="flex items-center gap-3">
            <img
              src="/assets/reyna-g-logo.png"
              alt="Logo"
              className="w-15 h-15 object-contain"
            />
            <p className="font-bold text-lg">Reyna G</p>
          </div>

          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.page}
                className={`hover:font-bold border-1 rounded-[20px] p-5 ${
                  page === item.page
                    ? "bg-red-800 text-white border-red-800"
                    : ""
                }`}
                onClick={() => setPage(item.page)}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </div>
              </a>
            ))}
          </nav>
        </>
      )}
    </aside>
  );
}

export default SideBar;
