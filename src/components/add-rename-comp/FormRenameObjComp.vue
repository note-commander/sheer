<template>
    <n-form ref="formRef" :show-label="false" :model="formModel" :rules="formRules">

        <n-form-item path="name">
            <n-popover trigger="manual" placement="top" style="color:crimson" :show="showPopover">
                <template #trigger>
                    <n-input-group size="large">
                        <n-input clearable size="large" placeholder="请输入文件名称" v-model:value="formModel.name"
                            @input="showPopover = false" />
                    </n-input-group>
                </template>
                <span>文件名重复</span>
            </n-popover>
        </n-form-item>
    </n-form>

    <n-space justify="end">
        <n-button secondary type="info" @click="handleValidateClick">确认</n-button>
    </n-space>
</template>


<script lang='ts' setup>
import type { FormInst, FormRules } from 'naive-ui';




const props = defineProps(['dataModel'])
const emits = defineEmits(['renameObj'])




//被改名对象的备份
const renameObjBackup = JSON.parse(JSON.stringify(props.dataModel))




const formRef = ref<FormInst | null>(null)
const formModel = reactive({ name: props.dataModel.data.name })
const formRules: FormRules = { name: { required: true, message: '请输入文件名称' } }
//控制表单输入框popover提示的显隐
const showPopover = ref(false)




//点击表单的submit按钮后验证表单项合法性，合法就执行新增obj函数
const handleValidateClick = () => {
    formRef.value?.validate((errors: any) => {
        if (!errors) {
            renameObj(formModel.name)
        } else {
            console.log(errors)
        }
    })
}




//给obj改名
function renameObj(name: string) {
    renameObjBackup.data.name = name
    emits('renameObj', renameObjBackup)
}
</script>


<style scoped>

</style>