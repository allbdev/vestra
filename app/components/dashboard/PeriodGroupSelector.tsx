"use client";

import { Select, SelectOption } from "@/app/components/ui";
import { FREQUENCY_TYPES } from "@/app/lib/consts";

interface PeriodGroupSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const periodOptions: SelectOption[] = [
  { value: FREQUENCY_TYPES.DAILY, label: "Dia" },
  { value: FREQUENCY_TYPES.WEEKLY, label: "Semana" },
  { value: FREQUENCY_TYPES.MONTHLY, label: "Mês" },
  { value: FREQUENCY_TYPES.YEARLY, label: "Ano" },
];

export function PeriodGroupSelector({
  value,
  onChange,
}: PeriodGroupSelectorProps) {
  return (
    <Select
      label="Agrupar por"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      options={periodOptions}
    />
  );
}


