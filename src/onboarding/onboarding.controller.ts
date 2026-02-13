import { TypedBody } from '@nestia/core'
import { Controller, Get, Post } from '@nestjs/common'

import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { OnboardingService } from './onboarding.service'
import { OnboardingConfigOutputDto } from './dto/onboarding-config-output.dto'
import { OnboardingAnswersBodyDto } from './dto/onboarding-answers-body.dto'
import { PaywallTypeOutputDto } from './dto/paywall-type-output.dto'
import { JourneyOutputDto } from '../journeys/dto/journey-output.dto'

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * @tag Onboarding
   * @summary Get onboarding steps configuration
   * @security bearer
   */
  @Get('config')
  async getConfig(): Promise<OnboardingConfigOutputDto> {
    return this.onboardingService.getConfig()
  }

  /**
   * @tag Onboarding
   * @summary Save onboarding answers
   * @security bearer
   */
  @Post('answers')
  async saveAnswers(
    @CurrentUser('sub') userId: string,
    @TypedBody() body: OnboardingAnswersBodyDto,
  ): Promise<{ success: boolean }> {
    return this.onboardingService.saveAnswers(
      userId,
      body.flowId,
      body.answers,
    )
  }

  /**
   * @tag Onboarding
   * @summary Get paywall type and options
   * @security bearer
   */
  @Get('paywall-type')
  async getPaywallType(): Promise<PaywallTypeOutputDto> {
    return this.onboardingService.getPaywallType()
  }

  /**
   * @tag Onboarding
   * @summary Get recommended journeys based on onboarding
   * @security bearer
   */
  @Get('journeys')
  async getRecommendedJourneys(
    @CurrentUser('sub') userId: string,
  ): Promise<JourneyOutputDto[]> {
    return this.onboardingService.getRecommendedJourneys(userId)
  }
}
