type SideBarProps = {
    open: boolean;
    settings: string;
};

function SideBar({ open, settings }: SideBarProps) {
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
                            className={`hover:font-bold border-2 p-5 ${settings === "dashboard"
                                ? "bg-red-800 text-white border-red-800"
                                : ""
                                }`}
                        >
                            Dashboard
                        </a>
                        <a
                            className={`hover:font-bold border-2 p-5 ${settings === "user-management"
                                ? "bg-red-800 text-white border-red-800"
                                : ""
                                }`}
                        >
                            User Management
                        </a>
                        <a
                            className={`hover:font-bold border-2 p-5 ${settings === "service-pricing"
                                ? "bg-red-800 text-white border-red-800"
                                : ""
                                }`}
                        >
                            Service Pricing
                        </a>
                        <a
                            className={`hover:font-bold border-2 p-5 ${settings === "acitivity-monitoring"
                                ? "bg-red-800 text-white border-red-800"
                                : ""
                                }`}
                        >
                            Activity Monitoring
                        </a>


                    </nav>
                </>
            )}
        </aside>
    );
}

export default SideBar;