import { actions as repos, serializeState as serializeRepos } from './repos-store'
import { actions as rawMap, dirType, fileType } from './map-store'

export function serializeState() {
  // serializeRepos()
}

export const repoState = repos
export const mapState = rawMap
export type { dirType, fileType }
