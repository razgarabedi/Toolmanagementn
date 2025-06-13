import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Werkzeugmeister Pro</h1>
      <p className="mt-4 text-lg">Professionelles Werkzeugmanagement</p>
      <div className="mt-8 flex gap-4">
        <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </Link>
        <Link href="/register" className="bg-gray-500 text-white px-4 py-2 rounded">
          Register
        </Link>
        <Link href="/tools" className="bg-green-500 text-white px-4 py-2 rounded">
          Manage Tools
        </Link>
      </div>
    </main>
  );
}
