import { useState } from 'react';
import { useWorkflowStore } from '../../../store/workflowStore';
import { Braces } from 'lucide-react';

export default function VariablePicker({ onSelect }: { onSelect: (variable: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const actions = useWorkflowStore(s => s.actions);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors mt-1"
        type="button"
      >
        <Braces className="w-3 h-3" />
        Insert Variable
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 bg-black/40 border border-surface-border rounded-lg text-sm">
      <div className="flex justify-between items-center mb-2 text-white/50 text-xs font-semibold uppercase">
        Available Variables
        <button onClick={() => setIsOpen(false)} className="hover:text-white" type="button">Close</button>
      </div>
      
      <div className="space-y-3">
        {/* Trigger Variables */}
        <div>
          <div className="text-white/80 font-medium mb-1 text-xs">Trigger</div>
          <button 
            type="button"
            onClick={() => onSelect('{{trigger.body}}')}
            className="block w-full text-left px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/10 rounded"
          >
            {"{{trigger.body}}"}
          </button>
        </div>

        {/* Previous Action Variables */}
        {actions.map(a => (
          <div key={a.id}>
            <div className="text-white/80 font-medium mb-1 text-xs mt-2">Step {a.sequence}: {a.actionType}</div>
            
            {a.actionType === 'HTTP_REQUEST' && (
              <>
                <button type="button" onClick={() => onSelect(`{{steps.${a.sequence}.http_response}}`)} className="block w-full text-left px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/10 rounded">{"{{steps." + a.sequence + ".http_response}}"}</button>
                <button type="button" onClick={() => onSelect(`{{steps.${a.sequence}.status}}`)} className="block w-full text-left px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/10 rounded">{"{{steps." + a.sequence + ".status}}"}</button>
              </>
            )}
            
            {a.actionType === 'CUSTOM_CODE' && (
              <button type="button" onClick={() => onSelect(`{{steps.${a.sequence}.result}}`)} className="block w-full text-left px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/10 rounded">{"{{steps." + a.sequence + ".result}}"}</button>
            )}

            {a.actionType === 'AI_ANALYZE' && (
              <button type="button" onClick={() => onSelect(`{{steps.${a.sequence}.result}}`)} className="block w-full text-left px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/10 rounded">{"{{steps." + a.sequence + ".result}}"}</button>
            )}
            
            {!['HTTP_REQUEST', 'CUSTOM_CODE', 'AI_ANALYZE'].includes(a.actionType) && (
              <button type="button" onClick={() => onSelect(`{{steps.${a.sequence}.data}}`)} className="block w-full text-left px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/10 rounded">{"{{steps." + a.sequence + ".data}}"}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
