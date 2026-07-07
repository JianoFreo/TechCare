type SideBarProps = {
    open: boolean;
    page: string;
    setPage: (page: string) => void;
};

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
                        <button
                            type="button"
                            className={`cursor-pointer border-2 p-5 text-left hover:font-bold ${
                                page === "dashboard"
                                    ? "border-red-800 bg-red-800 text-white"
                                    : ""
                            }`}
                            onClick={() => setPage("dashboard")}
                        >
                            Dashboard
                        </button>

                        <button
                            type="button"
                            className={`cursor-pointer border-2 p-5 text-left hover:font-bold ${
                                page === "patient-registration"
                                    ? "border-red-800 bg-red-800 text-white"
                                    : ""
                            }`}
                            onClick={() => setPage("patient-registration")}
                        >
                            Patient Registration
                        </button>

                        <button
                            type="button"
                            className={`cursor-pointer border-2 p-5 text-left hover:font-bold ${
                                page === "patient-records"
                                    ? "border-red-800 bg-red-800 text-white"
                                    : ""
                            }`}
                            onClick={() => setPage("patient-records")}
                        >
                            Patient Records
                        </button>

                        <button
                            type="button"
                            className={`cursor-pointer border-2 p-5 text-left hover:font-bold ${
                                page === "queue-management"
                                    ? "border-red-800 bg-red-800 text-white"
                                    : ""
                            }`}
                            onClick={() => setPage("queue-management")}
                        >
                            Queue Management
                        </button>

                        <button
                            type="button"
                            className={`cursor-pointer border-2 p-5 text-left hover:font-bold ${
                                page === "billing"
                                    ? "border-red-800 bg-red-800 text-white"
                                    : ""
                            }`}
                            onClick={() => setPage("billing")}
                        >
                            Billing
                        </button>
                    </nav>
                </>
            )}
        </aside>
    );
}

export default SideBar;