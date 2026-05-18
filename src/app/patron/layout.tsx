import { SidebarLayout } from "@/components/sidebar-layout"
import { patronSidebarConfig } from "@/config/sidebar-config"
import { requirePatronAuth } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function PatronLayout({ children }: { children: React.ReactNode }) {
  let session
  try {
    session = await requirePatronAuth()
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
      sidebarConfig={patronSidebarConfig}
      userSession={userSession}
    >
      {children}
    </SidebarLayout>
  )
}
