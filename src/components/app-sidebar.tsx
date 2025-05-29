import {
  LayoutDashboard,
  Mail,
  FileText,
  BarChart2,
  HelpCircle,
  Settings,
  History,
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
import Logo from "@/../public/logo-2.svg";
import WhiteLogo from "@/../public/logo-white.svg";
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
  const { theme } = useTheme();

  return (
    <Sidebar>
      <SidebarContent>
        <img
          src={theme === "dark" ? WhiteLogo.src : Logo.src}
          alt="reachmate-logo"
          className="pl-3 pt-4 pb-2 w-40 h-auto"
        />
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