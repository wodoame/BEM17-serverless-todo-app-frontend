import { fetchAuthSession } from "aws-amplify/auth"

const API_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "")

export interface Task {
  TaskId: string
  UserId: string
  Description: string
  Date?: string
  Status: "Pending" | "Completed" | "Expired"
  Deadline: string
  CreatedAt: string
}

async function authorizedFetch(path: string, options: RequestInit = {}) {
  const session = await fetchAuthSession()
  const token = session.tokens?.idToken?.toString()

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ?? "",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const tasksApi = {
  list: (): Promise<{ tasks: Task[] }> => authorizedFetch("/tasks"),

  create: (input: { Description: string; Date?: string }): Promise<Task> =>
    authorizedFetch("/tasks", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (
    taskId: string,
    input: Partial<Pick<Task, "Description" | "Date" | "Status">>
  ): Promise<Task> =>
    authorizedFetch(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  remove: (taskId: string): Promise<null> =>
    authorizedFetch(`/tasks/${taskId}`, { method: "DELETE" }),
}
