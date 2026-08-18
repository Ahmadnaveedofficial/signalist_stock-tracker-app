"use client";

import { useState } from "react";
import {
  Control,
  Controller,
  FieldError,
  FieldValues,
  Path,
} from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import countryList from "react-select-country-list";
import ReactCountryFlag from "react-country-flag";

type CountrySelectProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  control: Control<T>;
  error?: FieldError;
  required?: boolean;
};

type CountrySelectInputProps = {
  value: string;
  onChange: (value: string) => void;
};

const CountrySelect = ({ value, onChange }: CountrySelectInputProps) => {
  const [open, setOpen] = useState(false);

  const countries = countryList().getData();

  const selectedCountry = countries.find((country) => country.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        role="combobox"
        aria-expanded={open}
        className={cn(
          "country-select-trigger",
          "flex w-full items-center justify-between",
          "rounded-md border border-gray-600",
          "bg-gray-800 px-3 py-2",
          "text-sm text-gray-100",
          "hover:bg-gray-700",
          "focus:outline-none focus:ring-2 focus:ring-yellow-500",
          "cursor-pointer",
        )}
      >
        {selectedCountry ? (
          <span className="flex items-center gap-2">
            <ReactCountryFlag
              countryCode={selectedCountry.value}
              svg
              style={{ width: "1.2em", height: "1.2em" }}
            />
            <span>{selectedCountry.label}</span>
          </span>
        ) : (
          <span className="text-gray-400">Select your country...</span>
        )}

        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--anchor-width)] border-gray-600 bg-black p-0"
      >
        <Command className="bg-black">
          <CommandInput
            placeholder="Search countries..."
            className="country-select-input"
          />

          <CommandEmpty className="country-select-empty">
            No country found.
          </CommandEmpty>

          <CommandList className="max-h-60 bg-black scrollbar-hide-default">
            <CommandGroup className="bg-black">
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={`${country.label} ${country.value}`}
                  onSelect={() => {
                    onChange(country.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "country-select-item",
                    "bg-black",
                    "text-gray-100",
                    "aria-selected:!bg-black",
                    "aria-selected:!text-gray-100",
                    "data-[selected=true]:!bg-black",
                    "data-[selected=true]:!text-gray-100",
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-yellow-500",
                      value === country.value ? "opacity-100" : "opacity-0",
                    )}
                  />

                  <span className="flex items-center gap-2">
                    <ReactCountryFlag
                      countryCode={country.value}
                      svg
                      style={{ width: "1.2em", height: "1.2em" }}
                    />
                    <span>{country.label}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const CountrySelectField = <T extends FieldValues>({
  name,
  label,
  control,
  error,
  required = false,
}: CountrySelectProps<T>) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="form-label">
        {label}
      </Label>

      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `Please select ${label.toLowerCase()}` : false,
        }}
        render={({ field }) => (
          <CountrySelect value={field.value ?? ""} onChange={field.onChange} />
        )}
      />

      {error && <p className="text-sm text-red-500">{error.message}</p>}

      <p className="text-xs text-gray-500">
        Helps us show market data and news relevant to you.
      </p>
    </div>
  );
};
