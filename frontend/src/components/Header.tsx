import { Bell } from "lucide-react";
import UserHeader from "./Header/UserHeader";

type HeaderProps = {
  page: string;
  loading: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  loadData: () => void;
};

function Header({
  page,
  loading,
  open,
  setOpen,
  loadData,
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between h-24 gap-4 mb-6 px-6 border-b border-gray-300">
      <div className="flex gap-5">
        <button
          onClick={() => setOpen(!open)}
          className="text-2xl cursor-pointer hover:scale-105 active:scale-95"
        >
          ☰
        </button>

        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">{page}</h1>
          <h2 className="text-gray-500">Laboratory Staff</h2>
        </div>
      </div>

      <div className="flex gap-5 items-center">
        <div
          onClick={loadData}
          className="bg-red-800 text-white py-2 px-4 cursor-pointer w-28 h-10 text-center transition-all duration-300 hover:bg-red-900 hover:rounded-lg hover:scale-110"
        >
          {loading ? "Loading..." : "Load Data"}
        </div>

        <button className="flex items-center border p-2 rounded-md text-gray-400 border-gray-300 cursor-pointer">
          <Bell size={20} strokeWidth={1} />
        </button>

        <UserHeader />
      </div>
    </div>
  );
}

export default Header;