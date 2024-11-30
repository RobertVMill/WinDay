'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AppHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">Welcome to WinDay</h1>
      </div>
    </main>
  );
}
