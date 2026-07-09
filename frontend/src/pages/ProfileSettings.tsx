import { useState } from 'react';
import { User, Mail, Shield, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function ProfileSettings() {
  const user = useAuthStore(s => s.user);
  
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // In a real implementation, we would call an update profile API here.
    setTimeout(() => {
      setIsSaving(false);
      alert('Profile updated successfully! (Mocked)');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <User className="w-8 h-8 text-primary" />
          Profile Settings
        </h1>
        <p className="text-muted mt-2 text-lg">Manage your personal account details.</p>
      </div>

      <div className="glass-panel p-8">
        <form onSubmit={handleSave} className="space-y-6 max-w-xl">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Personal Information
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-10"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className="input-field pl-10 opacity-70 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted">Email address cannot be changed directly. Contact support if you need to update it.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-surface-border flex justify-end">
            <button 
              type="submit"
              disabled={isSaving}
              className="btn-primary py-2 px-6 flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
