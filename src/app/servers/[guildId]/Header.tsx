'use client';

import { cn } from '@/lib/utils';
import { Guild } from '@prisma/client';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { BarChartIcon, HomeIcon, LogOutIcon } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Header({
  children,
  guild,
}: {
  children: React.ReactNode;
  guild: Guild;
}) {
  const session = useSession();

  const pathname = usePathname();
  const rootPath = `/servers/${guild.id}`;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between gap-3 border-b px-3 py-1">
        <button
          className="rounded-full bg-neutral-400/20 p-2 hover:bg-neutral-400/40"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <HamburgerMenuIcon width={24} height={24} />
        </button>

        <h1 className="align-middle text-3xl">
          <span>Discord Dashboard</span>{' '}
          <span className="text-violet-500">2.0</span>
        </h1>

        <div className="dropdown dropdown-hover">
          <label tabIndex={0} className="btn btn-link p-0">
            <Image
              src={session.data?.user.image ?? ''}
              alt="server image"
              className="rounded-full"
              width={40}
              height={40}
            />
          </label>

          <div tabIndex={0} className="dropdown-content right-0">
            <button
              title="logout"
              className="btn btn-sm flex-nowrap text-error"
              onClick={() => signOut()}
            >
              logout <LogOutIcon width={24} height={24} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        <aside
          className={cn(
            'box-content flex w-16 flex-col items-center border-r transition-all',
            {
              'w-fit': isOpen,
            },
          )}
        >
          <div className="flex items-center gap-1 p-3">
            <Image
              src={guild.iconUrl ?? ''}
              alt="server image"
              className="rounded-full"
              width={40}
              height={40}
            />

            {isOpen && <span>{guild.name}</span>}
          </div>
          <hr className="w-[80%]" />
          <nav className="w-full">
            <ul className="menu p-3">
              <li className="w-full">
                <Link
                  href={rootPath}
                  className={cn('p-2', {
                    active: pathname === rootPath,
                  })}
                >
                  <HomeIcon width={24} height={24} />
                  {isOpen && <span>Overview</span>}{' '}
                </Link>
              </li>
              <li>
                <Link
                  href={`${rootPath}/charts`}
                  className={cn('p-2', {
                    active: pathname === `${rootPath}/charts`,
                  })}
                >
                  <BarChartIcon width={24} height={24} />
                  {isOpen && <span>Charts</span>}{' '}
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {children}
      </div>
    </>
  );
}
