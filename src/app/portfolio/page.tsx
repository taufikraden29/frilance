'use client';

import { Header } from '@/components/Header';
import { useProjects } from '@/hooks/useProjects';
import { usePortfolio, useTogglePortfolioProject } from '@/hooks/usePortfolio';
import { ExternalLink, CheckCircle, Circle, Globe, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PortfolioBuilderPage() {
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();
  const { data: portfolio, isLoading: isLoadingPortfolio } = usePortfolio();
  const toggleProject = useTogglePortfolioProject();

  // Filter completed projects or show all? Let's show all for flexibility but highlight completed
  const sortedProjects = [...projects].sort((a, b) => {
    // Show published first
    const aPub = portfolio?.publishedProjectIds.includes(a.id);
    const bPub = portfolio?.publishedProjectIds.includes(b.id);
    if (aPub && !bPub) return -1;
    if (!aPub && bPub) return 1;
    // Then completed first
    if (a.status === 'completed' && b.status !== 'completed') return -1;
    if (a.status !== 'completed' && b.status === 'completed') return 1;
    return 0;
  });

  const isLoading = isLoadingProjects || isLoadingPortfolio;

  return (
    <div className="min-h-screen bg-black">
      <Header
        title="Portfolio Builder"
        subtitle="Select projects to feature on your public showcase page."
        action={{
          label: "View Live Site",
          onClick: () => window.open('/showcase', '_blank')
        }}
      />

      <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Your Public Showcase</h2>
            <p className="text-gray-400 max-w-xl">
              Projects selected below will appear on your standalone portfolio page.
              Share the link with clients to demonstrate your expertise.
            </p>
          </div>
          <Link
            href="/showcase"
            target="_blank"
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Globe className="w-4 h-4" /> Open Showcase <ExternalLink className="w-3 h-3 text-gray-500" />
          </Link>
        </div>

        {/* Project List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Select Projects</h3>
            <span className="text-sm text-gray-500">
              {portfolio?.publishedProjectIds.length || 0} selected
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
            </div>
          ) : sortedProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No projects found. Create some projects first!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedProjects.map(project => {
                const isPublished = portfolio?.publishedProjectIds.includes(project.id);

                return (
                  <div
                    key={project.id}
                    onClick={() => toggleProject.mutate(project.id)}
                    className={`relative group cursor-pointer border rounded-2xl p-5 transition-all duration-300 ${isPublished
                        ? 'bg-[#151515] border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                        : 'bg-[#0A0A0A] border-white/5 hover:border-white/10 opacity-70 hover:opacity-100'
                      }`}
                  >
                    {/* Status Badge */}
                    <div className="absolute top-5 right-5">
                      {isPublished ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-600 group-hover:border-gray-400 transition-colors" />
                      )}
                    </div>

                    <h4 className={`text-lg font-semibold mb-2 pr-8 ${isPublished ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                      {project.name}
                    </h4>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-500 truncate">
                        {project.description || 'No description provided.'}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded capitalize border ${project.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-white/5 text-gray-400 border-white/10'
                          }`}>
                          {project.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className={`mt-4 pt-4 border-t border-white/5 text-xs font-medium flex items-center gap-2 ${isPublished ? 'text-emerald-500' : 'text-gray-600'}`}>
                      {isPublished ? 'Featured on Showcase' : 'Click to Feature'}
                      {!isPublished && <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
