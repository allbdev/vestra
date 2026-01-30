"use client";

import { DatePicker } from "@/app/components/DatePicker";
import dayjs from "dayjs";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled = false,
  readOnly = false,
}: DateRangePickerProps) {
  // Calculate limits based on selection
  // 1. If startDate is selected, endDate cannot be before startDate.
  // 2. If endDate is selected, startDate cannot be after endDate.
  // 3. Range limited to 1 year.

  const startObj = startDate ? dayjs(startDate) : null;
  const endObj = endDate ? dayjs(endDate) : null;

  // Start Date Limits
  // Max date is the end date (if selected).
  // Min date: if end date selected, min date is end date - 1 year.
  const startMaxDate = endObj;
  const startMinDate = endObj ? endObj.subtract(364, 'day') : null;

  // End Date Limits
  // Min date is the start date (if selected).
  // Max date: if start date selected, max date is start date + 1 year.
  const endMinDate = startObj;
  const endMaxDate = startObj ? startObj.add(364, 'day') : null;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <DatePicker
          value={startDate}
          onChange={onStartDateChange}
          label="Data Inicial"
          disabled={disabled}
          readOnly={readOnly}
          required
          maxDate={startMaxDate}
          minDate={startMinDate}
        />
      </div>
      <div className="flex-1">
        <DatePicker
          value={endDate}
          onChange={onEndDateChange}
          label="Data Final"
          disabled={disabled}
          readOnly={readOnly}
          required
          minDate={endMinDate}
          maxDate={endMaxDate}
        />
      </div>
    </div>
  );
}
