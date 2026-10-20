import React from 'react'
type QueueingMonitorModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  loadData: () => Promise<void>;
  loading: boolean;
};

function QueueingMonitor({ open, setOpen, loadData, loading }: QueueingMonitorModalProps ) {
  return (
    <div>QueueingMonitor</div>
  )
}

export default QueueingMonitor