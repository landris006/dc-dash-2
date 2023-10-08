'use client';

import { signIn } from 'next-auth/react';
import { useEffect, useRef } from 'react';

export default function LoginPage() {
  const trackerRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent) {
    if (trackerRef.current) {
      trackerRef.current.animate(
        [
          {
            top: `${e.clientY}px`,
            left: `${e.clientX}px`,
          },
        ],
        {
          duration: 3000,
          easing: 'ease-in-out',
          fill: 'forwards',
        },
      );
    }
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [trackerRef]);

  return (
    <div className="relative overflow-hidden">
      <div
        ref={trackerRef}
        className="absolute left-[35%] top-[35%] h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-900 bg-opacity-30 ring-offset-muted"
      >
        &nbsp;
      </div>

      <main className="flex h-full min-h-screen flex-col items-center justify-center gap-5 break-keep bg-opacity-0 backdrop-blur-3xl ">
        <div>
          <h1 className="text-center text-6xl font-semibold">
            Discord Dashboard <span className="text-violet-500">2.0</span>
          </h1>
          <p className="mt-3 text-center text-lg opacity-60">
            A dashboard to track the activity of members on your server.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => signIn('discord')}>
          Sign in with Discord
        </button>
      </main>
    </div>
  );
}
