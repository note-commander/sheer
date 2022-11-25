<template>
    <n-modal :show="loading" :mask-closable="false" @after-leave="resetDownload">
        <n-card style="width: 600px" size="huge" :bordered="false" role="dialog" aria-modal="true">
            <n-h3 prefix="bar" type="info">
                <n-text type="info">
                    正在导出 {{ hadDowned }}/{{ fileNumber }}
                </n-text>
            </n-h3>
            <n-progress type="line" :percentage="currentPercent" :indicator-placement="'inside'" processing />
        </n-card>
    </n-modal>
</template>


<script lang='ts' setup>
import { Base64 } from 'js-base64';
import { repoState, mapState } from '@/stores';
import { platNames, MAPDIRNAME } from '@/utils/enum';
import { api } from '@/api';
import jszip from 'jszip';
import saveAs from 'file-saver';
type objType = { [prop in string]: any }




const emits = defineEmits(['click:negative'])
const dialog = useDialog()




//导出确认框回调处理函数
async function confirmClickOutput() {
    dialog.info({
        title: '确定导出仓库中所有文件吗？',
        content: '此操作可能会持续较长时间，请等待到处完成，中途关闭页面会导致操作失败。',
        positiveText: '确认',
        negativeText: '取消',
        onPositiveClick: () => {
            outputAllFile()
        },
        onNegativeClick: () => {
            emits('click:negative')
        }
    })
}
//downloadObj对象类型
type downloadObjType = { path: string, content: string }
//下载文件的缓存栈
const downloadFileList = ref<downloadObjType[]>([])
//应下载file的总数
const fileNumber = computed(() => {
    let num = 0
    for (const value of mapState.map.value.values()) {
        if (value.data.type === 'file') num++
    }
    return num
})
//已下载file的数量
const hadDowned = ref(0)
//下载文件的loading开关
const loading = ref(false)
//loading的进度
const currentPercent = ref(0)
//导出仓库的所有文件
async function outputAllFile() {
    //开启loading动画
    loading.value = true
    //从map文件中的根目录开始便利所有节点并找到其指向的文件，然后填装进downloadFileList保护现场
    await fillJsZipObj(mapState.map.value.get('1') as objType, repoState.repos)
    //用downloadFileList里的所有元素构建zip对象
    const zipObj = await new Promise((resolve) => {
        const zip = new jszip()

        if (downloadFileList.value.length > 0) {
            for (const item of downloadFileList.value) {
                zip.file(item.path, item.content)
            }
        }

        resolve(zip)
    }) as jszip
    //下载zip
    await zipObj.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, `${repoState.repos.name}.zip`)
        //延迟1.2秒隐藏loading
        setTimeout(() => {
            loading.value = false
        }, 1200)
    })
}
//重置现场
function resetDownload() {
    currentPercent.value = 0
    hadDowned.value = 0
    downloadFileList.value = []
}
//下钻dirObj获取其下所有fileObj并构建zip file对象
async function fillJsZipObj(dirObj: objType, reposObj: objType) {
    if (dirObj.data.type !== 'dir' || dirObj.child.length <= 0) return

    for (const childId of dirObj.child) {
        const currentObj = mapState.map.value.get(childId) as objType
        if (currentObj.data.type === 'file') {

            try {
                const resp = await getFileContentFromSwitch(currentObj.data.path, reposObj) as objType
                const path = translateIdToNameInPath(resp.data.path)
                const filePath = path + currentObj.data.format
                const content = Base64.decode(resp.data.content ?? ' ')
                //把文件名和内容构建成对象push进下载列表
                downloadFileList.value.push({ path: filePath, content: content })
                //更新loading动画的数值
                currentPercent.value = Number.parseFloat((++hadDowned.value / fileNumber.value).toFixed(2)) * 100
            } catch (error) {
                continue
            }

        } else {
            await fillJsZipObj(currentObj, reposObj)
        }
    }
}
//把path里的id转成name
function translateIdToNameInPath(path: string) {
    let idArrFromPath = path.split('/')
    idArrFromPath = idArrFromPath.slice(idArrFromPath.indexOf(MAPDIRNAME) + 1)
    for (let i = 0; i < idArrFromPath.length; i++) {
        const currentObj = mapState.map.value.get(idArrFromPath[i]) as objType
        if (currentObj) idArrFromPath[i] = currentObj.data.name
    }
    return idArrFromPath.join('/')
}
//异步获取文件内容
function getFileContentFromSwitch(filePath: string, reposObj: objType) {
    switch (reposObj.plat) {

        case platNames.github.value:
            return api.github.getFiles(reposObj.usernameInPlat, reposObj.nameInPlat, filePath)

        case platNames.gitee.value:
            return api.gitee.getFiles({ owner: reposObj.usernameInPlat, repo: reposObj.nameInPlat, path: filePath })

        default:
            return new Promise((resolve) => { resolve(null) })
    }
}




defineExpose({ confirmClickOutput, outputAllFile })
</script>


<style scoped>

</style>