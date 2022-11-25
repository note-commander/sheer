import { cache as local, init as initLocal } from './local-cache'
import { cache as session, init as initSession } from './session-cache'

export const localCache = local
export const sessionCache = session
export const init = (secret: string) => {
  initLocal(secret)
  initSession(secret)
}
export const initLocalCache = (secret: string) => {
  initLocal(secret)
}
export const initSessionCache = (secret: string) => {
  initSession(secret)
}
