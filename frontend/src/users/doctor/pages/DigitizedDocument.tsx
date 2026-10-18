import Header from "#components/Header";
import React, { useEffect } from "react";

type DigitizedDocumentProps = {
  loadData: () => Promise<void>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
};

function DigitizedDocument({
  loadData,
  open,
  setOpen,
  loading,
}: DigitizedDocumentProps) {
  useEffect(() => {
      async function action() {
        await loadData();
      }
      action();
    }, [loadData]);
  return (
    <main className="flex-1 min-w-0 ">
      DigitizedDocument
    </main>
  );
}

export default DigitizedDocument;
