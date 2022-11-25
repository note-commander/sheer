import axios from 'axios'

class ApiInstance {
  private axs
  constructor(baseUrl: string) {
    this.axs = axios.create({ baseURL: baseUrl, timeout: 1000 * 5 })
  }
  getApi() {
    return this.axs
  }
}

export default ApiInstance
