import { Mail, BrainCircuit, Database, X } from 'lucide-react';
import { useWorkflowStore } from '../../../store/workflowStore';

const AVAILABLE_ACTIONS = [
  {
    type: 'SEND_EMAIL',
    title: 'Send Email',
    description: 'Send an email via standard SMTP',
    icon: <Mail className="w-5 h-5 text-blue-400" />,
    bg: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20'
  },
  {
    type: 'AI_ANALYZE',
    title: 'AI Analysis',
    description: 'Process data using OpenAI/Gemini models',
    icon: <BrainCircuit className="w-5 h-5 text-purple-400" />,
    bg: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20'
  },
  {
    type: 'SAVE_TO_DB',
    title: 'Save to Database',
    description: 'Insert or update a record in Postgres',
    icon: <Database className="w-5 h-5 text-green-400" />,
    bg: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20'
  }
];

export default function ActionPicker({ onClose }: { onClose: () => void }) {
  const addAction = useWorkflowStore((s) => s.addAction);

  const handleSelect = (type: string) => {
    addAction(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md h-full glass-panel rounded-none border-y-0 border-r-0 p-6 flex flex-col shadow-2xl animate-slide-up">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-white">Add Action Step</h2>
            <p className="text-sm text-white/50">Choose an action to add to your workflow</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto">
          {AVAILABLE_ACTIONS.map((action) => (
            <button
              key={action.type}
              onClick={() => handleSelect(action.type)}
              className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${action.bg}`}
            >
              <div className="p-2 rounded-lg bg-white/5">
                {action.icon}
              </div>
              <div>
                <h3 className="font-semibold text-white">{action.title}</h3>
                <p className="text-sm text-white/60 mt-1 leading-snug">{action.description}</p>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
