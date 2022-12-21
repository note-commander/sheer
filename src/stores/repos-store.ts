import { REPOSOBJMODEL } from '@/utils/enum'

type propType = any
type objType = { [prop in string]: propType }

const reposObj: objType = reactive(JSON.parse(sessionStorage.getItem('repos-state') as string) || { ...REPOSOBJMODEL })

//reposObj变动就写进localStorage
watch(
  reposObj,
  (newValue) => {
    if (newValue.nameInPlat) {
      localStorage.setItem('repos-state', JSON.stringify(toRaw(reposObj)))
    }
  },
  { deep: true }
)

export const actions = {
  repos: reposObj,
  setRepos(repos: objType) {
    Object.assign(reposObj, repos)
  },
  setLocalStorage() {
    localStorage.setItem('repos-state', JSON.stringify(toRaw(reposObj)))
  },
  getReposObjFromCache() {
    return localStorage.getItem('repos-state') ? JSON.parse(localStorage.getItem('repos-state') as string) : null //localStorage.getItem('repos-state') ? JSON.parse(localStorage.getItem('repos-state') as string) : null
    // return {
    //   plat: '',
    //   path: '/note-commander',
    //   usernameInPlat: '',
    //   nameInPlat: '',
    //   name: '',
    //   emailInPlat: '',
    //   tokenInPlat: '',
    //   createTime: '',
    // }
  },
  clearStore() {
    for (const key of Object.keys(reposObj)) {
      reposObj[key] = ''
    }
  },
  removeAllCookie() {
    localStorage.removeItem('repos-state')
  },
}

export function serializeState() {
  window.addEventListener('unload', actions.setLocalStorage)
}
