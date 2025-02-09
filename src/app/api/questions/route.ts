import { db } from '@/lib/db/turso'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subject = searchParams.get('subject')

  try {
    const query = subject 
      ? 'SELECT * FROM questions WHERE subject = ?'
      : 'SELECT * FROM questions'
    
    const result = await db.execute({
      sql: query,
      args: subject ? [subject] : []
    })
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
} 