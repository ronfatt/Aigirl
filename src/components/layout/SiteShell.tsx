"use client";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LoadingExperience } from "./LoadingExperience";
import { CustomCursor } from "@/src/components/motion/CustomCursor";
import { PageTransition } from "./PageTransition";
export function SiteShell({ children }: { children: ReactNode }) { return <><LoadingExperience/><PageTransition/><Header/><main>{children}</main><Footer/><CustomCursor/></>; }
