import CryptoJS from 'crypto-js'

const localMap = new Map()
let secretKey = ''

export function init(secret: string) {
  //赋予secret key
  secretKey = secret
  //读取localStorage
  while (localStorage.length) {
    //获取localStorage的key
    const key = localStorage.key(0)
    //把key解密
    const decryptedData = CryptoJS.AES.decrypt('U2FsdGVkX1' + key + '=', secretKey).toString(CryptoJS.enc.Utf8)
    //把解密后的可以和对应value存入map
    localMap.set(decryptedData, { value: localStorage.getItem(key as string), key: '' })
    //把localStorage里的对应缓存删除
    localStorage.removeItem(key as string)
  }

  //没有缓存就return
  if (!localMap.size) return

  //重写localStorage
  for (const [key, value] of localMap.entries()) {
    //把key加密作为新key
    const k = CryptoJS.AES.encrypt(key, secretKey).toString()
    //把加密后的key存入map
    localMap.set(key, { ...localMap.get(key), key: k.slice(10, k.length - 1) })
    //用新key和值写入localStorage
    localStorage.setItem(k.slice(10, k.length - 1), value.value)
  }
}

function setCache(key: string, value: string) {
  if (localMap.has(key)) localStorage.removeItem(localMap.get(key).key)

  const newKey = CryptoJS.AES.encrypt(key, secretKey).toString()
  localMap.set(key, { value: value, key: newKey.slice(10, newKey.length - 1) })

  localStorage.setItem(newKey.slice(10, newKey.length - 1), localMap.get(key).value)
}

function getCache(key: string) {
  if (localMap.has(key)) return localMap.get(key).value
  return null
}

function removeCache(key: string) {
  if (localMap.has(key)) {
    const obj = localMap.get(key)
    localStorage.removeItem(obj.key)
    localMap.delete(key)
    return obj
  }
  return null
}

export const cache = {
  setCache,
  getCache,
  removeCache,
}
