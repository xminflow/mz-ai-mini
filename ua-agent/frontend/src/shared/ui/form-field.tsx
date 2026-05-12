import * as React from "react";

import { cn } from "@/shared/lib/utils";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  htmlFor?: string;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  labelClassName?: string;
}

export function FormField({
  label,
  htmlFor,
  description,
  error,
  required = false,
  className,
  labelClassName,
  children,
  ...props
}: FormFieldProps): JSX.Element {
  return (
    <div className={cn("field-stack", className)} {...props}>
      <label htmlFor={htmlFor} className={cn("field-label", labelClassName)}>
        <span>{label}</span>
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </label>
      {children}
      {description ? <p className="field-description">{description}</p> : null}
      {error ? <p className="text-xs leading-6 text-destructive">{error}</p> : null}
    </div>
  );
}
