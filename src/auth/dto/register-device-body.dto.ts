import { tags } from 'typia'

export interface RegisterDeviceBodyDto {
  deviceId: string & tags.MinLength<1> & tags.MaxLength<256>
  platform: string & tags.MinLength<1> & tags.MaxLength<32>
}
