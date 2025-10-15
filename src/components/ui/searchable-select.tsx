"use client";

import * as React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  placeholder?: string;
  options: Option[];
  onValueChange?: (value: string) => void;
  className?: string;
  value?: string;
}

export function SearchableSelect({
  placeholder = "Pilih opsi...",
  options,
  onValueChange,
  className,
  value,
}: SearchableSelectProps) {
  const [search, setSearch] = React.useState("");
  const [filteredOptions, setFilteredOptions] = React.useState<Option[]>(options);

  React.useEffect(() => {
    const filtered = options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [search, options]);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {/* Input pencarian */}
        <div className="p-2">
          <Input
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        {/* Daftar hasil */}
        {filteredOptions.length > 0 ? (
          filteredOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))
        ) : (
          <div className="text-center text-sm text-muted-foreground py-2">
            Tidak ditemukan
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
