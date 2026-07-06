import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Terminal, X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface LogEntry {
  step: string;
  status: 'STARTED' | 'SUCCESS' | 'FAILED';
  timestamp: string;
  durationMs?: number;
  error?: string;
  data?: any;
}

export default function LiveLogsPanel({ workflowId, onClose }: { workflowId: string, onClose: () => void }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED'>('QUEUED');
  const [executionId, setExecutionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Scroll to bottom whenever logs change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    // Initialize Socket Connection
    const socket = io('http://localhost:3000');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket, joining workflow room', workflowId);
      socket.emit('join:workflow', workflowId);
    });

    socket.on('execution:started', (data) => {
      setStatus('RUNNING');
      setExecutionId(data.executionId);
      // Once we know the executionId, we can join its specific room to get direct logs
      socket.emit('join:execution', data.executionId);
    });

    socket.on('execution:log', (data) => {
      if (data.executionId === executionId || !executionId) {
        setLogs((prev) => [...prev, data.log]);
      }
    });

    socket.on('execution:completed', () => {
      setStatus('SUCCESS');
    });

    socket.on('execution:failed', () => {
      setStatus('FAILED');
    });

    return () => {
      socket.disconnect();
    };
  }, [workflowId, executionId]);

  return (
    <div className="fixed bottom-4 right-4 w-[450px] glass-panel bg-[#0a0a0a]/95 border-surface-border shadow-2xl overflow-hidden flex flex-col z-50 animate-slide-up">
      {/* Header */}
      <div className="p-3 border-b border-surface-border flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2 text-white/80">
          <Terminal className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wide">Live Execution Logs</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-medium">
            {status === 'QUEUED' && <><Loader2 className="w-3 h-3 animate-spin text-yellow-400" /> <span className="text-yellow-400">Queued</span></>}
            {status === 'RUNNING' && <><Loader2 className="w-3 h-3 animate-spin text-blue-400" /> <span className="text-blue-400">Running</span></>}
            {status === 'SUCCESS' && <><CheckCircle2 className="w-3 h-3 text-green-400" /> <span className="text-green-400">Completed</span></>}
            {status === 'FAILED' && <><XCircle className="w-3 h-3 text-red-400" /> <span className="text-red-400">Failed</span></>}
          </span>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 h-[300px] overflow-y-auto font-mono text-xs flex flex-col gap-2">
        {status === 'QUEUED' && (
          <div className="text-white/40">Waiting for BullMQ worker to pick up job...</div>
        )}
        
        {logs.map((log, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-white/30">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className="text-primary font-semibold">{log.step}</span>
              <span className={`font-bold ${
                log.status === 'STARTED' ? 'text-blue-400' :
                log.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'
              }`}>
                {log.status}
              </span>
              {log.durationMs && <span className="text-white/30">{log.durationMs}ms</span>}
            </div>
            {log.error && (
              <div className="pl-24 text-red-400">Error: {log.error}</div>
            )}
            {log.data && (
              <div className="pl-24 pr-4 mt-1">
                <div className="bg-black/40 border border-white/5 rounded-md p-2 overflow-x-auto text-white/70 whitespace-pre-wrap font-mono text-[11px]">
                  {JSON.stringify(log.data, null, 2)}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
