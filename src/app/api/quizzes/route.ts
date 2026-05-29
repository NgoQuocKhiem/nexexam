import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// GET: Fetch all quizzes for the current lecturer
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const lecturerId = decoded.userId;

    const quizzes = await prisma.quiz.findMany({
      where: { lecturerId },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Fetch quizzes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new quiz with questions and whitelist
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const lecturerId = decoded.userId;

    const { 
      title, description, duration, questions, whitelist,
      enableAlarm, alarmDuration, reminderText 
    } = await req.json();

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json({ error: 'Title and at least one question are required' }, { status: 400 });
    }

    const quiz = await prisma.$transaction(async (tx) => {
      const newQuiz = await tx.quiz.create({
        data: {
          title,
          description,
          duration: Number(duration),
          lecturerId,
          enableAlarm: Boolean(enableAlarm),
          alarmDuration: Number(alarmDuration || 10),
          reminderText: reminderText || undefined,
          questions: {
            create: questions.map((q: any) => ({
              text: q.text,
              type: q.type || 'MULTIPLE_CHOICE',
              points: 1,
              options: {
                create: q.options.map((opt: any) => ({
                  text: opt.text,
                  isCorrect: opt.isCorrect,
                })),
              },
            })),
          },
          allowedStudents: whitelist ? {
            create: whitelist.map((s: any) => ({
              name: s.name,
              mssv: s.mssv,
              class: s.class,
            })),
          } : undefined,
        },
      });
      return newQuiz;
    });

    return NextResponse.json({ message: 'Quiz created successfully', quiz }, { status: 201 });
  } catch (error) {
    console.error('Create quiz error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
