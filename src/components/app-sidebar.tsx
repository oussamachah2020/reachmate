import {
  LayoutDashboard,
  Mail,
  FileText,
  BarChart2,
  Settings,
  History,
  TimerIcon,
  SparkleIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

// Menu items.
const items = [
  {
    title: "Dashboard",
    href: "/home",
    icon: LayoutDashboard,
  },
  {
    title: "Inbox",
    href: "/inbox",
    icon: Mail,
  },
  // {
  //   title: "Sent",
  //   href: "/sent",
  //   icon: Send,
  // },
  {
    title: "Templates",
    href: "/templates",
    icon: FileText,
  },
  {
    title: "Schedule",
    href: "/schedule",
    icon: TimerIcon,
  },
  // {
  //   title: "Smart Replies",
  //   href: "/smart-replies",
  //   icon: SparkleIcon,
  // },
  {
    title: "History",
    href: "/history",
    icon: History,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart2,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  // {
  //   title: "Help",
  //   href: "/help",
  //   icon: HelpCircle,
  // },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex flex-row items-center gap-3 pl-3 pt-4">
          <div className="h-9 w-9 rounded-full bg-primary p-2  shadow-md flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary-foreground dark:text-white" />
          </div>
          <span className="text-xl font-semibold dark:text-white">
            ReachMate
          </span>
          {/* <img
            src={theme === "dark" ? WhiteLogo.src : Logo.src}
            alt="reachmate-logo"
            className="pl-3 pt-4 pb-2 w-40 h-auto"
          /> */}
        </div>
        <Separator className="mt-[5px]" />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.href}
                      className={cn(
                        "flex items-center rounded-md text-lg px-3 py-2 ",
                        pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : ""
                      )}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}