type objType = { [prop: string]: any }

const currentHtml = ref('')
const anchorFlag = ref(false)
const file = reactive<objType>({ parent: '', data: { id: '', type: '', name: '', path: '', format: '', createTime: '' } })
const filenameFlag = ref(false)
const filename = ref('')
//监听file，更新filename
watch(
  file,
  (newValue) => {
    filename.value = newValue.data.name
  },
  { deep: true }
)

export const actions = {
  html: currentHtml,
  flag: anchorFlag,
  file: file,
  filenameFlag: filenameFlag,
  filename: filename,
  setHtml(html: string) {
    currentHtml.value = html
  },
  changeFlag() {
    anchorFlag.value = !anchorFlag.value
  },
  changeName() {
    filenameFlag.value = !filenameFlag.value
  },
  setFilename(newName: string) {
    filename.value = newName
  },
  mergeFile(fileObj: objType) {
    Object.assign(file, fileObj)
  },
}
