import { tags } from 'typia'

export interface FinishLessonBodyDto {
  rating?: number & tags.Minimum<1> & tags.Maximum<5>
}
