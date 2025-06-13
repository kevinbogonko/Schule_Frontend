import { motion } from "framer-motion";

export default function LoadingSpinner (){
    return (
      <div className="flex items-center justify-center h-screen bg-white flex-col space-y-6">
        {/* Schule Text with elegant animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500"
        >
          Schule
        </motion.div>

        {/* Loading indicator with smooth pulse */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        ></motion.div>

        {/* Subtle status text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-gray-500 font-medium text-lg mt-2"
        >
          Optimizing resources...
        </motion.p>
      </div>
    );
}