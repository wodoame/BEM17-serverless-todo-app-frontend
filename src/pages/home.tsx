import { useEffect, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/use-auth"
import { tasksApi, type Task } from "@/lib/api"

const STATUSES = ["Pending", "Completed", "Expired"] as const

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const auth = useAuth()

  async function loadTasks() {
    setIsLoading(true)
    try {
      const { tasks } = await tasksApi.list()
      setTasks(tasks)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load tasks")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, loading state starts true already
    loadTasks()
  }, [])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!description.trim()) return

    setIsCreating(true)
    try {
      await tasksApi.create({ Description: description, Date: date || undefined })
      setDescription("")
      setDate("")
      await loadTasks()
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
      await loadTasks()
      toast.success("Task completed")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update task")
    }
  }

  async function handleDelete(taskId: string) {
    try {
      await tasksApi.remove(taskId)
      await loadTasks()
      toast.success("Task deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete task")
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Tasks</h1>
          {auth.email && <p className="text-muted-foreground text-sm">{auth.email}</p>}
        </div>
        <Button variant="outline" onClick={() => auth.signOut()}>
          Sign out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New task</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3" onSubmit={handleCreate}>
            <Textarea
              placeholder="Description"
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            <Button type="submit" disabled={isCreating}>
              Add task
            </Button>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="Pending">
        <TabsList className="w-full">
          {STATUSES.map((status) => (
            <TabsTrigger key={status} value={status} className="flex-1">
              {status}
            </TabsTrigger>
          ))}
        </TabsList>
        {STATUSES.map((status) => {
          const statusTasks = tasks.filter((task) => task.Status === status)

          return (
            <TabsContent key={status} value={status} className="flex flex-col gap-3">
              {isLoading && <p className="text-muted-foreground text-sm">Loading...</p>}
              {!isLoading && statusTasks.length === 0 && (
                <p className="text-muted-foreground text-sm">No {status.toLowerCase()} tasks.</p>
              )}
              {statusTasks.map((task) => (
                <Card key={task.TaskId}>
                  <CardContent className="flex items-start justify-between gap-4 pt-6">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{task.Description}</p>
                      {task.Date && (
                        <p className="text-muted-foreground text-xs">Date: {task.Date}</p>
                      )}
                      <p className="text-muted-foreground text-xs">
                        Deadline: {new Date(task.Deadline).toLocaleString()}
                      </p>
                      <Badge variant="outline" className="w-fit">
                        {task.Status}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2">
                      {task.Status === "Pending" && (
                        <Button size="sm" onClick={() => handleComplete(task.TaskId)}>
                          Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(task.TaskId)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
