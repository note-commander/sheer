<template>
    <n-form ref="formRef" :show-label="false" :model="formModel" :rules="formRules">

        <n-form-item path="type">
            <n-radio-group v-model:value="formModel.type">
                <n-space>
                    <n-radio value="file">
                        文件
                    </n-radio>
                    <n-radio value="dir">
                        目录
                    </n-radio>
                </n-space>
            </n-radio-group>
        </n-form-item>

        <n-form-item path="name">
            <n-popover trigger="manual" placement="top" style="color:crimson" :show="showPopover">
                <template #trigger>
                    <n-input-group size="large">
                        <n-input-group-label size="large">
                            <n-ellipsis style="max-width: 200px">
                                {{ filePath }}
                            </n-ellipsis>
                        </n-input-group-label>
                        <n-input clearable size="large" placeholder="请输入文件名称" v-model:value="formModel.name"
                            @input="showPopover = false" />
                    </n-input-group>
                </template>
                <span>文件名重复</span>
            </n-popover>
        </n-form-item>
    </n-form>

    <n-space justify="end">
        <n-button secondary type="info" @click="handleValidateClick" :loading="isLoading">确认</n-button>
    </n-space>
</template>


<script lang='ts' setup>
import type { FormInst, FormRules } from 'naive-ui';
import { api } from '@/api';
import { repoState } from '@/stores';
import { OBJMODELINMAP, platNames } from '@/utils/enum';
import { join } from 'path-browserify'
type objType = { [prop in string]: any }




const props = defineProps(['dataModel'])
const emits = defineEmits(['addObj', 'addObj:success'])
const message = useMessage()
//按钮loading状态的开关
const isLoading = ref(false)




//输入框前缀的路径
const filePath = computed(() => {
    if (props.dataModel.data.id === '1') {
        return '/'
    } else {
        return props.dataModel.data.name + '/'
    }
})




const formRef = ref<FormInst | null>(null)
const formModel = reactive({ type: 'file', name: '' })
const formRules: FormRules = { name: { required: true, message: '请输入文件名称' } }
//控制表单输入框popover提示的显隐
const showPopover = ref(false)




//点击表单的submit按钮后验证表单项合法性，合法就执行新增obj函数
const handleValidateClick = () => {
    formRef.value?.validate((errors: any) => {
        if (!errors) {
            addObj().then(() => {
                if (formModel.type === 'dir') {
                    message.success('添加了新目录')
                } else {
                    message.success('添加了新文件')
                }
                emits('addObj:success')
            }).finally(() => {
                isLoading.value = false
            })
        } else {
            console.log(errors)
        }
    })
}




//新增obj
async function addObj() {
    isLoading.value = true

    let obj: objType = { ...OBJMODELINMAP.file }

    if (formModel.type === 'dir') {
        obj = { ...OBJMODELINMAP.dir }
        obj.child = []
    }

    obj.parent = props.dataModel.data.id
    obj.data.id = Math.random().toString(36).slice(2)
    obj.data.name = formModel.name
    obj.data.path = join(props.dataModel.data.path, `${obj.data.id}`)

    emits('addObj', obj)

    if (formModel.type === 'file') {
        await addFileObj(obj.data.id).catch(() => {
            showPopover.value = true
        })
    }
}
//新增type为file的obj
function addFileObj(fileName: string) {
    switch (repoState.repos.plat) {
        case platNames.github.value:
            return api.github.putFile({
                owner: repoState.repos.usernameInPlat,
                repo: repoState.repos.nameInPlat,
                path: props.dataModel.data.path,
                name: fileName,
                committerName: repoState.repos.nameInPlat,
                committerEmail: repoState.repos.emailInPlat
            })

        case platNames.gitee.value:
            return api.gitee.postFile({
                owner: repoState.repos.usernameInPlat,
                repo: repoState.repos.nameInPlat,
                path: props.dataModel.data.path,
                name: fileName
            })

        default:
            return new Promise((resolve) => { resolve(null) })
    }
}




defineExpose({ addFileObj })
</script>


<style scoped>

</style>