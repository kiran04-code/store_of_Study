import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Archive,
  Bookmark,
  BookOpen,
  CalendarClock,
  CalendarDays,
  Check,
  ClipboardPaste,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  Flame,
  Folder,
  Gauge,
  History,
  Import,
  Layers3,
  Menu,
  Moon,
  Plus,
  Redo2,
  RotateCcw,
  Search,
  Settings,
  Shuffle,
  Star,
  Sun,
  Target,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useStore } from "./store";
import type {
  AppData,
  DailyPriority,
  DailyTarget,
  DailyTargetStatus,
  DailyTargetType,
  Difficulty,
  ItemType,
  Status,
  StudyItem,
  Topic,
} from "./types";

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const dayKey = (x: string | null) =>
  x ? new Date(x).toLocaleDateString("en-CA") : "";
const fmt = (x: string | null, full = false) =>
  x
    ? new Date(x).toLocaleDateString(
        "en-US",
        full
          ? { month: "long", day: "numeric", year: "numeric" }
          : { month: "short", day: "numeric" },
      )
    : "—";
const daysAgo = (x: string | null) => {
  if (!x) return "Never";
  const n = Math.floor(
    (today().getTime() - new Date(x).setHours(0, 0, 0, 0)) / 864e5,
  );
  return n === 0
    ? "Today"
    : n === 1
      ? "Yesterday"
      : n > 1
        ? `${n} days ago`
        : `in ${-n} days`;
};
const isDue = (x: string | null) =>
  !!x && new Date(x).setHours(0, 0, 0, 0) <= today().getTime();
const STATUS: Status[] = [
  "Not Started",
  "Learning",
  "Solved",
  "Revising",
  "Mastered",
];
const DIFFICULTY: Difficulty[] = ["Easy", "Medium", "Hard", "None"];
const TYPES: ItemType[] = [
  "Question",
  "Concept",
  "Todo",
  "Article",
  "Practice",
];

function Badge({ status }: { status: Status }) {
  const cls: { [k in Status]: string } = {
    "Not Started": "bg-zinc-100 text-zinc-600 dark:bg-zinc-800",
    Learning:
      "border border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300",
    Solved: "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900",
    Revising:
      "border border-dashed border-zinc-500 text-zinc-800 dark:text-zinc-200",
    Mastered: "bg-black text-white dark:bg-white dark:text-black",
  };
  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-[11px] font-medium ${cls[status]}`}
    >
      {status}
    </span>
  );
}
function Modal({
  title,
  children,
  onClose,
  width = "max-w-xl",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  width?: string;
}) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`panel max-h-[92vh] w-full ${width} overflow-y-auto`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4 dark:bg-zinc-900">
          <h2 className="font-semibold">{title}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Confirm({
  title,
  body,
  onConfirm,
  onClose,
}: {
  title: string;
  body: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose} width="max-w-md">
      <div className="p-5">
        <p className="text-sm muted">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn border-red-700 bg-red-700 text-white hover:bg-red-600"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Sidebar({
  mobile,
  onClose,
}: {
  mobile?: boolean;
  onClose?: () => void;
}) {
  const s = useStore();
  const nav = [
    ["/", "Dashboard", Gauge],
    ["/daily", "Daily Target", Target],
    ["/revision", "Revision Queue", CalendarClock],
    ["/quick", "Quick Revision", Zap],
    ["/daily-history", "Daily History", CalendarDays],
    ["/recent", "Recently Solved", History],
    ["/bookmarks", "Bookmarks", Bookmark],
    ["/settings", "Settings", Settings],
  ] as const;
  const [add, setAdd] = useState(false);
  const compact = s.settings.sidebarCollapsed && !mobile;
  return (
    <>
      <aside
        className={`${mobile ? "flex" : "hidden lg:flex"} h-full flex-col border-r bg-white dark:bg-zinc-950 ${compact ? "w-[68px]" : "w-60"} transition-[width]`}
      >
        <div className="flex h-16 items-center gap-3 border-b px-4">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
            <Redo2 size={17} />
          </div>
          {!compact && (
            <span className="text-sm font-semibold tracking-tight">
              Revision Tracker
            </span>
          )}
          {mobile && (
            <button className="icon-btn ml-auto" onClick={onClose}>
              <X size={18} />
            </button>
          )}
        </div>
        <nav className="scrollbar flex-1 overflow-y-auto p-3">
          <div className="space-y-0.5">
            {nav.slice(0, 4).map(([to, label, Icon]) => (
              <NavLink
                end={to === "/"}
                onClick={onClose}
                title={label}
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex h-9 items-center gap-3 rounded-md px-2.5 text-sm ${isActive ? "bg-zinc-100 font-medium text-zinc-950 dark:bg-zinc-800 dark:text-white" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`
                }
              >
                <Icon size={17} />
                {!compact && label}
              </NavLink>
            ))}
          </div>
          {!compact && (
            <p className="mb-2 mt-6 px-2 text-[10px] font-semibold uppercase tracking-[.16em] text-zinc-400">
              Subjects
            </p>
          )}
          <div className="space-y-0.5">
            {s.subjects.map((x) => (
              <NavLink
                onClick={onClose}
                title={x.name}
                key={x.id}
                to={`/subject/${x.id}`}
                className={({ isActive }) =>
                  `flex h-9 items-center gap-3 rounded-md px-2.5 text-sm ${isActive ? "bg-zinc-100 font-medium dark:bg-zinc-800" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`
                }
              >
                <span className="w-[17px] text-center text-sm">
                  {x.icon || "◇"}
                </span>
                {!compact && <span className="truncate">{x.name}</span>}
              </NavLink>
            ))}
          </div>
          <div className="mt-5 space-y-0.5">
            {nav.slice(4).map(([to, label, Icon]) => (
              <NavLink
                onClick={onClose}
                title={label}
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex h-9 items-center gap-3 rounded-md px-2.5 text-sm ${isActive ? "bg-zinc-100 font-medium dark:bg-zinc-800" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`
                }
              >
                <Icon size={17} />
                {!compact && label}
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="border-t p-3">
          <button
            onClick={() => setAdd(true)}
            title="New subject"
            className="btn w-full px-2"
          >
            {" "}
            <Plus size={16} />
            {!compact && "New Subject"}
          </button>
          {!mobile && (
            <button
              onClick={() => s.setSettings({ sidebarCollapsed: !compact })}
              className="mt-2 flex w-full items-center justify-center py-1 text-zinc-400 hover:text-zinc-700"
            >
              {compact ? (
                <ChevronsRight size={16} />
              ) : (
                <ChevronsLeft size={16} />
              )}
            </button>
          )}
        </div>
      </aside>
      {add && <AddSubject onClose={() => setAdd(false)} />}
    </>
  );
}

function AddSubject({ onClose }: { onClose: () => void }) {
  const s = useStore();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("◇");
  return (
    <Modal title="New subject" onClose={onClose} width="max-w-md">
      <form
        className="space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) {
            const x = s.addSubject(name.trim(), icon);
            onClose();
            nav(`/subject/${x.id}`);
          }
        }}
      >
        <div>
          <label className="label">Subject name *</label>
          <input
            autoFocus
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Database Management"
          />
        </div>
        <div>
          <label className="label">Icon</label>
          <div className="flex gap-2">
            {["◇", "⌘", "◫", "◎", "△", "□"].map((x) => (
              <button
                type="button"
                onClick={() => setIcon(x)}
                className={`size-10 rounded-md border text-lg ${icon === x ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : ""}`}
                key={x}
              >
                {x}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={!name.trim()}>
            Create subject
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const s = useStore();
  const [search, setSearch] = useState(false);
  const [add, setAdd] = useState(false);
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
      if (
        e.key.toLowerCase() === "n" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName,
        )
      )
        setAdd(true);
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  return (
    <>
      <header className="flex h-16 items-center gap-3 border-b bg-white px-4 dark:bg-zinc-950 lg:px-6">
        <button className="icon-btn lg:hidden" onClick={onMenu}>
          <Menu size={19} />
        </button>
        <button
          onClick={() => setSearch(true)}
          className="flex h-9 max-w-md flex-1 items-center gap-2 rounded-md border bg-zinc-50 px-3 text-sm text-zinc-400 dark:bg-zinc-900"
        >
          <Search size={16} />
          <span className="truncate">
            Search questions, topics, subjects...
          </span>
          <kbd className="ml-auto hidden rounded border bg-white px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-950 sm:block">
            Ctrl K
          </kbd>
        </button>
        <button
          className="icon-btn ml-auto border"
          title={
            s.settings.darkMode
              ? "Switch to white mode"
              : "Switch to black mode"
          }
          aria-label={
            s.settings.darkMode
              ? "Switch to white mode"
              : "Switch to black mode"
          }
          onClick={() =>
            s.setSettings({ darkMode: !s.settings.darkMode })
          }
        >
          {s.settings.darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <div>
          <button className="btn btn-primary" onClick={() => setAdd(true)}>
            <Plus size={16} />
            <span className="hidden sm:inline">Add item</span>
          </button>
        </div>
      </header>
      {search && <SearchDialog onClose={() => setSearch(false)} />}{" "}
      {add && <ItemModal onClose={() => setAdd(false)} />}
    </>
  );
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const s = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const n = q.toLowerCase();
    return [
      ...s.subjects
        .filter((x) => x.name.toLowerCase().includes(n))
        .map((x) => ({
          id: x.id,
          title: x.name,
          meta: "Subject",
          url: `/subject/${x.id}`,
        })),
      ...s.topics
        .filter((x) => x.name.toLowerCase().includes(n))
        .map((x) => ({
          id: x.id,
          title: x.name,
          meta: `Topic · ${s.subjects.find((z) => z.id === x.subjectId)?.name}`,
          url: `/subject/${x.subjectId}?topic=${x.id}`,
        })),
      ...s.items
        .filter((x) =>
          (x.title + " " + x.tags.join(" ")).toLowerCase().includes(n),
        )
        .map((x) => ({
          id: x.id,
          title: x.title,
          meta: `${x.type} · ${s.subjects.find((z) => z.id === x.subjectId)?.name}`,
          url: `/item/${x.id}`,
        })),
    ].slice(0, 12);
  }, [q, s]);
  return (
    <Modal title="Search" onClose={onClose} width="max-w-2xl">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-zinc-400" size={17} />
          <input
            autoFocus
            className="field pl-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type to search everything..."
          />
        </div>
        <div className="mt-3 max-h-96 overflow-y-auto">
          {q && results.length === 0 && (
            <div className="p-8 text-center text-sm muted">
              No matching subjects, topics, or items.
            </div>
          )}
          {results.map((r) => (
            <button
              key={`${r.meta}-${r.id}`}
              className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
              onClick={() => {
                nav(r.url);
                onClose();
              }}
            >
              <div className="flex size-8 items-center justify-center rounded border">
                <FileText size={15} />
              </div>
              <div>
                <div className="text-sm font-medium">{r.title}</div>
                <div className="text-xs muted">{r.meta}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function Shell() {
  const [mobile, setMobile] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar onMenu={() => setMobile(true)} />
        <main className="scrollbar h-[calc(100vh-4rem)] overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/daily" element={<DailyTargetPage />} />
            <Route path="/daily-focus" element={<DailyFocus />} />
            <Route path="/daily-history" element={<DailyHistory />} />
            <Route path="/subject/:id" element={<SubjectPage />} />
          <Route path="/item/:id" element={<Dashboard />} />
          <Route path="/notes/:id" element={<NotesPage />} />
            <Route path="/revision" element={<RevisionQueue />} />
            <Route path="/quick" element={<QuickRevision />} />
            <Route path="/recent" element={<ItemList mode="recent" />} />
            <Route path="/bookmarks" element={<ItemList mode="bookmarks" />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
      {mobile && (
        <div
          className="fixed inset-0 z-40 flex bg-black/40 lg:hidden"
          onMouseDown={(e) => e.target === e.currentTarget && setMobile(false)}
        >
          <Sidebar mobile onClose={() => setMobile(false)} />
        </div>
      )}
      <ItemRouteDrawer />
      <ToastHost />
    </div>
  );
}

function ToastHost() {
  const [messages, setMessages] = useState<{ id: number; text: string }[]>([]);
  useEffect(() => {
    const onToast = (e: Event) => {
      const id = Date.now();
      setMessages((m) => [
        ...m,
        { id, text: (e as CustomEvent<string>).detail },
      ]);
      setTimeout(() => setMessages((m) => m.filter((x) => x.id !== id)), 2400);
    };
    window.addEventListener("revision-toast", onToast);
    return () => window.removeEventListener("revision-toast", onToast);
  }, []);
  return (
    <>
      <ItemDailyButton />
      <div className="fixed bottom-5 right-5 z-[70] space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm text-white shadow-lg dark:bg-white dark:text-zinc-950"
          >
            <Check size={15} />
            {m.text}
          </div>
        ))}
      </div>
    </>
  );
}
function ItemDailyButton() {
  const loc = useLocation();
  const s = useStore();
  const id = loc.pathname.match(/^\/item\/(.+)$/)?.[1];
  const item = s.items.find((i) => i.id === id);
  if (!item) return null;
  const exists = s.dailyTargets.some(
    (t) => t.date === dailyDate() && t.studyItemId === item.id,
  );
  return (
    <button
      disabled={exists}
      onClick={() =>
        s.addDailyTarget({
          title: item.title,
          studyItemId: item.id,
          subjectId: item.subjectId,
          topicId: item.topicId,
          type: isDue(item.nextRevisionAt) ? "Revise" : "Solve",
        })
      }
      className="btn fixed bottom-20 right-5 z-[60] shadow-lg"
    >
      {exists ? <Check size={15} /> : <Plus size={15} />}{" "}
      {exists ? "In today’s target" : "Add to Today"}
    </button>
  );
}

function Page({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {title.startsWith("Good ") && <DailyDashboard />}
      {children}
    </div>
  );
}
function Progress({ value }: { value: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div
        className="h-full bg-zinc-900 dark:bg-zinc-100"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function FullDashboard() {
  const s = useStore();
  const nav = useNavigate();
  const [newSubject, setNewSubject] = useState(false);
  const hour = new Date().getHours();
  const due = s.items.filter((i) => isDue(i.nextRevisionAt));
  const solved = s.items.filter((i) => i.solveCount > 0);
  const mastered = s.items.filter((i) => i.status === "Mastered");
  const totalSolves = s.items.reduce((n, i) => n + i.solveCount, 0);
  const weak = [...s.items]
    .filter(
      (i) =>
        i.solveCount < 2 || i.status === "Revising" || isDue(i.nextRevisionAt),
    )
    .sort(
      (a, b) =>
        (isDue(b.nextRevisionAt) ? 1 : 0) - (isDue(a.nextRevisionAt) ? 1 : 0),
    )
    .slice(0, 5);
  const recent = [...s.items]
    .filter((i) => i.lastSolvedAt)
    .sort((a, b) => b.lastSolvedAt!.localeCompare(a.lastSolvedAt!))
    .slice(0, 5);
  const stats = [
    { label: "Total items", value: s.items.length, Icon: Archive },
    { label: "Solved", value: solved.length, Icon: Check },
    { label: "Need revision", value: due.length, Icon: CalendarClock },
    { label: "Mastered", value: mastered.length, Icon: Star },
    { label: "Total solves", value: totalSolves, Icon: RotateCcw },
  ];
  return (
    <Page
      title={`Good ${hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"}`}
      subtitle="Ready for today’s revision?"
      action={
        <button className="btn btn-primary" onClick={() => nav("/quick")}>
          <Zap size={16} />
          Start quick revision
        </button>
      }
    >
      {s.subjects.length === 0 && s.items.length === 0 && (
        <section className="panel mb-6 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-zinc-50 dark:bg-zinc-900">
            <BookOpen size={20} />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold">Start with a clean workspace</h2>
            <p className="mt-1 text-sm muted">
              Create your first subject, or add a tiny demo dataset to see how
              questions, revisions, and daily targets work.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn" onClick={() => s.loadDemo()}>
              <Archive size={15} />
              Add demo data
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setNewSubject(true)}
            >
              <Plus size={15} />
              Add subject
            </button>
          </div>
        </section>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="panel p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs muted">{label}</span>
              <Icon size={15} className="text-zinc-400" />
            </div>
            <div className="mt-3 text-2xl font-semibold">{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className="panel">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Today’s revision</h2>
              <p className="mt-0.5 text-xs muted">
                {due.length} items due or overdue
              </p>
            </div>
            <button
              className="text-xs font-medium hover:underline"
              onClick={() => nav("/revision")}
            >
              View queue
            </button>
          </div>
          <div className="divide-y">
            {due.slice(0, 5).map((i) => (
              <CompactItem key={i.id} item={i} />
            ))}
            {due.length === 0 && (
              <Empty text="You’re all caught up for today." />
            )}
          </div>
        </section>
        <section className="panel p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Subject progress</h2>
              <p className="mt-0.5 text-xs muted">Solved or mastered items</p>
            </div>
            <Layers3 size={16} className="text-zinc-400" />
          </div>
          <div className="space-y-5">
            {s.subjects.map((sub) => {
              const all = s.items.filter((i) => i.subjectId === sub.id);
              const done = all.filter((i) =>
                ["Solved", "Mastered"].includes(i.status),
              ).length;
              const pct = all.length
                ? Math.round((done / all.length) * 100)
                : 0;
              return (
                <button
                  key={sub.id}
                  onClick={() => nav(`/subject/${sub.id}`)}
                  className="block w-full text-left"
                >
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="font-medium">{sub.name}</span>
                    <span className="muted">{pct}%</span>
                  </div>
                  <Progress value={pct} />
                </button>
              );
            })}
          </div>
        </section>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel">
          <SectionHead
            title="Recently practiced"
            subtitle="Your latest activity"
          />
          <div className="divide-y">
            {recent.map((i) => (
              <CompactItem
                key={i.id}
                item={i}
                right={daysAgo(i.lastSolvedAt)}
              />
            ))}
          </div>
        </section>
        <section className="panel">
          <SectionHead
            title="Weak items"
            subtitle="Low repetition, revising, or overdue"
          />
          <div className="divide-y">
            {weak.map((i) => (
              <CompactItem
                key={i.id}
                item={i}
                right={`${i.solveCount}× solved`}
              />
            ))}
          </div>
        </section>
      </div>
      {newSubject && <AddSubject onClose={() => setNewSubject(false)} />}
    </Page>
  );
}
function Dashboard() {
  const nav = useNavigate();
  const hour = new Date().getHours();
  return (
    <Page
      title={`Good ${hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"}`}
      subtitle="Ready for today’s revision?"
      action={
        <button className="btn btn-primary" onClick={() => nav("/daily")}>
          <Target size={16} />
          Manage today’s target
        </button>
      }
    >
      <></>
    </Page>
  );
}

function DailyDashboard() {
  const s = useStore();
  const nav = useNavigate();
  const date = new Date().toLocaleDateString("en-CA");
  const targets = s.dailyTargets.filter((t) => t.date === date);
  const completed = targets.filter((t) => t.status === "Completed").length;
  const goal = s.dailyGoal.enabled ? s.dailyGoal.dailyItemGoal : targets.length;
  const pct = goal ? Math.min(100, Math.round((completed / goal) * 100)) : 0;
  return (
    <section className="panel mb-6 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <Target size={16} />
            <h2 className="text-sm font-semibold">Today’s Target</h2>
          </div>
          <p className="mt-1 text-xs muted">
            {completed} / {goal} completed
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn text-xs" onClick={() => nav("/daily")}>
            <Plus size={14} />
            Add target
          </button>
          <button
            className="btn btn-primary text-xs"
            onClick={() => nav("/daily-focus")}
          >
            <Zap size={14} />
            Continue revision
          </button>
        </div>
      </div>
      <div className="p-5">
        <Progress value={pct} />
        <div className="mt-4 space-y-1">
            {targets.map((t) => (
              <button
                key={t.id}
                onClick={() => s.completeDailyTarget(t.id, "plain")}
                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <span
                  className={`flex size-4 items-center justify-center rounded border ${t.status === "Completed" ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : ""}`}
                >
                  {t.status === "Completed" && <Check size={11} />}
                </span>
                <span
                  className={`text-sm ${t.status === "Completed" ? "text-zinc-400 line-through" : ""}`}
                >
                  {t.title}
                </span>
              </button>
            ))}
            {!targets.length && (
              <p className="py-3 text-sm muted">
                Nothing planned yet. Add a target or pull in due revisions.
              </p>
            )}
        </div>
      </div>
    </section>
  );
}
function SectionHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b px-5 py-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-0.5 text-xs muted">{subtitle}</p>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <div className="p-10 text-center text-sm muted">{text}</div>;
}
function CompactItem({ item, right }: { item: StudyItem; right?: string }) {
  const s = useStore();
  const nav = useNavigate();
  const sub = s.subjects.find((x) => x.id === item.subjectId);
  const topic = s.topics.find((x) => x.id === item.topicId);
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <button
        onClick={() => nav(`/item/${item.id}`)}
        className="min-w-0 flex-1 text-left"
      >
        <div className="truncate text-sm font-medium hover:underline">
          {item.title}
        </div>
        <div className="mt-0.5 truncate text-xs muted">
          {sub?.name}
          {topic && ` · ${topic.name}`}
        </div>
      </button>
      {right && <span className="hidden text-xs muted sm:block">{right}</span>}
      <button
        className="btn h-8 px-2.5 text-xs"
        onClick={() => s.solve(item.id)}
      >
        <Plus size={13} />
        Solve
      </button>
    </div>
  );
}

function SubjectPage() {
  const { id } = useParams();
  const s = useStore();
  const nav = useNavigate();
  const subject = s.subjects.find((x) => x.id === id);
  const [tab, setTab] = useState<"overview" | "topics" | "questions" | "queue">(
    "overview",
  );
  const [topicModal, setTopicModal] = useState<string | null | undefined>();
  const [itemModal, setItemModal] = useState(false);
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  if (!subject)
    return (
      <Page title="Subject not found">
        <Empty text="This subject no longer exists." />
      </Page>
    );
  const items = s.items.filter((i) => i.subjectId === id);
  const done = items.filter((i) =>
    ["Solved", "Mastered"].includes(i.status),
  ).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const tabs = ["overview", "topics", "questions", "queue"] as const;
  return (
    <Page
      title={subject.name}
      subtitle={`${items.length} items · ${done} solved · ${pct}% progress`}
      action={
        <div className="flex gap-2">
          <button className="btn" onClick={() => setEdit(true)}>
            <Edit3 size={15} />
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setItemModal(true)}
          >
            <Plus size={15} />
            Add item
          </button>
        </div>
      }
    >
      <div className="mb-6 flex gap-1 overflow-x-auto border-b">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-3 text-sm capitalize ${tab === t ? "border-zinc-900 font-medium dark:border-white" : "border-transparent text-zinc-500"}`}
          >
            {t === "questions"
              ? "All items"
              : t === "queue"
                ? "Revision queue"
                : t}
          </button>
        ))}
      </div>
      {tab === "overview" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="panel p-5">
              <span className="text-xs muted">Total items</span>
              <div className="mt-2 text-2xl font-semibold">{items.length}</div>
            </div>
            <div className="panel p-5">
              <span className="text-xs muted">Completed</span>
              <div className="mt-2 text-2xl font-semibold">{done}</div>
            </div>
            <div className="panel p-5">
              <span className="text-xs muted">Revision due</span>
              <div className="mt-2 text-2xl font-semibold">
                {items.filter((i) => isDue(i.nextRevisionAt)).length}
              </div>
            </div>
          </div>
          <section className="panel mt-5 p-5">
            <div className="mb-3 flex justify-between text-sm">
              <span className="font-medium">Overall progress</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} />
          </section>
          <section className="panel mt-5">
            <SectionHead title="Topics" subtitle="Top-level categories" />
            <TopicTree subjectId={subject.id} onAdd={setTopicModal} />
          </section>
        </>
      )}
      {tab === "topics" && (
        <section className="panel">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Topic tree</h2>
              <p className="text-xs muted">
                Topics can contain both items and subtopics.
              </p>
            </div>
            <button className="btn" onClick={() => setTopicModal(null)}>
              <Plus size={14} />
              Add topic
            </button>
          </div>
          <TopicTree subjectId={subject.id} onAdd={setTopicModal} detailed />
        </section>
      )}
      {tab === "questions" && <QuestionTable items={items} />}{" "}
      {tab === "queue" && <QueueGroups items={items} />}{" "}
      {topicModal !== undefined && (
        <TopicModal
          subjectId={subject.id}
          parentId={topicModal}
          onClose={() => setTopicModal(undefined)}
        />
      )}{" "}
      {itemModal && (
        <ItemModal subjectId={subject.id} onClose={() => setItemModal(false)} />
      )}{" "}
      {edit && (
        <Modal
          title="Edit subject"
          onClose={() => setEdit(false)}
          width="max-w-md"
        >
          <form
            className="p-5"
            onSubmit={(e) => {
              e.preventDefault();
              const v = new FormData(e.currentTarget).get("name") as string;
              if (v.trim()) s.updateSubject(subject.id, v.trim());
              setEdit(false);
            }}
          >
            <label className="label">Name</label>
            <input
              name="name"
              autoFocus
              defaultValue={subject.name}
              className="field"
            />
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setEdit(false);
                  setConfirm(true);
                }}
                className="text-sm text-red-600"
              >
                Delete subject
              </button>
              <button className="btn btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}
      {confirm && (
        <Confirm
          title="Delete subject?"
          body="This permanently removes the subject, all topics, items, and solve history."
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            s.deleteSubject(subject.id);
            nav("/");
          }}
        />
      )}
    </Page>
  );
}

function TopicTree({
  subjectId,
  onAdd,
  detailed = false,
}: {
  subjectId: string;
  onAdd: (id: string | null) => void;
  detailed?: boolean;
}) {
  const s = useStore();
  const roots = s.topics.filter(
    (t) => t.subjectId === subjectId && !t.parentTopicId,
  );
  if (!roots.length)
    return (
      <Empty text="No topics yet. Add the first topic to organize your items." />
    );
  return (
    <div className="p-3">
      {roots.map((t) => (
        <TopicNode key={t.id} topic={t} onAdd={onAdd} detailed={detailed} />
      ))}
    </div>
  );
}
function TopicNode({
  topic,
  onAdd,
  detailed,
}: {
  topic: Topic;
  onAdd: (id: string) => void;
  detailed: boolean;
}) {
  const s = useStore();
  const [open, setOpen] = useState(true);
  const [rename, setRename] = useState(false);
  const [remove, setRemove] = useState(false);
  const children = s.topics.filter((t) => t.parentTopicId === topic.id);
  const own = s.items.filter((i) => i.topicId === topic.id);
  const descendants = (id: string): string[] => [
    id,
    ...s.topics
      .filter((t) => t.parentTopicId === id)
      .flatMap((t) => descendants(t.id)),
  ];
  const ids = descendants(topic.id);
  const all = s.items.filter((i) => i.topicId && ids.includes(i.topicId));
  const solved = all.filter((i) =>
    ["Solved", "Mastered"].includes(i.status),
  ).length;
  return (
    <div>
      <div className="group flex items-center gap-2 rounded-md px-2 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
        <button className="icon-btn size-6" onClick={() => setOpen(!open)}>
          {children.length || own.length ? (
            open ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : (
            <span className="size-3" />
          )}
        </button>
        <Folder size={16} className="text-zinc-400" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {topic.name}
        </span>
        <span className="text-xs muted">
          {all.length} items · {solved} done
        </span>
        {detailed && (
          <>
            <button
              title="Add subtopic"
              className="icon-btn opacity-0 group-hover:opacity-100"
              onClick={() => onAdd(topic.id)}
            >
              <Plus size={14} />
            </button>
            <button
              title="Rename"
              className="icon-btn opacity-0 group-hover:opacity-100"
              onClick={() => setRename(true)}
            >
              <Edit3 size={13} />
            </button>
            <button
              title="Delete"
              className="icon-btn opacity-0 group-hover:opacity-100"
              onClick={() => setRemove(true)}
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
      {open && (
        <div className="ml-5 border-l pl-2">
          {children.map((t) => (
            <TopicNode key={t.id} topic={t} onAdd={onAdd} detailed={detailed} />
          ))}
          {own.map((i) => (
            <CompactTopicItem key={i.id} item={i} />
          ))}
        </div>
      )}
      {rename && (
        <Modal
          title="Rename topic"
          onClose={() => setRename(false)}
          width="max-w-md"
        >
          <form
            className="p-5"
            onSubmit={(e) => {
              e.preventDefault();
              const v = new FormData(e.currentTarget).get("name") as string;
              if (v.trim()) s.updateTopic(topic.id, v.trim());
              setRename(false);
            }}
          >
            <input
              name="name"
              autoFocus
              defaultValue={topic.name}
              className="field"
            />
            <div className="mt-4 flex justify-end">
              <button className="btn btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}
      {remove && (
        <Confirm
          title="Delete topic?"
          body="Nested topics will be removed. Their study items will be kept at the subject level."
          onClose={() => setRemove(false)}
          onConfirm={() => s.deleteTopic(topic.id)}
        />
      )}
    </div>
  );
}
function CompactTopicItem({ item }: { item: StudyItem }) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => nav(`/item/${item.id}`)}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      <FileText size={14} />
      <span className="flex-1 truncate">{item.title}</span>
      <Badge status={item.status} />
    </button>
  );
}
function TopicModal({
  subjectId,
  parentId,
  onClose,
}: {
  subjectId: string;
  parentId: string | null;
  onClose: () => void;
}) {
  const s = useStore();
  const [name, setName] = useState("");
  return (
    <Modal
      title={parentId ? "Add subtopic" : "Add topic"}
      onClose={onClose}
      width="max-w-md"
    >
      <form
        className="p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) {
            s.addTopic(subjectId, name.trim(), parentId);
            onClose();
          }
        }}
      >
        <label className="label">Topic name *</label>
        <input
          autoFocus
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Dynamic Programming"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={!name.trim()}>
            Add topic
          </button>
        </div>
      </form>
    </Modal>
  );
}

function QuestionTable({ items }: { items: StudyItem[] }) {
  const s = useStore();
  const nav = useNavigate();
  const [status, setStatus] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [subject, setSubject] = useState("All");
  const [topic, setTopic] = useState("All");
  const [tag, setTag] = useState("");
  const [minSolves, setMinSolves] = useState(0);
  const [due, setDue] = useState(false);
  const [sort, setSort] = useState("recent");
  const topics = s.topics.filter(
    (t) => subject === "All" || t.subjectId === subject,
  );
  const rows = useMemo(
    () =>
      items
        .filter(
          (i) =>
            (status === "All" || i.status === status) &&
            (difficulty === "All" || i.difficulty === difficulty) &&
            (subject === "All" || i.subjectId === subject) &&
            (topic === "All" || i.topicId === topic) &&
            (!tag ||
              i.tags.some((t) =>
                t.toLowerCase().includes(tag.toLowerCase()),
              )) &&
            i.solveCount >= minSolves &&
            (!due || isDue(i.nextRevisionAt)),
        )
        .sort((a, b) =>
          sort === "most"
            ? b.solveCount - a.solveCount
            : sort === "least"
              ? a.solveCount - b.solveCount
              : sort === "added"
                ? b.createdAt.localeCompare(a.createdAt)
                : sort === "difficulty"
                  ? DIFFICULTY.indexOf(a.difficulty) -
                    DIFFICULTY.indexOf(b.difficulty)
                  : (b.lastSolvedAt || "").localeCompare(a.lastSolvedAt || ""),
        ),
    [items, status, difficulty, subject, topic, tag, minSolves, due, sort],
  );
  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap gap-2 border-b p-3">
        <select
          aria-label="Subject filter"
          className="field w-auto"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setTopic("All");
          }}
        >
          <option value="All">All subjects</option>
          {s.subjects.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Topic filter"
          className="field w-auto max-w-48"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option value="All">All topics</option>
          {topics.map((x) => (
            <option key={x.id} value={x.id}>
              {topicPath(x, s.topics)}
            </option>
          ))}
        </select>
        <select
          aria-label="Status filter"
          className="field w-auto"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="All">All statuses</option>
          {STATUS.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          aria-label="Difficulty filter"
          className="field w-auto"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="All">All difficulties</option>
          {DIFFICULTY.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <input
          aria-label="Tag filter"
          className="field w-28"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Tag..."
        />
        <select
          aria-label="Minimum solves"
          className="field w-auto"
          value={minSolves}
          onChange={(e) => setMinSolves(Number(e.target.value))}
        >
          <option value="0">Any solves</option>
          <option value="1">1+ solves</option>
          <option value="3">3+ solves</option>
          <option value="5">5+ solves</option>
        </select>
        <button
          className={`btn ${due ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : ""}`}
          onClick={() => setDue(!due)}
        >
          <Clock3 size={14} />
          Due
        </button>
        <select
          aria-label="Sort items"
          className="field ml-auto w-auto"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="recent">Recently solved</option>
          <option value="most">Most solved</option>
          <option value="least">Least solved</option>
          <option value="difficulty">Difficulty</option>
          <option value="added">Recently added</option>
        </select>
      </div>
      <div className="scrollbar overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b bg-zinc-50 text-[11px] uppercase tracking-wide text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="w-12 px-4 py-3">#</th>
              <th className="px-3 py-3">Item</th>
              <th className="px-3 py-3">Topic</th>
              <th className="px-3 py-3">Difficulty</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Solves</th>
              <th className="px-3 py-3">Last revised</th>
              <th className="px-3 py-3">Next revision</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((i, n) => (
              <tr
                key={i.id}
                className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40"
              >
                <td className="px-4 py-3 text-xs muted">
                  {String(n + 1).padStart(2, "0")}
                </td>
                <td className="max-w-72 px-3 py-3">
                  <button
                    onClick={() => nav(`/item/${i.id}`)}
                    className="block max-w-full truncate font-medium hover:underline"
                  >
                    {i.title}
                  </button>
                  <span className="text-[11px] muted">{i.type}</span>
                </td>
                <td className="px-3 py-3 text-xs muted">
                  {s.topics.find((t) => t.id === i.topicId)?.name || "—"}
                </td>
                <td className="px-3 py-3 text-xs">{i.difficulty}</td>
                <td className="px-3 py-3">
                  <Badge status={i.status} />
                </td>
                <td className="px-3 py-3 font-medium">{i.solveCount}×</td>
                <td className="px-3 py-3 text-xs muted">
                  {fmt(i.lastSolvedAt)}
                </td>
                <td
                  className={`px-3 py-3 text-xs ${isDue(i.nextRevisionAt) ? "font-medium text-red-600" : "muted"}`}
                >
                  {fmt(i.nextRevisionAt)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    {i.articleNote && (
                      <button
                        title="Read notes"
                        className="icon-btn border"
                        onClick={() => nav(`/notes/${i.id}`)}
                      >
                        <BookOpen size={13} />
                      </button>
                    )}
                    {i.url && (
                      <a
                        href={i.url}
                        target="_blank"
                        rel="noreferrer"
                        title="Open link"
                        className="icon-btn border"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  <button
                    title="Mark solved"
                    className="btn h-8 px-2 text-xs"
                    onClick={() => s.solve(i.id)}
                  >
                    <Plus size={13} />
                    Solve
                  </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty text="No items match these filters." />}
      </div>
    </section>
  );
}

function ItemModal({
  onClose,
  subjectId,
  editItem,
}: {
  onClose: () => void;
  subjectId?: string;
  editItem?: StudyItem;
}) {
  const s = useStore();
  const [sub, setSub] = useState(
    editItem?.subjectId || subjectId || s.subjects[0]?.id || "",
  );
  const [topic, setTopic] = useState(editItem?.topicId || "");
  const [newTopic, setNewTopic] = useState("");
  const articleRef = useRef<HTMLTextAreaElement>(null);
  const pasteNotes = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const field = articleRef.current;
      if (!field) return;
      const start = field.selectionStart;
      const end = field.selectionEnd;
      field.setRangeText(text, start, end, "end");
      window.dispatchEvent(
        new CustomEvent("revision-toast", { detail: "Notes pasted" }),
      );
    } catch {
      articleRef.current?.focus();
      window.dispatchEvent(
        new CustomEvent("revision-toast", {
          detail: "Press Ctrl+V to paste your notes",
        }),
      );
    }
  };
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    let topicId = topic || null;
    if (newTopic.trim())
      topicId = s.addTopic(sub, newTopic.trim(), topic || null).id;
    const payload = {
      subjectId: sub,
      topicId,
      title: String(f.get("title")),
      type: String(f.get("type")) as ItemType,
      difficulty: String(f.get("difficulty")) as Difficulty,
      status: String(f.get("status")) as Status,
      platform: String(f.get("platform")),
      url: String(f.get("url")),
      tags: String(f.get("tags"))
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      shortNote: String(f.get("note")),
      articleNote: String(f.get("articleNote")),
      nextRevisionAt: String(f.get("next"))
        ? new Date(String(f.get("next")) + "T12:00:00").toISOString()
        : null,
    };
    if (editItem) s.updateItem(editItem.id, payload);
    else s.addItem(payload);
    onClose();
  };
  return (
    <Modal
      title={editItem ? "Edit item" : "Add study item"}
      onClose={onClose}
      width="max-w-2xl"
    >
      <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Title *</label>
          <input
            name="title"
            required
            autoFocus
            defaultValue={editItem?.title}
            className="field"
            placeholder="What are you studying?"
          />
        </div>
        <div>
          <label className="label">Subject *</label>
          <select
            className="field"
            value={sub}
            onChange={(e) => {
              setSub(e.target.value);
              setTopic("");
            }}
          >
            {s.subjects.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Topic / subtopic</label>
          <select
            className="field"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            <option value="">No topic</option>
            {s.topics
              .filter((x) => x.subjectId === sub)
              .map((x) => (
                <option key={x.id} value={x.id}>
                  {topicPath(x, s.topics)}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="label">Type</label>
          <select
            name="type"
            defaultValue={editItem?.type || "Question"}
            className="field"
          >
            {TYPES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Difficulty</label>
          <select
            name="difficulty"
            defaultValue={editItem?.difficulty || "None"}
            className="field"
          >
            {DIFFICULTY.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select
            name="status"
            defaultValue={editItem?.status || "Not Started"}
            className="field"
          >
            {STATUS.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Next revision</label>
          <input
            name="next"
            type="date"
            defaultValue={
              editItem?.nextRevisionAt ? dayKey(editItem.nextRevisionAt) : ""
            }
            className="field"
          />
        </div>
        <div>
          <label className="label">Platform</label>
          <input
            name="platform"
            defaultValue={editItem?.platform}
            className="field"
            placeholder="LeetCode, book, course..."
          />
        </div>
        <div>
          <label className="label">Resource link</label>
          <input
            name="url"
            defaultValue={editItem?.url}
            type="url"
            className="field"
            placeholder="https://leetcode.com/problems/..."
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">
            Tags <span className="font-normal muted">(comma separated)</span>
          </label>
          <input
            name="tags"
            defaultValue={editItem?.tags.join(", ")}
            className="field"
            placeholder="Greedy, DP, Intervals"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">
            Create nested topic{" "}
            <span className="font-normal muted">
              (optional, under selected topic)
            </span>
          </label>
          <input
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            className="field"
            placeholder="New topic name"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Short revision note</label>
          <textarea
            name="note"
            defaultValue={editItem?.shortNote}
            rows={3}
            className="field resize-none"
            placeholder="Keep it short: key insight, pattern, or pitfall."
          />
        </div>
        <div className="sm:col-span-2">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label className="label mb-0">Detailed notes / article</label>
            <button
              type="button"
              className="btn h-8 px-2.5 text-xs"
              onClick={pasteNotes}
            >
              <ClipboardPaste size={14} />
              Paste notes
            </button>
          </div>
          <textarea
            ref={articleRef}
            name="articleNote"
            defaultValue={editItem?.articleNote}
            rows={10}
            className="field resize-y font-mono text-[13px] leading-6"
            placeholder={"Paste full notes here. Formatting supported:\n# Heading\n- Bullet point\n> Important note\n```\ncode example\n```"}
          />
          <p className="mt-1.5 text-[11px] muted">
            Supports headings, bullet lists, numbered lists, quotes, links, and
            code blocks.
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t pt-4 sm:col-span-2">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary">
            {editItem ? "Save changes" : "Add item"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function topicPath(t: Topic, all: Topic[]): string {
  const p = all.find((x) => x.id === t.parentTopicId);
  return p ? `${topicPath(p, all)} › ${t.name}` : t.name;
}

function ItemRouteDrawer() {
  const loc = useLocation();
  const nav = useNavigate();
  const s = useStore();
  const match = loc.pathname.match(/^\/item\/(.+)$/);
  const item = s.items.find((i) => i.id === match?.[1]);
  const [edit, setEdit] = useState(false);
  const [remove, setRemove] = useState(false);
  if (!item) return null;
  const sub = s.subjects.find((x) => x.id === item.subjectId);
  const topic = s.topics.find((x) => x.id === item.topicId);
  const history = s.history
    .filter((h) => h.studyItemId === item.id)
    .sort((a, b) => b.solvedAt.localeCompare(a.solvedAt));
  const schedule = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    s.updateItem(item.id, { nextRevisionAt: d.toISOString() });
  };
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={() => nav(-1)} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l bg-white shadow-xl dark:bg-zinc-950">
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <button className="icon-btn" onClick={() => nav(-1)}>
            <X size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-semibold">{item.title}</h2>
            <p className="text-xs muted">
              {item.type} · {sub?.name}
            </p>
          </div>
          <button
            className="icon-btn"
            title="Bookmark"
            onClick={() =>
              s.updateItem(item.id, { bookmarked: !item.bookmarked })
            }
          >
            <Star size={18} fill={item.bookmarked ? "currentColor" : "none"} />
          </button>
          <button className="icon-btn" onClick={() => setEdit(true)}>
            <Edit3 size={16} />
          </button>
          <button
            className="icon-btn text-red-500"
            onClick={() => setRemove(true)}
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className="scrollbar flex-1 overflow-y-auto p-5">
          <div className="flex items-center gap-3">
            <Badge status={item.status} />
            {item.difficulty !== "None" && (
              <span className="tag">{item.difficulty}</span>
            )}
            <span className="tag">{item.solveCount}× solved</span>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5 text-sm">
            <Info label="Subject" value={sub?.name} />
            <Info
              label="Topic"
              value={topic ? topicPath(topic, s.topics) : "Uncategorized"}
            />
            <Info label="Platform" value={item.platform || "—"} />
            <Info label="Last solved" value={fmt(item.lastSolvedAt, true)} />
            <Info
              label="Next revision"
              value={fmt(item.nextRevisionAt, true)}
            />
            <div>
              <dt className="label">Status</dt>
              <select
                value={item.status}
                onChange={(e) =>
                  s.updateItem(item.id, { status: e.target.value as Status })
                }
                className="field"
              >
                <>
                  {STATUS.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </>
              </select>
            </div>
          </dl>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="btn mt-5"
            >
              <ExternalLink size={14} />
              Open link
            </a>
          )}
          {item.tags.length > 0 && (
            <div className="mt-6">
              <p className="label">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6">
            <p className="label">Short revision note</p>
            <div className="min-h-20 rounded-md border bg-zinc-50 p-3 text-sm leading-6 dark:bg-zinc-900">
              {item.shortNote || <span className="muted">No note added.</span>}
            </div>
          </div>
          <div className="mt-7">
            <div className="mb-2 flex items-center justify-between">
              <p className="label mb-0">Detailed notes</p>
              <div className="flex items-center gap-3">
                {item.articleNote && (
                  <button
                    className="text-xs font-medium hover:underline"
                    onClick={() => nav(`/notes/${item.id}`)}
                  >
                    Read as article
                  </button>
                )}
                <button
                  className="text-xs font-medium hover:underline"
                  onClick={() => setEdit(true)}
                >
                  {item.articleNote ? "Edit notes" : "Add notes"}
                </button>
              </div>
            </div>
            {item.articleNote ? (
              <ArticleNotes content={item.articleNote} />
            ) : (
              <button
                onClick={() => setEdit(true)}
                className="w-full rounded-md border border-dashed p-6 text-sm muted hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                Paste explanations, approaches, code, or article notes for this
                problem.
              </button>
            )}
          </div>
          <div className="mt-7">
            <p className="label">Schedule revision</p>
            <div className="flex flex-wrap gap-2">
              {[
                [0, "Today"],
                [1, "Tomorrow"],
                [3, "In 3 days"],
                [7, "In 7 days"],
              ].map(([n, l]) => (
                <button
                  key={l as string}
                  className="btn text-xs"
                  onClick={() => schedule(n as number)}
                >
                  {l as string}
                </button>
              ))}
              <input
                type="date"
                className="field w-auto"
                value={item.nextRevisionAt ? dayKey(item.nextRevisionAt) : ""}
                onChange={(e) =>
                  s.updateItem(item.id, {
                    nextRevisionAt: e.target.value
                      ? new Date(e.target.value + "T12:00:00").toISOString()
                      : null,
                  })
                }
              />
            </div>
          </div>
          <div className="mt-7">
            <div className="flex items-center justify-between">
              <p className="label">Solve history</p>
              {history.length > 0 && (
                <button
                  className="text-xs muted hover:text-zinc-900"
                  onClick={() => s.undoSolve(item.id)}
                >
                  Undo last
                </button>
              )}
            </div>
            <div className="divide-y rounded-md border">
              {history.slice(0, 8).map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm"
                >
                  <Check size={14} />
                  {fmt(h.solvedAt, true)}
                </div>
              ))}
              {!history.length && (
                <div className="p-4 text-sm muted">No solve sessions yet.</div>
              )}
            </div>
          </div>
        </div>
        <div className="border-t p-4">
          <button
            className="btn btn-primary w-full"
            onClick={() => s.solve(item.id)}
          >
            <Check size={16} />
            Mark solved again
          </button>
        </div>
      </aside>
      {edit && (
        <ItemModal editItem={item} onClose={() => setEdit(false)} />
      )}{" "}
      {remove && (
        <Confirm
          title="Delete item?"
          body="This item and its complete solve history will be permanently removed."
          onClose={() => setRemove(false)}
          onConfirm={() => {
            s.deleteItem(item.id);
            nav(-1);
          }}
        />
      )}
    </>
  );
}
function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </div>
  );
}

function NoteInline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
  return (
    <>
      {parts.map((part, index) => {
        const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
        if (link)
          return (
            <a
              key={index}
              href={link[2]}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-2"
            >
              {link[1]}
            </a>
          );
        if (part.startsWith("`") && part.endsWith("`"))
          return (
            <code
              key={index}
              className="rounded bg-zinc-200 px-1 py-0.5 font-mono text-[12px] dark:bg-zinc-800"
            >
              {part.slice(1, -1)}
            </code>
          );
        return part;
      })}
    </>
  );
}

function ArticleNotes({ content, plain = false }: { content: string; plain?: boolean }) {
  const lines = content.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trimEnd();
    if (!line.trim()) {
      index++;
      continue;
    }
    if (line.trim().startsWith("```")) {
      const language = line.trim().slice(3);
      const code: string[] = [];
      index++;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        code.push(lines[index]);
        index++;
      }
      index++;
      blocks.push(
        <div key={`code-${index}`} className="my-4 overflow-hidden rounded-md border">
          {language && (
            <div className="border-b bg-zinc-100 px-3 py-1.5 text-[10px] uppercase tracking-wide muted dark:bg-zinc-900">
              {language}
            </div>
          )}
          <pre className="scrollbar overflow-x-auto bg-zinc-950 p-4 text-[12px] leading-5 text-zinc-100">
            <code>{code.join("\n")}</code>
          </pre>
        </div>,
      );
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      blocks.push(
        <div
          key={`heading-${index}`}
          className={`${level === 1 ? "mt-6 text-xl" : level === 2 ? "mt-5 text-base" : "mt-4 text-sm"} mb-2 font-semibold tracking-tight first:mt-0`}
        >
          <NoteInline text={heading[2]} />
        </div>,
      );
      index++;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const entries: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        entries.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index++;
      }
      blocks.push(
        <ul key={`list-${index}`} className="my-3 list-disc space-y-1.5 pl-5">
          {entries.map((entry, i) => (
            <li key={i}><NoteInline text={entry} /></li>
          ))}
        </ul>,
      );
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const entries: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        entries.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index++;
      }
      blocks.push(
        <ol key={`ordered-${index}`} className="my-3 list-decimal space-y-1.5 pl-5">
          {entries.map((entry, i) => (
            <li key={i}><NoteInline text={entry} /></li>
          ))}
        </ol>,
      );
      continue;
    }
    if (line.trim().startsWith(">")) {
      blocks.push(
        <blockquote key={`quote-${index}`} className="my-3 border-l-2 pl-4 italic muted">
          <NoteInline text={line.trim().replace(/^>\s?/, "")} />
        </blockquote>,
      );
      index++;
      continue;
    }
    const paragraph = [line.trim()];
    index++;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,3})\s+|^[-*]\s+|^\d+\.\s+|^>|^```/.test(lines[index].trim())
    ) {
      paragraph.push(lines[index].trim());
      index++;
    }
    blocks.push(
      <p key={`paragraph-${index}`} className="my-3 leading-6">
        <NoteInline text={paragraph.join(" ")} />
      </p>,
    );
  }
  return (
    <article
      className={
        plain
          ? "text-[15px] leading-7 text-zinc-700 dark:text-zinc-300"
          : "rounded-md border bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-900"
      }
    >
      {blocks}
    </article>
  );
}

function RevisionQueue() {
  const s = useStore();
  const due = s.items.filter((i) => i.nextRevisionAt);
  return (
    <Page
      title="Revision Queue"
      subtitle="Everything scheduled for review, grouped by urgency."
    >
      <QueueGroups items={due} />
    </Page>
  );
}
function QueueGroups({ items }: { items: StudyItem[] }) {
  const t = today();
  const tomorrow = new Date(t);
  tomorrow.setDate(t.getDate() + 1);
  const groups = [
    [
      "Overdue",
      items.filter((i) => i.nextRevisionAt && new Date(i.nextRevisionAt) < t),
    ],
    [
      "Today",
      items.filter((i) => dayKey(i.nextRevisionAt) === dayKey(t.toISOString())),
    ],
    [
      "Tomorrow",
      items.filter(
        (i) => dayKey(i.nextRevisionAt) === dayKey(tomorrow.toISOString()),
      ),
    ],
    [
      "Upcoming",
      items.filter(
        (i) => i.nextRevisionAt && new Date(i.nextRevisionAt) > tomorrow,
      ),
    ],
  ] as const;
  return (
    <div className="space-y-5">
      {groups.map(([name, list]) => (
        <section className="panel" key={name}>
          <div className="flex items-center justify-between border-b px-5 py-3.5">
            <h2 className="text-xs font-semibold uppercase tracking-[.14em]">
              {name}
            </h2>
            <span className="text-xs muted">{list.length}</span>
          </div>
          <div className="divide-y">
            {list
              .sort((a, b) =>
                a.nextRevisionAt!.localeCompare(b.nextRevisionAt!),
              )
              .map((i) => (
                <RevisionItem key={i.id} item={i} />
              ))}
            {!list.length && (
              <div className="px-5 py-6 text-sm muted">No items.</div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
function RevisionItem({ item }: { item: StudyItem }) {
  const s = useStore();
  const nav = useNavigate();
  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-3">
      <button
        className="min-w-40 flex-1 text-left"
        onClick={() => nav(`/item/${item.id}`)}
      >
        <div className="text-sm font-medium hover:underline">{item.title}</div>
        <div className="text-xs muted">
          {s.subjects.find((x) => x.id === item.subjectId)?.name} · Due{" "}
          {fmt(item.nextRevisionAt)}
        </div>
      </button>
      <span className="text-xs muted">{item.solveCount}×</span>
      <button
        className="btn h-8 text-xs"
        onClick={() => {
          s.solve(item.id);
          const d = new Date();
          d.setDate(d.getDate() + 3);
          s.updateItem(item.id, { nextRevisionAt: d.toISOString() });
        }}
      >
        <Check size={13} />
        Mark revised
      </button>
    </div>
  );
}

function QuickRevision() {
  const s = useStore();
  const nav = useNavigate();
  const candidates = useMemo(
    () =>
      [...s.items]
        .filter(
          (i) =>
            isDue(i.nextRevisionAt) ||
            i.status === "Revising" ||
            i.solveCount < 2,
        )
        .sort((a, b) =>
          (a.nextRevisionAt || "999").localeCompare(b.nextRevisionAt || "999"),
        ),
    [s.items],
  );
  const [idx, setIdx] = useState(0);
  const item = candidates[idx % candidates.length];
  if (!item)
    return (
      <Page
        title="Quick Revision"
        subtitle="One item at a time, zero distractions."
      >
        <div className="panel mx-auto max-w-2xl">
          <Empty text="No items need attention right now." />
        </div>
      </Page>
    );
  const next = () => setIdx((x) => x + 1);
  return (
    <Page
      title="Quick Revision"
      subtitle={`${idx + 1} of ${candidates.length} items in this session`}
    >
      <div className="panel mx-auto max-w-2xl p-6 sm:p-9">
        <div className="flex items-center justify-between">
          <span className="tag">{item.type}</span>
          <button
            className="icon-btn"
            onClick={() =>
              s.updateItem(item.id, { bookmarked: !item.bookmarked })
            }
          >
            <Star size={18} fill={item.bookmarked ? "currentColor" : "none"} />
          </button>
        </div>
        <h2 className="mt-8 text-2xl font-semibold tracking-tight">
          {item.title}
        </h2>
        <p className="mt-2 text-sm muted">
          {s.subjects.find((x) => x.id === item.subjectId)?.name}
          {item.topicId &&
            ` → ${topicPath(s.topics.find((x) => x.id === item.topicId)!, s.topics)}`}
        </p>
        {item.shortNote && (
          <div className="mt-8 rounded-md border bg-zinc-50 p-4 text-sm leading-6 dark:bg-zinc-900">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider muted">
              Revision note
            </p>
            {item.shortNote}
          </div>
        )}
        <div className="mt-8 grid grid-cols-2 gap-4 border-y py-5 text-sm">
          <Info label="Solved" value={`${item.solveCount} times`} />
          <Info label="Last revised" value={daysAgo(item.lastSolvedAt)} />
        </div>
        <div className="mt-7 flex flex-wrap gap-2">
          <button
            className="btn btn-primary flex-1"
            onClick={() => {
              s.solve(item.id);
              const d = new Date();
              d.setDate(d.getDate() + 3);
              s.updateItem(item.id, { nextRevisionAt: d.toISOString() });
              next();
            }}
          >
            <Check size={16} />
            Solved again
          </button>
          <button
            className="btn flex-1"
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() + 1);
              s.updateItem(item.id, {
                status: "Revising",
                nextRevisionAt: d.toISOString(),
              });
              next();
            }}
          >
            Need more practice
          </button>
          <button className="btn" onClick={next}>
            Skip
          </button>
          <button className="btn" onClick={() => nav(`/item/${item.id}`)}>
            Open item
          </button>
        </div>
      </div>
    </Page>
  );
}

function ItemList({ mode }: { mode: "recent" | "bookmarks" }) {
  const s = useStore();
  const items =
    mode === "bookmarks"
      ? s.items.filter((i) => i.bookmarked)
      : [...s.items]
          .filter((i) => i.lastSolvedAt)
          .sort((a, b) => b.lastSolvedAt!.localeCompare(a.lastSolvedAt!));
  return (
    <Page
      title={mode === "bookmarks" ? "Bookmarks" : "Recently Solved"}
      subtitle={
        mode === "bookmarks"
          ? "Starred items from every subject."
          : "Your study activity in reverse chronological order."
      }
    >
      <QuestionTable items={items} />
    </Page>
  );
}

function SettingsPage() {
  const s = useStore();
  const file = useRef<HTMLInputElement>(null);
  const [reset, setReset] = useState(false);
  const exportData = () => {
    const data: AppData = {
      subjects: s.subjects,
      topics: s.topics,
      items: s.items,
      history: s.history,
      settings: s.settings,
      dailyTargets: s.dailyTargets,
      dailyRecords: s.dailyRecords,
      dailyGoal: s.dailyGoal,
    };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    a.download = `revision-tracker-${dayKey(new Date().toISOString())}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importData = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const x = JSON.parse(String(r.result));
        if (
          !Array.isArray(x.subjects) ||
          !Array.isArray(x.topics) ||
          !Array.isArray(x.items) ||
          !Array.isArray(x.history)
        )
          throw Error();
        s.importData({ ...x, settings: x.settings || s.settings });
      } catch {
        alert("This file is not a valid Revision Tracker export.");
      }
    };
    r.readAsText(f);
  };
  return (
    <Page title="Settings" subtitle="Appearance, backups, and local data.">
      <div className="max-w-2xl space-y-5">
        <section className="panel">
          <SectionHead
            title="Appearance"
            subtitle="Choose how the dashboard looks on this device."
          />
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium">Dark mode</p>
              <p className="text-xs muted">
                Switch between light and dark themes.
              </p>
            </div>
            <button
              className="btn"
              onClick={() => s.setSettings({ darkMode: !s.settings.darkMode })}
            >
              {s.settings.darkMode ? <Sun size={16} /> : <Moon size={16} />}{" "}
              {s.settings.darkMode ? "Use light" : "Use dark"}
            </button>
          </div>
        </section>
        <section className="panel">
          <SectionHead
            title="Data & backups"
            subtitle="Your data lives only in this browser’s local storage."
          />
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            <button className="btn justify-start p-4" onClick={exportData}>
              <Download size={18} />
              <span className="text-left">
                <span className="block">Export data</span>
                <span className="block text-xs font-normal muted">
                  Download a JSON backup
                </span>
              </span>
            </button>
            <button
              className="btn justify-start p-4"
              onClick={() => file.current?.click()}
            >
              <Import size={18} />
              <span className="text-left">
                <span className="block">Import data</span>
                <span className="block text-xs font-normal muted">
                  Restore from a backup
                </span>
              </span>
            </button>
            {s.subjects.length === 0 && s.items.length === 0 && (
              <button
                className="btn justify-start p-4 sm:col-span-2"
                onClick={() => s.loadDemo()}
              >
                <Archive size={18} />
                <span className="text-left">
                  <span className="block">Add demo data</span>
                  <span className="block text-xs font-normal muted">
                    Add four example study items and two daily targets
                  </span>
                </span>
              </button>
            )}
            <input
              ref={file}
              hidden
              type="file"
              accept="application/json"
              onChange={(e) => importData(e.target.files?.[0])}
            />
          </div>
          <div className="border-t p-5">
            <button
              className="text-sm font-medium text-red-600 hover:underline"
              onClick={() => setReset(true)}
            >
              Delete all data
            </button>
            <p className="mt-1 text-xs muted">
              Permanently remove every locally stored subject and study record.
            </p>
          </div>
        </section>
      </div>
      {reset && (
        <Confirm
          title="Delete all data?"
          body="All subjects, topics, study items, daily targets, notes, and solve history will be permanently removed."
          onClose={() => setReset(false)}
          onConfirm={s.reset}
        />
      )}
    </Page>
  );
}

function NotesPage() {
  const { id } = useParams();
  const s = useStore();
  const nav = useNavigate();
  const item = s.items.find((entry) => entry.id === id);
  const subject = s.subjects.find((entry) => entry.id === item?.subjectId);
  const topic = s.topics.find((entry) => entry.id === item?.topicId);
  const [edit, setEdit] = useState(false);

  if (!item)
    return (
      <Page title="Notes not found">
        <Empty text="This study item no longer exists." />
      </Page>
    );

  return (
    <div className="min-h-full bg-white dark:bg-zinc-950">
      <article className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <button
          className="btn mb-10 h-8 text-xs"
          onClick={() => nav(-1)}
        >
          <ChevronRight className="rotate-180" size={14} />
          Back
        </button>

        <header className="border-b pb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="tag">{item.type}</span>
            {item.difficulty !== "None" && (
              <span className="tag">{item.difficulty}</span>
            )}
            <Badge status={item.status} />
          </div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {item.title}
          </h1>
          <p className="mt-4 text-sm muted">
            {subject?.name || "Uncategorized"}
            {topic && ` · ${topicPath(topic, s.topics)}`}
            {item.platform && ` · ${item.platform}`}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button className="btn" onClick={() => setEdit(true)}>
              <Edit3 size={14} />
              Edit notes
            </button>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="btn"
              >
                <ExternalLink size={14} />
                Open problem
              </a>
            )}
          </div>
        </header>

        {item.shortNote && (
          <aside className="my-8 rounded-md border-l-4 border-zinc-900 bg-zinc-50 px-5 py-4 text-sm leading-6 dark:border-zinc-100 dark:bg-zinc-900">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.14em] muted">
              Quick revision note
            </p>
            {item.shortNote}
          </aside>
        )}

        <div className="py-5">
          {item.articleNote ? (
            <ArticleNotes content={item.articleNote} plain />
          ) : (
            <div className="rounded-lg border border-dashed py-16 text-center">
              <BookOpen className="mx-auto mb-3 text-zinc-400" size={24} />
              <p className="text-sm muted">No detailed notes have been added.</p>
              <button
                className="btn btn-primary mt-5"
                onClick={() => setEdit(true)}
              >
                <Plus size={15} />
                Add notes
              </button>
            </div>
          )}
        </div>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6 text-xs muted">
          <span>{item.solveCount} solve sessions</span>
          <span>Last revised {fmt(item.lastSolvedAt, true)}</span>
        </footer>
      </article>
      {edit && <ItemModal editItem={item} onClose={() => setEdit(false)} />}
    </div>
  );
}

const dailyDate = () => new Date().toLocaleDateString("en-CA");
const PRIORITIES: DailyPriority[] = ["High", "Medium", "Low"];
const TARGET_TYPES: DailyTargetType[] = [
  "Solve",
  "Revise",
  "Learn",
  "Read",
  "Practice",
  "Custom",
];
const TARGET_STATUSES: DailyTargetStatus[] = [
  "To Do",
  "In Progress",
  "Completed",
];
const priorityRank = (p: DailyPriority) => PRIORITIES.indexOf(p);

function getStreak(targets: DailyTarget[]) {
  const active = new Set(
    targets.filter((t) => t.status === "Completed").map((t) => t.date),
  );
  let current = 0;
  const cursor = new Date();
  if (!active.has(cursor.toLocaleDateString("en-CA"))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (active.has(cursor.toLocaleDateString("en-CA"))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }
  const dates = [...active].sort();
  let longest = 0,
    run = 0,
    prev = "";
  dates.forEach((x) => {
    const d = new Date(x + "T12:00:00");
    const p = prev ? new Date(prev + "T12:00:00") : null;
    run = p && (d.getTime() - p.getTime()) / 864e5 === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = x;
  });
  return { current, longest };
}

function DailyTargetPage() {
  const s = useStore();
  const nav = useNavigate();
  const date = dailyDate();
  const [modal, setModal] = useState(false);
  const [random, setRandom] = useState(false);
  const [quick, setQuick] = useState("");
  const [goalEdit, setGoalEdit] = useState(false);
  const todays = s.dailyTargets
    .filter((t) => t.date === date)
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
  const completed = todays.filter((t) => t.status === "Completed").length;
  const goal = s.dailyGoal.enabled ? s.dailyGoal.dailyItemGoal : todays.length;
  const remaining = Math.max(0, goal - completed);
  const solvedToday = s.history.filter(
    (h) => dayKey(h.solvedAt) === date,
  ).length;
  const revisions = todays.filter(
    (t) => t.status === "Completed" && t.type === "Revise",
  ).length;
  const pct = goal ? Math.min(100, Math.round((completed / goal) * 100)) : 0;
  const old = s.dailyTargets.filter(
    (t) => t.date < date && t.status !== "Completed",
  );
  const due = s.items.filter(
    (i) =>
      isDue(i.nextRevisionAt) && !todays.some((t) => t.studyItemId === i.id),
  );
  const addQuick = (e: FormEvent) => {
    e.preventDefault();
    if (quick.trim()) {
      s.addDailyTarget({ title: quick.trim() });
      setQuick("");
    }
  };
  const addAllDue = () =>
    due.forEach((i) =>
      s.addDailyTarget({
        title: i.title,
        studyItemId: i.id,
        subjectId: i.subjectId,
        topicId: i.topicId,
        type: "Revise",
        priority: "High",
      }),
    );
  const moveAll = () => old.forEach((t) => s.moveDailyTarget(t.id, date));
  return (
    <Page
      title="Daily Target"
      subtitle={new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}
      action={
        <button className="btn btn-primary" onClick={() => nav("/daily-focus")}>
          <Zap size={16} />
          Start revision
        </button>
      }
    >
      {old.length > 0 && (
        <section className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-dashed px-5 py-4">
          <Clock3 size={17} />
          <div className="min-w-48 flex-1">
            <p className="text-sm font-medium">
              {old.length} unfinished {old.length === 1 ? "task" : "tasks"} from
              earlier
            </p>
            <p className="text-xs muted">
              Move them forward, choose individually below, or dismiss them.
            </p>
          </div>
          <button className="btn text-xs" onClick={moveAll}>
            Move all to today
          </button>
          <button
            className="btn text-xs"
            onClick={() => old.forEach((t) => s.deleteDailyTarget(t.id))}
          >
            Dismiss
          </button>
        </section>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {[
          [goal, "Target"],
          [completed, "Completed"],
          [remaining, "Remaining"],
          [solvedToday, "Questions solved"],
          [revisions, "Concepts revised"],
          [`${pct}%`, "Progress"],
        ].map(([v, l]) => (
          <div className="panel p-4" key={l as string}>
            <div className="text-xl font-semibold">{v}</div>
            <div className="mt-1 text-[11px] muted">{l}</div>
          </div>
        ))}
      </div>
      <section className="panel mt-5 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Today’s progress · {completed} / {goal}
          </span>
          <button
            className="text-xs muted hover:text-zinc-900 dark:hover:text-white"
            onClick={() => setGoalEdit(true)}
          >
            Change daily goal
          </button>
        </div>
        <div className="mt-3">
          <Progress value={pct} />
        </div>
      </section>
      <form onSubmit={addQuick} className="panel mt-5 flex gap-2 p-3">
        <input
          aria-label="Quick add daily target"
          className="field border-0 shadow-none"
          value={quick}
          onChange={(e) => setQuick(e.target.value)}
          placeholder="Add something to today’s target..."
        />
        <button className="btn btn-primary" disabled={!quick.trim()}>
          <Plus size={15} />
          Add
        </button>
      </form>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {TARGET_STATUSES.map((status) => (
            <DailySection
              key={status}
              title={status}
              targets={todays.filter((t) => t.status === status)}
            />
          ))}
        </div>
        <aside className="space-y-5">
          <section className="panel">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">
                  Due for Revision — {due.length}
                </h2>
                <p className="text-[11px] muted">Items due today or overdue</p>
              </div>
              {due.length > 0 && (
                <button
                  className="text-xs font-medium hover:underline"
                  onClick={addAllDue}
                >
                  Add all
                </button>
              )}
            </div>
            <div className="divide-y">
              {due.slice(0, 6).map((i) => (
                <div key={i.id} className="flex items-center gap-2 px-4 py-3">
                  <button
                    className="min-w-0 flex-1 truncate text-left text-sm"
                    onClick={() => nav(`/item/${i.id}`)}
                  >
                    {i.title}
                  </button>
                  <button
                    className="icon-btn"
                    title="Add to today"
                    onClick={() =>
                      s.addDailyTarget({
                        title: i.title,
                        studyItemId: i.id,
                        subjectId: i.subjectId,
                        topicId: i.topicId,
                        type: "Revise",
                        priority: "High",
                      })
                    }
                  >
                    <Plus size={15} />
                  </button>
                </div>
              ))}
              {!due.length && (
                <div className="p-5 text-sm muted">
                  No unplanned revisions due.
                </div>
              )}
            </div>
          </section>
          <SubjectDailyProgress targets={todays} />
          <button className="btn w-full" onClick={() => setRandom(true)}>
            <Shuffle size={16} />
            Pick random question
          </button>
          <button className="btn w-full" onClick={() => setModal(true)}>
            <Plus size={16} />
            Add detailed target
          </button>
        </aside>
      </div>
      {old.length > 0 && (
        <section className="panel mt-5">
          <SectionHead
            title="Earlier unfinished"
            subtitle="Move selected items to today."
          />
          <div className="divide-y">
            {old.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                <span className="min-w-0 flex-1 truncate text-sm">
                  {t.title}
                </span>
                <span className="text-xs muted">
                  {fmt(t.date + "T12:00:00")}
                </span>
                <button
                  className="btn h-8 text-xs"
                  onClick={() => s.moveDailyTarget(t.id, date)}
                >
                  Move to today
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      <DailyNote date={date} />
      {modal && <DailyTargetModal onClose={() => setModal(false)} />}{" "}
      {random && <RandomPicker onClose={() => setRandom(false)} />}{" "}
      {goalEdit && <GoalModal onClose={() => setGoalEdit(false)} />}
    </Page>
  );
}

function DailySection({
  title,
  targets,
}: {
  title: DailyTargetStatus;
  targets: DailyTarget[];
}) {
  return (
    <section className="panel">
      <div className="flex items-center justify-between border-b px-5 py-3.5">
        <h2 className="text-xs font-semibold uppercase tracking-[.14em]">
          {title}
        </h2>
        <span className="text-xs muted">{targets.length}</span>
      </div>
      <div className="divide-y">
        {targets.map((t) => (
          <DailyTargetRow key={t.id} target={t} />
        ))}
        {!targets.length && (
          <div className="px-5 py-6 text-sm muted">No items.</div>
        )}
      </div>
    </section>
  );
}
function DailyTargetRow({ target }: { target: DailyTarget }) {
  const s = useStore();
  const nav = useNavigate();
  const item = s.items.find((i) => i.id === target.studyItemId);
  const topic = s.topics.find(
    (t) => t.id === (target.topicId || item?.topicId),
  );
  const priorityClass =
    target.priority === "High"
      ? "bg-zinc-900 dark:bg-white"
      : target.priority === "Medium"
        ? "bg-zinc-500"
        : "bg-zinc-300 dark:bg-zinc-600";
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3">
      <button
        aria-label="Toggle complete"
        className={`flex size-5 items-center justify-center rounded border ${target.status === "Completed" ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : ""}`}
        onClick={() => s.completeDailyTarget(target.id, "plain")}
      >
        {target.status === "Completed" && <Check size={13} />}
      </button>
      <span
        title={`${target.priority} priority`}
        className={`size-1.5 rounded-full ${priorityClass}`}
      />
      <button
        onClick={() => item && nav(`/item/${item.id}`)}
        className="min-w-40 flex-1 text-left"
      >
        <div
          className={`text-sm font-medium ${target.status === "Completed" ? "text-zinc-400 line-through" : ""}`}
        >
          {target.title}
        </div>
        <div className="text-[11px] muted">
          {target.type}
          {topic && ` · ${topicPath(topic, s.topics)}`}
          {item && ` · ${item.solveCount}× solved`}
        </div>
      </button>
      {item?.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="icon-btn border"
          title="Open link"
          aria-label={`Open link for ${item.title}`}
        >
          <ExternalLink size={13} />
        </a>
      )}
      <select
        aria-label="Target status"
        className="field h-8 w-auto py-1 text-xs"
        value={target.status}
        onChange={(e) => {
          const status = e.target.value as DailyTargetStatus;
          if (status === "Completed")
            s.completeDailyTarget(
              target.id,
              target.type === "Revise" ? "revision" : "plain",
            );
          else s.updateDailyTarget(target.id, { status, completedAt: null });
        }}
      >
        {TARGET_STATUSES.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
      {item && target.status !== "Completed" && (
        <button
          className="btn h-8 text-xs"
          onClick={() => s.completeDailyTarget(target.id, "solve")}
        >
          <Check size={13} />
          Solved
        </button>
      )}
      <button
        className="icon-btn"
        title="Remove target"
        onClick={() => s.deleteDailyTarget(target.id)}
      >
        <X size={14} />
      </button>
    </div>
  );
}

function DailyTargetModal({ onClose }: { onClose: () => void }) {
  const s = useStore();
  const [itemId, setItemId] = useState("");
  const item = s.items.find((i) => i.id === itemId);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    s.addDailyTarget({
      title: String(f.get("title")) || item?.title || "",
      studyItemId: itemId || null,
      subjectId: item?.subjectId || String(f.get("subject")) || null,
      topicId: item?.topicId || null,
      type: String(f.get("type")) as DailyTargetType,
      priority: String(f.get("priority")) as DailyPriority,
    });
    onClose();
  };
  return (
    <Modal title="Add daily target" onClose={onClose}>
      <form className="grid gap-4 p-5 sm:grid-cols-2" onSubmit={submit}>
        <div className="sm:col-span-2">
          <label className="label">Title *</label>
          <input
            name="title"
            required={!itemId}
            defaultValue={item?.title}
            className="field"
            placeholder="What do you want to finish?"
          />
        </div>
        <div>
          <label className="label">
            Study item <span className="font-normal muted">(optional)</span>
          </label>
          <select
            className="field"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
          >
            <option value="">Manual target</option>
            {s.items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Subject</label>
          <select
            name="subject"
            className="field"
            disabled={!!itemId}
            defaultValue={item?.subjectId || ""}
          >
            <option value="">None</option>
            {s.subjects.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Target type</label>
          <select name="type" defaultValue="Solve" className="field">
            {TARGET_TYPES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select name="priority" defaultValue="Medium" className="field">
            {PRIORITIES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 border-t pt-4 sm:col-span-2">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary">Add to today</button>
        </div>
      </form>
    </Modal>
  );
}

function GoalModal({ onClose }: { onClose: () => void }) {
  const s = useStore();
  const [goal, setGoal] = useState(s.dailyGoal.dailyItemGoal);
  return (
    <Modal title="Daily study goal" onClose={onClose} width="max-w-md">
      <form
        className="space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          s.setDailyGoal({ dailyItemGoal: Math.max(1, goal), enabled: true });
          onClose();
        }}
      >
        <div>
          <label className="label">Study items per day</label>
          <input
            autoFocus
            type="number"
            min="1"
            max="100"
            className="field"
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={s.dailyGoal.enabled}
            onChange={(e) => s.setDailyGoal({ enabled: e.target.checked })}
          />{" "}
          Enable daily goal
        </label>
        <div className="flex justify-end">
          <button className="btn btn-primary">Save goal</button>
        </div>
      </form>
    </Modal>
  );
}

function SubjectDailyProgress({ targets }: { targets: DailyTarget[] }) {
  const s = useStore();
  const active = s.subjects
    .map((sub) => {
      const all = targets.filter(
        (t) =>
          t.subjectId === sub.id ||
          s.items.find((i) => i.id === t.studyItemId)?.subjectId === sub.id,
      );
      return {
        sub,
        all,
        done: all.filter((t) => t.status === "Completed").length,
      };
    })
    .filter((x) => x.all.length);
  return (
    <section className="panel">
      <SectionHead title="By subject" subtitle="Today’s planned coverage" />
      <div className="space-y-4 p-4">
        {active.map(({ sub, all, done }) => (
          <div key={sub.id}>
            <div className="mb-1.5 flex justify-between text-xs">
              <span>{sub.name}</span>
              <span className="muted">
                {done} / {all.length}
              </span>
            </div>
            <Progress value={all.length ? (done / all.length) * 100 : 0} />
          </div>
        ))}
        {!active.length && (
          <p className="text-sm muted">No subject-linked targets yet.</p>
        )}
      </div>
    </section>
  );
}
function DailyNote({ date }: { date: string }) {
  const s = useStore();
  const note = s.dailyRecords.find((r) => r.date === date)?.shortNote || "";
  return (
    <section className="panel mt-5 p-5">
      <label className="label">Today’s note</label>
      <textarea
        maxLength={240}
        rows={2}
        value={note}
        onChange={(e) => s.setDailyNote(date, e.target.value)}
        className="field resize-none"
        placeholder="A short reminder or reflection for today..."
      />
      <div className="mt-1 text-right text-[10px] muted">{note.length}/240</div>
    </section>
  );
}

function RandomPicker({ onClose }: { onClose: () => void }) {
  const s = useStore();
  const [subject, setSubject] = useState("All");
  const [topic, setTopic] = useState("All");
  const [mode, setMode] = useState("any");
  const pool = useMemo(
    () =>
      s.items.filter(
        (i) =>
          (subject === "All" || i.subjectId === subject) &&
          (topic === "All" || i.topicId === topic) &&
          (mode !== "weak" || i.solveCount < 2 || i.status === "Revising") &&
          (mode !== "due" || isDue(i.nextRevisionAt)) &&
          (mode !== "stale" ||
            !i.lastSolvedAt ||
            (today().getTime() - new Date(i.lastSolvedAt).getTime()) / 864e5 >=
              7),
      ),
    [s.items, subject, topic, mode],
  );
  const [pick, setPick] = useState<StudyItem | undefined>();
  const choose = () => setPick(pool[Math.floor(Math.random() * pool.length)]);
  useEffect(() => {
    choose();
  }, [subject, topic, mode]);
  return (
    <Modal title="Pick random question" onClose={onClose}>
      <div className="grid gap-2 border-b p-4 sm:grid-cols-3">
        <select
          className="field"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setTopic("All");
          }}
        >
          <option value="All">Any subject</option>
          {s.subjects.map((x) => (
            <option value={x.id} key={x.id}>
              {x.name}
            </option>
          ))}
        </select>
        <select
          className="field"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option value="All">Any topic</option>
          {s.topics
            .filter((t) => subject === "All" || t.subjectId === subject)
            .map((t) => (
              <option value={t.id} key={t.id}>
                {t.name}
              </option>
            ))}
        </select>
        <select
          className="field"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="any">Any item</option>
          <option value="weak">Weak only</option>
          <option value="due">Due only</option>
          <option value="stale">Not solved recently</option>
        </select>
      </div>
      <div className="p-6">
        {pick ? (
          <>
            <span className="tag">{pick.difficulty}</span>
            <h3 className="mt-4 text-xl font-semibold">{pick.title}</h3>
            <p className="mt-2 text-sm muted">
              {s.topics.find((t) => t.id === pick.topicId)?.name ||
                s.subjects.find((x) => x.id === pick.subjectId)?.name}
            </p>
            <div className="mt-5 flex gap-5 text-sm">
              <span>{pick.solveCount}× solved</span>
              <span className="muted">Last: {daysAgo(pick.lastSolvedAt)}</span>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  s.addDailyTarget({
                    title: pick.title,
                    studyItemId: pick.id,
                    subjectId: pick.subjectId,
                    topicId: pick.topicId,
                    type: "Revise",
                  });
                  onClose();
                }}
              >
                Start
              </button>
              <button className="btn" onClick={choose}>
                <Shuffle size={14} />
                Pick another
              </button>
            </div>
          </>
        ) : (
          <Empty text="No items match these filters." />
        )}
      </div>
    </Modal>
  );
}

function DailyFocus() {
  const s = useStore();
  const nav = useNavigate();
  const date = dailyDate();
  const targets = s.dailyTargets
    .filter((t) => t.date === date && t.status !== "Completed")
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
  const [index, setIndex] = useState(0);
  const target = targets[index % Math.max(1, targets.length)];
  if (!target)
    return (
      <Page title="Today’s Focus" subtitle="Distraction-free daily revision">
        <div className="panel mx-auto max-w-2xl">
          <Empty text="Every target is complete. Nice work." />
          <div className="flex justify-center pb-8">
            <button className="btn" onClick={() => nav("/daily")}>
              Back to daily target
            </button>
          </div>
        </div>
      </Page>
    );
  const item = s.items.find((i) => i.id === target.studyItemId);
  const topic = s.topics.find(
    (t) => t.id === (target.topicId || item?.topicId),
  );
  const next = () => setIndex((x) => x + 1);
  return (
    <Page
      title="Today’s Focus"
      subtitle={`${Math.min(index + 1, targets.length)} of ${targets.length} remaining`}
    >
      <div className="panel mx-auto max-w-2xl p-7 sm:p-10">
        <span className="tag">
          {target.type} · {target.priority} priority
        </span>
        <h2 className="mt-7 text-2xl font-semibold">{target.title}</h2>
        <p className="mt-2 text-sm muted">
          {topic
            ? topicPath(topic, s.topics)
            : s.subjects.find(
                (x) => x.id === (target.subjectId || item?.subjectId),
              )?.name || "Personal target"}
        </p>
        {item && (
          <div className="mt-8 grid grid-cols-2 border-y py-5">
            <Info label="Last solved" value={daysAgo(item.lastSolvedAt)} />
            <Info label="Solve count" value={`${item.solveCount} times`} />
          </div>
        )}
        {item?.url && (
          <a
            className="btn mt-6"
            href={item.url}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={15} />
            Open question
          </a>
        )}
        <div className="mt-8 flex flex-wrap gap-2">
          <button
            className="btn btn-primary flex-1"
            onClick={() => {
              s.completeDailyTarget(target.id, item ? "solve" : "plain");
            }}
          >
            <Check size={16} />
            Completed
          </button>
          <button
            className="btn flex-1"
            onClick={() => {
              s.updateDailyTarget(target.id, { status: "In Progress" });
              if (item) s.updateItem(item.id, { status: "Revising" });
              next();
            }}
          >
            Need more practice
          </button>
          <button className="btn" onClick={next}>
            Skip
          </button>
        </div>
      </div>
    </Page>
  );
}

function DailyHistory() {
  const s = useStore();
  const [selected, setSelected] = useState(dailyDate());
  const dates = useMemo(
    () =>
      [
        ...new Set([
          ...s.dailyTargets.map((t) => t.date),
          ...s.dailyRecords.map((r) => r.date),
        ]),
      ]
        .sort()
        .reverse(),
    [s.dailyTargets, s.dailyRecords],
  );
  const streak = getStreak(s.dailyTargets);
  const selectedTargets = s.dailyTargets.filter((t) => t.date === selected);
  const monthDays = calendarDays(new Date());
  return (
    <Page
      title="Daily History"
      subtitle="A quiet record of your study consistency."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <Flame size={17} />
            <span className="text-sm font-medium">Current study streak</span>
          </div>
          <div className="mt-3 text-3xl font-semibold">
            {streak.current}{" "}
            <span className="text-base font-normal muted">days</span>
          </div>
        </div>
        <div className="panel p-5">
          <div className="text-sm font-medium">Longest streak</div>
          <div className="mt-3 text-3xl font-semibold">
            {streak.longest}{" "}
            <span className="text-base font-normal muted">days</span>
          </div>
        </div>
      </div>
      <section className="panel mt-5 p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <p className="text-xs muted">
            Activity intensity reflects completed targets.
          </p>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="pb-1 text-center text-[10px] muted">
              {d}
            </div>
          ))}
          {monthDays.map((d, i) => {
            if (!d) return <div key={i} />;
            const key = d.toLocaleDateString("en-CA");
            const n = s.dailyTargets.filter(
              (t) => t.date === key && t.status === "Completed",
            ).length;
            const shade =
              n === 0
                ? "bg-zinc-100 dark:bg-zinc-800"
                : n < 3
                  ? "bg-zinc-300 dark:bg-zinc-600"
                  : n < 6
                    ? "bg-zinc-600 dark:bg-zinc-400"
                    : "bg-zinc-950 dark:bg-white";
            return (
              <button
                title={`${key}: ${n} completed`}
                key={key}
                onClick={() => setSelected(key)}
                className={`aspect-square rounded-sm text-[10px] ${shade} ${n > 2 ? "text-white dark:text-zinc-950" : ""} ${selected === key ? "ring-2 ring-zinc-500 ring-offset-2 dark:ring-offset-zinc-900" : ""}`}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </section>
      <div className="mt-5 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <section className="panel">
          <SectionHead
            title="Study days"
            subtitle="Select a date to inspect it."
          />
          <div className="scrollbar max-h-[420px] divide-y overflow-y-auto">
            {dates.map((date) => {
              const all = s.dailyTargets.filter((t) => t.date === date);
              const done = all.filter((t) => t.status === "Completed").length;
              const pct = all.length
                ? Math.round((done / all.length) * 100)
                : 0;
              return (
                <button
                  key={date}
                  onClick={() => setSelected(date)}
                  className={`flex w-full items-center gap-4 px-5 py-4 text-left ${selected === date ? "bg-zinc-50 dark:bg-zinc-800" : ""}`}
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {new Date(date + "T12:00:00").toLocaleDateString(
                        "en-US",
                        { month: "long", day: "numeric" },
                      )}
                    </div>
                    <div className="text-xs muted">
                      {done} / {all.length} completed
                    </div>
                  </div>
                  <span className="text-sm font-medium">{pct}%</span>
                </button>
              );
            })}
            {!dates.length && (
              <Empty text="Complete a daily target to begin your history." />
            )}
          </div>
        </section>
        <section className="panel">
          <SectionHead
            title={new Date(selected + "T12:00:00").toLocaleDateString(
              "en-US",
              { month: "long", day: "numeric", year: "numeric" },
            )}
            subtitle={`${selectedTargets.filter((t) => t.status === "Completed").length} of ${selectedTargets.length} targets completed`}
          />
          <div className="divide-y">
            {selectedTargets.map((t) => (
              <div className="flex items-center gap-3 px-5 py-3" key={t.id}>
                {t.status === "Completed" ? (
                  <Check size={15} />
                ) : (
                  <Clock3 size={15} className="text-zinc-400" />
                )}
                <span className="flex-1 text-sm">{t.title}</span>
                <span className="tag">{t.type}</span>
              </div>
            ))}
            {!selectedTargets.length && (
              <Empty text="No targets recorded for this date." />
            )}
          </div>
          {s.dailyRecords.find((r) => r.date === selected)?.shortNote && (
            <div className="border-t p-5">
              <p className="label">Daily note</p>
              <p className="text-sm">
                {s.dailyRecords.find((r) => r.date === selected)?.shortNote}
              </p>
            </div>
          )}
        </section>
      </div>
    </Page>
  );
}
function calendarDays(base: Date) {
  const y = base.getFullYear(),
    m = base.getMonth(),
    first = new Date(y, m, 1).getDay(),
    count = new Date(y, m + 1, 0).getDate();
  return [
    ...Array(first).fill(null),
    ...Array.from({ length: count }, (_, i) => new Date(y, m, i + 1)),
  ] as (Date | null)[];
}

export default function App() {
  return <Shell />;
}
