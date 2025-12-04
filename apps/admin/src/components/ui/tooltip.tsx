"use client"

import * as React from "react"
// import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: any) {
  return <>{props.children}</>
}

function Tooltip({
  ...props
}: any) {
  return <TooltipProvider>{props.children}</TooltipProvider>
}

function TooltipTrigger({
  ...props
}: any) {
  return <>{props.children}</>
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: any) {
  return null // Don't render content to avoid issues
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
