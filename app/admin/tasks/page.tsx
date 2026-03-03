'use client'
import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import TaskCard from '@/components/TaskCard'
import { mockTasks } from '@/lib/mockData'
import { AdminTask } from '@/types'

type Filter = 'all' | 'pending' | 'accepted' | 'completed'

export default function AdminTasksPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [tasks] = useState<AdminTask[]>(mockTasks)

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    accepted: tasks.filter(t => t.status === 'accepted').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  }

  const tabs: Filter[] = ['all', 'pending', 'accepted', 'completed']

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <AdminSidebar role="admin" />
      <main className="flex-1 p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">My Tasks</h1>
          <p className="text-sm text-zinc-500 mt-1">Assignments dispatched by Super Administrator</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                filter === tab
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}{' '}
              <span className={`text-xs ml-1 ${filter === tab ? 'text-zinc-600' : 'text-zinc-600'}`}>
                ({counts[tab]})
              </span>
            </button>
          ))}
        </div>

        {/* Task list */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <p className="text-lg">No {filter === 'all' ? '' : filter} tasks</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}

        {/* Summary stats */}
        <div className="mt-10 grid grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Pending</p>
            <p className="text-3xl font-mono font-semibold text-yellow-400">{counts.pending}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Accepted</p>
            <p className="text-3xl font-mono font-semibold text-blue-400">{counts.accepted}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Completed</p>
            <p className="text-3xl font-mono font-semibold text-green-400">{counts.completed}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
