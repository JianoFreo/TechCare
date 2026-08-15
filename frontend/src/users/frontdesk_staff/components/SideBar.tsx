type SideBarProps = {
    open: boolean;
    page: string;
    setPage: (page: string) => void;
};

const navItems = [
    {
        page: "dashboard",
        label: "Dashboard",
    },
    {
        page: "patient-registration",
        label: "Patient Registration",
    },
    {
        page: "patient-records",
        label: "Patient Records",
    },
    {
        page: "queue-management",
        label: "Queue Management",
    },
    {
        page: "billing",
        label: "Billing",
    },
];

function SideBar({ open, page, setPage }: SideBarProps) {
    return (
        <aside
            className={`bg-gray-200 text-black h-screen overflow-hidden transition-all duration-300 ${
                open ? "w-64 p-6" : "w-0 p-0"
            }`}
        >
            {open && (
                <>
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-lg font-bold">TechCare System</p>
                    </div>

                    <nav className="flex flex-col gap-3">
                        {navItems.map((item) => (
                            <button
                                key={item.page}
                                type="button"
                                className={`cursor-pointer border-2 p-5 text-left hover:font-bold ${
                                    page === item.page
                                        ? "border-red-800 bg-red-800 text-white"
                                        : ""
                                }`}
                                onClick={() => setPage(item.page)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </>
            )}
        </aside>
    );
}

export default SideBar;