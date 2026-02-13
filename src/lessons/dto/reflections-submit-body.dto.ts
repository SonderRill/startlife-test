import { tags } from 'typia'

export interface ReflectionsSubmitBodyDto {
  text: string & tags.MaxLength<5000>
}
