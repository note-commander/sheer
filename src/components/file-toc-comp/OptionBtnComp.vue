<template>
    <n-grid x-gap="8" y-gap="8" cols="12 l:24" responsive="screen">
        <n-gi span="12">
            <n-button strong secondary type="info" icon-placement="left" style="width:100%;"
                @click="$emit('click:add')">
                <template #icon>
                    <n-icon size="1.2rem" color="#2080f0" :component="AddSquareMultiple16Filled">
                    </n-icon>
                </template>
                添加
            </n-button>
        </n-gi>
        <n-gi span="12">
            <n-button strong secondary type="info" icon-placement="left" style="width:100%;"
                @click="$emit('click:repos')">
                <template #icon>
                    <n-icon size="1.2rem" color="#2080f0" :component="ArchiveSettings16Filled">
                    </n-icon>
                </template>
                <n-ellipsis style="width: 100%;">
                    {{ reposName }}
                </n-ellipsis>
            </n-button>
        </n-gi>
    </n-grid>
</template>


<script lang='ts' setup>
import { AddSquareMultiple16Filled, ArchiveSettings16Filled } from '@vicons/fluent'
import { repoState } from '@/stores'




const emits = defineEmits(['changeRepos', 'click:add', 'click:repos', 'changeRepos:empty'])
const reposName = toRef(repoState.repos, 'name')




//获取当前用户的仓库列表
function getReposInfo() {
    //有本地缓存就直接发射事件并return
    if (repoState.repos.usernameInPlat) {
        //发射变更仓库的事件
        emits('changeRepos')
        return
    }
    //有localStorage就合并reposObj
    if (repoState.getReposObjFromCache()) {
        repoState.setRepos(repoState.getReposObjFromCache())
        emits('changeRepos')
    } else {
        emits('changeRepos:empty')
    }
}




//监听repoState
watch(repoState.repos, () => { getReposInfo() }, { deep: true, immediate: true })




defineExpose({ getReposInfo })
</script>


<style scoped>

</style>