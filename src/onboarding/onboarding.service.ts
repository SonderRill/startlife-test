import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'
import { JourneyOutputDto } from '../journeys/dto/journey-output.dto'
import {
  OnboardingConfigOutputDto,
  OnboardingStepOutputDto,
} from './dto/onboarding-config-output.dto'
import { PaywallTypeOutputDto } from './dto/paywall-type-output.dto'

const DEFAULT_FLOW_KEY = 'default'

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig(): Promise<OnboardingConfigOutputDto> {
    const flow = await this.prisma.onboardingFlow.findFirst({
      where: { key: DEFAULT_FLOW_KEY },
      include: {
        onboardingSteps: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!flow) {
      return {
        flowId: '',
        key: DEFAULT_FLOW_KEY,
        version: 1,
        steps: [],
      }
    }

    const steps: OnboardingStepOutputDto[] = flow.onboardingSteps.map((s) => ({
      id: s.id,
      order: s.order,
      answerOptions: s.answerOptions as unknown,
    }))

    return {
      flowId: flow.id,
      key: flow.key,
      version: flow.version,
      steps,
    }
  }

  async saveAnswers(
    userId: string,
    flowId: string,
    answers: Record<string, unknown>,
  ): Promise<{ success: boolean }> {
    const flow = await this.prisma.onboardingFlow.findUnique({
      where: { id: flowId },
    })

    if (!flow) {
      throw new NotFoundException('Onboarding flow not found')
    }

    await this.prisma.onboardingAnswer.upsert({
      where: { userId_flowId: { userId, flowId } },
      create: { userId, flowId, answers: answers as object },
      update: { answers: answers as object },
    })

    return { success: true }
  }

  async getPaywallType(): Promise<PaywallTypeOutputDto> {
    return {
      type: 'subscription',
      options: {
        plans: ['monthly', 'yearly'],
      },
    }
  }

  async getRecommendedJourneys(userId: string): Promise<JourneyOutputDto[]> {
    const answers = await this.prisma.onboardingAnswer.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    const journeys = await this.prisma.journey.findMany({
      select: { id: true, slug: true, title: true, lengthDays: true },
      orderBy: { createdAt: 'asc' },
    })

    if (!answers?.answers) {
      return journeys
    }

    return this.recommendJourneys(journeys, answers.answers as Record<string, unknown>)
  }

  private recommendJourneys(
    journeys: JourneyOutputDto[],
    _answers: Record<string, unknown>,
  ): JourneyOutputDto[] {
    return journeys
  }
}
