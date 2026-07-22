# Task List

A simple personal task list built with Next.js and Tailwind CSS. Add tasks, check them off, and delete them. Tasks are saved to your browser's local storage, so your list is still there when you come back.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

## Project structure

- `src/app/page.tsx` — home page
- `src/app/layout.tsx` — root layout and page metadata
- `src/components/TaskList.tsx` — task list UI and logic (add / check off / delete, persisted to `localStorage`)
- `src/types/task.ts` — shared `Task` type
