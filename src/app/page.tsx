import LoginPage from '@/app/LoginPage';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Login() {
  const session = await getServerSession();
  if (session?.user) {
    redirect('/servers');
  }

  return <LoginPage />;
}
