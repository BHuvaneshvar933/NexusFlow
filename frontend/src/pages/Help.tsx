import { BookOpen, Webhook, Clock, Code2, Users, Zap, Link2, Sparkles, PlayCircle, Database, Mail, Globe, BrainCircuit, Share2, Copy, Repeat } from 'lucide-react';
import { useState } from 'react';

const DOCS = [
  {
    id: 'basics',
    icon: <Users className="w-5 h-5 text-indigo-500" />,
    title: 'Getting Started & Workspaces',
    description: 'Understand the core concepts of NexusFlow and how to collaborate.',
    content: (
      <div className="space-y-4">
        <h4 className="font-semibold text-foreground text-lg">What is NexusFlow?</h4>
        <p className="text-foreground/80 leading-relaxed">
          NexusFlow is a powerful automation engine that allows you to connect APIs, run background jobs, and execute custom logic without maintaining servers. You build <strong>Workflows</strong> consisting of a Trigger and multiple Actions.
        </p>

        <h4 className="font-semibold text-foreground text-lg mt-6">Workspaces & Collaboration</h4>
        <p className="text-foreground/80 leading-relaxed">
          Everything you build lives inside a <strong>Workspace</strong>. Workspaces are collaborative environments where you and your team share workflows, data stores, and execution logs.
        </p>
        <div className="bg-surface border border-surface-border p-4 rounded-xl mt-2 grid gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-foreground/80 text-sm"><strong>Owner:</strong> Full control, can delete the workspace.</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-foreground/80 text-sm"><strong>Admin:</strong> Can manage members and all workflows.</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-foreground/80 text-sm"><strong>Editor:</strong> Can build, edit, and run workflows.</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <span className="text-foreground/80 text-sm"><strong>Viewer:</strong> Can only view executions and workflows.</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'triggers',
    icon: <Zap className="w-5 h-5 text-yellow-500" />,
    title: 'Workflow Triggers',
    description: 'Learn how to start your workflows manually, on a schedule, or via APIs.',
    content: (
      <div className="space-y-6">
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground flex items-center gap-2"><PlayCircle className="w-4 h-4 text-green-500"/> Manual Triggers</h4>
          <p className="text-foreground/80 text-sm leading-relaxed">
            Run a workflow instantly by clicking "Run Now" on the dashboard. You can define a default JSON payload in the Trigger configuration to simulate external data during manual tests.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-foreground flex items-center gap-2"><Webhook className="w-4 h-4 text-blue-500"/> Webhook API</h4>
          <p className="text-foreground/80 text-sm leading-relaxed">
            Trigger a workflow when an event happens in an external app (like Stripe, GitHub, or Shopify). 
            Send a POST request to your unique Webhook URL. The JSON body sent in the request becomes available to all your workflow steps as <code>{`{{trigger.body}}`}</code>.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-purple-500"/> Scheduled Tasks (Cron)</h4>
          <p className="text-foreground/80 text-sm leading-relaxed">
            Set workflows to run automatically at specific intervals (e.g., every 5 minutes, every day). NexusFlow converts simple time intervals into standard Cron expressions internally and runs them reliably in the background queue.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'interpolation',
    icon: <Link2 className="w-5 h-5 text-cyan-500" />,
    title: 'Variables & Data Passing',
    description: 'How to pass data dynamically from one step to the next.',
    content: (
      <div className="space-y-4">
        <p className="text-foreground/80 leading-relaxed">
          NexusFlow features a powerful interpolation engine. You can dynamically inject data from previous steps into the configuration of any subsequent step using the double curly brace syntax: <code>{`{{ ... }}`}</code>.
        </p>

        <h4 className="font-semibold text-foreground text-lg mt-6">Accessing Trigger Data</h4>
        <p className="text-foreground/80">Use <code>trigger.body</code> to access the JSON sent by a Webhook or Manual run.</p>
        <pre className="bg-background border border-surface-border p-3 rounded-lg text-sm font-mono text-primary">
          {`{{trigger.body.customer.email}}`}
        </pre>

        <h4 className="font-semibold text-foreground text-lg mt-6">Accessing Previous Steps</h4>
        <p className="text-foreground/80">
          Every action is assigned a Sequence Number (1, 2, 3, etc.). You can access the exact JSON output of any completed step using <code>steps['sequence_number']</code>.
        </p>
        <pre className="bg-background border border-surface-border p-3 rounded-lg text-sm font-mono text-primary">
          {`// Get the status code from step 1 (HTTP Request)
{{steps['1'].status}}

// Get the AI analysis result from step 2
{{steps['2'].result}}

// Get a dynamically created property from step 3 (Custom Code)
{{steps['3'].totalPrice}}`}
        </pre>
      </div>
    )
  },
  {
    id: 'actions',
    icon: <Sparkles className="w-5 h-5 text-pink-500" />,
    title: 'Built-in Actions',
    description: 'Discover the powerful actions you can add to your workflows.',
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-surface-border p-4 rounded-xl">
          <Repeat className="w-6 h-6 text-pink-500 mb-2" />
          <h4 className="font-semibold text-foreground">Loop / Iterator</h4>
          <p className="text-sm text-foreground/70 mt-1">Takes an array of data and repeats all subsequent actions for each item in the array. Access the current item using <code>{`{{loop.item}}`}</code> (max 50 loops).</p>
        </div>
        <div className="bg-surface border border-surface-border p-4 rounded-xl">
          <Globe className="w-6 h-6 text-blue-500 mb-2" />
          <h4 className="font-semibold text-foreground">HTTP Request</h4>
          <p className="text-sm text-foreground/70 mt-1">Make GET/POST/PUT requests to external APIs. Pass headers, query params, and JSON bodies dynamically.</p>
        </div>
        <div className="bg-surface border border-surface-border p-4 rounded-xl">
          <BrainCircuit className="w-6 h-6 text-purple-500 mb-2" />
          <h4 className="font-semibold text-foreground">AI Analyze</h4>
          <p className="text-sm text-foreground/70 mt-1">Pass any text or JSON to an LLM with a custom prompt to categorize, summarize, or extract data intelligently.</p>
        </div>
        <div className="bg-surface border border-surface-border p-4 rounded-xl">
          <Database className="w-6 h-6 text-emerald-500 mb-2" />
          <h4 className="font-semibold text-foreground">Save to Database</h4>
          <p className="text-sm text-foreground/70 mt-1">Instantly persist JSON data to NexusFlow's built-in Data Stores. Great for building quick lead capturing forms.</p>
        </div>
        <div className="bg-surface border border-surface-border p-4 rounded-xl">
          <Mail className="w-6 h-6 text-orange-500 mb-2" />
          <h4 className="font-semibold text-foreground">Send Email</h4>
          <p className="text-sm text-foreground/70 mt-1">Trigger transactional emails directly from your workflow. Inject variables into the subject and body.</p>
        </div>
      </div>
    )
  },
  {
    id: 'code',
    icon: <Code2 className="w-5 h-5 text-red-500" />,
    title: 'Code & Conditions',
    description: 'Use raw JavaScript to control flow and transform data.',
    content: (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-foreground text-lg">Custom Code Action</h4>
          <p className="text-foreground/80 mt-1 text-sm leading-relaxed">
            Write sandboxed JavaScript. The <code>variables</code> object contains the outputs of all previous steps (e.g. <code>variables['1']</code>). 
            Write your final data to the <code>output</code> object, which will be accessible to the next steps.
          </p>
          <pre className="bg-background border border-surface-border p-4 rounded-lg text-sm font-mono text-foreground overflow-x-auto mt-3">
{`// Map over an array and calculate a total
const items = variables['1'].http_response.data;
let total = 0;
for (const item of items) {
  total += item.price;
}

output.totalPrice = total;
output.summary = "Processed " + items.length + " items.";`}
          </pre>
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-lg">Condition Action</h4>
          <p className="text-foreground/80 mt-1 text-sm leading-relaxed">
            Halts the workflow immediately if your JavaScript expression evaluates to <code>false</code>. 
            Useful for filtering out bad requests or checking status codes before proceeding.
          </p>
          <pre className="bg-background border border-surface-border p-4 rounded-lg text-sm font-mono text-foreground overflow-x-auto mt-3">
{`// Only proceed if step 1 returned a 200 OK
variables['1'].status === 200

// Only proceed if the webhook is of a specific type
trigger.body.type === "payment_intent.succeeded"`}
          </pre>
        </div>
      </div>
    )
  },

  {
    id: 'datastore',
    icon: <Database className="w-5 h-5 text-emerald-500" />,
    title: 'Data Store (NoSQL)',
    description: 'Use the built-in database to capture and manage data.',
    content: (
      <div className="space-y-4">
        <p className="text-foreground/80 leading-relaxed">
          NexusFlow includes a fully functional <strong>NoSQL database engine</strong> built directly into your workspaces. You do not need to set up external databases like Airtable, MongoDB, or Google Sheets to store your automation data!
        </p>

        <h4 className="font-semibold text-foreground text-lg mt-6">Workflow Operations</h4>
        <p className="text-foreground/80 leading-relaxed text-sm">
          Use the <strong>Database Operation</strong> action node in your workflows to perform CRUD (Create, Read, Update, Delete) and Search operations automatically.
        </p>
        <ul className="list-disc list-inside text-foreground/80 text-sm space-y-1 mt-2 mb-4">
          <li><strong>Create:</strong> Insert a new JSON document into a collection.</li>
          <li><strong>Read:</strong> Fetch a document by its ID.</li>
          <li><strong>Update:</strong> Overwrite an existing document by ID.</li>
          <li><strong>Delete:</strong> Remove a document by ID.</li>
          <li><strong>Search:</strong> Perform a JSON exact-match query (e.g. <code>{`{"email": "test@test.com"}`}</code>) to find matching documents.</li>
        </ul>

        <h4 className="font-semibold text-foreground text-lg mt-6">Data Store CMS UI</h4>
        <p className="text-foreground/80 leading-relaxed text-sm">
          Navigate to the <strong>Data Store</strong> tab to view and manage your database collections via a beautiful graphical interface. You can create collections manually, insert raw JSON documents, edit existing records, and delete rows without writing any code.
        </p>
      </div>
    )
  },
  {
    id: 'templates',
    icon: <Share2 className="w-5 h-5 text-indigo-400" />,
    title: 'Templates & Workflow Sharing',
    description: 'Learn how to securely share your workflows globally, collaborate across workspaces, and jumpstart your automation projects using the official Template Library.',
    content: (
      <div className="space-y-8">
        {/* Introduction section */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-3">Overview of Sharing in NexusFlow</h3>
          <p className="text-foreground/80 leading-relaxed">
            Collaboration is at the heart of NexusFlow. Rather than rebuilding the same automation tasks repeatedly, you can seamlessly share any of your workflows with the world. Sharing generates a highly secure, read-only version of your workflow that anyone can view and instantly duplicate into their own Workspace. Additionally, NexusFlow maintains an ever-growing library of official templates to help you build complex logic in seconds.
          </p>
        </section>

        {/* Deep dive into Sharing */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4 border-b border-surface-border pb-2">Sharing Your Custom Workflows</h3>
          <p className="text-foreground/80 leading-relaxed mb-4 text-sm">
            Whether you are sharing an automation solution with a colleague, writing a blog post, or providing technical support, sharing a workflow is a 1-click process. 
          </p>
          
          <div className="bg-surface border border-surface-border p-5 rounded-xl shadow-sm mb-6">
            <h4 className="font-semibold flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center bg-primary text-white w-6 h-6 rounded-full text-xs">1</span>
              How to share a workflow
            </h4>
            <ol className="list-decimal list-inside space-y-3 text-sm text-foreground/80 ml-2">
              <li>Navigate to your desired workflow from the <strong>Dashboard</strong> or <strong>Builder</strong>.</li>
              <li>Ensure your latest logic is saved by clicking the <strong>Save Draft</strong> button.</li>
              <li>Click the <strong>Share</strong> button located in the top-right navigation bar of the Builder.</li>
              <li>A modal will instantly appear containing your secure, public link (e.g., <code>https://your-domain.com/shared/xyz123</code>).</li>
              <li>Click the <strong>Copy</strong> icon and share it anywhere!</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-background border border-surface-border p-4 rounded-xl">
              <h5 className="font-semibold text-foreground mb-1 text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" /> Read-Only Preview
              </h5>
              <p className="text-xs text-foreground/70 leading-relaxed">
                When a user opens your shared link, they are greeted by a fully interactive, but strictly read-only, canvas. They can inspect your Triggers, view the configuration of your Actions (like HTTP headers or URLs), and understand your workflow architecture without altering your original file.
              </p>
            </div>
            <div className="bg-background border border-surface-border p-4 rounded-xl">
              <h5 className="font-semibold text-foreground mb-1 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-green-500" /> Privacy & Security First
              </h5>
              <p className="text-xs text-foreground/70 leading-relaxed">
                Your execution logs, live data, and past runs are <strong>never</strong> shared. When someone duplicates your workflow, they receive a clean, blank slate. Your secret environment variables and API keys are not exposed to the public.
              </p>
            </div>
          </div>
        </section>

        {/* Deep dive into Templates */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4 border-b border-surface-border pb-2">The Official Template Library</h3>
          <p className="text-foreground/80 leading-relaxed mb-4 text-sm">
            We understand that starting from a blank canvas can be daunting. The <strong>Template Library</strong> is a curated collection of production-ready workflows built by the NexusFlow team.
          </p>

          <ul className="space-y-4 text-sm text-foreground/80">
            <li className="flex gap-3">
              <div className="shrink-0 mt-0.5"><BookOpen className="w-5 h-5 text-indigo-500" /></div>
              <div>
                <strong className="text-foreground block mb-1">Browsing the Library</strong>
                Access the Template Library by clicking <strong>Templates</strong> in the top navigation bar. You can browse through various categories such as Data Syncing, E-commerce, Notifications, and Webhooks.
              </div>
            </li>
            <li className="flex gap-3">
              <div className="shrink-0 mt-0.5"><Copy className="w-5 h-5 text-orange-500" /></div>
              <div>
                <strong className="text-foreground block mb-1">1-Click Duplication</strong>
                Found a template you like? Click <strong>Use Template</strong>. NexusFlow will instantly clone the entire node structure, trigger configurations, and custom code directly into your active Workspace. You'll be redirected to the Builder immediately to start tweaking it.
              </div>
            </li>
          </ul>
        </section>

        {/* Best Practices / Warning */}
        <section>
          <div className="bg-primary/5 border border-primary/20 p-5 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <h4 className="font-semibold text-primary flex items-center gap-2 text-lg mb-2 relative z-10">
              <Sparkles className="w-5 h-5" /> Post-Duplication Best Practices
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed relative z-10 mb-4">
              When you duplicate any workflow (whether from a shared link or the official Template Library), the new workflow is created in an <strong>Inactive</strong> state. To ensure a smooth deployment, always follow this checklist:
            </p>
            <ul className="list-disc list-inside text-sm text-foreground/80 space-y-2 relative z-10 ml-2">
              <li><strong>Verify Connections:</strong> Check your HTTP Request nodes and ensure you have entered your personal API Keys in the Headers.</li>
              <li><strong>Update Webhook URLs:</strong> If the template relies on a Webhook Trigger, copy your new, unique URL and paste it into the external service (like Stripe or Shopify).</li>
              <li><strong>Test Run:</strong> Use the "Run Now" feature on the Dashboard to execute a manual test and verify your logic before deploying.</li>
              <li><strong>Deploy:</strong> Click the <strong>Deploy</strong> button in the Builder to activate your workflow!</li>
            </ul>
          </div>
        </section>
      </div>
    )
  }
];

export default function Help() {
  const [activeTab, setActiveTab] = useState(DOCS[0].id);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-4.5rem)] flex flex-col gap-6 animate-slide-up pb-4">
      <div className="bg-surface border border-surface-border px-6 py-4 rounded-2xl shadow-sm relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 relative z-10">
          <BookOpen className="w-6 h-6 text-primary" />
          Documentation Hub
        </h1>
        <p className="text-muted mt-1 text-sm relative z-10 max-w-2xl">
          Everything you need to know to build powerful, scalable automated workflows in NexusFlow.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-72 shrink-0 flex flex-col gap-2 overflow-y-auto pb-4 pr-2">
          {DOCS.map(doc => (
            <button
              key={doc.id}
              onClick={() => setActiveTab(doc.id)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                activeTab === doc.id 
                  ? 'bg-surface border-primary/50 shadow-[0_2px_10px_rgba(255,79,0,0.1)] ring-1 ring-primary/20 text-foreground' 
                  : 'bg-transparent border-transparent hover:bg-surface/50 text-foreground/70 hover:text-foreground'
              }`}
            >
              <div className={`p-2 rounded-lg shadow-sm border ${activeTab === doc.id ? 'bg-background border-surface-border' : 'bg-surface border-surface-border/50'}`}>
                {doc.icon}
              </div>
              <span className="font-medium">{doc.title}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-panel p-6 sm:p-10 overflow-y-auto">
          {DOCS.map(doc => doc.id === activeTab && (
            <div key={doc.id} className="animate-fade-in flex flex-col h-full">
              <div className="flex items-center gap-4 border-b border-surface-border pb-6 mb-8">
                <div className="p-3 rounded-xl bg-background shadow-sm border border-surface-border">
                  {doc.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{doc.title}</h2>
                  <p className="text-muted mt-1 text-sm">{doc.description}</p>
                </div>
              </div>
              
              <div className="prose prose-sm dark:prose-invert max-w-none flex-1 text-base">
                {doc.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
