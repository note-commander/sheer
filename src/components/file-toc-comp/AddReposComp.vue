<template>
    <n-button size="large" @click="showFormModal = true">
        添加仓库
    </n-button>

    <n-modal v-model:show="showFormModal" preset="card" style="width:38rem;" :bordered="false" title="添加仓库">
        <FormReposObjComp :data-model="reposObjWithEmpty" @submit:create-repos="handleSubmitCreateRepos"
            @submit:load-repos="handleSubmitLoadRepos">
        </FormReposObjComp>
    </n-modal>
</template>


<script lang='ts' setup>
import { api } from '@/api';
import { repoState } from '@/stores'
import { platNames, REPOSOBJFILEPATH } from '@/utils/enum'
import { Base64 } from 'js-base64';
type objType = { [prop: string]: any }




const emits = defineEmits(['submit:createRepos'])
//表单modal的开关
const showFormModal = ref(false)




//空reposObj数据模型
const reposObjWithEmpty = computed(() => {
    const emptyObj = { ...repoState.repos }
    for (const item in emptyObj) {
        emptyObj[item] = ''

    }
    emptyObj.plat = platNames.github.value
    return emptyObj
})




//创建仓库的处理函数
function handleSubmitCreateRepos() {
    showFormModal.value = false
    emits('submit:createRepos')
}




//从远程仓库载入reposObj文件信息的处理函数
function handleSubmitLoadRepos() {
    getReposObjFromPlat().then((resp) => {
        const data = resp as objType
        const content = Base64.decode(data.data.content)
        //索引文件为空直接return
        if (content.trim().length === 0) return
        //赋值给repoState
        repoState.setRepos(JSON.parse(content))
        //handleSubmitCreateRepos()
    })
}




//从平台获取reposObj文件内容
function getReposObjFromPlat() {
    switch (repoState.repos.plat) {
        case platNames.github.value:
            return api.github.getFiles(repoState.repos.usernameInPlat, repoState.repos.nameInPlat, REPOSOBJFILEPATH)

        case platNames.gitee.value:
            return api.gitee.getFiles({ owner: repoState.repos.usernameInPlat, repo: repoState.repos.nameInPlat, path: REPOSOBJFILEPATH })

        default:
            return new Promise((resolve) => { resolve(null) })
    }
}
</script>


<style scoped>

</style>