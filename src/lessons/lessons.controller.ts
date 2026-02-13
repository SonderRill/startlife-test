import { TypedBody, TypedParam } from '@nestia/core'
import { Controller, Get, Post } from '@nestjs/common'

import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { LessonsService } from './lessons.service'
import { LessonContentOutputDto } from './dto/lesson-content-output.dto'
import { QuizSubmitBodyDto } from './dto/quiz-submit-body.dto'
import { ReflectionsSubmitBodyDto } from './dto/reflections-submit-body.dto'
import { FinishLessonBodyDto } from './dto/finish-lesson-body.dto'

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  /**
   * @tag Lesson
   * @summary Get lesson content by journey and day
   * @security bearer
   */
  @Get(':journeyId/:day')
  async getContent(
    @CurrentUser('sub') userId: string,
    @TypedParam('journeyId') journeyId: string,
    @TypedParam('day') day: number,
  ): Promise<LessonContentOutputDto> {
    return this.lessonsService.getLessonContent(userId, journeyId, day)
  }

  /**
   * @tag Lesson
   * @summary Submit quiz answers for lesson
   * @security bearer
   */
  @Post(':id/quiz/submit')
  async submitQuiz(
    @CurrentUser('sub') userId: string,
    @TypedParam('id') lessonId: string,
    @TypedBody() body: QuizSubmitBodyDto,
  ): Promise<{ success: boolean }> {
    return this.lessonsService.submitQuiz(userId, lessonId, body.answers)
  }

  /**
   * @tag Lesson
   * @summary Submit reflection for lesson
   * @security bearer
   */
  @Post(':id/reflections/submit')
  async submitReflections(
    @CurrentUser('sub') userId: string,
    @TypedParam('id') lessonId: string,
    @TypedBody() body: ReflectionsSubmitBodyDto,
  ): Promise<{ success: boolean }> {
    return this.lessonsService.submitReflections(userId, lessonId, body.text)
  }

  /**
   * @tag Lesson
   * @summary Finish lesson and submit rating
   * @security bearer
   */
  @Post(':id/finish')
  async finish(
    @CurrentUser('sub') userId: string,
    @TypedParam('id') lessonId: string,
    @TypedBody() body: FinishLessonBodyDto,
  ): Promise<{ success: boolean }> {
    return this.lessonsService.finishLesson(userId, lessonId, body.rating)
  }
}
