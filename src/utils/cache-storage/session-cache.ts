import CryptoJS from 'crypto-js'

const map = new Map()
let secretKey = ''

export function init(secret: string, oldSecretKeys?: string[]) {
  //赋予secret key
  secretKey = secret
  //读取sessionStorage
  while (sessionStorage.length) {
    //获取sessionStorage的key
    const key = sessionStorage.key(0)
    //把key解密
    let decryptedData = CryptoJS.AES.decrypt('U2FsdGVkX1' + key + '=', secret).toString(CryptoJS.enc.Utf8)
    //密钥解压不出来就用oldSecretKeys里的secret试
    let index = 0
    while (!decryptedData && oldSecretKeys && index < oldSecretKeys.length) {
      decryptedData = CryptoJS.AES.decrypt('U2FsdGVkX1' + key + '=', oldSecretKeys[index++]).toString(CryptoJS.enc.Utf8)
    }
    //试完了所有oldSecretKeys还不能解密就报错
    if (!decryptedData) throw new Error('decrypt failed, because the secret is wrong')
    //把解密后的可以和对应value存入map
    map.set(decryptedData, { value: sessionStorage.getItem(key as string), key: '' })
    //把sessionStorage里的对应缓存删除
    sessionStorage.removeItem(key as string)
  }
  //没有缓存就return
  if (!map.size) return
  //重写sessionStorage
  for (const [key, value] of map.entries()) {
    //把key加密作为新key
    const k = CryptoJS.AES.encrypt(key, secret).toString()
    //把加密后的key存入map
    map.set(key, { ...map.get(key), key: k.slice(10, k.length - 1) })
    //用新key和值写入sessionStorage
    sessionStorage.setItem(k.slice(10, k.length - 1), value.value)
  }
}

function setCache(key: string, value: string) {
  if (map.has(key)) sessionStorage.removeItem(map.get(key).key)

  const newKey = CryptoJS.AES.encrypt(key, secretKey).toString()
  map.set(key, { value: value, key: newKey.slice(10, newKey.length - 1) })

  sessionStorage.setItem(newKey.slice(10, newKey.length - 1), map.get(key).value)
}

function getCache(key: string) {
  if (map.has(key)) return map.get(key).value
  return null
}

function removeCache(key: string) {
  if (map.has(key)) {
    const obj = map.get(key)
    sessionStorage.removeItem(obj.key)
    map.delete(key)
    return obj
  }
  return null
}

export const cache = {
  setCache,
  getCache,
  removeCache,
}
