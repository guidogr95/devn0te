import * as React from "react";

import { cn } from "devnote/utils/shadcn";
import { FieldError } from "react-hook-form";
import { Button } from "../button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-bg-secondary px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

type DevNoteInputProps = InputProps & {
  label?: string;
  error?: FieldError;
};

const DevNoteInput = React.forwardRef<HTMLInputElement, DevNoteInputProps>(
  ({ label, error = {}, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={props.id || props.name}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <Input
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            className={cn("w-full", isPassword && "pr-10", className)}
            {...props}
          />
          {isPassword && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
              ) : (
                <EyeIcon className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          )}
        </div>
        {!!error.message && (
          <ul className="text-sm text-destructive">
            <li>{error.message}</li>
          </ul>
        )}
      </div>
    );
  }
);
DevNoteInput.displayName = "DevNoteInput";

export { Input, DevNoteInput };
