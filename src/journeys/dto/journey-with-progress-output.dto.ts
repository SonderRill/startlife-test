import type { JourneyOutputDto } from './journey-output.dto'

export interface JourneyWithProgressOutputDto extends JourneyOutputDto {
  progress: {
    currentLevelNumber: number
    currentLessonDayNumber: number
    premiumUnlocked?: boolean
  }
}
