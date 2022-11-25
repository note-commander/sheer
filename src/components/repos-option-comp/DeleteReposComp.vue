<template>
    <n-modal :show="loading" :mask-closable="false" @after-leave="resetLive">
        <n-card style="width: 600px" size="huge" :bordered="false" role="dialog" aria-modal="true">
            <n-h3 prefix="bar" type="info">
                <n-text type="info">
                    正在删除 {{ hadDeleted }}/{{ fileNumber }}
                </n-text>
            </n-h3>
            <n-progress type="line" :percentage="currentPercent" :indicator-placement="'inside'" processing />
        </n-card>
    </n-modal>
</template>


<script lang='ts' setup>
import { repoState, mapState } from '@/stores';
import { api } from '@/api';
import { platNames, MAPFILEPATH, REPOSOBJFILEPATH } from '@/utils/enum';
type objType = { [prop: string]: any }




const emits = defineEmits(['delete:repos', 'click:negative'])
const dialog = useDialog()
const message = useMessage()




//已下载file的数量
const hadDeleted = ref(0)
//删除文件的loading开关
const loading = ref(false)
//loading的进度
const currentPercent = ref(0)
//应下载file的总数
const fileNumber = computed(() => {
    let num = 0
    for (const [, value] of mapState.map.value) {
        if (value?.data.type === 'file') num++
    }
    return num
})
//重置现场
function resetLive() {
    currentPercent.value = 0
    hadDeleted.value = 0
}




//导出确认框回调处理函数
async function confirmClickDelete() {
    dialog.warning({
        title: '确定删除仓库和其中所有文件吗？',
        content: '此操作可能会持续较长时间，请等待到处完成，中途关闭页面会导致操作失败。',
        positiveText: '确认',
        negativeText: '取消',
        onPositiveClick: () => {
            // removeObj(['1', mapState.map.value.get('1')])
            removeRepos().then(() => {
                message.success('删除了仓库')
                //清除reposState
                repoState.clearStore()
                //清除reposState的cookie
                repoState.removeAllCookie()
                //清除mapState
                mapState.clearStore()
                //延迟1.2秒隐藏loading
                setTimeout(() => {
                    loading.value = false
                }, 1200)
            })
        },
        onNegativeClick: () => {
            emits('click:negative')
        }
    })
}




//删除仓库中所有文件
async function removeRepos() {
    loading.value = true
    //如果仓库里没有文件就直接删除
    if (mapState.map.value.size <= 0) {
        //更新loading动画的数值
        currentPercent.value = Number.parseFloat((++hadDeleted.value / fileNumber.value).toFixed(2)) * 100
    } else {
        //仓库里有文件就遍历删除所有文件
        for (const item of mapState.map.value.values()) {
            if (item.data.type === 'file') {
                try {
                    await removeFileObj(item.data.path).finally(() => {
                        currentPercent.value = Number.parseFloat((++hadDeleted.value / fileNumber.value).toFixed(2)) * 100
                    })
                } catch (error) {
                    continue
                }
            }
        }
    }
    //获取map文件的sha
    const mapResp = await getFileContentFromSwitch(MAPFILEPATH) as objType
    //删除map文件
    await deleteFileFromPlat(MAPFILEPATH, mapResp.data.sha)

    //获取reposObj文件的sha
    const reposObjResp = await getFileContentFromSwitch(REPOSOBJFILEPATH) as objType
    //删除map文件
    await deleteFileFromPlat(REPOSOBJFILEPATH, reposObjResp.data.sha)
}




//删除单个文件
async function removeFileObj(path: string) {
    //获取sha
    const resp = await getFileContentFromSwitch(path) as objType
    await deleteFileFromPlat(path, resp.data.sha)
}
//从平台删除单个文件
function deleteFileFromPlat(path: string, sha: string) {
    switch (repoState.repos.plat) {

        case platNames.github.value:
            return api.github.deleteFile({
                owner: repoState.repos.usernameInPlat,
                repo: repoState.repos.nameInPlat,
                path: path,
                sha: sha,
                committerName: repoState.repos.nameInPlat,
                committerEmail: repoState.repos.emailInPlat
            })

        case platNames.gitee.value:
            return api.gitee.deleteFile({
                owner: repoState.repos.usernameInPlat,
                repo: repoState.repos.nameInPlat,
                path: path,
                sha: sha
            })

        default:
            return new Promise((resolve) => { resolve(null) })
    }
}
//异步获取文件内容
function getFileContentFromSwitch(path: string) {
    switch (repoState.repos.plat) {

        case platNames.github.value:
            return api.github.getFiles(repoState.repos.usernameInPlat, repoState.repos.nameInPlat, path)

        case platNames.gitee.value:
            return api.gitee.getFiles({ owner: repoState.repos.usernameInPlat, repo: repoState.repos.nameInPlat, path: path })

        default:
            return new Promise((resolve) => { resolve(null) })
    }
}




defineExpose({ confirmClickDelete })
</script>


<style scoped>

</style>