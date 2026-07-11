import { X } from 'lucide-react';
import { useWorkflowStore } from '../../../store/workflowStore';
import VariablePicker from './VariablePicker';

export default function ActionConfigSidebar({ 
  actionId, 
  onClose 
}: { 
  actionId: string, 
  onClose: () => void 
}) {
  const { actions, updateActionConfig } = useWorkflowStore();
  const action = actions.find(a => a.id === actionId);

  if (!action) return null;

  const handleChange = (key: string, value: any) => {
    updateActionConfig(actionId, {
      ...action.config,
      [key]: value
    });
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      <div className="fixed top-0 right-0 h-full w-[400px] glass-panel bg-surface border-l border-surface-border z-50 p-6 flex flex-col shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-foreground">Configure Action</h2>
            <p className="text-muted text-sm mt-1">{action.actionType.replace(/_/g, ' ')}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-surface-border rounded-full transition-colors text-foreground/50 hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {action.actionType === 'SEND_EMAIL' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Recipient Email</label>
                <input 
                  type="email" 
                  value={action.config.to || ''}
                  onChange={(e) => handleChange('to', e.target.value)}
                  placeholder="name@example.com"
                  className="input-field"
                />
                <VariablePicker currentSequence={action.sequence} onSelect={(val) => handleChange('to', (action.config.to || '') + val)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Subject</label>
                <input 
                  type="text" 
                  value={action.config.subject || ''}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="Email subject"
                  className="input-field"
                />
                <VariablePicker currentSequence={action.sequence} onSelect={(val) => handleChange('subject', (action.config.subject || '') + val)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Body</label>
                <textarea 
                  value={action.config.body || ''}
                  onChange={(e) => handleChange('body', e.target.value)}
                  placeholder="Email body..."
                  className="input-field min-h-[120px] resize-y"
                />
                <VariablePicker currentSequence={action.sequence} onSelect={(val) => handleChange('body', (action.config.body || '') + val)} />
              </div>
            </>
          )}

          {action.actionType === 'AI_ANALYZE' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Prompt</label>
              <p className="text-xs text-muted mb-2">You can use {"{{variables}}"} from previous steps.</p>
              <textarea 
                value={action.config.prompt || ''}
                onChange={(e) => handleChange('prompt', e.target.value)}
                placeholder="Analyze the following data: {{trigger.data}}"
                className="input-field min-h-[200px] resize-y font-mono text-sm"
              />
              <VariablePicker currentSequence={action.sequence} onSelect={(val) => handleChange('prompt', (action.config.prompt || '') + val)} />
            </div>
          )}

          {action.actionType === 'SAVE_TO_DB' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Operation</label>
                <select 
                  value={action.config.operation || 'CREATE'}
                  onChange={(e) => handleChange('operation', e.target.value)}
                  className="input-field"
                >
                  <option value="CREATE">Create Document</option>
                  <option value="READ">Read Document</option>
                  <option value="UPDATE">Update Document</option>
                  <option value="DELETE">Delete Document</option>
                  <option value="SEARCH">Search Documents</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Collection Name</label>
                <input 
                  type="text" 
                  value={action.config.table || ''}
                  onChange={(e) => handleChange('table', e.target.value)}
                  placeholder="e.g. leads"
                  className="input-field"
                />
              </div>

              {['READ', 'UPDATE', 'DELETE'].includes(action.config.operation) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">Document ID</label>
                  <input 
                    type="text" 
                    value={action.config.documentId || ''}
                    onChange={(e) => handleChange('documentId', e.target.value)}
                    placeholder="e.g. {{steps.0.id}}"
                    className="input-field font-mono text-sm"
                  />
                  <VariablePicker currentSequence={action.sequence} onSelect={(val) => handleChange('documentId', (action.config.documentId || '') + val)} />
                </div>
              )}

              {action.config.operation === 'SEARCH' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">Search Query (JSON)</label>
                  <textarea 
                    value={action.config.query || ''}
                    onChange={(e) => handleChange('query', e.target.value)}
                    placeholder={'{\n  "email": "user@example.com"\n}'}
                    className="input-field min-h-[120px] font-mono text-sm"
                  />
                  <VariablePicker currentSequence={action.sequence} onSelect={(val) => handleChange('query', (action.config.query || '') + val)} />
                </div>
              )}

              {['CREATE', 'UPDATE'].includes(action.config.operation || 'CREATE') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">Document Data (JSON)</label>
                  <textarea 
                    value={action.config.data || ''}
                    onChange={(e) => handleChange('data', e.target.value)}
                    placeholder={'{\n  "status": "active"\n}'}
                    className="input-field min-h-[120px] font-mono text-sm"
                  />
                  <VariablePicker currentSequence={action.sequence} onSelect={(val) => handleChange('data', (action.config.data || '') + val)} />
                </div>
              )}
            </>
          )}

          {action.actionType === 'HTTP_REQUEST' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">URL</label>
                <input 
                  type="url" 
                  value={action.config.url || ''}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://api.example.com/data"
                  className="input-field font-mono text-sm"
                />
                <VariablePicker currentSequence={action.sequence} onSelect={(val) => handleChange('url', (action.config.url || '') + val)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Method</label>
                <select 
                  value={action.config.method || 'GET'}
                  onChange={(e) => handleChange('method', e.target.value)}
                  className="input-field"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">JSON Body</label>
                <textarea 
                  value={action.config.body || ''}
                  onChange={(e) => handleChange('body', e.target.value)}
                  placeholder={'{\n  "text": "{{steps.0.message}}"\n}'}
                  className="input-field min-h-[120px] font-mono text-sm"
                />
                <VariablePicker currentSequence={action.sequence} onSelect={(val) => handleChange('body', (action.config.body || '') + val)} />
              </div>
            </>
          )}

          {action.actionType === 'CUSTOM_CODE' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">JavaScript Code</label>
              <p className="text-xs text-muted mb-2">Write raw JS. Read from `input` and write to `output`. E.g., `output.total = input.price * 2;`</p>
              <textarea 
                value={action.config.code || ''}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder={'// Your custom code here\noutput.result = input.data + " processed";'}
                className="input-field min-h-[250px] resize-y font-mono text-sm"
              />
            </div>
          )}

          {action.actionType === 'CONDITION' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Filter Condition (JavaScript)</label>
              <p className="text-xs text-muted mb-2">Write a JS condition. The workflow stops if this evaluates to false. E.g., `variables['0'].http_response.status === 200` or `env.API_KEY !== undefined`</p>
              <input 
                type="text"
                value={action.config.condition || ''}
                onChange={(e) => handleChange('condition', e.target.value)}
                placeholder="e.g. steps['0'].status === 200"
                className="input-field font-mono text-sm"
              />
              <VariablePicker currentSequence={action.sequence} onSelect={(val) => handleChange('condition', (action.config.condition || '') + val)} formatAs="js" />
            </div>
          )}

          {action.actionType === 'ITERATOR' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Array Source</label>
              <p className="text-xs text-muted mb-2">Select an array to loop over. All actions below this one will execute for each item. Access the current item in subsequent steps using {'{{loop.item}}'} or {'{{loop.item.property}}'}. Limit: 50 items.</p>
              <input 
                type="text"
                value={action.config.arraySource || ''}
                onChange={(e) => handleChange('arraySource', e.target.value)}
                placeholder="e.g. {{trigger.body.customers}}"
                className="input-field font-mono text-sm"
              />
              <VariablePicker currentSequence={action.sequence} onSelect={(val) => handleChange('arraySource', (action.config.arraySource || '') + val)} />
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-surface-border mt-auto">
          <button onClick={onClose} className="btn-primary w-full justify-center">
            Done
          </button>
        </div>
      </div>
    </>
  );
}
