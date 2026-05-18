import { SidebarLayout } from "@/components/sidebar-layout"
import { adminSidebarConfig } from "@/config/sidebar-config"
import { requireAdminAuth } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let session
  try {
    session = await requireAdminAuth()
  } catch (error) {
    redirect('/login')
  }

  const userSession = {
    email: session.email,
    role: session.role,
    userId: session.userId
  }

  return (
    <SidebarLayout 
      sidebarConfig={adminSidebarConfig} 
      userSession={userSession}
    >
      {children}
    </SidebarLayout>
  )
}
