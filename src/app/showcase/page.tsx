'use client';

import { useProjects } from '@/hooks/useProjects';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Loader2, ArrowUpRight, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ShowcasePage() {
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();
  const { data: portfolio, isLoading: isLoadingPortfolio } = usePortfolio();

  // Simulated "User Profile" for the showcase header - in real app this comes from settings
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || isLoadingProjects || isLoadingPortfolio) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  // Ensure portfolio is loaded before filtering
  if (!portfolio) return null;

  const publishedProjects = projects.filter(p => portfolio?.publishedProjectIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">Raden<span className="text-gray-500">.Design</span></div>
          <a
            href="mailto:hello@example.com"
            className="px-5 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-200 transition-colors"
          >
            Hire Me
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
          Building digital <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">experiences</span> that matter.
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
          I'm a freelance developer & designer specialized in building high-performance web applications and stunning user interfaces.
        </p>

        <div className="flex gap-6 mt-12">
          <a href="#" className="text-gray-400 hover:text-white transition-colors"><Github className="w-6 h-6" /></a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-6 h-6" /></a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="w-6 h-6" /></a>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-6 pb-32 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-sm font-mono text-gray-500 uppercase tracking-widest">Selected Works</h2>
          <div className="h-px bg-white/10 flex-1 ml-8"></div>
        </div>

        {publishedProjects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <p className="text-gray-500">No projects published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {publishedProjects.map((project, index) => (
              <div key={project.id} className={`group relative ${index % 3 === 0 ? 'md:col-span-2' : ''}`}>
                <div className="relative aspect-video bg-[#111] border border-white/5 rounded-2xl overflow-hidden mb-6 group-hover:border-white/20 transition-colors">
                  {/* Placeholder for project image since we don't have real images yet */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-white/0">
                    <span className="text-4xl font-bold text-white/5 group-hover:text-white/10 transition-colors duration-500">
                      {project.name.charAt(0)}
                    </span>
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="px-6 py-3 border border-white rounded-full text-sm font-medium hover:bg-white hover:text-black transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                      View Project
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">{project.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 max-w-md">{project.description}</p>
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors transform group-hover:translate-x-1 group-hover:-translate-y-1 duration-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-sm text-gray-600">
        <p>© {new Date().getFullYear()} Raden Design. All rights reserved.</p>
      </footer>

    </div>
  );
}
