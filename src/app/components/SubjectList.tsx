'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

const subjects = [
    { name: 'Digital Logic', questionCount: 533 },
    { name: 'Computer Organization', questionCount: 551},
    { name: 'Programming and Data Structures', questionCount: 460 },
    { name: 'Algorithms', questionCount: 638 },
    { name: 'Theory of Computation', questionCount: 566 },
    { name: 'Compiler Design', questionCount: 781 },
    { name: 'Operating Systems', questionCount: 374 },
    { name: 'Databases', questionCount: 266 },
    { name: 'Computer Networks', questionCount: 321 },
]

export function SubjectList() {
  return (
    <div className="space-y-4">
      {subjects.map((subject) => (
        <div
          key={subject.name}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{subject.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No of Questions: {subject.questionCount}
            </p>
          </div>
          <Link href={`/main/practice/${subject.name.toLowerCase().replace(/\s+/g, '-')}`}>
            <Button>Practice</Button>
          </Link>
        </div>
      ))}
    </div>
  )
}