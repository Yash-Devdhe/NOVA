"use client";

import * as React from "react";
import { toast as sonnerToast, Toaster } from "sonner";

type ToastInput = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
};

export const toast = ({ title, description, variant }: ToastInput) => {
  const message = title || description || "Notification";

  return sonnerToast(message, {
    description,
    className: variant === "destructive" ? "border-red-200 text-red-600" : undefined,
  });
};

export const useToast = () => ({
  toast,
});

export { Toaster };
