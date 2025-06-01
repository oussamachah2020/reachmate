"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { Control, useController } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DateTimePickerProps {
  control: Control<any>;
  name: string;
  disabled?: boolean;
}

export function DateTimePicker({
  control,
  name,
  disabled,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  // Convert the form value (local ISO string) to Date object for display
  const selectedDate = value ? new Date(value + ":00") : undefined;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && !disabled) {
      // If we have an existing time, preserve it
      if (value) {
        const existingDate = new Date(value);
        selectedDate.setHours(existingDate.getHours());
        selectedDate.setMinutes(existingDate.getMinutes());
      } else {
        // Default to current time if no time was set
        const now = new Date();
        selectedDate.setHours(now.getHours());
        selectedDate.setMinutes(now.getMinutes());
      }

      // Convert to ISO string format for the form (YYYY-MM-DDTHH:mm)
      const isoString = selectedDate.toISOString().slice(0, 16);
      onChange(isoString);
    }
  };

  const handleTimeChange = (type: "hour" | "minute", timeValue: string) => {
    if (disabled) return;

    let dateToModify = selectedDate;

    // If no date is selected, default to today
    if (!dateToModify) {
      dateToModify = new Date();
    }

    const newDate = new Date(dateToModify);

    if (type === "hour") {
      newDate.setHours(parseInt(timeValue));
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(timeValue));
    }

    // Convert to ISO string format for the form
    const isoString = newDate
      .toLocaleString("sv-SE")
      .replace(" ", "T")
      .slice(0, 16);

    onChange(isoString);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-red-500"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "MM/dd/yyyy HH:mm")
          ) : (
            <span>Select date & time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            disabled={disabled}
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                <div className="text-xs font-medium text-muted-foreground p-2 sm:text-center">
                  Hours
                </div>
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    size="sm"
                    variant={
                      selectedDate && selectedDate.getHours() === hour
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("hour", hour.toString())}
                    disabled={disabled}
                  >
                    {hour.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                <div className="text-xs font-medium text-muted-foreground p-2 sm:text-center">
                  Minutes
                </div>
                {minutes.map((minute) => (
                  <Button
                    key={minute}
                    size="sm"
                    variant={
                      selectedDate && selectedDate.getMinutes() === minute
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() =>
                      handleTimeChange("minute", minute.toString())
                    }
                    disabled={disabled}
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}