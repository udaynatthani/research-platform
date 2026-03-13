import React from 'react';
import { BookOpen, Sparkles, Star, Shield, CheckCircle, ChevronRight, Info } from 'lucide-react';
import Badge from '../ui/Badge';

const SummarizeResult = ({ data }) => (
  <div className="space-y-6">
    <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
      <h4 className="font-display font-bold text-emerald-800 text-sm mb-2 flex items-center gap-2">
        <BookOpen size={16} /> Research Summary
      </h4>
      <p className="text-slate-700 leading-relaxed text-sm">{data.summary}</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <h5 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-2">Key Contributions</h5>
        <p className="text-slate-600 text-sm">{data.key_contributions}</p>
      </div>
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <h5 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-2">Methodology</h5>
        <p className="text-slate-600 text-sm">{data.methodology}</p>
      </div>
    </div>

    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <h5 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-2">Potential Limitations</h5>
      <p className="text-slate-600 text-sm">{data.limitations}</p>
    </div>

    <div className="flex flex-wrap gap-2 pt-2">
      {data.topics?.map((topic, i) => (
        <Badge key={i} label={`#${topic}`} color="slate" />
      ))}
    </div>
  </div>
);

const InsightsResult = ({ data }) => (
  <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
    <h4 className="font-display font-bold text-purple-800 text-sm mb-4 flex items-center gap-2">
      <Sparkles size={16} /> Extracted Insights
    </h4>
    <div className="prose prose-sm prose-purple text-purple-900 max-w-none">
      {(data.insights || data.content) ? (data.insights || data.content).split('\n').filter(line => line.trim()).map((line, i) => (
        <p key={i} className="mb-3 last:mb-0 leading-relaxed">{line}</p>
      )) : <p className="text-slate-400 italic">No insights extracted.</p>}
    </div>
  </div>
);

const RecommendationResult = ({ data }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
        <Star size={16} className="text-blue-500" /> Recommended Reading
      </h4>
      <Badge label={`${data.recommendations?.length || 0} Results`} color="blue" />
    </div>
    <div className="grid gap-3">
      {data.recommendations?.map((rec, i) => (
        <div key={i} className="group bg-white rounded-xl p-4 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all">
          <div className="flex justify-between items-start gap-3 mb-2">
            <h5 className="font-display font-semibold text-slate-900 group-hover:text-blue-600 text-sm transition-colors">{rec.title}</h5>
            <div className="shrink-0 flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
              <span className="text-[10px] font-bold text-blue-600">{(rec.similarity_score * 100).toFixed(0)}%</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs line-clamp-3 italic leading-relaxed">"{rec.text_preview}"</p>
          <div className="mt-4 flex justify-end">
            <button className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-blue-600 flex items-center gap-1 transition-colors">
              Request Full Paper <ChevronRight size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PlagiarismResult = ({ data }) => {
  const score = (data.plagiarism_score * 100).toFixed(1);
  const color = score > 20 ? 'rose' : score > 5 ? 'orange' : 'emerald';
  const scoreColors = {
    rose: 'bg-rose-50 border-rose-100 text-rose-900',
    orange: 'bg-orange-50 border-orange-100 text-orange-900',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-900'
  };
  
  return (
    <div className="space-y-6">
      <div className={`rounded-2xl p-8 border ${scoreColors[color]} flex flex-col items-center text-center shadow-sm`}>
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm border border-inherit mb-4">
          <Shield size={28} className={color === 'rose' ? 'text-rose-500' : color === 'orange' ? 'text-orange-500' : 'text-emerald-500'} />
        </div>
        <h4 className="font-display font-bold text-2xl mb-1">{score}% Similarity</h4>
        <p className="text-xs font-semibold uppercase tracking-widest opacity-70">Plagiarism Detection Score</p>
      </div>

      <div className="space-y-4">
        <h5 className="font-display font-bold text-slate-800 text-xs uppercase tracking-[0.2em] px-1 flex items-center gap-2">
          <Info size={14} className="text-slate-400" /> Matching Analysis
        </h5>
        {data.matching_sections?.length > 0 ? data.matching_sections.map((section, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Overlap Cluster #{i+1}</span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded leading-none">{(section.similarity * 100).toFixed(0)}%</span>
            </div>
            <div className="p-4 grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Candidate Text</span>
                <p className="text-[11px] text-slate-600 font-medium italic border-l-2 border-indigo-200 pl-3 py-1">"{section.text}"</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Reference Source</span>
                <p className="text-[11px] text-slate-600 italic border-l-2 border-slate-200 pl-3 py-1 opacity-70">"{section.matched_text}"</p>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-slate-50 rounded-xl p-8 border border-slate-100 text-center">
            <p className="text-slate-400 text-sm italic">No significant matching sections found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const IndexResult = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 border border-emerald-100 shadow-xl relative">
      <CheckCircle size={40} />
      <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
    </div>
    <h4 className="font-display font-bold text-slate-900 text-2xl mb-3">Paper Successfully Indexed</h4>
    <p className="text-slate-500 text-sm max-w-sm leading-relaxed px-4">
      The research intelligence engine has finished processing the paper. Advanced features like semantic search, summarization, and RAG-based chat are now active.
    </p>
  </div>
);

export default function AIResultDisplay({ action, result }) {
  if (!result) return null;

  switch (action) {
    case 'summarize':
      return <SummarizeResult data={result} />;
    case 'insights':
      return <InsightsResult data={result} />;
    case 'recommend':
      return <RecommendationResult data={result} />;
    case 'plagiarism':
      return <PlagiarismResult data={result} />;
    case 'index':
      return <IndexResult />;
    default:
      return (
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
           <h4 className="font-display font-bold text-slate-800 text-sm mb-4">Response Data</h4>
           <pre className="text-[11px] font-mono text-slate-500 bg-white p-4 rounded-lg border border-slate-100 overflow-auto max-h-[400px]">
             {JSON.stringify(result, null, 2)}
           </pre>
        </div>
      );
  }
}
