type objType = { [prop: string]: any }

export interface dirType {
  parent: string
  data: dirDataType
  child: Array<string>
}
type dirDataType = Record<'id' | 'type' | 'name' | 'path' | 'createTime', string>
export interface fileType {
  parent: string
  data: fileDataType
}
type fileDataType = Record<'id' | 'type' | 'name' | 'path' | 'format' | 'createTime', string>
type mapType = Map<string, dirType | fileType>

const rawMap = ref<mapType>(new Map())
const currentMap = ref<mapType>(new Map())
const currentMapBackup = ref<mapType>(new Map())

export const actions = {
  map: rawMap,
  current: currentMap,
  backup: currentMapBackup,
  mergeRawMap(map: mapType) {
    rawMap.value.clear()
    for (const [key, value] of map.entries()) {
      rawMap.value.set(key, value)
    }
  },
  mergeCurrentMap(map: mapType) {
    currentMap.value.clear()
    for (const [key, value] of map.entries()) {
      currentMap.value.set(key, value)
    }
  },
  mergeCurrentMapBackup(map: mapType) {
    currentMapBackup.value.clear()
    for (const [key, value] of map.entries()) {
      currentMapBackup.value.set(key, value)
    }
  },
  clearStore() {
    rawMap.value.clear()
    currentMap.value.clear()
    currentMapBackup.value.clear()
  },
}
