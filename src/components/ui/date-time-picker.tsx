"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Control, useController } from "react-hook-form";

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
    field: { onChange, value },
  } = useController({
    name,
    control,
  });

  const date = value ? parseISO(value) : undefined;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && !disabled) {
      const newDate = date ? new Date(date) : new Date();
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      onChange(newDate.toISOString().slice(0, 16));
    }
  };

  const handleTimeChange = (type: "hour" | "minute", val: string) => {
    if (!disabled && date) {
      const newDate = new Date(date);
      if (type === "hour") {
        newDate.setHours(parseInt(val));
      } else if (type === "minute") {
        newDate.setMinutes(parseInt(val));
      }
      onChange(newDate.toISOString().slice(0, 16));
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "MM/dd/yyyy hh:mm a")
          ) : (
            <span>MM/DD/YYYY hh:mm</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            disabled={disabled}
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours.reverse().map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={
                      date && date.getHours() === hour ? "default" : "ghost"
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
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      date && date.getMinutes() === minute ? "default" : "ghost"
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
