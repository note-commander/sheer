<template>
    <n-form ref="formRef" :model="formModel" :rules="formRules">
        <n-form-item path="emailInPlat" label="账号">
            <n-popover trigger="manual" placement="top" style="color:crimson" :show="showPopover.emailInPlat">
                <template #trigger>
                    <n-input clearable size="large" placeholder="请输入在供应商侧注册的账号" v-model:value="formModel.emailInPlat"
                        @input="showPopover.emailInPlat = false" />
                </template>
                <span>账号错误</span>
            </n-popover>
        </n-form-item>

        <n-form-item path="git" label="地址">
            <n-popover trigger="manual" placement="top" style="color:crimson" :show="showPopover.git">
                <template #trigger>
                    <n-input clearable size="large" placeholder="请输入仓库地址" v-model:value="formModel.git"
                        @input="showPopover.git = false" />
                </template>
                <span>仓库名错误</span>
            </n-popover>
        </n-form-item>

        <n-form-item path="tokenInPlat" label="令牌">
            <n-popover trigger="manual" placement="top" style="color:crimson" :show="showPopover.tokenInPlat">
                <template #trigger>
                    <n-input clearable size="large" placeholder="请输入上述拥有上述仓库访问权限的令牌"
                        v-model:value="formModel.tokenInPlat" @input="showPopover.tokenInPlat = false" />
                </template>
                <span>令牌错误</span>
            </n-popover>
        </n-form-item>

        <n-form-item path="path" label="根目录">
            <n-input clearable size="large" placeholder="请输入文件根目录, 笔记文件将存储在此目录下，为空表示'/note-commander'"
                v-model:value="formModel.path" />
        </n-form-item>

        <n-form-item path="name" label="别名">
            <n-input clearable size="large" placeholder="输入别名, 用于代替仓库名在note-commander显示"
                v-model:value="formModel.name" />
        </n-form-item>
    </n-form>

    <n-space justify="end">
        <n-button secondary @click="$emit('click:cancle')">取消</n-button>
        <n-button secondary type="info" @click="handleValidateClick">确认</n-button>
    </n-space>
</template>


<script lang='ts' setup>
import type { FormInst, FormRules } from 'naive-ui';
import { platNames, REPOSOBJFILEPATH, REPOSOBJMODEL } from '@/utils/enum';
import { api } from '@/api';
import { repoState } from '@/stores';
type objType = { [prop: string]: any }




const props = defineProps(['dataModel'])
const emits = defineEmits(['submit:repos', 'submit:createRepos', 'submit:loadRepos', 'click:cancle'])
const message = useMessage()




const formRef = ref<FormInst | null>(null)
const formModel = reactive({ ...props.dataModel })
const showPopover = reactive({
    git: false,
    emailInPlat: false,
    tokenInPlat: false
})
const formRules: FormRules = {
    git: { required: true, message: '请输入仓库地址' },
    emailInPlat: { required: true, message: '请输入在供应商侧注册的邮箱' },
    tokenInPlat: { required: true, message: '输入令牌token' },
    path: { required: false, message: '请输入根目录的路径' },
    name: { required: false, message: '请输入别名' }
}




//去掉表单数据模型内数据头尾的空格
function clearTrim(obj: objType) {
    Object.entries(obj).forEach(([index, value]) => {
        obj[index] = value.trim()
    })
}




//点击表单的submit按钮后验证表单项合法性，合法就执行新增obj函数
const handleValidateClick = () => {
    formRef.value?.validate((errors: any) => {
        if (!errors) {
            clearTrim(formModel)
            if (props.dataModel.nameInPlat) {
                updateRepos(formModel).then(() => {
                    //发射事件给index
                    emits('submit:repos')
                    //toast提示
                    message.success('修改了仓库信息')
                })
            } else {
                addRepos(formModel).then(() => {
                    //发射事件给AddReposComp
                    emits('submit:createRepos')
                })
            }

        } else {
            message.error('仓库信息错误，请检查必填项是否填写正确')
        }
    })
}




//更新仓库信息
async function updateRepos(reposObj: any) {
    //备份repoState
    const reposStateBackup = { ...repoState.repos }
    //把reposObj赋给现在的reposState
    await new Promise((resolve) => {
        //缓存表单的nameInPlat
        const gitUrl = formModel.git
        //把ssh格式解析成https
        const str = gitUrl.replace(/^git@/, 'https://').replace(/.com:/, '.com/').replace('.git', '')
        //构造url对象
        const url = new URL(str)
        //先处理一下url里的pathname
        const pathname = url.pathname.split('/')
        //赋予创建时间
        repoState.setRepos({
            ...reposObj,
            name: reposObj.name || pathname[2].split('.')[0],
            path: reposObj.path || REPOSOBJMODEL.path,
            plat: url.hostname.includes('github') ? 'github' : 'gitee',
            nameInPlat: pathname[2],
            usernameInPlat: pathname[1]
        })
        resolve(null)
    })

    try {
        //获取reposObj文件的sha
        const repos = await getFileContentFromSwitch(REPOSOBJFILEPATH) as objType
        //更新文件内容
        await updateReposObjToPlat(repos.data.sha)
    } catch (error) {
        //创建reposObj出错就恢复reposObj
        repoState.setRepos(reposStateBackup)
        message.error('仓库信息错误，请检查必填项是否填写正确')
        throw error
    }
}




//更新平台中reposObj文件的内容
function updateReposObjToPlat(sha: string) {
    switch (repoState.repos.plat) {
        case platNames.github.value:
            return api.github.putFile({
                owner: repoState.repos.usernameInPlat,
                repo: repoState.repos.nameInPlat,
                path: REPOSOBJFILEPATH,
                //原来把整个reposState写入文件，但会导致公开仓库中暴露token
                // content: JSON.stringify(toRaw(repoState.repos)),
                //现在只把仓库别名写入文件
                content: JSON.stringify({ name: repoState.repos.name }),
                sha: sha,
                committerName: repoState.repos.usernameInPlat,
                committerEmail: repoState.repos.emailInPlat,
            })

        case platNames.gitee.value:
            return api.gitee.putFile({
                owner: repoState.repos.usernameInPlat,
                repo: repoState.repos.nameInPlat,
                path: REPOSOBJFILEPATH,
                //原来把整个reposState写入文件，但会导致公开仓库中暴露token
                // content: JSON.stringify(toRaw(repoState.repos)),
                //现在只把仓库别名写入文件
                content: JSON.stringify({ name: repoState.repos.name }),
                sha: sha,
            })

        default:
            return new Promise((resolve) => { resolve(null) })
    }
}




//获取平台中文件的内容
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




//新增仓库
async function addRepos(reposObj: any) {
    //把reposObj赋给现在的reposState
    await new Promise((resolve) => {
        //缓存表单git的url
        const gitUrl = formModel.git
        //把ssh格式解析成https
        const str = gitUrl.replace(/^git@/, 'https://').replace(/.com:/, '.com/').replace('.git', '')
        //构造url对象
        const url = new URL(str)
        //先处理一下url里的pathname
        const pathname = url.pathname.split('/')
        //赋予创建时间
        repoState.setRepos({
            ...reposObj,
            name: reposObj.name || pathname[2].split('.')[0],
            path: reposObj.path || REPOSOBJMODEL.path,
            createTime: new Date().toISOString(),
            plat: url.hostname.includes('github') ? 'github' : 'gitee',
            nameInPlat: pathname[2],
            usernameInPlat: pathname[1]
        })
        resolve(null)
    })

    try {
        //创建reposObj文件
        await createReposObjInPlat()
        //在仓库创建map文件
        await createMap(reposObj.plat)
    } catch (error) {
        await handleError(error as objType)
    }
}




//在平台创建reposObj文件
function createReposObjInPlat() {
    switch (repoState.repos.plat) {
        case platNames.github.value:
            return api.github.putFile({
                owner: repoState.repos.usernameInPlat,
                repo: repoState.repos.nameInPlat,
                path: REPOSOBJFILEPATH,
                //原来把整个reposState写入文件，但会导致公开仓库中暴露token
                // content: JSON.stringify(toRaw(repoState.repos)),
                //现在只把仓库别名写入文件
                content: JSON.stringify({ name: repoState.repos.name }),
                committerName: repoState.repos.usernameInPlat,
                committerEmail: repoState.repos.emailInPlat,
            })

        case platNames.gitee.value:
            return api.gitee.createReposObj({
                owner: repoState.repos.usernameInPlat,
                repo: repoState.repos.nameInPlat,
                reposObj: { name: repoState.repos.name }
            })

        default:
            return new Promise((resolve) => { resolve(null) })
    }
}




//创建仓库.map文件
function createMap(plat: string) {
    switch (plat) {
        case platNames.github.value:
            return api.github.createMap({
                owner: repoState.repos.usernameInPlat,
                repo: repoState.repos.nameInPlat,
                committerName: repoState.repos.usernameInPlat,
                committerEmail: repoState.repos.emailInPlat
            })

        case platNames.gitee.value:
            return api.gitee.createMap({
                owner: repoState.repos.usernameInPlat,
                repo: repoState.repos.nameInPlat
            })

        default:
            return new Promise((resolve) => { resolve(null) })
    }
}




//错误处理
async function handleError(error: objType) {
    switch (formModel.plat) {
        case platNames.github.value:
            return console.log(error)

        case platNames.gitee.value:
            return emits('submit:loadRepos')
    }
}
</script>


<style scoped>

</style>