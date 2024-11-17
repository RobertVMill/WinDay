import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between">
        <div className="text-white text-lg font-bold">
          Dayflow
        </div>
        <div className="space-x-4">
          <Link href="/journal/new">
            <a className="text-gray-300 hover:text-white">New Journal Entry</a>
          </Link>
          <Link href="/templates">
            <a className="text-gray-300 hover:text-white">Templates</a>
          </Link>
        </div>
      </div>
    </nav>
  );
}
