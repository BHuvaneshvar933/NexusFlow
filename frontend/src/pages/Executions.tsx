import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, XCircle, Clock, Loader2, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { getAllExecutionsApi } from '../services/execution';
import { triggerWorkflowApi } from '../services/workflow';

export default function Executions() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedLogs, setSelectedLogs] = useState<any[] | null>(null);
  const [isReplaying, setIsReplaying] = useState<string | null>(null);

  useEffect(() => {
    setPageInput(page.toString());
    loadExecutions(page);
  }, [page, statusFilter]);

  const handlePageSubmit = () => {
    const val = parseInt(pageInput);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      setPage(val);
    } else {
      setPageInput(page.toString()); // Revert if invalid
    }
  };

  const loadExecutions = async (currentPage: number) => {
    try {
      setIsLoading(true);
      const res = await getAllExecutionsApi(currentPage, 10, statusFilter);
      setExecutions(res.data.executions);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load executions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplay = async (execution: any) => {
    try {
      setIsReplaying(execution.id);
      await triggerWorkflowApi(execution.workflowId, execution.triggerData || {});
      // Refresh the page to show the new execution instantly
      loadExecutions(page);
    } catch (err: any) {
      setError(err.message || 'Failed to replay execution');
    } finally {
      setIsReplaying(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'FAILED':
        return <XCircle className="w-3.5 h-3.5" />;
      case 'STARTED':
      case 'RUNNING':
        return <Loader2 className="w-3.5 h-3.5 animate-spin" />;
      case 'PENDING':
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS': return 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20';
      case 'FAILED': return 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20';
      case 'STARTED':
      case 'RUNNING': return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'PENDING': return 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20';
      default: return 'text-foreground/70 bg-surface border-surface-border';
    }
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) return 'Running...';
    const durationMs = new Date(end).getTime() - new Date(start).getTime();
    if (durationMs < 1000) return `${durationMs}ms`;
    return `${(durationMs / 1000).toFixed(2)}s`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            Execution History
          </h1>
          <p className="text-muted mt-2 text-lg">View recent workflow runs across your workspace.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1); // Reset to page 1 on filter change
            }}
            className="input-field py-2"
          >
            <option value="ALL">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
            <option value="pending">Pending</option>
          </select>

          <button 
            onClick={() => loadExecutions(page)}
            className="btn-secondary py-2 px-4 whitespace-nowrap"
          >
            Refresh Logs
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="glass-panel overflow-hidden relative min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        
        {executions.length === 0 && !isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-center text-muted h-full absolute inset-0">
            <Activity className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-lg font-medium text-foreground/80">No executions found.</p>
            <p className="text-sm mt-1">Try adjusting your filters or trigger a workflow.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-surface-border">
                  <th className="p-4 font-semibold text-foreground/70 text-sm">Status</th>
                  <th className="p-4 font-semibold text-foreground/70 text-sm">Workflow</th>
                  <th className="p-4 font-semibold text-foreground/70 text-sm">Started At</th>
                  <th className="p-4 font-semibold text-foreground/70 text-sm">Duration</th>
                  <th className="p-4 font-semibold text-foreground/70 text-sm">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {executions.map((exec) => (
                  <tr key={exec.id} className="hover:bg-background/50 transition-colors">
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${getStatusColor(exec.status)}`}>
                        {getStatusIcon(exec.status)}
                        <span className="capitalize">{exec.status.toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{exec.workflow?.name || 'Unknown Workflow'}</div>
                      <div className="text-xs font-mono text-muted mt-0.5">{exec.workflowId}</div>
                    </td>
                    <td className="p-4 text-sm text-foreground/80">
                      {new Date(exec.startedAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm font-mono text-foreground/80">
                      {formatDuration(exec.startedAt, exec.completedAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        {exec.error && (
                          <div className="text-xs text-red-500 dark:text-red-400 font-mono truncate max-w-xs" title={exec.error}>
                            {exec.error}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-1">
                          <button 
                            onClick={() => setSelectedLogs(exec.logs || [])}
                            className="text-xs text-primary hover:underline font-medium"
                          >
                            View Logs
                          </button>
                          {exec.status.toLowerCase() === 'failed' && (
                            <button
                              onClick={() => handleReplay(exec)}
                              disabled={isReplaying === exec.id}
                              className="text-xs text-orange-500 hover:underline font-medium flex items-center gap-1 disabled:opacity-50"
                            >
                              <RotateCw className={`w-3 h-3 ${isReplaying === exec.id ? 'animate-spin' : ''}`} />
                              Replay
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {executions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="flex items-center text-sm text-foreground/70">
            Page 
            <input 
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePageSubmit();
              }}
              onBlur={handlePageSubmit}
              className="w-16 px-2 py-1 mx-2 text-center rounded bg-surface border border-surface-border text-foreground outline-none focus:ring-1 focus:ring-primary appearance-none"
            />
            of <span className="font-medium text-foreground ml-1">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-surface-border bg-surface text-sm font-medium hover:bg-surface-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-surface-border bg-surface text-sm font-medium hover:bg-surface-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {selectedLogs && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-3xl flex flex-col max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-surface-border bg-background">
              <h2 className="text-lg font-bold text-foreground">Execution Logs</h2>
              <button onClick={() => setSelectedLogs(null)} className="text-foreground/50 hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto bg-background/50 font-mono text-xs space-y-4">
              {selectedLogs.length === 0 ? (
                <div className="text-muted italic">No logs available for this execution.</div>
              ) : (
                selectedLogs.map((log: any, idx: number) => (
                  <div key={idx} className="flex flex-col gap-1 border-b border-surface-border/50 pb-3 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-muted">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className="text-primary font-semibold">{log.step}</span>
                      <span className={`font-bold ${
                        log.status === 'STARTED' ? 'text-blue-500' :
                        log.status === 'SUCCESS' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {log.status}
                      </span>
                      {log.durationMs && <span className="text-muted">{log.durationMs}ms</span>}
                    </div>
                    {log.error && <div className="text-red-500 ml-4">Error: {log.error}</div>}
                    {log.data && (
                      <div className="ml-4 mt-2 bg-surface border border-surface-border rounded p-2 overflow-x-auto">
                        <pre className="text-foreground/80">{JSON.stringify(log.data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
