import { SidebarLayout } from "@/components/sidebar-layout"
import { librarianSidebarConfig } from "@/config/sidebar-config"
import { requireLibrarianAuth } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function LibrarianLayout({ children }: { children: React.ReactNode }) {
  let session
  try {
    session = await requireLibrarianAuth()
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
      sidebarConfig={librarianSidebarConfig} 
      userSession={userSession}
    >
      {children}
    </SidebarLayout>
  )
}
