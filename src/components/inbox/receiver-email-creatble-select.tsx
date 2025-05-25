import { useEffect, useMemo, useState, useCallback } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { useAuthStore } from "@/zustand/auth.store";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

type EmailOption = {
  value: string;
  label: string;
};

interface ReceiverEmailSelectProps {
  value?: EmailOption | null;
  onChange?: (value: EmailOption | null) => void;
  placeholder?: string;
}

export function ReceiverEmailSelect({
  value,
  onChange,
  placeholder = "To",
}: ReceiverEmailSelectProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const { user } = useAuthStore();

  // Use controlled value or internal state
  const selected = value;
  const setSelected = onChange || (() => {});

  const handleClear = useCallback(() => {
    setSelected(null);
    setInputValue("");
  }, [setSelected]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && selected && inputValue === "") {
        setSelected(null);
      }

      // Handle Enter key to set email
      if (e.key === "Enter" && inputValue.trim()) {
        e.preventDefault();
        handleSetEmail(inputValue.trim());
      }
    },
    [selected, inputValue]
  );

  const handleSetEmail = (emailValue: string) => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Set the email (no database operations)
    const newEmail = { value: emailValue, label: emailValue };
    setSelected(newEmail);
    setInputValue("");
    setOpen(false);
  };

  const formattedEmails = useMemo(() => {
    if (emails.length > 0) {
      return emails.map((email) => ({
        label: email,
        value: email,
      }));
    }
    return [];
  }, [emails]);

  const filteredEmails = useMemo(() => {
    // Filter by input value
    if (inputValue) {
      return formattedEmails.filter((email) =>
        email.label.toLowerCase().includes(inputValue.toLowerCase())
      );
    }

    return formattedEmails;
  }, [formattedEmails, inputValue]);

  // Show create option if input doesn't match existing emails and is not currently selected
  const showCreateOption = useMemo(() => {
    if (!inputValue.trim()) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(inputValue.trim());
    const isExistingEmail = formattedEmails.some(
      (email) => email.value.toLowerCase() === inputValue.trim().toLowerCase()
    );
    const isDifferentFromSelected =
      !selected ||
      selected.value.toLowerCase() !== inputValue.trim().toLowerCase();

    return isValidEmail && !isExistingEmail && isDifferentFromSelected;
  }, [inputValue, formattedEmails, selected]);

  useEffect(() => {
    async function fetchReceiversEmail() {
      try {
        const { data, error } = await supabase.from("receiver").select("email");

        if (error) {
          toast.error(error.message);
          return;
        }

        const receivers = data.map((item) => item.email);
        setEmails(receivers);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch receivers emails");
      }
    }

    if (user) {
      fetchReceiversEmail();
    }
  }, [user]);

  return (
    <div className="w-full">
      <Command className="overflow-visible">
        <div className="rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <div className="flex items-center gap-2">
            {selected && (
              <Badge variant="secondary" className="select-none">
                {selected.label}
                <X
                  className="size-3 text-muted-foreground hover:text-foreground ml-2 cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  onClick={handleClear}
                />
              </Badge>
            )}
            <CommandPrimitive.Input
              onKeyDown={handleKeyDown}
              onValueChange={setInputValue}
              value={inputValue}
              onBlur={() => setOpen(false)}
              onFocus={() => setOpen(true)}
              placeholder={selected ? "" : placeholder}
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="relative mt-2">
          <CommandList>
            {open && (filteredEmails.length > 0 || showCreateOption) && (
              <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                <CommandGroup className="h-full overflow-auto max-h-64">
                  {filteredEmails.map((email) => (
                    <CommandItem
                      key={email.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                      onSelect={() => {
                        setInputValue("");
                        setSelected(email);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      {email.label}
                    </CommandItem>
                  ))}

                  {showCreateOption && (
                    <CommandItem
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                      onSelect={() => {
                        handleSetEmail(inputValue.trim());
                      }}
                      className="cursor-pointer text-primary"
                    >
                      Use "{inputValue.trim()}"
                    </CommandItem>
                  )}
                </CommandGroup>
              </div>
            )}
          </CommandList>
        </div>
      </Command>

      {isLoading && (
        <div className="text-sm text-muted-foreground mt-1">
          Adding email...
        </div>
      )}
    </div>
  );
}
