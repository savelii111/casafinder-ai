import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

export default function PipelineDebugger() {
  return null; // Disabled
  const [stats, setStats] = React.useState({
    backend: null,
    orchestrator: null,
    ai: null,
    map: null,
    alerts: []
  });

  React.useEffect(() => {
    // Intercept console logs to track pipeline stats
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Parse backend stats
      if (message.includes('[STAGE 1: BACKEND FETCH] Complete')) {
        const match = message.match(/Total apartments: (\d+)/);
        if (match) {
          setStats(prev => ({ ...prev, backend: parseInt(match[1]) }));
        }
      }
      
      // Parse orchestrator stats
      if (message.includes('[STAGE 3: ORCHESTRATOR] COMPLETE')) {
        const match = message.match(/Sorted: (\d+) apartments/);
        if (match) {
          setStats(prev => ({ ...prev, orchestrator: parseInt(match[1]) }));
        }
      }
      
      // Parse AI stats
      if (message.includes('[STAGE 4: AI ANALYSIS] Calling')) {
        const match = message.match(/Total apartments to analyze: (\d+)/);
        if (match) {
          setStats(prev => ({ ...prev, ai: parseInt(match[1]) }));
        }
      }
      
      // Parse map stats
      if (message.includes('[STAGE 6: MAP MARKERS] Rendering')) {
        const match = message.match(/Will render (\d+) markers/);
        if (match) {
          setStats(prev => ({ ...prev, map: parseInt(match[1]) }));
        }
      }
      
      originalLog.apply(console, args);
    };
    
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('🚨')) {
        setStats(prev => ({ 
          ...prev, 
          alerts: [...prev.alerts.slice(-5), message] 
        }));
      }
      originalError.apply(console, args);
    };
    
    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const allCounts = [stats.backend, stats.orchestrator, stats.ai, stats.map].filter(n => n !== null);
  const isConsistent = allCounts.length > 0 && allCounts.every(n => n === allCounts[0]);
  const has20Limit = allCounts.some(n => n === 20);

  if (!stats.backend && !stats.orchestrator && !stats.ai && !stats.map) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-2xl p-4 border-2 border-slate-700 max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-5 h-5 text-blue-400" />
        <h3 className="font-bold text-sm">Pipeline Debugger</h3>
      </div>
      
      <div className="space-y-2 text-xs font-mono">
        {stats.backend !== null && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Backend:</span>
            <Badge className={stats.backend === 20 ? "bg-red-500" : "bg-green-500"}>
              {stats.backend}
            </Badge>
          </div>
        )}
        
        {stats.orchestrator !== null && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Orchestrator:</span>
            <Badge className={stats.orchestrator === 20 ? "bg-red-500" : "bg-green-500"}>
              {stats.orchestrator}
            </Badge>
          </div>
        )}
        
        {stats.ai !== null && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400">AI Input:</span>
            <Badge className={stats.ai === 20 ? "bg-red-500" : "bg-green-500"}>
              {stats.ai}
            </Badge>
          </div>
        )}
        
        {stats.map !== null && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Map Markers:</span>
            <Badge className={stats.map === 20 ? "bg-red-500" : "bg-green-500"}>
              {stats.map}
            </Badge>
          </div>
        )}
      </div>
      
      {allCounts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          {isConsistent && !has20Limit && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs">Pipeline consistent</span>
            </div>
          )}
          {has20Limit && (
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">20-item limit detected!</span>
            </div>
          )}
          {!isConsistent && !has20Limit && (
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">Counts inconsistent</span>
            </div>
          )}
        </div>
      )}
      
      {stats.alerts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-xs text-red-400 font-bold mb-1">Alerts:</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {stats.alerts.map((alert, i) => (
              <p key={i} className="text-xs text-red-300 truncate">
                {alert.substring(0, 50)}...
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}