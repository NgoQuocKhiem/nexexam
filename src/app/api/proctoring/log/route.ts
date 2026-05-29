import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// POST: Log a violation in real-time
export async function POST(req: Request) {
  try {
    const { quizId, studentInfo, action, details } = await req.json();

    if (!quizId || !studentInfo || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.liveViolation.create({
      data: {
        quizId,
        studentName: studentInfo.name,
        mssv: studentInfo.mssv,
        class: studentInfo.class,
        action,
        details: details || null,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Log violation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Fetch logs for live monitoring
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get('quizId');

    if (!quizId) {
      return NextResponse.json({ error: 'QuizId is required' }, { status: 400 });
    }

    // Verify lecturer authorization
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const lecturerId = decoded.userId;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { lecturerId: true }
    });

    if (!quiz || quiz.lecturerId !== lecturerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch live violations
    const logs = await prisma.liveViolation.findMany({
      where: { quizId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Fetch proctoring logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
