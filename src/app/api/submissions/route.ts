import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// POST: Student submits an exam with AUTO-GRADING
export async function POST(req: Request) {
  try {
    const { quizId, studentInfo, answers, violations } = await req.json();

    if (!quizId || !studentInfo || !answers) {
      return NextResponse.json({ error: 'Missing submission data' }, { status: 400 });
    }

    // 1. Fetch correct answers for all questions in this quiz
    const quizQuestions = await prisma.question.findMany({
      where: { quizId },
      include: { options: { where: { isCorrect: true } } }
    });

    let correctCount = 0;
    const totalQuestions = quizQuestions.length;

    quizQuestions.forEach(q => {
      const studentAnswer = answers[q.id];
      const correctOption = q.options[0]; // Assuming one correct option for now

      if (studentAnswer === correctOption?.id) {
        correctCount++;
      }
    });

    // 2. Calculate score on 10-point scale
    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0;

    // 3. Find/Create Student
    let student = await prisma.user.findUnique({
      where: { email: `${studentInfo.mssv}@student.nexexam.com` }
    });

    if (!student) {
      student = await prisma.user.create({
        data: {
          name: studentInfo.name,
          email: `${studentInfo.mssv}@student.nexexam.com`,
          password: 'student_nopass',
          role: 'STUDENT'
        }
      });
    }

    const submission = await prisma.$transaction(async (tx) => {
      const sub = await tx.submission.create({
        data: {
          quizId,
          studentId: student!.id,
          status: 'SUBMITTED',
          endTime: new Date(),
          score: score, // STORED SCORE
        }
      });

      await tx.answer.createMany({
        data: Object.entries(answers).map(([qId, content]) => ({
          submissionId: sub.id,
          questionId: qId,
          content: String(content),
        }))
      });

      if (violations && violations.length > 0) {
        await tx.auditLog.createMany({
          data: violations.map((v: string) => ({
            studentId: student!.id,
            submissionId: sub.id,
            action: 'VIOLATION',
            details: v,
          }))
        });
      }

      return sub;
    });

    return NextResponse.json({ 
      message: 'Submission successful', 
      submissionId: submission.id,
      score: score.toFixed(1),
      correctCount,
      totalQuestions
    });
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

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { lecturerId: true, questions: { select: { id: true } } }
    });

    if (!quiz || quiz.lecturerId !== lecturerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const totalQuestions = quiz.questions.length;

    const submissions = await prisma.submission.findMany({
      where: { quizId },
      include: {
        student: { select: { name: true, email: true } },
        logs: { select: { id: true } },
        answers: true,
      },
      orderBy: { endTime: 'desc' }
    });

    // Add metadata for frontend
    const results = submissions.map(sub => ({
      ...sub,
      totalQuestions,
      correctCount: sub.score ? Math.round((sub.score / 10) * totalQuestions) : 0
    }));

    return NextResponse.json({ submissions: results });
  } catch (error) {
    console.error('Fetch submissions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
