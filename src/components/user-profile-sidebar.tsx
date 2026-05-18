'use client'

import { User, LogOut } from "lucide-react"
import { logout } from "@/app/actions/authActions"
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from "@/components/ui/sidebar"

interface UserProfileSidebarProps {
  email: string
  role: string
  userId: number
}

export function UserProfileSidebar({ email, role, userId }: UserProfileSidebarProps) {
  const handleLogout = async () => {
    await logout()
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator'
      case 'librarian':
        return 'Librarian'
      case 'student':
        return 'Student'
      case 'faculty':
        return 'Faculty'
      case 'patron':
        return 'Patron'
      default:
        return role
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* User Info */}
          <SidebarMenuItem>
            <div className="flex items-center gap-2 p-2 text-sm">
              <User className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium truncate max-w-[150px]" title={email}>
                  {email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getRoleDisplay(role)} (ID: {userId})
                </span>
              </div>
            </div>
          </SidebarMenuItem>
          
          {/* Logout Button - Hidden for patrons */}
          {!['student', 'faculty', 'patron'].includes(role) && (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
