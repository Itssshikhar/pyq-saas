import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subject = searchParams.get('subject')

  try {
    const questions = await prisma.question.findMany({
      where: {
        subject: subject || undefined,
      },
      // Add pagination if needed
      // take: 10,
      // skip: 0,
    })

    return NextResponse.json(questions)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
} 