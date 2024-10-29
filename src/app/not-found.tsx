import Link from "next/link";
import { Music } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-4">
      <Music className="text-white w-24 h-24 mb-8" />
      <h1 className="text-8xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400">
        404
      </h1>
      <h2 className="text-2xl font-semibold mb-2">Not Found</h2>
      <p className="text-lg text-gray-300 mb-8">
        The page you're looking for does not exist
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50"
      >
        Go back to home
      </Link>
    </div>
  );
}
