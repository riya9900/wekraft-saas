"use client";

import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
