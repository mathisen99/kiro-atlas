import { useState } from "preact/hooks";
import { atlasData } from "../shared/atlas.generated";

const workflow = ["Steering", "Requirements", "Design", "Tasks", "Code", "Hook refresh"];

function Icon({ name, className = "h-4 w-4" }: { name: "arrow" | "check" | "file" | "hook" | "spark" | "terminal"; className?: string }) {
  const paths = {
    arrow: <path d="m9 18 6-6-6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
    hook: <><path d="M18 8a6 6 0 0 1-12 0V5" /><path d="m3 8 3 3 3-3M12 14v7M9 18h6" /></>,
    spark: <path d="m12 3-1.4 3.6L7 8l3.6 1.4L12 13l1.4-3.6L17 8l-3.6-1.4L12 3ZM5 14l-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14Z" />,
    terminal: <><path d="m4 17 6-6-6-6M12 19h8" /></>
  };

  return <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24">{paths[name]}</svg>;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.22em] text-cyan-300">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      <p className="mt-3 text-base leading-7 text-zinc-400">{description}</p>
    </div>
  );
}

function Stat({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/10">
      <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{detail}</p>
    </div>
  );
}

function Progress({ completed, total }: { completed: number; total: number }) {
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between font-mono text-xs">
        <span className="text-zinc-500">{completed}/{total} tasks</span>
        <span className="text-cyan-300">{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function StatusDot({ available }: { available: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${available ? "text-emerald-300" : "text-zinc-600"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${available ? "bg-emerald-400" : "bg-zinc-700"}`} />
      {available ? "ready" : "missing"}
    </span>
  );
}

function SpecCard({ spec }: { spec: (typeof atlasData.specs)[number] }) {
  const total = spec.completedTasks + spec.incompleteTasks;
  return (
    <details className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 open:border-cyan-400/25">
      <summary className="cursor-pointer list-none p-6 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${spec.incompleteTasks ? "bg-amber-300" : "bg-emerald-400"}`} />
              <h3 className="font-mono text-base font-medium text-white">{spec.name}</h3>
            </div>
            <p className="mt-2 text-sm text-zinc-500">{spec.incompleteTasks ? `${spec.incompleteTasks} task left` : "Spec complete"}</p>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-zinc-500 transition group-open:rotate-90 group-open:text-cyan-300">
            <Icon name="arrow" />
          </span>
        </div>
        <div className="mt-6">
          <Progress completed={spec.completedTasks} total={total} />
        </div>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono">
          <span className="flex items-center gap-2 text-xs text-zinc-500">requirements <StatusDot available={spec.hasRequirements} /></span>
          <span className="flex items-center gap-2 text-xs text-zinc-500">design <StatusDot available={spec.hasDesign} /></span>
          <span className="flex items-center gap-2 text-xs text-zinc-500">tasks <StatusDot available={spec.hasTasks} /></span>
        </div>
      </summary>
      <div className="border-t border-white/10 px-6 py-6">
        {spec.firstIncompleteTask ? (
          <div className="mb-6 rounded-xl border border-amber-300/15 bg-amber-300/[0.06] p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-300/70">Next task</p>
            <p className="mt-2 text-sm text-amber-100">{spec.firstIncompleteTask}</p>
          </div>
        ) : null}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-500">Plan sections</p>
            <ul className="space-y-2 text-sm text-zinc-300">
              {[...spec.requirementHeadings, ...spec.designHeadings].map((heading) => <li className="flex gap-2" key={heading}><span className="text-cyan-400">/</span>{heading}</li>)}
            </ul>
          </div>
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-500">Tasks</p>
            <ul className="space-y-3">
              {spec.tasks.map((task) => (
                <li className="flex gap-3 text-sm" key={task.text}>
                  <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${task.completed ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-zinc-700 text-transparent"}`}>
                    <Icon className="h-3 w-3" name="check" />
                  </span>
                  <span className={task.completed ? "text-zinc-500 line-through decoration-zinc-700" : "text-zinc-200"}>{task.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {spec.referencedFiles.map((file) => <code className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-xs text-violet-300" key={file}>{file}</code>)}
        </div>
      </div>
    </details>
  );
}

function Command({ value, copied, onCopy }: { value: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-3 first:border-t-0">
      <code className="min-w-0 overflow-x-auto whitespace-nowrap text-xs text-zinc-300"><span className="mr-2 text-cyan-400">$</span>{value}</code>
      <button className="shrink-0 rounded-md border border-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-zinc-500 hover:border-cyan-300/30 hover:text-cyan-300" onClick={onCopy} type="button">{copied ? "copied" : "copy"}</button>
    </div>
  );
}

export function App() {
  const [copied, setCopied] = useState("");

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied(""), 1200);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#08090b] text-zinc-200 selection:bg-cyan-300 selection:text-black">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 opacity-[0.18]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/[0.07] blur-[120px]" />

      <header className="relative z-10 border-b border-white/[0.07] bg-[#08090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a className="flex items-center gap-3" href="#top">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-300"><Icon name="spark" /></span>
            <span className="font-mono text-sm font-semibold tracking-tight text-white">kiro/atlas</span>
          </a>
          <nav className="hidden items-center gap-6 font-mono text-xs text-zinc-500 sm:flex">
            <a className="hover:text-white" href="#specs">Specs</a>
            <a className="hover:text-white" href="#steering">Steering</a>
            <a className="hover:text-white" href="#map">Project map</a>
            <a className="hover:text-white" href="#learn">Learn Kiro</a>
          </nav>
          <span className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />generated</span>
        </div>
      </header>

      <div className="relative z-10" id="top">
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-20 sm:px-8 sm:pt-28">
          <div className="grid items-end gap-12 lg:grid-cols-[1.35fr_.65fr]">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400"><Icon className="h-3.5 w-3.5 text-violet-300" name="terminal" /> workspace intelligence, made visible</p>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.05em] text-white sm:text-7xl lg:text-[5.5rem]">Make the hidden <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 bg-clip-text text-transparent">.kiro</span> workspace visible.</h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400">See how persistent knowledge becomes requirements, design, tasks, and working code—all refreshed by one local hook.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5 font-mono shadow-2xl shadow-cyan-950/10">
              <div className="mb-4 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400/70" /><span className="h-2 w-2 rounded-full bg-amber-300/70" /><span className="h-2 w-2 rounded-full bg-emerald-400/70" /><span className="ml-auto text-[10px] text-zinc-600">atlas.status</span></div>
              <p className="text-xs text-zinc-500"><span className="text-cyan-400">→</span> scanning committed workspace</p>
              <p className="mt-2 text-xs text-zinc-500"><span className="text-emerald-400">✓</span> {atlasData.summary.specs} specs connected</p>
              <p className="mt-2 text-xs text-zinc-500"><span className="text-emerald-400">✓</span> {atlasData.summary.demoFiles} source files mapped</p>
              <p className="mt-4 border-t border-white/10 pt-4 text-xs text-zinc-300">next: <span className="text-amber-300">{atlasData.nextStep.task}</span></p>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat detail="feature workspaces" label="Specs" value={atlasData.summary.specs} />
            <Stat detail="persistent context" label="Steering" value={atlasData.summary.steeringFiles} />
            <Stat detail="local refresh" label="Hooks" value={atlasData.summary.hooks} />
            <Stat detail={`${atlasData.summary.completedTasks} of ${atlasData.summary.totalTasks} complete`} label="Task progress" value={`${atlasData.summary.progressPercent}%`} />
          </div>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">Workspace flow</p>
            <div className="flex min-w-[720px] items-center justify-between">
              {workflow.map((step, index) => (
                <div className="contents" key={step}>
                  <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] font-mono text-[10px] text-cyan-300">0{index + 1}</span><span className="text-sm text-zinc-300">{step}</span></div>
                  {index < workflow.length - 1 ? <Icon className="h-4 w-4 shrink-0 text-zinc-700" name="arrow" /> : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.07] bg-white/[0.018] py-20" id="specs">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <SectionHeading description="Specs turn an idea into an inspectable plan. Expand a card to follow its requirements, design decisions, tasks, and referenced files." eyebrow="01 / feature planning" title="Specs with a pulse" />
            <div className="grid gap-4 lg:grid-cols-2">{atlasData.specs.map((spec) => <SpecCard key={spec.name} spec={spec} />)}</div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8" id="steering">
          <SectionHeading description="Steering gives Kiro persistent project knowledge: what you are building, the technical boundaries, and where everything belongs." eyebrow="02 / persistent context" title="Knowledge that stays in the room" />
          <div className="grid gap-4 lg:grid-cols-3">
            {atlasData.steering.map((document, index) => (
              <article className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 hover:border-violet-300/25" key={document.path}>
                <div className="flex items-center justify-between"><span className="font-mono text-xs text-violet-300">0{index + 1}</span><Icon className="h-5 w-5 text-zinc-700 group-hover:text-violet-300" name="file" /></div>
                <h3 className="mt-8 text-xl font-medium text-white">{document.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{document.summary}</p>
                <ul className="mt-6 space-y-2 border-t border-white/10 pt-5">
                  {document.bullets.slice(0, 3).map((bullet) => <li className="flex gap-2 text-xs leading-5 text-zinc-500" key={bullet}><span className="text-cyan-400">+</span>{bullet}</li>)}
                </ul>
                <code className="mt-6 block truncate text-[11px] text-zinc-600">{document.path}</code>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-white/[0.07] bg-gradient-to-b from-cyan-950/[0.08] to-transparent py-20">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-[.7fr_1.3fr]">
            <SectionHeading description="A Kiro CLI v3 PostFileSave hook watches the learning artifacts and regenerates this page's data locally." eyebrow="03 / automation" title="Refresh, never deploy" />
            <div className="space-y-4">
              {atlasData.hooks.map((hook) => (
                <article className="rounded-2xl border border-white/10 bg-black/30 p-6" key={hook.path}>
                  <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-300"><Icon name="hook" /></span><div><h3 className="font-medium text-white">{hook.name}</h3><p className="mt-1 text-xs text-zinc-500">{hook.description}</p></div></div><span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2 py-1 font-mono text-[10px] uppercase text-emerald-300">{hook.enabled ? "enabled" : "disabled"}</span></div>
                  <dl className="mt-6 grid gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 font-mono text-xs sm:grid-cols-2">
                    <div><dt className="text-zinc-600">trigger</dt><dd className="mt-1 text-zinc-300">{hook.trigger}</dd></div>
                    <div><dt className="text-zinc-600">action</dt><dd className="mt-1 text-zinc-300">{hook.actionType}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-zinc-600">matcher</dt><dd className="mt-1 break-all text-violet-300">{hook.matcher}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-zinc-600">command</dt><dd className="mt-1 text-cyan-300">{hook.command}</dd></div>
                  </dl>
                </article>
              ))}
              <p className="rounded-xl border border-amber-300/15 bg-amber-300/[0.05] px-4 py-3 text-sm text-amber-100"><strong className="font-medium">Deployment is manual</strong> and is not triggered on every save.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8" id="map">
          <SectionHeading description="The fictional Quest Board is small on purpose. Atlas maps exported symbols and shows which specs point to each file—without exposing full source code." eyebrow="04 / implementation" title="From tasks to files" />
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><span className="font-mono text-xs text-zinc-500">demo/</span><span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">{atlasData.projectFiles.length} files</span></div>
            {atlasData.projectFiles.map((file) => (
              <div className="grid gap-4 border-b border-white/[0.07] px-5 py-5 last:border-b-0 md:grid-cols-[1fr_1.2fr_1fr] md:items-center" key={file.path}>
                <div className="flex items-center gap-3"><Icon className="h-4 w-4 text-cyan-400" name="file" /><div><p className="font-mono text-sm text-zinc-200">{file.name}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">{file.extension}</p></div></div>
                <div className="flex flex-wrap gap-2">{file.symbols.map((symbol) => <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-zinc-400" key={`${symbol.kind}-${symbol.name}`}><span className="text-violet-300">{symbol.kind}</span> {symbol.name}</span>)}</div>
                <div className="flex flex-wrap gap-2 md:justify-end">{file.referencedBy.map((spec) => <span className="rounded-full bg-cyan-300/[0.07] px-2 py-1 font-mono text-[10px] text-cyan-300" key={spec}>{spec}</span>)}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-white/[0.07] bg-white/[0.018] py-20" id="learn">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <SectionHeading description="A practical field guide to the pieces you will touch most often while working with Kiro." eyebrow="05 / field guide" title="Learn the workspace" />
            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Steering", "Persistent project instructions", ".kiro/steering/"],
                ["Specs", "Structured planning for one feature", ".kiro/specs/"],
                ["Requirements", "Describe what the feature should do", "requirements.md"],
                ["Design", "Explain how the feature will be built", "design.md"],
                ["Tasks", "Turn the plan into trackable steps", "tasks.md"],
                ["Hooks", "React to events such as saving a file", ".kiro/hooks/"]
              ].map(([name, description, path]) => (
                <article className="bg-[#0b0c0f] p-6" key={name}><p className="font-mono text-xs text-cyan-300">{name}</p><p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p><code className="mt-5 block text-[11px] text-zinc-600">{path}</code></article>
              ))}
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div><h3 className="text-2xl font-medium text-white">Kiro CLI v3</h3><p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">Start the next-generation agent, create a spec, inspect it, and run its tasks without leaving the terminal.</p></div>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                {["kiro-cli --v3", "/spec", "/spec new <name>", "/spec <name>", "/spec run <name>"].map((command) => <Command copied={copied === command} key={command} onCopy={() => void copy(command)} value={command} />)}
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/[0.07] px-5 py-8 sm:px-8"><div className="mx-auto flex max-w-6xl flex-col gap-3 font-mono text-[11px] text-zinc-600 sm:flex-row sm:items-center sm:justify-between"><span>kiro atlas / generated from committed files</span><span>local refresh · manual deploy · public by design</span></div></footer>
      </div>
    </main>
  );
}
