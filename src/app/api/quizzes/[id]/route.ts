import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            options: {
              select: {
                id: true,
                text: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error('Fetch quiz error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Verify Student Information
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, mssv, class: className } = await req.json();

    if (!name || !mssv || !className) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin' }, { status: 400 });
    }

    // CHECK WHITELIST STRICTLY
    const hasWhitelist = await prisma.whitelistStudent.count({ where: { quizId: id } });
    
    if (hasWhitelist > 0) {
      const whitelistEntry = await prisma.whitelistStudent.findFirst({
        where: {
          quizId: id,
          mssv: { equals: mssv, mode: 'insensitive' },
          // Also check name or class to be safer
          name: { contains: name, mode: 'insensitive' }
        },
      });

      if (!whitelistEntry) {
        return NextResponse.json({ 
          error: 'Thông tin không khớp với danh sách dự thi. Vui lòng kiểm tra lại Họ tên/MSSV.' 
        }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, student: { name, mssv, class: className } });
  } catch (error) {
    console.error('Verify student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a Quiz
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const lecturerId = decoded.userId;

    // Verify ownership
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: { lecturerId: true }
    });

    if (!quiz || quiz.lecturerId !== lecturerId) {
      return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 403 });
    }

    // Delete in order (or use cascade if configured in schema, but manual is safer here)
    await prisma.$transaction([
      prisma.answer.deleteMany({ where: { submission: { quizId: id } } }),
      prisma.auditLog.deleteMany({ where: { submission: { quizId: id } } }),
      prisma.submission.deleteMany({ where: { quizId: id } }),
      prisma.whitelistStudent.deleteMany({ where: { quizId: id } }),
      prisma.option.deleteMany({ where: { question: { quizId: id } } }),
      prisma.question.deleteMany({ where: { quizId: id } }),
      prisma.quiz.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
