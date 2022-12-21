import { actions as repos, serializeState as serializeRepos } from './repos-store'
import { actions as rawMap, dirType, fileType } from './map-store'
import { actions as tipTap } from './tip-tap-store'

export function serializeState() {
  // serializeRepos()
}

export const repoState = repos
export const mapState = rawMap
export const tipTapState = tipTap
export type { dirType, fileType }
