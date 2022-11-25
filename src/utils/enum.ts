export const platNames = {
  github: { value: 'github', baseURL: 'https://api.github.com/repos' },
  gitee: { value: 'gitee', baseURL: 'https://gitee.com/api/v5/repos' },
}

export const MAPFILENAME = '.map'
export const MAPDIRNAME = ''
export const MAPFILEPATH = `${MAPDIRNAME}/${MAPFILENAME}`
export const OBJMODELINMAP = {
  dir: { parent: null, data: { id: '1', type: 'dir', name: '', path: '/', createTime: '' }, child: [] },
  file: { parent: null, data: { id: '1', type: 'file', name: '', path: '', format: '.md', createTime: '' } },
}

export const REPOSOBJFILENAME = '.reposObj'
export const REPOSOBJDIRNAME = ''
export const REPOSOBJFILEPATH = `${REPOSOBJDIRNAME}/${REPOSOBJFILENAME}`
export const REPOSOBJMODEL = {
  plat: '',
  path: '/note-commander',
  usernameInPlat: '',
  nameInPlat: '',
  name: '',
  emailInPlat: '',
  tokenInPlat: '',
  createTime: '',
  git: '',
}
