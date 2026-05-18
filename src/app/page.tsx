
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();
  
  if (session) {
    // Redirect authenticated users to their appropriate dashboard
    switch (session.role) {
      case 'admin':
        redirect('/admin/dashboard');
        break;
      case 'librarian':
        redirect('/librarian');
        break;
      case 'student':
      case 'faculty':
      case 'patron':
        redirect('/patron/dashboard');
        break;
      default:
        redirect('/login');
    }
  } else {
    // Redirect unauthenticated users to login
    redirect('/login');
  }
}
