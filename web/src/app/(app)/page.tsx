"use client";

import { Thread } from "@/components/thread";
import { StreamProvider } from "@/providers/Stream";
import { ThreadProvider } from "@/providers/Thread";
import { Toaster } from "@/components/ui/sonner";
import React from "react";
import ProtectedRoute from "@/components/protected-router";
import { Navbar } from "@/components/navbar";
import { ArtifactProvider } from "@/components/thread/artifact";

export default function DemoPage(): React.ReactNode {
  return (
    <React.Suspense fallback={<div>Loading (layout)...</div>}>
      <Toaster />
      <ProtectedRoute>
      <Navbar />
        <ThreadProvider>
          <ArtifactProvider>
          <StreamProvider>
            <Thread />
          </StreamProvider>
          </ArtifactProvider>
        </ThreadProvider>
      </ProtectedRoute>
    </React.Suspense>
  );
}