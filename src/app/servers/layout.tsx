import { getServerSession } from 'next-auth';
import { RedirectType, redirect } from 'next/navigation';

export default async function ServersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) {
    return redirect('/', RedirectType.replace);
  }

  return (
    <>
      {/* <div className="absolute left-[35%] top-[35%] h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-900 bg-opacity-30 ring-offset-muted"> */}
      {/*   &nbsp; */}
      {/* </div> */}
      <div className="min-h-screen bg-opacity-0 backdrop-blur-3xl">
        {children}
      </div>
    </>
  );
}
