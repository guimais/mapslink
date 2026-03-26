"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva("nav-liquid-btn", {
  variants: {
    variant: {
      default: "nav-liquid-btn--default",
      destructive: "nav-liquid-btn--destructive",
      cool: "nav-liquid-btn--cool",
      outline: "nav-liquid-btn--outline",
      secondary: "nav-liquid-btn--secondary",
      ghost: "nav-liquid-btn--ghost",
      link: "nav-liquid-btn--link",
    },
    size: {
      default: "nav-liquid-btn--md",
      sm: "nav-liquid-btn--sm",
      lg: "nav-liquid-btn--lg",
      icon: "nav-liquid-btn--icon",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const Button = React.forwardRef(function Button(
  { className, variant, size, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});

const liquidbuttonVariants = cva("nav-liquid-btn nav-liquid-btn--liquid", {
  variants: {
    variant: {
      default: "nav-liquid-btn--default",
      destructive: "nav-liquid-btn--destructive",
      outline: "nav-liquid-btn--outline",
      secondary: "nav-liquid-btn--secondary",
      ghost: "nav-liquid-btn--ghost",
      link: "nav-liquid-btn--link",
    },
    size: {
      default: "nav-liquid-btn--md",
      sm: "nav-liquid-btn--sm",
      lg: "nav-liquid-btn--lg",
      xl: "nav-liquid-btn--xl",
      xxl: "nav-liquid-btn--xxl",
      icon: "nav-liquid-btn--icon",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "xxl",
  },
});

function LiquidButton({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(liquidbuttonVariants({ variant, size, className }))} {...props} />;
}

const metalVariants = cva("nav-liquid-btn nav-liquid-btn--metal", {
  variants: {
    variant: {
      default: "nav-liquid-btn--metal-default",
      primary: "nav-liquid-btn--metal-primary",
      success: "nav-liquid-btn--metal-success",
      error: "nav-liquid-btn--metal-error",
      gold: "nav-liquid-btn--metal-gold",
      bronze: "nav-liquid-btn--metal-bronze",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const MetalButton = React.forwardRef(function MetalButton(
  { className, variant, ...props },
  ref,
) {
  return <button ref={ref} className={cn(metalVariants({ variant, className }))} {...props} />;
});

export { Button, buttonVariants, liquidbuttonVariants, LiquidButton, MetalButton };
