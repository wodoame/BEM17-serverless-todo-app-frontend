import { useEffect, useMemo, useState, type FormEvent } from "react"
import { toast } from "sonner"
import {
  CheckIcon,
  ClockIcon,
  Loader2Icon,
  LogOutIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { useAuth } from "@/lib/use-auth"
import { tasksApi, type Task } from "@/lib/api"

type Status = "Pending" | "Completed" | "Expired"
const STATUSES: Status[] = ["Pending", "Completed", "Expired"]

const BADGE: Record<Status, { wrap: string; dot: string; label: string }> = {
  Pending: {
    wrap: "text-[#274A67] bg-[#EFF7FE] border-[#CDE6FC] dark:text-[#92C9F9] dark:bg-[#5DAFF6]/15 dark:border-[#5DAFF6]/25",
    dot: "bg-[#5DAFF6]",
    label: "Pending",
  },
  Completed: {
    wrap: "text-[#046C4E] bg-[#DEF7EC] border-[#BCF0DA] dark:text-[#6EE7B7] dark:bg-[#0E9F6E]/15 dark:border-[#0E9F6E]/25",
    dot: "bg-[#0E9F6E]",
    label: "Completed",
  },
  Expired: {
    wrap: "text-[#9B1C1C] bg-[#FDE8E8] border-[#FBD5D5] dark:text-[#F8B4B4] dark:bg-[#F05252]/15 dark:border-[#F05252]/25",
    dot: "bg-[#F05252]",
    label: "Expired",
  },
}

function initials(email: string | null) {
  if (!email) return "?"
  const local = email.split("@")[0]
  const parts = local.split(/[._-]+/).filter(Boolean)
  const chars = parts.length >= 2 ? parts[0][0] + parts[1][0] : local.slice(0, 2)
  return chars.toUpperCase()
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "expired"
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}m ${String(s).padStart(2, "0")}s`
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-[26px] w-[26px] flex-col justify-center gap-[2px] rounded-md bg-[#FF5A00] p-[6px]">
        <span className="block h-[2px] w-full rounded-sm bg-white" />
        <span className="block h-[2px] w-[68%] rounded-sm bg-white" />
        <span className="block h-[2px] w-full rounded-sm bg-white" />
      </div>
      <span className="text-[17px] font-extrabold tracking-[-0.02em] text-[#08283B] dark:text-[#EAEEF0]">
        Fleeting
      </span>
    </div>
  )
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState<Status>("Pending")
  const [now, setNow] = useState(() => Date.now())
  const auth = useAuth()

  async function loadTasks(silent = false) {
    if (!silent) setIsLoading(true)
    try {
      const { tasks } = await tasksApi.list()
      setTasks(tasks)
    } catch (error) {
      if (!silent) toast.error(error instanceof Error ? error.message : "Failed to load tasks")
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, loading state starts true already
    loadTasks()
    // tick the countdowns every second
    const tick = setInterval(() => setNow(Date.now()), 1000)
    // poll so server-side expiry transitions show up during a demo
    const poll = setInterval(() => loadTasks(true), 20000)
    return () => {
      clearInterval(tick)
      clearInterval(poll)
    }
  }, [])

  const counts = useMemo(() => {
    return {
      Pending: tasks.filter((t) => t.Status === "Pending").length,
      Completed: tasks.filter((t) => t.Status === "Completed").length,
      Expired: tasks.filter((t) => t.Status === "Expired").length,
    }
  }, [tasks])

  const visible = useMemo(() => {
    const list = tasks.filter((t) => t.Status === activeTab)
    list.sort((a, b) =>
      activeTab === "Pending"
        ? new Date(a.Deadline).getTime() - new Date(b.Deadline).getTime()
        : new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
    )
    return list
  }, [tasks, activeTab])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!description.trim()) return

    setIsCreating(true)
    try {
      await tasksApi.create({ Description: description.trim() })
      setDescription("")
      await loadTasks(true)
      setActiveTab("Pending")
      toast.success("Task created")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create task")
    } finally {
      setIsCreating(false)
    }
  }

  async function handleComplete(taskId: string) {
    try {
      await tasksApi.update(taskId, { Status: "Completed" })
      await loadTasks(true)
      toast.success("Task completed")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update task")
    }
  }

  async function handleDelete(taskId: string) {
    try {
      await tasksApi.remove(taskId)
      await loadTasks(true)
      toast.success("Task deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete task")
    }
  }

  return (
    <div className="min-h-svh bg-[#FBFBFC] dark:bg-[#0a1620]">
      {/* App header */}
      <header className="flex h-[60px] items-center justify-between border-b border-[#EEF0F2] bg-white px-4 sm:px-6 dark:border-white/[0.07] dark:bg-[#0f1e2b]">
        <Logo />
        <div className="flex items-center gap-3 sm:gap-3.5">
          <span className="hidden text-[13px] text-gray-500 sm:inline dark:text-[#8D9CA5]">
            {auth.email}
          </span>
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#08283B] text-[12px] font-semibold text-white dark:bg-[#17293a] dark:text-[#CDE6FC] dark:ring-1 dark:ring-white/10">
            {initials(auth.email)}
          </div>
          <button
            onClick={() => auth.signOut()}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-[7px] text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:px-3 dark:border-white/[0.12] dark:bg-[#0f1e2b] dark:text-[#C5D0D7] dark:hover:bg-[#17293a]"
          >
            <LogOutIcon className="h-[15px] w-[15px]" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[820px] px-4 py-6 sm:px-7 sm:py-7">
        <h1 className="mb-0.5 text-[22px] font-bold tracking-[-0.015em] text-[#08283B] sm:text-2xl dark:text-[#EAEEF0]">
          My tasks
        </h1>
        <p className="mb-5 text-sm text-gray-500 dark:text-[#8D9CA5]">
          Add a task and complete it before it expires: 5 minutes on the clock.
        </p>

        {/* New task */}
        <form
          onSubmit={handleCreate}
          className="mb-6 flex flex-col gap-2.5 rounded-xl border border-gray-200 bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,.04)] sm:flex-row sm:items-center sm:gap-2.5 dark:border-white/[0.09] dark:bg-[#0f1e2b]"
        >
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add a task, expires in 5 minutes…"
            className="min-w-0 flex-1 bg-transparent px-1.5 py-2 text-[14.5px] font-medium text-[#08283B] outline-none placeholder:text-gray-400 dark:text-[#EAEEF0] dark:placeholder:text-[#64798a]"
          />
          <div className="flex gap-2.5">
            <button
              type="submit"
              disabled={isCreating}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#08283B] px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#072436] disabled:opacity-70 sm:flex-none dark:bg-[#FDFDFD] dark:text-[#08283B] dark:hover:bg-[#E6EAEB]"
            >
              {isCreating ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <PlusIcon className="h-4 w-4" />}
              {isCreating ? "Adding…" : "Add task"}
            </button>
          </div>
        </form>

        {/* Tabs */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-[10px] border border-gray-200 bg-gray-100 p-1 dark:border-white/[0.08] dark:bg-[#0b1826]">
            {STATUSES.map((status) => {
              const active = status === activeTab
              return (
                <button
                  key={status}
                  onClick={() => setActiveTab(status)}
                  className={
                    "flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-[7px] text-[13.5px] font-semibold transition-colors sm:px-3.5 " +
                    (active
                      ? "bg-white text-[#08283B] shadow-sm dark:bg-[#17293a] dark:text-[#EAEEF0]"
                      : "text-gray-500 hover:text-[#08283B] dark:text-[#8D9CA5] dark:hover:text-[#EAEEF0]")
                  }
                >
                  {status}
                  <span
                    className={
                      "rounded-full px-[7px] py-px text-[11px] font-semibold " +
                      (active
                        ? "text-[#274A67] bg-[#EFF7FE] dark:text-[#CDE6FC] dark:bg-[#5DAFF6]/16"
                        : "text-gray-500 bg-gray-200 dark:text-[#8D9CA5] dark:bg-white/[0.06]")
                    }
                  >
                    {counts[status]}
                  </span>
                </button>
              )
            })}
          </div>
          {activeTab === "Pending" && (
            <span className="hidden text-[12.5px] text-gray-400 sm:inline dark:text-[#64798a]">
              Sorted by soonest to expire
            </span>
          )}
        </div>

        {/* List */}
        <div className="flex flex-col gap-2.5">
          {isLoading &&
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[74px] animate-pulse rounded-xl border border-gray-200 bg-white dark:border-white/[0.08] dark:bg-[#0f1e2b]"
              />
            ))}

          {!isLoading && visible.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white/50 px-6 py-12 text-center dark:border-white/[0.1] dark:bg-transparent">
              <p className="text-sm text-gray-500 dark:text-[#8D9CA5]">
                No {activeTab.toLowerCase()} tasks{activeTab === "Pending" ? " yet" : ""}.
              </p>
            </div>
          )}

          {!isLoading &&
            visible.map((task) => {
              const remaining = new Date(task.Deadline).getTime() - now
              const low = task.Status === "Pending" && remaining > 0 && remaining < 60000
              const badge = BADGE[task.Status]
              return (
                <div
                  key={task.TaskId}
                  className={
                    "flex items-start gap-3 rounded-xl border p-3.5 transition-colors sm:gap-3.5 " +
                    (low
                      ? "border-[#F0C9AE] bg-[#FFF9F5] dark:border-[#FF9054]/30 dark:bg-[#1a1712]"
                      : "border-[#EAECEE] bg-white dark:border-white/[0.08] dark:bg-[#0f1e2b]")
                  }
                >
                  {/* checkbox / status marker */}
                  {task.Status === "Pending" ? (
                    <button
                      onClick={() => handleComplete(task.TaskId)}
                      aria-label="Mark complete"
                      className="mt-0.5 flex h-6 w-6 flex-none cursor-pointer items-center justify-center rounded-full border-[1.5px] border-[#CBD5D9] transition-colors hover:border-[#0E9F6E] hover:bg-[#F3FAF7] dark:border-white/25 dark:hover:border-[#0E9F6E]"
                    />
                  ) : (
                    <span
                      className={
                        "mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full " +
                        (task.Status === "Completed"
                          ? "bg-[#0E9F6E] text-white"
                          : "border-[1.5px] border-[#E5B4B4] bg-[#FBEDED] text-[#C81E1E] dark:border-[#F05252]/40 dark:bg-transparent")
                      }
                    >
                      {task.Status === "Completed" && <CheckIcon className="h-3.5 w-3.5" />}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div
                      className={
                        "mb-1.5 text-[15px] font-semibold " +
                        (task.Status === "Completed"
                          ? "text-gray-400 line-through dark:text-[#64798a]"
                          : "text-[#08283B] dark:text-[#EAEEF0]")
                      }
                    >
                      {task.Description}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-gray-500 dark:text-[#8D9CA5]">
                      {task.Status === "Pending" && (
                        <>
                          <span
                            className={
                              "inline-flex items-center gap-1.5 font-mono " +
                              (low
                                ? "font-medium text-[#B54000] dark:text-[#FF9054]"
                                : "text-[#427CAF] dark:text-[#7DBFF8]")
                            }
                          >
                            <ClockIcon className="h-[13px] w-[13px]" />
                            {remaining > 0 ? "expires in " : ""}
                            {formatRemaining(remaining)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <span
                    className={
                      "inline-flex flex-none items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold " +
                      badge.wrap
                    }
                  >
                    <span className={"h-1.5 w-1.5 rounded-full " + badge.dot} />
                    <span>{badge.label}</span>
                  </span>

                  <button
                    onClick={() => handleDelete(task.TaskId)}
                    aria-label="Delete task"
                    className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-lg border border-transparent text-gray-400 transition-colors hover:border-[#FBD5D5] hover:bg-[#FDE8E8] hover:text-[#C81E1E] dark:text-[#64798a] dark:hover:border-transparent dark:hover:bg-[#F05252]/15 dark:hover:text-[#F8B4B4]"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
        </div>
      </main>
    </div>
  )
}
