import {
  LayoutDashboard,
  Mail,
  FileText,
  Users,
  BarChart2,
  HelpCircle,
  Menu,
  X,
  Send,
  Settings,
  Link,
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
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

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
  {
    title: "Help",
    href: "/help",
    icon: HelpCircle,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent className="bg-white">
        <img
          src={Logo.src}
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
                          : "text-gray-700 hover:bg-gray-100"
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