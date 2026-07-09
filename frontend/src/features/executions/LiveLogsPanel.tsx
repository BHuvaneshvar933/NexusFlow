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

export default function LiveLogsPanel({ executionId, onClose }: { executionId: string, onClose: () => void }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED'>('QUEUED');
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Scroll to bottom whenever logs change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    // Initialize Socket Connection
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const socket = io(BACKEND_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket, joining execution room', executionId);
      socket.emit('join:execution', executionId);
    });

    socket.on('execution:started', () => {
      setStatus('RUNNING');
    });

    socket.on('execution:log', (data) => {
      if (data.executionId === executionId) {
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
  }, [executionId]);

  return (
    <div className="fixed bottom-4 right-4 w-[450px] bg-surface border border-surface-border shadow-2xl overflow-hidden flex flex-col z-50 animate-slide-up rounded-xl">
      {/* Header */}
      <div className="p-3 border-b border-surface-border flex items-center justify-between bg-background/50">
        <div className="flex items-center gap-2 text-foreground">
          <Terminal className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wide">Live Execution Logs</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-medium">
            {status === 'QUEUED' && <><Loader2 className="w-3 h-3 animate-spin text-yellow-600" /> <span className="text-yellow-600">Queued</span></>}
            {status === 'RUNNING' && <><Loader2 className="w-3 h-3 animate-spin text-blue-500" /> <span className="text-blue-500">Running</span></>}
            {status === 'SUCCESS' && <><CheckCircle2 className="w-3 h-3 text-green-500" /> <span className="text-green-500">Completed</span></>}
            {status === 'FAILED' && <><XCircle className="w-3 h-3 text-red-500" /> <span className="text-red-500">Failed</span></>}
          </span>
          <button onClick={onClose} className="text-foreground/50 hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 h-[300px] overflow-y-auto font-mono text-xs flex flex-col gap-2">
        {status === 'QUEUED' && (
          <div className="text-muted">Waiting for BullMQ worker to pick up job...</div>
        )}
        
        {logs.map((log, i) => (
          <div key={i} className="flex flex-col gap-1">
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
            {log.error && (
              <div className="pl-24 text-red-500">Error: {log.error}</div>
            )}
            {log.data && (
              <div className="pl-24 pr-4 mt-1">
                <div className="bg-background border border-surface-border rounded-md p-2 overflow-x-auto text-foreground/80 whitespace-pre-wrap font-mono text-[11px]">
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
