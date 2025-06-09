'use client'

import { motion } from 'framer-motion'
import { Sparkles, Menu, Settings } from 'lucide-react'

export default function Header() {
  return (
    <motion.header 
      className="sticky top-0 z-50 backdrop-blur-2xl border-b border-white/10"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="bg-gradient-to-r from-black/80 via-slate-900/90 to-black/80">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Brand */}
            <motion.div 
              className="flex items-center gap-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="relative">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30"
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.6 }}
                >
                  <Sparkles className="w-7 h-7 text-black" />
                </motion.div>
                <div className="absolute -inset-1 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl blur-lg -z-10" />
              </div>
              <div>
                <motion.h1 
                  className="text-2xl font-bold bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  InkVision
                </motion.h1>
                <motion.p 
                  className="text-sm text-white/60 font-medium"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Visualize Your Vision
                </motion.p>
              </div>
            </motion.div>
            
            {/* Navigation */}
            <motion.div 
              className="hidden md:flex items-center gap-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <nav className="flex items-center gap-6">
                <motion.a 
                  href="#" 
                  className="text-white/80 hover:text-white font-medium transition-colors relative group"
                  whileHover={{ y: -2 }}
                >
                  Gallery
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 group-hover:w-full transition-all duration-300" />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-white/80 hover:text-white font-medium transition-colors relative group"
                  whileHover={{ y: -2 }}
                >
                  Artists
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 group-hover:w-full transition-all duration-300" />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-white/80 hover:text-white font-medium transition-colors relative group"
                  whileHover={{ y: -2 }}
                >
                  About
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 group-hover:w-full transition-all duration-300" />
                </motion.a>
              </nav>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <motion.button 
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all backdrop-blur-sm border border-white/10"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
                <motion.button 
                  className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/25"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </div>
            </motion.div>
            
            {/* Mobile Menu */}
            <motion.button 
              className="md:hidden p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Menu className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Decorative bottom border */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
    </motion.header>
  )
} 