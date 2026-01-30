"use client";

import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useState, useEffect } from "react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  error?: boolean;
  helperText?: string;
  minDate?: Dayjs | null;
  maxDate?: Dayjs | null;
}

const parseDate = (dateStr: string): Dayjs | null => {
  if (!dateStr || dateStr.trim() === "") return null;
  const parsed = dayjs(dateStr);
  return parsed.isValid() ? parsed : null;
};

export function DatePicker({
  value,
  onChange,
  label,
  disabled = false,
  readOnly = false,
  required = false,
  name,
  error = false,
  helperText,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [internalValue, setInternalValue] = useState<Dayjs | null>(
    parseDate(value)
  );

  // Update internal value when props change
  useEffect(() => {
    setInternalValue(parseDate(value));
  }, [value]);

  const handleChange = (newValue: Dayjs | null) => {
    setInternalValue(newValue);
    if (newValue) {
      onChange(newValue.format("YYYY-MM-DD"));
    } else {
      onChange("");
    }
  };

  return (
    <MuiDatePicker
      value={internalValue}
      onChange={handleChange}
      label={label}
      disabled={disabled}
      readOnly={readOnly}
      format="DD/MM/YYYY"
      minDate={minDate || undefined}
      maxDate={maxDate || undefined}
      slotProps={{
        textField: {
          required,
          name,
          error,
          helperText,
          sx: {
            width: "100%",
          },
        },
      }}
    />
  );
}
