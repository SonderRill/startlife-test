import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'
import { JourneyOutputDto } from './dto/journey-output.dto'
import { JourneyWithProgressOutputDto } from './dto/journey-with-progress-output.dto'
import { JourneyProgressOutputDto } from './dto/journey-progress-output.dto'

@Injectable()
export class JourneysService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<JourneyOutputDto[]> {
    return this.prisma.journey.findMany({
      select: { id: true, slug: true, title: true, lengthDays: true },
      orderBy: { createdAt: 'asc' },
    })
  }

  async findMyWithProgress(userId: string): Promise<JourneyWithProgressOutputDto[]> {
    const userJourneys = await this.prisma.userJourney.findMany({
      where: { userId },
      include: {
        journey: { select: { id: true, slug: true, title: true, lengthDays: true } },
      },
    })

    const progressMap = await this.prisma.userJourneyProgress.findMany({
      where: { userId },
    }).then((list) => new Map(list.map((p) => [p.journeyId, p])))

    return userJourneys.map((uj) => {
      const progress = progressMap.get(uj.journeyId)
      return {
        ...uj.journey,
        progress: {
          currentLevelNumber: progress?.currentLevelNumber ?? 1,
          currentLessonDayNumber: progress?.currentLessonDayNumber ?? 1,
          premiumUnlocked: uj.premiumUnlocked,
        },
      }
    })
  }

  async getMyProgress(
    userId: string,
    journeyId: string,
  ): Promise<JourneyProgressOutputDto> {
    const [progress, userJourney] = await Promise.all([
      this.prisma.userJourneyProgress.findUnique({
        where: { userId_journeyId: { userId, journeyId } },
      }),
      this.prisma.userJourney.findUnique({
        where: { userId_journeyId: { userId, journeyId } },
      }),
    ])

    if (!userJourney) {
      throw new NotFoundException('Journey not assigned to user')
    }

    return {
      currentLevelNumber: progress?.currentLevelNumber ?? 1,
      currentLessonDayNumber: progress?.currentLessonDayNumber ?? 1,
      premiumUnlocked: userJourney.premiumUnlocked,
    }
  }

  async premiumUnlock(userId: string, journeyId: string): Promise<{ success: boolean }> {
    const userJourney = await this.prisma.userJourney.findUnique({
      where: { userId_journeyId: { userId, journeyId } },
    })

    if (!userJourney) {
      throw new NotFoundException('Journey not assigned to user')
    }

    await this.prisma.userJourney.update({
      where: { userId_journeyId: { userId, journeyId } },
      data: { premiumUnlocked: true },
    })

    return { success: true }
  }
}
