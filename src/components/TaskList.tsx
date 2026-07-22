"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/types/task";

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from Supabase once, on mount.
  useEffect(() => {
    async function loadTasks() {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError("Couldn't load tasks. Check your Supabase connection.");
      } else {
        setTasks(data ?? []);
      }
      setLoading(false);
    }
    loadTasks();
  }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    // Show the task immediately, then reconcile with the saved row.
    const optimisticId = crypto.randomUUID();
    const optimisticTask: Task = {
      id: optimisticId,
      text,
      done: false,
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [optimisticTask, ...prev]);
    setInput("");

    const { data, error } = await supabase
      .from("tasks")
      .insert({ text, done: false })
      .select()
      .single();

    if (error) {
      setError("Couldn't save the task. Please try again.");
      setTasks((prev) => prev.filter((t) => t.id !== optimisticId));
    } else if (data) {
      setTasks((prev) => prev.map((t) => (t.id === optimisticId ? data : t)));
    }
  }

  async function toggleTask(id: string) {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const nextDone = !target.done;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: nextDone } : t))
    );

    const { error } = await supabase
      .from("tasks")
      .update({ done: nextDone })
      .eq("id", id);

    if (error) {
      setError("Couldn't update the task. Please try again.");
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, done: !nextDone } : t))
      );
    }
  }

  async function deleteTask(id: string) {
    const removed = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));

    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error && removed) {
      setError("Couldn't delete the task. Please try again.");
      setTasks((prev) => [removed, ...prev]);
    }
  }

  const remaining = tasks.filter((t) => !t.done).length;

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Tasks</h1>

      <form onSubmit={addTask} className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        />
        <button
          type="submit"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-white text-sm font-medium hover:bg-neutral-700 transition-colors"
        >
          Add
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-500 mb-4" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-neutral-400 text-center py-8">
          Loading tasks...
        </p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-8">
          No tasks yet. Add one above to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="group flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 hover:border-neutral-300 transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                aria-label={task.done ? "Mark as not done" : "Mark as done"}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  task.done
                    ? "bg-neutral-900 border-neutral-900"
                    : "border-neutral-300 hover:border-neutral-500"
                }`}
              >
                {task.done && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>

              <span
                className={`flex-1 text-sm break-words ${
                  task.done
                    ? "text-neutral-400 line-through"
                    : "text-neutral-900"
                }`}
              >
                {task.text}
              </span>

              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                aria-label="Delete task"
                className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity shrink-0"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {tasks.length > 0 && (
        <p className="text-xs text-neutral-400 mt-6 text-center">
          {remaining} {remaining === 1 ? "task" : "tasks"} remaining
        </p>
      )}
    </div>
  );
}
