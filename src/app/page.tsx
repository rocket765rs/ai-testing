import TaskList from "@/components/TaskList";

export default function Home() {
  return (
    <main className="flex flex-1 items-start justify-center bg-neutral-50 px-4 py-16 sm:py-24">
      <TaskList />
    </main>
  );
}
