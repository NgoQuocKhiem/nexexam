import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
                // Do NOT select isCorrect for students
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

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, mssv, class: className } = await req.json();

    if (!name || !mssv || !className) {
      return NextResponse.json({ error: 'Missing student information' }, { status: 400 });
    }

    // Check whitelist
    const whitelistEntry = await prisma.whitelistStudent.findFirst({
      where: {
        quizId: id,
        mssv: mssv,
        // Optional: match name/class strictly or loosely
      },
    });

    // If quiz has whitelist and student not in it
    const hasWhitelist = await prisma.whitelistStudent.count({ where: { quizId: id } });
    
    if (hasWhitelist > 0 && !whitelistEntry) {
      return NextResponse.json({ 
        error: 'Bạn không có tên trong danh sách dự thi bài này. Vui lòng liên hệ Giảng viên.' 
      }, { status: 403 });
    }

    return NextResponse.json({ success: true, student: { name, mssv, class: className } });
  } catch (error) {
    console.error('Verify student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
