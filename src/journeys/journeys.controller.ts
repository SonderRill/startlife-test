import { TypedParam } from '@nestia/core'
import { Controller, Get, Post } from '@nestjs/common'

import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JourneyOutputDto } from './dto/journey-output.dto'
import { JourneyProgressOutputDto } from './dto/journey-progress-output.dto'
import { JourneyWithProgressOutputDto } from './dto/journey-with-progress-output.dto'
import { JourneysService } from './journeys.service'

@Controller('journeys')
export class JourneysController {
  constructor(private readonly journeysService: JourneysService) {}

  /**
   * @tag Journey
   * @summary Get all available journeys
   * @security bearer
   */
  @Get()
  async findAll(): Promise<JourneyOutputDto[]> {
    return this.journeysService.findAll()
  }

  /**
   * @tag Journey
   * @summary Get my journeys with progress
   * @security bearer
   */
  @Get('my')
  async findMy(
    @CurrentUser('sub') userId: string,
  ): Promise<JourneyWithProgressOutputDto[]> {
    return this.journeysService.findMyWithProgress(userId)
  }

  /**
   * @tag Journey
   * @summary Get my progress for a journey
   * @security bearer
   */
  @Get(':id/my/progress')
  async getMyProgress(
    @CurrentUser('sub') userId: string,
    @TypedParam('id') journeyId: string,
  ): Promise<JourneyProgressOutputDto> {
    return this.journeysService.getMyProgress(userId, journeyId)
  }

  /**
   * @tag Journey
   * @summary Unlock premium lessons for journey
   * @security bearer
   */
  @Post(':id/my/progress/premium-unlock')
  async premiumUnlock(
    @CurrentUser('sub') userId: string,
    @TypedParam('id') journeyId: string,
  ): Promise<{ success: boolean }> {
    return this.journeysService.premiumUnlock(userId, journeyId)
  }
}
