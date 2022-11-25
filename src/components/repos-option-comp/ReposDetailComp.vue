<template>
    <n-grid x-gap="8" responsive="screen">
        <n-gi span="12">
            <n-statistic label="仓库平台">
                <n-h3>
                    {{ repoState.repos.plat }}
                </n-h3>
            </n-statistic>
        </n-gi>
        <n-gi span="12">
            <n-statistic label="文件数量">
                <n-skeleton v-if="loading" :sharp="false" size="small" />
                <n-h3 v-else>{{ fileNumber }}</n-h3>
            </n-statistic>
        </n-gi>
    </n-grid>

    <n-divider style="margin-top:-0rem ;" />

    <n-statistic label="根目录">
        <n-h3>
            <n-text code :strong="true">
                {{ repoState.repos.path }}
            </n-text>
        </n-h3>
    </n-statistic>

    <n-divider />

    <n-statistic label="curl">
        <n-h3>
            <n-text code :strong="true">
                https://api.github.com/repos/{{ repoState.repos.usernameInPlat }}/{{
                        repoState.repos.nameInPlat
                }}/contents{{ repoState.repos.path }}<br />
                -H "Authorization: Bearer {{ repoState.repos.tokenInPlat }}"
            </n-text>
        </n-h3>
    </n-statistic>

    <n-divider />

    <n-text depth="3">
        创建于{{ createTime }}
    </n-text>

    <n-divider />

    <n-space justify="center">
        <n-button quaternary type="info" @click="handleEditClick">修改
        </n-button>

        <n-button quaternary type="info" @click="handleOutputClick">导出</n-button>

        <n-button quaternary type="error" @click="handleDeleteClick">删除</n-button>
    </n-space>
</template>


<script lang='ts' setup>
import { repoState, mapState } from '@/stores';




const emits = defineEmits(['click:edit', 'click:output', 'click:delete'])




//仓库创建日期
const createTimeFromRepoState = toRef(repoState.repos, 'createTime')
const createTime = computed(() => {
    return new Date(createTimeFromRepoState.value).toLocaleString()
})




//文件数量骨架占位的开关哨兵
const loading = ref(false)




//仓库里文件的数量
const fileNumber = ref(0)
//计算map里文件元素的数量
function countFileNumberInRawObjMap() {
    loading.value = true
    for (const item of mapState.map.value.values()) {
        if (item.data.type === 'file') fileNumber.value++
    }
    loading.value = false
}
//组件载入后执行计算map
nextTick(() => {
    countFileNumberInRawObjMap()
})




function handleEditClick() {
    emits('click:edit')
}




//导出确认框确定的处理函数
function handleOutputClick() {
    emits('click:output')
}




//点击【删除】按钮的处理函数
function handleDeleteClick() {
    emits('click:delete')
}
</script>


<style scoped>

</style>