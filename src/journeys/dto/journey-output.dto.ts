import type { JourneyModel } from '../../../prisma/generated/prisma/models'

export type JourneyOutputDto = Pick<
  JourneyModel,
  'id' | 'slug' | 'title' | 'lengthDays'
>
