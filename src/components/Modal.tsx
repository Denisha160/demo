import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  headerBg?: string;
  titleClassName?: string;
}

const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "max-w-md",
  headerBg = "bg-card",
  titleClassName = "",
}: ModalProps) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-foreground/20 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={`relative bg-card border border-border shadow-card-hover rounded-sm w-full ${maxWidth} max-h-[85vh] flex flex-col animate-fade-in`}
      >
        <div
          className={`flex items-start justify-between p-3 border-b border-border rounded-t-sm ${headerBg}`}
        >
          <div>
            <h2
              className={`text-sm font-semibold ${titleClassName || "text-foreground"}`}
            >
              {title}
            </h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className="p-3 overflow-y-auto flex-1"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .overflow-y-auto::-webkit-scrollbar { display: none; }
          `,
            }}
          />
          {children}
        </div>
        {footer && (
          <div className="p-3 border-t border-border flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
