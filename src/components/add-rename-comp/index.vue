<template>
    <n-modal v-model:show="showModal" preset="card" style="width:38rem ;" :bordered="false" :title="title">
        <FormAddObjComp v-if="showAddForm" :data-model="addObjModel" @add-obj="handleAddObj"
            @add-obj:success="showModal = false">
        </FormAddObjComp>
        <FormRenameObjComp v-if="showRenameForm" :data-model="renameObjModel" @rename-obj="handleRenameObj">
        </FormRenameObjComp>
    </n-modal>
</template>


<script lang='ts' setup>
import { Ref } from 'vue';
type objType = { [prop in string]: any }




const props = defineProps(['dataModel'])
const emits = defineEmits(['renameObj', 'addObj'])




//模态弹窗的开关
const showModal = ref(false)
//FormAddObj的开关
const showAddForm = ref(false)
//FormRenameObj的开关
const showRenameForm = ref(false)
//新增obj的dirObj需要的
const addObjModel = toRef(props.dataModel, 'dir')
//需要改名的数据模型
const renameObjModel = ref()
//模态弹窗的标题
const title = ref('')




//处理新增obj
function handleAddObj(obj: objType) {
    emits('addObj', obj)
}
//处理obj改名
function handleRenameObj(obj: objType) {
    emits('renameObj', obj)
    showModal.value = false
}




//打开某个模态弹窗内的元素
function openSomethingInModal(something: Ref) {
    showRenameForm.value = false
    showAddForm.value = false
    something.value = true
    showModal.value = true
}




//向外暴露给obj改名的方法
function renameObj(obj: objType) {
    renameObjModel.value = obj
    title.value = '修改名称'
    openSomethingInModal(showRenameForm)
}
//向外暴露添加obj的方法
function addObj() {
    title.value = '添加'
    openSomethingInModal(showAddForm)
}




defineExpose({ renameObj, addObj })
</script>


<style scoped>

</style>