import { useState, useEffect } from 'react';
import { Database, Loader2, Trash2, FolderOpen } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getCollectionsApi, getDocumentsApi, deleteDocumentApi } from '../services/datastore';

export default function DataStore() {
  const { activeWorkspaceId } = useAuthStore();
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDocsLoading, setIsDocsLoading] = useState(false);

  useEffect(() => {
    if (activeWorkspaceId) {
      loadCollections();
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (selectedCollection && activeWorkspaceId) {
      loadDocuments(selectedCollection);
    }
  }, [selectedCollection, activeWorkspaceId]);

  const loadCollections = async () => {
    try {
      setIsLoading(true);
      const res = await getCollectionsApi(activeWorkspaceId!);
      setCollections(res.data);
      if (res.data.length > 0 && !selectedCollection) {
        setSelectedCollection(res.data[0].name);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async (collection: string) => {
    try {
      setIsDocsLoading(true);
      const res = await getDocumentsApi(activeWorkspaceId!, collection);
      setDocuments(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDocsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteDocumentApi(activeWorkspaceId!, id);
      setDocuments(docs => docs.filter(d => d.id !== id));
      // Update count locally
      setCollections(cols => cols.map(c => c.name === selectedCollection ? { ...c, count: c.count - 1 } : c));
    } catch (error) {
      console.error(error);
    }
  };

  // Extract dynamic columns from the data
  const columns = documents.length > 0 
    ? Array.from(new Set(documents.flatMap(doc => Object.keys(doc.data)))) 
    : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-slide-up h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Database className="w-8 h-8 text-primary" />
          Data Store CMS
        </h1>
        <p className="text-muted mt-2 text-lg">View and manage data captured by your workflows.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        {/* Collections Sidebar */}
        <div className="w-full md:w-64 shrink-0 glass-panel overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-surface-border font-semibold text-foreground/80">
            Collections
          </div>
          {isLoading ? (
            <div className="flex-1 flex justify-center items-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : collections.length === 0 ? (
            <div className="p-4 text-sm text-muted text-center mt-4">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-20" />
              No collections found.
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {collections.map(c => (
                <button
                  key={c.name}
                  onClick={() => setSelectedCollection(c.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                    selectedCollection === c.name 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'hover:bg-surface-border text-foreground/80'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-background border border-surface-border">
                    {c.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Documents Table */}
        <div className="flex-1 glass-panel overflow-hidden flex flex-col">
          <div className="p-4 border-b border-surface-border flex items-center justify-between bg-background">
            <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
              {selectedCollection ? (
                <>
                  <FolderOpen className="w-5 h-5 text-primary" />
                  {selectedCollection}
                </>
              ) : 'Select a collection'}
            </h2>
            {selectedCollection && (
              <div className="text-sm text-muted">{documents.length} records</div>
            )}
          </div>
          
          <div className="flex-1 overflow-auto bg-background/50 relative">
            {isDocsLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {!selectedCollection ? (
              <div className="flex h-full items-center justify-center text-muted p-8 text-center">
                Select a collection from the sidebar to view its records.
              </div>
            ) : documents.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted p-8 text-center">
                This collection is empty.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-surface/50 border-b border-surface-border sticky top-0 z-20 backdrop-blur-md">
                    <th className="p-3 font-semibold text-foreground/70 border-r border-surface-border whitespace-nowrap">ID</th>
                    <th className="p-3 font-semibold text-foreground/70 border-r border-surface-border whitespace-nowrap">Created At</th>
                    {columns.map(col => (
                      <th key={col} className="p-3 font-semibold text-foreground/70 border-r border-surface-border whitespace-nowrap capitalize">
                        {col}
                      </th>
                    ))}
                    <th className="p-3 font-semibold text-foreground/70 text-right sticky right-0 bg-surface/50 backdrop-blur-md shadow-[-4px_0_10px_rgba(0,0,0,0.05)] dark:shadow-[-4px_0_10px_rgba(0,0,0,0.2)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-background/80 transition-colors group">
                      <td className="p-3 font-mono text-xs text-muted border-r border-surface-border truncate max-w-[100px]">{doc.id}</td>
                      <td className="p-3 text-muted border-r border-surface-border whitespace-nowrap">
                        {new Date(doc.createdAt).toLocaleString()}
                      </td>
                      {columns.map(col => (
                        <td key={col} className="p-3 border-r border-surface-border text-foreground/90 max-w-[200px] truncate">
                          {typeof doc.data[col] === 'object' ? JSON.stringify(doc.data[col]) : String(doc.data[col] ?? '')}
                        </td>
                      ))}
                      <td className="p-3 text-right sticky right-0 bg-background group-hover:bg-background/80 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] dark:shadow-[-4px_0_10px_rgba(0,0,0,0.2)] transition-colors">
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg opacity-0 md:opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
