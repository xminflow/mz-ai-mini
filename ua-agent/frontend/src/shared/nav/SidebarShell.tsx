import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/shared/ui/sidebar";

import { navItems } from "./navItems";

interface SidebarShellProps {
  children: ReactNode;
}

export function SidebarShell({ children }: SidebarShellProps): JSX.Element {
  return (
    <SidebarProvider className="min-h-0 flex-1">
      <Sidebar collapsible="icon" className="top-9 h-[calc(100svh-2.25rem)]">
        <SidebarHeader>
          <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            工作台
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.navTo}>
                      <NavLink
                        to={item.navTo}
                        end={item.navTo === "/" || item.children !== undefined ? false : true}
                      >
                        {({ isActive }) => (
                          <SidebarMenuButton tooltip={item.label} isActive={isActive}>
                            <Icon />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        )}
                      </NavLink>
                      {item.children !== undefined ? (
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.path}>
                              <NavLink to={child.path} end>
                                {({ isActive }) => (
                                  <SidebarMenuSubButton isActive={isActive}>
                                    <span>{child.label}</span>
                                  </SidebarMenuSubButton>
                                )}
                              </NavLink>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      ) : null}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="min-h-0 min-w-0 overflow-y-auto">{children}</SidebarInset>
    </SidebarProvider>
  );
}
