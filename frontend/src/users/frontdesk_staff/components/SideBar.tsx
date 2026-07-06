
type SideBarProps = {
    open: boolean;
    page: string;
    setPage: React.Dispatch<React.SetStateAction<string>>;
};

function SideBar({ open, page, setPage }: SideBarProps) {
    return (
        <aside
            className={`bg-gray-200 text-black h-screen overflow-hidden transition-all duration-300 ${open ? "w-64 p-6" : "w-0 p-0"
                }`}
        >
            {open && (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <p className="font-bold text-lg">TechCare System</p>
                    </div>

                    <nav className="flex flex-col gap-3">
                        <a
                            className={`hover:font-bold border-2 p-5 ${page === "dashboard"
                                ? "bg-red-800 text-white border-red-800"
                                : ""
                                }`}
                            onClick={() => setPage("dashboard")}    
                        >
                            Dashboard
                        </a>
                        <a
                            className={`hover:font-bold border-2 p-5 ${page === "patient-registration"
                                ? "bg-red-800 text-white border-red-800"
                                : ""
                                }`}
                            onClick={() => setPage("patient-registration")}
                        >
                            Patient Registration
                        </a>
                        <a
                            className={`hover:font-bold border-2 p-5 ${page === "patient-records"
                                ? "bg-red-800 text-white border-red-800"
                                : ""
                                }`}
                            onClick={() => setPage("patient-records")}
                        >
                            Patient Records
                        </a>
                        <a
                            className={`hover:font-bold border-2 p-5 ${page === "queue-management"
                                ? "bg-red-800 text-white border-red-800"
                                : ""
                                }`}
                            onClick={() => setPage("queue-management")}
                        >
                            Queue Management
                        </a>
                        <a
                            className={`hover:font-bold border-2 p-5 ${page === "billing"
                                ? "bg-red-800 text-white border-red-800"
                                : ""
                                }`}
                            onClick={() => setPage("billing")}
                        >
                            Billing
                        </a>


                    </nav>
                </>
            )}
        </aside>
    );
}

export default SideBar;