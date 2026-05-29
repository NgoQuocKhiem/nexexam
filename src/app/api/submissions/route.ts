import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// POST: Student submits an exam
export async function POST(req: Request) {
  try {
    const { quizId, studentInfo, answers, violations } = await req.json();

    if (!quizId || !studentInfo || !answers) {
      return NextResponse.json({ error: 'Missing submission data' }, { status: 400 });
    }

    // We use a simplified submission model for this MVP (Student info stored in metadata or linked User)
    // Since we don't have a full Student Login for everyone, we'll store student info in the Submission
    
    // First, find or create the student User record based on MSSV
    let student = await prisma.user.findUnique({
      where: { email: `${studentInfo.mssv}@student.nexexam.com` }
    });

    if (!student) {
      student = await prisma.user.create({
        data: {
          name: studentInfo.name,
          email: `${studentInfo.mssv}@student.nexexam.com`,
          password: 'student_nopass', // Placeholder
          role: 'STUDENT'
        }
      });
    }

    const submission = await prisma.$transaction(async (tx) => {
      // 1. Create Submission
      const sub = await tx.submission.create({
        data: {
          quizId,
          studentId: student.id,
          status: 'SUBMITTED',
          endTime: new Date(),
        }
      });

      // 2. Create Answers
      await tx.answer.createMany({
        data: Object.entries(answers).map(([qId, content]) => ({
          submissionId: sub.id,
          questionId: qId,
          content: String(content),
        }))
      });

      // 3. Create Audit Logs (Violations)
      if (violations && violations.length > 0) {
        await tx.auditLog.createMany({
          data: violations.map((v: string) => ({
            studentId: student.id,
            submissionId: sub.id,
            action: 'VIOLATION',
            details: v,
          }))
        });
      }

      return sub;
    });

    return NextResponse.json({ message: 'Submission successful', submissionId: submission.id });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Lecturer fetches submissions for a quiz
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get('quizId');

    if (!quizId) {
      return NextResponse.json({ error: 'Missing quizId' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const lecturerId = decoded.userId;

    // Verify ownership
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { lecturerId: true }
    });

    if (!quiz || quiz.lecturerId !== lecturerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const submissions = await prisma.submission.findMany({
      where: { quizId },
      include: {
        student: { select: { name: true, email: true } },
        logs: true,
        answers: true,
      },
      orderBy: { endTime: 'desc' }
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Fetch submissions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
