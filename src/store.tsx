import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AppData,
  DailyGoal,
  DailyPriority,
  DailyTarget,
  DailyTargetStatus,
  DailyTargetType,
  Settings,
  StudyItem,
  Subject,
  Topic,
} from "./types";

const uid = () => crypto.randomUUID();
const toast = (message: string) =>
  window.dispatchEvent(new CustomEvent("revision-toast", { detail: message }));
const iso = (offset = 0) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString();
};
const makeSeed = (): AppData => {
  const created = iso(-30);
  const subjects = [
    ["dsa", "DSA", "⌘"],
    ["os", "Operating Systems", "◫"],
    ["sd", "System Design", "◇"],
    ["net", "Networking", "◎"],
  ].map(([id, name, icon]) => ({ id, name, icon, createdAt: created }));
  const topics: Topic[] = [
    ["greedy", "dsa", null, "Greedy"],
    ["basic", "dsa", "greedy", "Basic Greedy"],
    ["gdp", "dsa", "greedy", "Greedy + DP"],
    ["segment", "dsa", null, "Segment Tree"],
    ["deadlocks", "os", null, "Deadlocks"],
    ["load", "sd", null, "Load Balancing"],
    ["http", "net", null, "HTTP"],
  ].map(([id, subjectId, parentTopicId, name]) => ({
    id: id!,
    subjectId: subjectId!,
    parentTopicId: parentTopicId || null,
    name: name!,
    createdAt: created,
  }));
  const raw: Array<
    Partial<StudyItem> &
      Pick<StudyItem, "id" | "subjectId" | "topicId" | "title">
  > = [
    {
      id: "activity",
      subjectId: "dsa",
      topicId: "basic",
      title: "Activity Selection",
      difficulty: "Easy",
      status: "Solved",
      solveCount: 4,
      lastSolvedAt: iso(-2),
      nextRevisionAt: iso(0),
      tags: ["Greedy"],
      platform: "GeeksforGeeks",
      url: "https://www.geeksforgeeks.org/dsa/activity-selection-problem-greedy-algo-1/",
    },
    {
      id: "knapsack",
      subjectId: "dsa",
      topicId: "basic",
      title: "Fractional Knapsack",
      difficulty: "Medium",
      status: "Learning",
      solveCount: 2,
      lastSolvedAt: iso(-5),
      nextRevisionAt: iso(-1),
      tags: ["Greedy", "Sorting"],
    },
    {
      id: "events",
      subjectId: "dsa",
      topicId: "gdp",
      title: "Maximum Value of Events",
      difficulty: "Hard",
      status: "Revising",
      solveCount: 3,
      lastSolvedAt: iso(-4),
      nextRevisionAt: iso(1),
      tags: ["Greedy", "DP", "Intervals"],
      shortNote:
        "Sort events by ending time. Use binary search to find the previous non-overlapping event.",
      articleNote:
        "# Maximum Value of Events\n\n## Core approach\n- Sort events by start time.\n- Use binary search to find the next non-overlapping event.\n- Apply dynamic programming on the event index and remaining choices.\n\n> The next event must start strictly after the current event ends.\n\n## Complexity\n`O(n log n)` after sorting.\n\n```ts\nconst next = upperBound(starts, event.end)\n```",
      platform: "LeetCode",
      url: "https://leetcode.com/problems/maximum-number-of-events-that-can-be-attended-ii/",
    },
    {
      id: "range-sum",
      subjectId: "dsa",
      topicId: "segment",
      title: "Range Sum Query",
      difficulty: "Medium",
      status: "Solved",
      solveCount: 3,
      lastSolvedAt: iso(-8),
      nextRevisionAt: iso(3),
      tags: ["Segment Tree"],
    },
    {
      id: "range-min",
      subjectId: "dsa",
      topicId: "segment",
      title: "Range Minimum Query",
      difficulty: "Medium",
      status: "Not Started",
      solveCount: 0,
      tags: ["Segment Tree"],
    },
    {
      id: "prevention",
      subjectId: "os",
      topicId: "deadlocks",
      title: "Deadlock Prevention",
      type: "Concept",
      difficulty: "None",
      status: "Solved",
      solveCount: 2,
      lastSolvedAt: iso(-6),
      nextRevisionAt: iso(0),
      tags: ["Deadlocks"],
      url: "https://en.wikipedia.org/wiki/Deadlock_prevention_algorithms",
    },
    {
      id: "avoidance",
      subjectId: "os",
      topicId: "deadlocks",
      title: "Deadlock Avoidance",
      type: "Concept",
      difficulty: "None",
      status: "Learning",
      solveCount: 1,
      lastSolvedAt: iso(-9),
      nextRevisionAt: iso(-2),
      tags: ["Deadlocks", "Banker’s Algorithm"],
    },
    {
      id: "dining",
      subjectId: "os",
      topicId: "deadlocks",
      title: "Dining Philosophers",
      difficulty: "Medium",
      status: "Revising",
      solveCount: 2,
      lastSolvedAt: iso(-3),
      nextRevisionAt: iso(2),
      tags: ["Concurrency"],
    },
    {
      id: "l4",
      subjectId: "sd",
      topicId: "load",
      title: "L4 Load Balancer",
      type: "Concept",
      difficulty: "None",
      status: "Mastered",
      solveCount: 5,
      lastSolvedAt: iso(-7),
      tags: ["Load Balancing"],
      url: "https://en.wikipedia.org/wiki/Load_balancing_(computing)",
    },
    {
      id: "l7",
      subjectId: "sd",
      topicId: "load",
      title: "L7 Load Balancer",
      type: "Concept",
      difficulty: "None",
      status: "Solved",
      solveCount: 3,
      lastSolvedAt: iso(-4),
      nextRevisionAt: iso(7),
      tags: ["Load Balancing"],
    },
    {
      id: "http1",
      subjectId: "net",
      topicId: "http",
      title: "HTTP/1.1",
      type: "Concept",
      difficulty: "None",
      status: "Solved",
      solveCount: 2,
      lastSolvedAt: iso(-10),
      nextRevisionAt: iso(4),
      tags: ["HTTP"],
    },
    {
      id: "http2",
      subjectId: "net",
      topicId: "http",
      title: "HTTP/2",
      type: "Concept",
      difficulty: "None",
      status: "Learning",
      solveCount: 1,
      lastSolvedAt: iso(-12),
      nextRevisionAt: iso(1),
      tags: ["HTTP"],
    },
    {
      id: "http3",
      subjectId: "net",
      topicId: "http",
      title: "HTTP/3",
      type: "Article",
      difficulty: "None",
      status: "Not Started",
      solveCount: 0,
      nextRevisionAt: iso(6),
      tags: ["HTTP", "QUIC"],
    },
  ];
  const items = raw.map(
    (x) =>
      ({
        type: "Question",
        difficulty: "None",
        status: "Not Started",
        platform: "",
        url: "",
        tags: [],
        shortNote: "",
        solveCount: 0,
        lastSolvedAt: null,
        nextRevisionAt: null,
        bookmarked: false,
        createdAt: created,
        ...x,
      }) as StudyItem,
  );
  const history = items.flatMap((item) =>
    Array.from({ length: item.solveCount }, (_, i) => ({
      id: uid(),
      studyItemId: item.id,
      solvedAt: iso(-(i + 1) * 3),
    })),
  );
  return {
    subjects,
    topics,
    items,
    history,
    settings: { darkMode: false, sidebarCollapsed: false },
    dailyTargets: [],
    dailyRecords: [],
    dailyGoal: { dailyItemGoal: 5, enabled: true },
  };
};
const makeEmpty = (): AppData => ({
  subjects: [],
  topics: [],
  items: [],
  history: [],
  settings: { darkMode: false, sidebarCollapsed: false },
  dailyTargets: [],
  dailyRecords: [],
  dailyGoal: { dailyItemGoal: 5, enabled: true },
});
const makeDemo = (): AppData => {
  const seed = makeSeed();
  const itemIds = ["activity", "events", "prevention", "l4"];
  const items = seed.items.filter((item) => itemIds.includes(item.id));
  const subjectIds = [...new Set(items.map((item) => item.subjectId))];
  const topicIds = new Set(items.map((item) => item.topicId).filter(Boolean));
  seed.topics.forEach((topic) => {
    if (topicIds.has(topic.id) && topic.parentTopicId)
      topicIds.add(topic.parentTopicId);
  });
  const date = new Date().toLocaleDateString("en-CA");
  const now = new Date().toISOString();
  return {
    ...makeEmpty(),
    subjects: seed.subjects.filter((subject) =>
      subjectIds.includes(subject.id),
    ),
    topics: seed.topics.filter((topic) => topicIds.has(topic.id)),
    items,
    history: seed.history.filter((entry) =>
      itemIds.includes(entry.studyItemId),
    ),
    dailyTargets: [
      {
        id: uid(),
        date,
        studyItemId: "activity",
        subjectId: "dsa",
        topicId: "basic",
        title: "Activity Selection",
        type: "Solve",
        priority: "Medium",
        status: "To Do",
        completedAt: null,
        createdAt: now,
      },
      {
        id: uid(),
        date,
        studyItemId: "prevention",
        subjectId: "os",
        topicId: "deadlocks",
        title: "Deadlock Prevention",
        type: "Revise",
        priority: "High",
        status: "Completed",
        completedAt: now,
        completionKind: "revision",
        createdAt: now,
      },
    ],
    dailyRecords: [
      {
        date,
        targetCount: 2,
        completedCount: 1,
        questionsSolved: 0,
        revisionCount: 1,
        shortNote: "Demo note: review the key idea again tomorrow.",
      },
    ],
  };
};
const keys = {
  subjects: "revision_subjects",
  topics: "revision_topics",
  items: "revision_items",
  history: "revision_history",
  settings: "revision_settings",
  dailyTargets: "revision_daily_targets",
  dailyRecords: "revision_daily_records",
  dailyGoal: "revision_daily_goal",
} as const;
const load = (): AppData => {
  try {
    const schemaKey = "revision_schema_version";
    if (localStorage.getItem(schemaKey) !== "demo-v2") {
      Object.values(keys).forEach((key) => localStorage.removeItem(key));
      localStorage.setItem(schemaKey, "demo-v2");
      return makeDemo();
    }
    const subjects = localStorage.getItem(keys.subjects);
    if (!subjects) return makeEmpty();
    return {
      subjects: JSON.parse(subjects),
      topics: JSON.parse(localStorage.getItem(keys.topics) || "[]"),
      items: JSON.parse(localStorage.getItem(keys.items) || "[]"),
      history: JSON.parse(localStorage.getItem(keys.history) || "[]"),
      settings: JSON.parse(
        localStorage.getItem(keys.settings) ||
          '{"darkMode":false,"sidebarCollapsed":false}',
      ),
      dailyTargets: JSON.parse(localStorage.getItem(keys.dailyTargets) || "[]"),
      dailyRecords: JSON.parse(localStorage.getItem(keys.dailyRecords) || "[]"),
      dailyGoal: JSON.parse(
        localStorage.getItem(keys.dailyGoal) ||
          '{"dailyItemGoal":5,"enabled":true}',
      ),
    };
  } catch {
    return makeEmpty();
  }
};

interface StoreValue extends AppData {
  addSubject: (name: string, icon?: string) => Subject;
  updateSubject: (id: string, name: string) => void;
  deleteSubject: (id: string) => void;
  addTopic: (
    subjectId: string,
    name: string,
    parentTopicId?: string | null,
  ) => Topic;
  updateTopic: (id: string, name: string) => void;
  deleteTopic: (id: string) => void;
  addItem: (
    item: Omit<
      StudyItem,
      "id" | "createdAt" | "solveCount" | "lastSolvedAt" | "bookmarked"
    >,
  ) => StudyItem;
  updateItem: (id: string, patch: Partial<StudyItem>) => void;
  deleteItem: (id: string) => void;
  solve: (id: string) => void;
  undoSolve: (id: string) => void;
  addDailyTarget: (x: {
    title: string;
    studyItemId?: string | null;
    subjectId?: string | null;
    topicId?: string | null;
    type?: DailyTargetType;
    priority?: DailyPriority;
    date?: string;
  }) => DailyTarget;
  updateDailyTarget: (id: string, patch: Partial<DailyTarget>) => void;
  completeDailyTarget: (
    id: string,
    kind?: "solve" | "revision" | "plain",
  ) => void;
  deleteDailyTarget: (id: string) => void;
  moveDailyTarget: (id: string, date: string) => void;
  setDailyGoal: (x: Partial<DailyGoal>) => void;
  setDailyNote: (date: string, note: string) => void;
  setSettings: (s: Partial<Settings>) => void;
  importData: (d: AppData) => void;
  loadDemo: () => void;
  reset: () => void;
}
const Store = createContext<StoreValue | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load);
  useEffect(() => {
    Object.entries(keys).forEach(([k, key]) =>
      localStorage.setItem(key, JSON.stringify(data[k as keyof AppData])),
    );
  }, [data]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", data.settings.darkMode);
  }, [data.settings.darkMode]);
  const value = useMemo<StoreValue>(
    () => ({
      ...data,
      addSubject: (name, icon = "◇") => {
        const s = {
          id: uid(),
          name,
          icon,
          createdAt: new Date().toISOString(),
        };
        setData((d) => ({ ...d, subjects: [...d.subjects, s] }));
        toast("Subject created");
        return s;
      },
      updateSubject: (id, name) =>
        setData((d) => ({
          ...d,
          subjects: d.subjects.map((s) => (s.id === id ? { ...s, name } : s)),
        })),
      deleteSubject: (id) => {
        setData((d) => {
          const tids = d.topics
            .filter((t) => t.subjectId === id)
            .map((t) => t.id);
          const itemIds = d.items
            .filter((i) => i.subjectId === id)
            .map((i) => i.id);
          return {
            ...d,
            subjects: d.subjects.filter((s) => s.id !== id),
            topics: d.topics.filter((t) => !tids.includes(t.id)),
            items: d.items.filter((i) => !itemIds.includes(i.id)),
            history: d.history.filter((h) => !itemIds.includes(h.studyItemId)),
          };
        });
        toast("Subject deleted");
      },
      addTopic: (subjectId, name, parentTopicId = null) => {
        const t = {
          id: uid(),
          subjectId,
          parentTopicId: parentTopicId || null,
          name,
          createdAt: new Date().toISOString(),
        };
        setData((d) => ({ ...d, topics: [...d.topics, t] }));
        toast(parentTopicId ? "Subtopic added" : "Topic added");
        return t;
      },
      updateTopic: (id, name) =>
        setData((d) => ({
          ...d,
          topics: d.topics.map((t) => (t.id === id ? { ...t, name } : t)),
        })),
      deleteTopic: (id) =>
        setData((d) => {
          const descendants = (root: string): string[] => {
            const children = d.topics
              .filter((t) => t.parentTopicId === root)
              .map((t) => t.id);
            return [root, ...children.flatMap(descendants)];
          };
          const ids = descendants(id);
          return {
            ...d,
            topics: d.topics.filter((t) => !ids.includes(t.id)),
            items: d.items.map((i) =>
              ids.includes(i.topicId || "") ? { ...i, topicId: null } : i,
            ),
          };
        }),
      addItem: (item) => {
        const x = {
          ...item,
          id: uid(),
          createdAt: new Date().toISOString(),
          solveCount: 0,
          lastSolvedAt: null,
          bookmarked: false,
        };
        setData((d) => ({ ...d, items: [x, ...d.items] }));
        toast("Study item added");
        return x;
      },
      updateItem: (id, patch) =>
        setData((d) => ({
          ...d,
          items: d.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),
      deleteItem: (id) => {
        setData((d) => ({
          ...d,
          items: d.items.filter((i) => i.id !== id),
          history: d.history.filter((h) => h.studyItemId !== id),
        }));
        toast("Study item deleted");
      },
      solve: (id) => {
        setData((d) => {
          const now = new Date().toISOString();
          return {
            ...d,
            items: d.items.map((i) =>
              i.id === id
                ? {
                    ...i,
                    solveCount: i.solveCount + 1,
                    lastSolvedAt: now,
                    status: i.status === "Not Started" ? "Solved" : i.status,
                  }
                : i,
            ),
            history: [
              ...d.history,
              { id: uid(), studyItemId: id, solvedAt: now },
            ],
          };
        });
        toast("Solve count updated");
      },
      undoSolve: (id) => {
        setData((d) => {
          const latest = [...d.history]
            .filter((h) => h.studyItemId === id)
            .sort((a, b) => b.solvedAt.localeCompare(a.solvedAt))[0];
          return {
            ...d,
            items: d.items.map((i) =>
              i.id === id
                ? {
                    ...i,
                    solveCount: Math.max(0, i.solveCount - 1),
                    lastSolvedAt:
                      d.history
                        .filter(
                          (h) => h.studyItemId === id && h.id !== latest?.id,
                        )
                        .sort((a, b) => b.solvedAt.localeCompare(a.solvedAt))[0]
                        ?.solvedAt || null,
                  }
                : i,
            ),
            history: d.history.filter((h) => h.id !== latest?.id),
          };
        });
        toast("Last solve undone");
      },
      addDailyTarget: (x) => {
        const target: DailyTarget = {
          id: uid(),
          date: x.date || new Date().toLocaleDateString("en-CA"),
          studyItemId: x.studyItemId || null,
          subjectId: x.subjectId || null,
          topicId: x.topicId || null,
          title: x.title,
          type: x.type || "Custom",
          priority: x.priority || "Medium",
          status: "To Do",
          completedAt: null,
          createdAt: new Date().toISOString(),
        };
        setData((d) => {
          const records = [...d.dailyRecords];
          const i = records.findIndex((r) => r.date === target.date);
          if (i >= 0)
            records[i] = {
              ...records[i],
              targetCount: records[i].targetCount + 1,
            };
          else
            records.push({
              date: target.date,
              targetCount: 1,
              completedCount: 0,
              questionsSolved: 0,
              revisionCount: 0,
              shortNote: "",
            });
          return {
            ...d,
            dailyTargets: [...d.dailyTargets, target],
            dailyRecords: records,
          };
        });
        toast("Added to today");
        return target;
      },
      updateDailyTarget: (id, patch) =>
        setData((d) => ({
          ...d,
          dailyTargets: d.dailyTargets.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        })),
      completeDailyTarget: (id, kind = "plain") =>
        setData((d) => {
          const target = d.dailyTargets.find((t) => t.id === id);
          if (!target) return d;
          const completing = target.status !== "Completed";
          const now = new Date().toISOString();
          let items = d.items,
            history = d.history;
          if (completing && kind === "solve" && target.studyItemId) {
            items = items.map((i) =>
              i.id === target.studyItemId
                ? {
                    ...i,
                    solveCount: i.solveCount + 1,
                    lastSolvedAt: now,
                    status: i.status === "Not Started" ? "Solved" : i.status,
                  }
                : i,
            );
            history = [
              ...history,
              { id: uid(), studyItemId: target.studyItemId, solvedAt: now },
            ];
          }
          const records = [...d.dailyRecords];
          const ri = records.findIndex((r) => r.date === target.date);
          const base =
            ri >= 0
              ? records[ri]
              : {
                  date: target.date,
                  targetCount: 0,
                  completedCount: 0,
                  questionsSolved: 0,
                  revisionCount: 0,
                  shortNote: "",
                };
          const delta = completing ? 1 : -1;
          const recordKind = completing ? kind : target.completionKind || kind;
          const record = {
            ...base,
            completedCount: Math.max(0, base.completedCount + delta),
            questionsSolved: Math.max(
              0,
              base.questionsSolved + (recordKind === "solve" ? delta : 0),
            ),
            revisionCount: Math.max(
              0,
              base.revisionCount + (recordKind === "revision" ? delta : 0),
            ),
          };
          if (ri >= 0) records[ri] = record;
          else records.push(record);
          return {
            ...d,
            items,
            history,
            dailyRecords: records,
            dailyTargets: d.dailyTargets.map((t) =>
              t.id === id
                ? {
                    ...t,
                    status: completing
                      ? ("Completed" as DailyTargetStatus)
                      : ("To Do" as DailyTargetStatus),
                    completedAt: completing ? now : null,
                    completionKind: completing ? kind : undefined,
                  }
                : t,
            ),
          };
        }),
      deleteDailyTarget: (id) => {
        setData((d) => {
          const target = d.dailyTargets.find((t) => t.id === id);
          if (!target) return d;
          const records = d.dailyRecords.map((r) =>
            r.date === target.date
              ? {
                  ...r,
                  targetCount: Math.max(0, r.targetCount - 1),
                  completedCount: Math.max(
                    0,
                    r.completedCount - (target.status === "Completed" ? 1 : 0),
                  ),
                }
              : r,
          );
          return {
            ...d,
            dailyTargets: d.dailyTargets.filter((t) => t.id !== id),
            dailyRecords: records,
          };
        });
        toast("Daily target removed");
      },
      moveDailyTarget: (id, date) =>
        setData((d) => {
          const target = d.dailyTargets.find((t) => t.id === id);
          if (!target || target.date === date) return d;
          const records = [...d.dailyRecords];
          const oldIndex = records.findIndex((r) => r.date === target.date);
          if (oldIndex >= 0)
            records[oldIndex] = {
              ...records[oldIndex],
              targetCount: Math.max(0, records[oldIndex].targetCount - 1),
            };
          const newIndex = records.findIndex((r) => r.date === date);
          if (newIndex >= 0)
            records[newIndex] = {
              ...records[newIndex],
              targetCount: records[newIndex].targetCount + 1,
            };
          else
            records.push({
              date,
              targetCount: 1,
              completedCount: 0,
              questionsSolved: 0,
              revisionCount: 0,
              shortNote: "",
            });
          return {
            ...d,
            dailyRecords: records,
            dailyTargets: d.dailyTargets.map((t) =>
              t.id === id
                ? { ...t, date, status: "To Do", completedAt: null }
                : t,
            ),
          };
        }),
      setDailyGoal: (x) =>
        setData((d) => ({ ...d, dailyGoal: { ...d.dailyGoal, ...x } })),
      setDailyNote: (date, note) =>
        setData((d) => {
          const i = d.dailyRecords.findIndex((r) => r.date === date);
          const records = [...d.dailyRecords];
          if (i >= 0) records[i] = { ...records[i], shortNote: note };
          else
            records.push({
              date,
              targetCount: 0,
              completedCount: 0,
              questionsSolved: 0,
              revisionCount: 0,
              shortNote: note,
            });
          return { ...d, dailyRecords: records };
        }),
      setSettings: (s) =>
        setData((d) => ({ ...d, settings: { ...d.settings, ...s } })),
      importData: (x) =>
        setData({
          ...x,
          dailyTargets: x.dailyTargets || [],
          dailyRecords: x.dailyRecords || [],
          dailyGoal: x.dailyGoal || { dailyItemGoal: 5, enabled: true },
        }),
      loadDemo: () => {
        setData(makeDemo());
        toast("Demo data added");
      },
      reset: () => setData(makeEmpty()),
    }),
    [data],
  );
  return <Store.Provider value={value}>{children}</Store.Provider>;
}
export const useStore = () => {
  const x = useContext(Store);
  if (!x) throw new Error("Store unavailable");
  return x;
};
