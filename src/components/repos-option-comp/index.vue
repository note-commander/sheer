<template>
    <n-modal v-model:show="showModal" preset="card" style="width:38rem ;" :bordered="false"
        :title="repoState.repos.name">
        <ReposDetailComp ref="reposDetailCompRef" v-if="showReposDetail" @click:edit="handleEditClick"
            @click:output="handleOutputClick" @click:logout="handleLogoutRepos" @click:delete="handleDeleteClick">
        </ReposDetailComp>
        <FormReposObjComp ref="formReposObjCompRef" v-if="showFormReposObj" :data-model="repoState.repos"
            @submit:repos="handleSubmitRepos" @click:cancle="handleClickCancle">
        </FormReposObjComp>
    </n-modal>

    <OutputReposComp ref="outputReposCompRef" @click:negative="handleClickCancle"></OutputReposComp>

    <DeleteReposComp ref="deleteReposCompRef" @click:negative="handleClickCancle"></DeleteReposComp>
</template>


<script lang='ts' setup>
import { repoState } from '@/stores';
import { Ref } from 'vue';




const reposDetailCompRef = ref()
const formReposObjCompRef = ref()
const outputReposCompRef = ref()
const deleteReposCompRef = ref()




//模态弹窗的开关
const showModal = ref(false)
//仓库详情的开关
const showReposDetail = ref(false)
//修改仓库表单的开关
const showFormReposObj = ref(false)




//打开某个模态弹窗内的元素
function openSomethingInModal(something: Ref) {
    showFormReposObj.value = false
    showReposDetail.value = false
    something.value = true
    showModal.value = true
}




//修改仓库按钮的处理函数
function handleEditClick() {
    openSomethingInModal(showFormReposObj)
}




//提交仓库信息更新的处理函数
function handleSubmitRepos() {
    openSomethingInModal(showReposDetail)
}
//点击【取消】按钮的处理函数
function handleClickCancle() {
    openSomethingInModal(showReposDetail)
}




//点击导出按钮的处理函数
function handleOutputClick() {
    showModal.value = false
    outputReposCompRef.value.confirmClickOutput()
}




//点击注销按钮的处理函数
function handleLogoutRepos() {
    showModal.value = false
}




//点击删除按钮的处理函数
function handleDeleteClick() {
    showModal.value = false
    deleteReposCompRef.value.confirmClickDelete()
}




//暴露的显示repos modal的函数
function showReposModal() {
    openSomethingInModal(showReposDetail)
}




defineExpose({ showReposModal })
</script>


<style scoped>

</style>