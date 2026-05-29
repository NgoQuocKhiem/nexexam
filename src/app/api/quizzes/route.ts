import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function POST(req: Request) {
  try {
    // 1. Get user from token
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const lecturerId = decoded.userId;

    // 2. Parse request body
    const { title, description, duration, questions } = await req.json();

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json({ error: 'Title and at least one question are required' }, { status: 400 });
    }

    // 3. Create Quiz and Questions in a transaction
    const quiz = await prisma.$transaction(async (tx) => {
      const newQuiz = await tx.quiz.create({
        data: {
          title,
          description,
          duration: Number(duration),
          lecturerId,
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
        },
        include: {
          questions: {
            include: {
              options: true,
            },
          },
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
