import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebarClient } from "@/components/app-sidebar-client"
import { SidebarGroup } from "@/components/app-sidebar"

interface UserSession {
  email: string
  role: string
  userId: number
}

interface SidebarLayoutProps {
  children: React.ReactNode
  sidebarConfig: SidebarGroup[]
  userSession?: UserSession
}

export function SidebarLayout({ 
  children, 
  sidebarConfig,
  userSession
}: SidebarLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        {/* Sidebar - Always open */}
        <AppSidebarClient groups={sidebarConfig} userSession={userSession}/>

        {/* Main content area */}
        <main className="flex-1 p-4">
          {/* Your page content */}
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
