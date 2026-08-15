type SideBarProps = {
    open: boolean;
    page: string;
    setPage: (page: string) => void;
    navItems: { page: string; label: string }[];
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
                    <div className="flex justify-between items-center mb-6">
                        <p className="font-bold text-lg">TechCare System</p>
                    </div>

                    <nav className="flex flex-col gap-3">
                        {navItems.map((item) => (
                            <a
                                key={item.page}
                                className={`hover:font-bold border-2 p-5 ${
                                    page === item.page
                                        ? "bg-red-800 text-white border-red-800"
                                        : ""
                                }`}
                                onClick={() => setPage(item.page)}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </>
            )}
        </aside>
    );
}

export default SideBar;