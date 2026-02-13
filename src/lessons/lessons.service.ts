import { Injectable, NotFoundException } from '@nestjs/common'

import { LessonProgressStatus } from '../../prisma/generated/prisma/enums'
import { PrismaService } from '../prisma/prisma.service'
import { LessonContentOutputDto } from './dto/lesson-content-output.dto'

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLessonContent(
    userId: string,
    journeyId: string,
    day: number,
  ): Promise<LessonContentOutputDto> {
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        level: { journeyId },
        dayNumber: day,
      },
      select: { id: true, slug: true, dayNumber: true, content: true },
    })

    if (!lesson) {
      throw new NotFoundException('Lesson not found')
    }

    return {
      ...lesson,
      content: lesson.content as unknown,
    }
  }

  async submitQuiz(
    userId: string,
    lessonId: string,
    answers: Record<string, unknown>,
  ): Promise<{ success: boolean }> {
    await this.prisma.userLessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        quizAnswers: answers as object,
        quizCompleted: true,
        status: LessonProgressStatus.IN_PROGRESS,
      },
      update: {
        quizAnswers: answers as object,
        quizCompleted: true,
      },
    })
    return { success: true }
  }

  async submitReflections(
    userId: string,
    lessonId: string,
    text: string,
  ): Promise<{ success: boolean }> {
    const existing = await this.prisma.userLessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    })

    const reflections = existing?.reflections
      ? [
          ...(existing.reflections as object[]),
          { text, createdAt: new Date().toISOString() },
        ]
      : [{ text, createdAt: new Date().toISOString() }]

    await this.prisma.userLessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        reflections: reflections as object,
        status: LessonProgressStatus.IN_PROGRESS,
      },
      update: { reflections: reflections as object },
    })
    return { success: true }
  }

  async finishLesson(
    userId: string,
    lessonId: string,
    rating?: number,
  ): Promise<{ success: boolean }> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { level: true },
    })

    if (!lesson) {
      throw new NotFoundException('Lesson not found')
    }

    const journeyId = lesson.level.journeyId
    const nextDay = lesson.dayNumber + 1

    await this.prisma.$transaction([
      this.prisma.userLessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        create: {
          userId,
          lessonId,
          status: LessonProgressStatus.COMPLETED,
          rating: rating ?? undefined,
        },
        update: {
          status: LessonProgressStatus.COMPLETED,
          ...(rating !== undefined && { rating }),
        },
      }),
      this.prisma.userJourneyProgress.upsert({
        where: { userId_journeyId: { userId, journeyId } },
        create: {
          userId,
          journeyId,
          currentLessonDayNumber: nextDay,
        },
        update: {
          currentLessonDayNumber: nextDay,
        },
      }),
    ])

    return { success: true }
  }
}
