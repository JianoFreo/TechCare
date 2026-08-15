type HeaderProps = {
  page: string;
  loading: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  loadData: () => void;
};

function Header({ page, loading, open, setOpen, loadData }: HeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6 ">
      <button onClick={() => setOpen(!open)} className="text-2xl">
        ☰
      </button>

      <h1 className="text-3xl font-bold">{page}</h1>

      <div
        onClick={() => {
          loadData();
        }}
        className="ml-auto bg-red-800 text-white py-2 px-4 cursor-pointer w-28 text-center transition-all duration:300 hover:bg-red-900 hover:rounded-lg hover:scale-110"
      >
        {loading ? "Loading..." : "Load Data"}
      </div>
    </div>
  );
}

export default Header;
