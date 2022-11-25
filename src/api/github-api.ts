import ApiInstance from './base-api'
import { MAPFILEPATH, OBJMODELINMAP } from '@/utils/enum'
import { Base64 } from 'js-base64'
import { repoState } from '@/stores'
import { join } from 'path-browserify'
import { platNames } from '@/utils/enum'

class GithubApi extends ApiInstance {
  constructor(baseUrl: string) {
    super(baseUrl)
    this.getApi().interceptors.request.use(
      (config) => {
        const token = repoState.repos.tokenInPlat ? `Bearer ${repoState.repos.tokenInPlat}` : null
        config.headers = {
          Authorization: token as string,
          Accept: 'application/vnd.github.v3+json',
        }
        return config
      },
      (error) => {
        console.log('error==========>', error)
        return Promise.reject(error)
      }
    )
  }
}

const githubApiInstance = new GithubApi(platNames.github.baseURL).getApi()

export const apiGithub = {
  getFiles(owner: string, repo: string, path: string) {
    return githubApiInstance({
      method: 'get',
      url: join(owner, repo, 'contents', repoState.repos.path, path),
    })
  },
  getMapResp(owner: string, repo: string) {
    return this.getFiles(owner, repo, MAPFILEPATH)
  },
  putFile(params: { owner: string; repo: string; path: string; name?: string; content?: string; sha?: string; committerName: string; committerEmail: string }) {
    return githubApiInstance({
      method: 'put',
      url: join(params.owner, params.repo, 'contents', repoState.repos.path, params.path, params.name || ''),
      data: {
        message: 'put a file',
        content: params.content ? Base64.encode(params.content) : '',
        sha: params.sha,
        committer: {
          name: params.committerName,
          email: params.committerEmail,
        },
      },
    })
  },
  updateMap(params: { owner: string; repo: string; content: string; sha: string; committerName: string; committerEmail: string }) {
    return this.putFile({
      owner: params.owner,
      repo: params.repo,
      path: MAPFILEPATH,
      content: params.content,
      sha: params.sha,
      committerName: params.committerName,
      committerEmail: params.committerEmail,
    })
  },
  createMap(params: { owner: string; repo: string; committerName: string; committerEmail: string }) {
    const contentForMap = JSON.stringify([...new Map().set(OBJMODELINMAP.dir.data.id, OBJMODELINMAP.dir)])
    return this.putFile({
      owner: params.owner,
      repo: params.repo,
      content: contentForMap,
      path: MAPFILEPATH,
      committerName: params.committerName,
      committerEmail: params.committerEmail,
    })
  },
  deleteFile(params: { owner: string; repo: string; path: string; sha: string; committerName: string; committerEmail: string }) {
    return githubApiInstance({
      method: 'delete',
      url: join(params.owner, params.repo, 'contents', repoState.repos.path, params.path),
      data: {
        message: 'delete a file',
        committer: {
          name: params.committerName,
          email: params.committerEmail,
        },
        sha: params.sha,
      },
    })
  },
}
