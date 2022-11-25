import ApiInstance from './base-api'
import { Base64 } from 'js-base64'
import { repoState } from '@/stores'
import { join } from 'path-browserify'
import { MAPDIRNAME, MAPFILENAME, MAPFILEPATH, OBJMODELINMAP, platNames, REPOSOBJDIRNAME, REPOSOBJFILENAME, REPOSOBJFILEPATH } from '@/utils/enum'
import qs from 'qs'
type objType = { [prop in string]: any }

class GiteeApi extends ApiInstance {
  constructor(baseUrl: string) {
    super(baseUrl)
    this.getApi().interceptors.request.use(
      (config) => {
        config.paramsSerializer = (params) => qs.stringify(params)
        return config
      },
      (error) => {
        console.log('error==========>', error)
        return Promise.reject(error)
      }
    )
  }
}

const giteeApiInstance = new GiteeApi(platNames.gitee.baseURL).getApi()

export const apiGitee = {
  getFiles(paramsObj: { owner: string; repo: string; path: string }) {
    return giteeApiInstance({
      method: 'get',
      url: join(paramsObj.owner, paramsObj.repo, 'contents', repoState.repos.path, paramsObj.path),
      params: { access_token: repoState.repos.tokenInPlat },
    })
  },
  getMapResp(owner: string, repo: string) {
    return this.getFiles({ owner: owner, repo: repo, path: MAPFILEPATH })
  },
  putFile(paramsObj: { owner: string; repo: string; path: string; content: string; sha: string }) {
    return giteeApiInstance.putForm(join(paramsObj.owner, paramsObj.repo, 'contents', repoState.repos.path, paramsObj.path), {
      access_token: repoState.repos.tokenInPlat,
      content: Base64.encode(paramsObj.content),
      sha: paramsObj.sha,
      message: 'update a file',
    })
  },
  updateMap(paramsObj: { owner: string; repo: string; content: string; sha: string }) {
    return this.putFile({
      owner: paramsObj.owner,
      repo: paramsObj.repo,
      path: MAPFILEPATH,
      content: paramsObj.content,
      sha: paramsObj.sha,
    })
  },
  postFile(paramsObj: { owner: string; repo: string; path: string; name: string; content?: string }) {
    return giteeApiInstance.postForm(join(paramsObj.owner, paramsObj.repo, 'contents', repoState.repos.path, paramsObj.path, paramsObj.name), {
      access_token: repoState.repos.tokenInPlat,
      content: Base64.encode(paramsObj.content || ' '),
      message: 'create a file',
    })
  },
  createReposObj(paramsObj: { owner: string; repo: string; reposObj: objType }) {
    const contentForReposObj = JSON.stringify(paramsObj.reposObj)
    return this.postFile({ owner: paramsObj.owner, repo: paramsObj.repo, path: REPOSOBJDIRNAME, name: REPOSOBJFILENAME, content: contentForReposObj })
  },
  createMap(paramsObj: { owner: string; repo: string }) {
    const contentForMap = JSON.stringify([...new Map().set(OBJMODELINMAP.dir.data.id, OBJMODELINMAP.dir)])
    return this.postFile({ owner: paramsObj.owner, repo: paramsObj.repo, path: MAPDIRNAME, name: MAPFILENAME, content: contentForMap })
  },
  deleteFile(paramsObj: { owner: string; repo: string; path: string; sha: string }) {
    return giteeApiInstance({
      method: 'delete',
      url: join(paramsObj.owner, paramsObj.repo, 'contents', repoState.repos.path, paramsObj.path),
      params: {
        access_token: repoState.repos.tokenInPlat,
        sha: paramsObj.sha,
        message: 'delete a file',
      },
    })
  },
}
