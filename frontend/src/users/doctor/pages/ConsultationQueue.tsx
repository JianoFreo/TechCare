import React, { useEffect } from "react";

type ConsultationQueueProps = {
  loadData: () => Promise<void>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
};

function ConsultationQueue({
  loadData,
  open,
  setOpen,
  loading,
}: ConsultationQueueProps) {
  useEffect(() => {
      async function action() {
        await loadData();
      }
      action();
    }, [loadData]);
  return (
    <main className="flex-1 min-w-0 ">
     
      ConsultationQueue
    </main>
  );
}

export default ConsultationQueue;
