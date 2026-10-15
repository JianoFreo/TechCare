import { useRef, type RefObject } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Check, X } from "lucide-react";

type ResultSuccessContentProps = {
  onBackToList: () => void;
  primaryActionRef?: RefObject<HTMLButtonElement | null>;
};

export function ResultSuccessContent({
  onBackToList,
  primaryActionRef,
}: ResultSuccessContentProps) {
  return (
    <div className="flex min-h-[292px] flex-col font-sans">
      <Dialog.Close
        aria-label="Close success message"
        className="absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded text-gray-300 outline-sky-400 hover:bg-gray-50 hover:text-gray-500"
      >
        <X size={15} strokeWidth={1.25} />
      </Dialog.Close>
      <div className="flex flex-1 flex-col items-center px-6 pt-[90px] pb-8 text-center">
        <span
          className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-[#2dc953] text-white"
          aria-hidden="true"
        >
          <Check size={29} strokeWidth={1.2} />
        </span>
        <Dialog.Title className="mt-3 text-sm font-semibold leading-5 text-[#172033]">
          Result Saved Successfully
        </Dialog.Title>
        <Dialog.Description className="sr-only">
          The laboratory result has been saved. Close this message to review the
          result, or return to the laboratory request list.
        </Dialog.Description>
      </div>
      <footer className="flex items-center justify-end gap-2 px-3 pb-2.5">
        <Dialog.Close className="inline-flex min-h-7 min-w-16 cursor-pointer items-center justify-center rounded border border-sky-200 bg-white px-3 py-1 text-[10px] font-medium text-[#39afe5] outline-sky-400 hover:bg-sky-50">
          Close
        </Dialog.Close>
        <button
          ref={primaryActionRef}
          type="button"
          onClick={onBackToList}
          className="inline-flex min-h-7 cursor-pointer items-center justify-center rounded border border-[#39afe5] bg-[#39afe5] px-3 py-1 text-[10px] font-medium text-white outline-sky-500 hover:border-sky-500 hover:bg-sky-500"
        >
          Back to list
        </button>
      </footer>
    </div>
  );
}

type ResultSuccessOverlayProps = {
  open: boolean;
  onClose: () => void;
  onBackToList: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

export default function ResultSuccessOverlay({
  open,
  onClose,
  onBackToList,
  returnFocusRef,
}: ResultSuccessOverlayProps) {
  const primaryActionRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Viewport className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4">
          <Dialog.Popup
            initialFocus={primaryActionRef}
            finalFocus={returnFocusRef}
            className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[348px] overflow-y-auto rounded-xl border-2 border-[#70b7d4] bg-white shadow-xl outline-none"
          >
            <ResultSuccessContent
              primaryActionRef={primaryActionRef}
              onBackToList={onBackToList}
            />
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
