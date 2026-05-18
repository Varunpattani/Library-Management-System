import { LucideIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { UserProfileSidebar } from "@/components/user-profile-sidebar"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

export interface MenuItem {
  title: string
  url: string
  icon: LucideIcon
}

export interface SidebarGroup {
  label: string
  items: MenuItem[]
}

interface UserSession {
  email: string
  role: string
  userId: number
}

interface AppSidebarProps {
  groups: SidebarGroup[]
  userSession?: UserSession
}

export function AppSidebar({ groups, userSession }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        {groups.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      {/* User Profile Footer */}
      {userSession && (
        <SidebarFooter>
          <UserProfileSidebar 
            email={userSession.email}
            role={userSession.role}
            userId={userSession.userId}
          />
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
