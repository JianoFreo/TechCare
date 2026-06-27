type HeaderProps = {
    page: string;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadUsers: () => void;
    loadServices: () => void;
};

function Header({ open, setOpen, loadUsers, loadServices, page }: HeaderProps) {
    return (
        <div className="flex items-center gap-4 mb-6 ">
            <button
                onClick={() => setOpen(!open)}
                className="text-2xl"
            >
                ☰
            </button>

            <h1 className="text-3xl font-bold">
                {page}
            </h1>

            <div
                onClick={() => {
                    loadUsers?.();
                    loadServices?.();
                }}
                className="ml-auto bg-red-800 text-white py-2 px-4 cursor-pointer"
            >
                Load Data
            </div>
        </div>
    );
}

export default Header;