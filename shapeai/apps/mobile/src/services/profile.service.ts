import { apiGet } from './api.client'
import type { UserProfile } from '@shapeai/shared'

export async function getUserProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>('/profile')
}
