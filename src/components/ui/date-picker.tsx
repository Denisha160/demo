import React from "react";
import { DatePicker as RSuiteDatePicker } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { FaCalendar } from "react-icons/fa";
import { formatDate } from "@/utils/date";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const DatePicker = React.forwardRef<any, DatePickerProps>(
  (
    { value, onChange, placeholder = "dd/MM/yyyy", className, disabled },
    ref,
  ) => {
    const parsedDate = React.useMemo(() => {
      if (!value) return null;

      if (value.includes("/")) {
        const [day, month, year] = value.split("/");
        if (day && month && year) {
          const fullYear =
            parseInt(year, 10) < 100
              ? 2000 + parseInt(year, 10)
              : parseInt(year, 10);
          return new Date(
            fullYear,
            parseInt(month, 10) - 1,
            parseInt(day, 10),
            12,
            0,
            0,
          );
        }
      }

      // Handle YYYY-MM-DD format
      if (value.includes("-")) {
        const [year, month, day] = value.split("-");
        if (year && month && day) {
          // Create date at noon to avoid timezone issues
          return new Date(
            parseInt(year, 10),
            parseInt(month, 10) - 1,
            parseInt(day, 10),
            12,
            0,
            0,
          );
        }
      }

      // Try parsing as regular date
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }, [value]);

    const handleDateChange = (date: Date | null) => {
      onChange(date ? formatDate(date) : "");
    };

    React.useEffect(() => {
      const style = document.createElement("style");
      style.innerHTML = `
            .rs-picker-popup {
                z-index: 9999 !important;
            }
            .rs-picker-toolbar {
                z-index: 9999 !important;
            }
            .rs-picker-date-menu {
                z-index: 9999 !important;
            }
        `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }, []);

    return (
      <div
        className={className}
        style={{ width: "100%", position: "relative" }}
      >
        <RSuiteDatePicker
          ref={ref}
          value={parsedDate}
          onChange={handleDateChange}
          format="dd/MM/yyyy"
          placeholder={placeholder}
          caretAs={FaCalendar}
          block
          placement="bottomStart"
          preventOverflow
          disabled={disabled}
          oneTap
          cleanable
          style={{
            width: "100%",
          }}
          container={
            typeof window !== "undefined" ? () => document.body : undefined
          }
        />
      </div>
    );
  },
);
