"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

import {
  Bell,
  Bot,
  ChevronDown,
  ChevronRight,
  ChevronsLeftRight,
  ChevronsRight,
  ChevronsUpDown,
  Compass,
  CreditCard,
  FileText,
  Folder,
  FolderCode,
  Gift,
  GitBranch,
  Github,
  GithubIcon,
  LayoutDashboard,
  Link2,
  LogOutIcon,
  LucideGitBranch,
  LucideGithub,
  LucideGrip,
  LucideLayoutDashboard,
  LucideListTodo,
  LucideRocket,
  LucideWandSparkles,
  Mic,
  Moon,
  Palette,
  Play,
  Plus,
  Settings2,
  SparklesIcon,
  Star,
  Stars,
  Store,
  Sun,
  User,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const user: Doc<"users"> | undefined | null = useQuery(
    api.user.getCurrentUser,
  );

  //   const projects = useQuery(api.project.getProjects);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + "/dashbaord");
  };

  return (
    <Sidebar collapsible="icon" className="">
      <SidebarHeader className="border-b ">
        <div className="flex items-center justify-center gap-3 px-3 py-3">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={30}
            height={30}
            className="cursor-pointer"
          />
          <h1 className="font-bold font-pop text-xl group-data-[collapsible=icon]:hidden">
            WeKraft
          </h1>
        </div>
        {user === undefined ? (
          <div className="flex items-center gap-4 my-1 mx-auto border px-6 py-2 bg-sidebar-accent/30 rounded-md w-full">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col space-y-2 group-data-[collapsible=icon]:hidden">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 my-0.5 mx-auto border px-6 py-2 bg-accent/40 rounded-md group-data-[collapsible=icon]:hidden font-sans">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>

            <div className="flex flex-col space-y-0.5 group-data-[collapsible=icon]:hidden">
              <h2 className="flex gap-2 text-sm items-center truncate">
                <Github className="h-4 w-4" /> {user?.githubUsername}
              </h2>
              <p className="text-xs text-muted-foreground ml-3">
                Account Synced
              </p>
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="flex flex-col px-3 py-5 relative overflow-y-scroll scroll-smooth">
        {/* 1 */}
        <SidebarMenu className="flex flex-col gap-3">
          <SidebarMenuButton
            asChild
            data-active={isActive("/dashboard")}
            className="group relative overflow-hidden"
          >
            <Link
              href="/dashboard"
              className="relative z-10 flex items-center gap-3 px-3 py-2 dark:data-[active=true]:text-white data-[active=true]:text-gray-700"
            >
              <LucideLayoutDashboard className="h-5 w-5" />
              <span className="text-sm">Dashboard</span>
              <span
                className="
        pointer-events-none absolute inset-0 -z-10
        opacity-0 transition-opacity
        group-data-[active=true]:opacity-100
        bg-linear-to-l from-blue-600/80 dark:from-blue-600/50 via-blue-600/10  to-transparent
      "
              />
            </Link>
          </SidebarMenuButton>
          {/* 2 */}
          <Popover>
            <PopoverTrigger asChild>
              <SidebarMenuButton
                data-active={isActive("/dashboard/community")}
                className="group relative overflow-hidden"
              >
                <div className="relative z-10 flex items-center gap-3 w-full text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Community</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                  <span className="" />
                </div>
              </SidebarMenuButton>
            </PopoverTrigger>

            <PopoverContent side="right" className="w-56 p-2">
              <div className="flex flex-col gap-1">
                <Link
                  href="/dashboard/community?mode=discover"
                  className="flex items-center gap-2 rounded px-2 py-1 text-sm text-base hover:bg-accent"
                >
                  <Compass className="h-4 w-4" />
                  Discover Projects
                </Link>

                <Link
                  href="/dashboard/community?mode=bounties"
                  className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
                >
                  <Gift className="h-4 w-4" />
                  Open Bounties
                </Link>

                <Link
                  href="/dashboard/community?mode=find-team"
                  className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
                >
                  <UserPlus className="h-4 w-4" />
                  Find Teammates
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t px-2 py-2 group-data-[collapsible=icon]:hidden"></SidebarFooter>
    </Sidebar>
  );
};
