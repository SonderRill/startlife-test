export interface AuthResponseDto {
  accessToken: string
  user: {
    id: string
    deviceId: string
    platform: string
  }
}
