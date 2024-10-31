"use client";

import { motion } from "framer-motion";
import { Disc2, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-4">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-6"
        >
          <Disc2 size={64} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4">${error.message}</h1>
        <motion.h2
          className="text-2xl mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {error.message}
        </motion.h2>
        <p className="text-gray-400 mb-8 text-sm">
          Error digest: {error.digest}
        </p>
        <button
          className="px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 flex items-center justify-center mx-auto"
          onClick={reset}
        >
          <RefreshCw className="mr-2" size={20} />
          Play it again
        </button>
      </motion.div>
    </div>
  );
}
