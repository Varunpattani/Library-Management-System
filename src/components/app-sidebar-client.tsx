
import { AppSidebar, SidebarGroup } from "./app-sidebar"

interface UserSession {
  email: string
  role: string
  userId: number
}

interface AppSidebarClientProps {
  groups: SidebarGroup[]
  userSession?: UserSession
}

export function AppSidebarClient({ groups, userSession }: AppSidebarClientProps) {
  
  return <AppSidebar groups={groups} userSession={userSession} />
}
