export interface OnboardingStepOutputDto {
  id: string
  order: number
  answerOptions: unknown
}

export interface OnboardingConfigOutputDto {
  flowId: string
  key: string
  version: number
  steps: OnboardingStepOutputDto[]
}
