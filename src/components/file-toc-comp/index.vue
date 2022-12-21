<template>
    <div class="box">
        <n-empty v-show="isEmpty" size="huge" style="height:93vh; justify-content: center;">
            <template #default>
                <n-h2 align-text>
                    还没有仓库
                </n-h2>
            </template>
            <template #icon>
                <svg t="1664467829956" class="icon" viewBox="0 0 1351 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="9264" width="54" height="54">
                    <path
                        d="M467.19776 479.648s2.688 2.688 8.096 2.688h393.44c2.688 0 5.376-2.688 8.096-2.688V358.4h409.6c-2.688-8.096-2.688-13.472-8.096-21.568l-264.096-277.568H335.16576l-264.096 277.568c-5.376 2.688-8.096 10.784-8.096 21.568h409.6v121.248h-5.376z m-409.6-61.952v476.96c0 37.728 40.416 70.048 88.928 70.048h1053.632c48.512 0 88.928-32.352 88.928-70.048V412.288H936.06176v64.672c0 32.352-29.632 59.296-61.984 59.296H480.63776c-35.04 0-61.984-26.944-61.984-59.296v-64.672H62.94176v5.376zM1200.18976 1024H146.55776C65.72576 1024 1.05376 964.704 1.05376 894.656V417.696c-2.688-48.512-2.688-94.304 29.632-123.968L313.62976 0H1038.52576l282.944 293.728c32.352 29.632 29.632 83.552 29.632 142.816v455.424C1345.72576 964.736 1278.33376 1024 1200.18976 1024z"
                        p-id="9265" fill="#cdcdcd"></path>
                </svg>
            </template>
            <template #extra>
                <AddReposComp @submit:create-repos="handleSubmitCreateRepos"></AddReposComp>
            </template>
        </n-empty>

        <div v-show="!isEmpty">
            <n-spin :show="showSpin" stroke="#2080f0" size="small" style="min-height: 90vh;">

                <OptionBtnComp ref="optionBtnCompRef" style="margin: 0.5rem 0 0.5rem 0;"
                    @change-repos="handleChangeRepos" @click:add="handleClickAdd" @click:repos="handleClickRepos"
                    @change-repos:empty="handleChangeReposEmpty">
                </OptionBtnComp>

                <add-rename-comp ref="addRenameCompRef" :data-model="dataModel" @add-obj="handleAddObj"
                    @rename-obj="handleRenameObj">
                </add-rename-comp>

                <repos-option-comp ref="reposOptionCompRef"></repos-option-comp>

                <FileListComp ref="fileListRef" :data-model="dataModel" @click:dir-obj="handleClickDirObj"
                    @click:rename="handleClickRename" @update:file-list="handleUpdateFileList"
                    @click:root-obj="handleClickRootObj" @download:dir="handleDownloadDir">
                    <template #breadcrumb>
                        <BreadcrumbComp ref="breadcrumbRef" style="margin: 0.5rem 0;" :data-model="dataModel.dir"
                            @click:crumb="handleClickCrumb">
                        </BreadcrumbComp>
                    </template>
                </FileListComp>

            </n-spin>
        </div>
    </div>

    <DownloadFilesComp ref="downloadFilesCompRef"></DownloadFilesComp>
</template>


<script lang='ts' setup>
import { OBJMODELINMAP } from '@/utils/enum'
type objType = { [prop in string]: any }




//基本数据模型，也用于存储当前状态
const dataModel = reactive({ ...OBJMODELINMAP })




const fileListRef = ref()
const breadcrumbRef = ref()
const optionBtnCompRef = ref()
const addRenameCompRef = ref()
const reposOptionCompRef = ref()
const downloadFilesCompRef = ref()
//FileListComp的开关
const isEmpty = ref(true)
//n-spin的开关
const showSpin = ref(false)




//下钻文件列表就往breadcrumb推一个目录
function handleClickDirObj(dirObj: any) {
    breadcrumbRef.value.pushCrumb(dirObj)
    dataModel.dir = { ...dirObj }
}
//点击了【改名】就把要改名的对象传给formRename
function handleClickRename(obj: objType) {
    addRenameCompRef.value.renameObj(obj)
}
//更新fileList时控制spin显隐
function handleUpdateFileList(order: string) {
    if (order === 'begin') {
        showSpin.value = true
    } else {
        showSpin.value = false
    }
}




//切换breadcrumb就更新fileList
function handleClickCrumb(crumb: any) {
    dataModel.dir = { ...crumb }
    fileListRef.value.getFileList(crumb)
}




//切换仓库就更新fileList
function handleChangeRepos() {
    isEmpty.value = false
    nextTick(() => {
        fileListRef.value.handleChangeRepos()
    })
}




//处理fileList发来的click rootObj事件
function handleClickRootObj(rootObj: any) {
    breadcrumbRef.value.makeRootCrumb(rootObj)
    handleClickDirObj(rootObj)
}




//没有仓库时不显示filiList
function handleChangeReposEmpty() {
    isEmpty.value = true
}




//控制模态弹窗的显隐
function handleClickAdd() {
    addRenameCompRef.value.addObj()
}




//创建仓库的处理函数
function handleSubmitCreateRepos() {
    handleChangeRepos()
}




//点击仓库按钮的处理函数
function handleClickRepos() {
    reposOptionCompRef.value.showReposModal()
}




//修改名称的处理函数
function handleRenameObj(obj: objType) {
    fileListRef.value.renameObj(obj)
}




//添加obj的处理函数
function handleAddObj(obj: objType) {
    fileListRef.value.setNewObjToMap(obj)
}




//下载文件夹下所有文件
function handleDownloadDir(obj: objType) {
    console.log(toRaw(obj))
    downloadFilesCompRef.value.outputAllFile(obj)
}
</script>


<style scoped>
.box {
    height: 100vh;
    overflow-y: auto;
    position: sticky;
    top: 0;
    padding: 0 0.5rem;
}
</style>