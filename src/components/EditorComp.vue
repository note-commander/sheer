<template>
    <mavon-editor ref="mdEditor" :toolbars="option" :subfield="true" v-model="contentModel.body" class="editorStyle"
        @save="updateContent"></mavon-editor>


    <n-text depth="3">
        {{ textCount }} 字
    </n-text>
</template>


<script lang="ts" setup>
import 'mavon-editor/dist/css/index.css';
import { repoState } from '@/stores';
import { api } from '@/api';
import { Base64 } from 'js-base64';
import { platNames } from '@/utils/enum';
type objType = { [prop in string]: any }




//mavonEditor功能选项
const option = {
    bold: true, // 粗体
    italic: true, // 斜体
    header: true, // 标题
    underline: true, // 下划线
    strikethrough: true, // 中划线
    mark: true, // 标记
    superscript: true, // 上角标
    subscript: true, // 下角标
    quote: true, // 引用
    ol: true, // 有序列表
    ul: true, // 无序列表
    link: true, // 链接
    imagelink: true, // 图片链接
    code: true, // code
    table: true, // 表格
    fullscreen: false, // 全屏编辑
    readmodel: true, // 沉浸式阅读
    htmlcode: true, // 展示html源码
    help: true, // 帮助
    /* 1.3.5 */
    undo: true, // 上一步
    redo: true, // 下一步
    trash: true, // 清空
    save: true, // 保存（触发events中的save事件）
    /* 1.4.2 */
    navigation: true, // 导航目录
    /* 2.1.8 */
    alignleft: true, // 左对齐
    aligncenter: true, // 居中
    alignright: true, // 右对齐
    /* 2.2.1 */
    subfield: true, // 单双栏模式
    preview: true, // 预览
}




//content模型
const contentModel = reactive({ body: '', path: '', sha: '' })




function decodeContent(obj: objType) {
    //base64解码
    if (obj.body) obj.body = Base64.decode(obj.body)
    //合并成content对象
    Object.assign(contentModel, obj)
}




//editor中文本的计数器
const textCount = ref(0)
watch(
    () => contentModel.body,
    (newValue) => {
        if (newValue.trim().length === 0) {
            textCount.value = 0
        } else {
            textCount.value = newValue.trim().replace(/(\n)|(\s)/g, "").length ?? 0
        }

    },
    { immediate: true }
)




//使用naiveUI的toast消息
const message = useMessage()




//更新内容到仓库
async function updateContent() {

    if (repoState.repos.id === 0) {

        //没有仓库就提示
        message.warning('还没有仓库，无法保存内容')

    } else if (!contentModel.path) {

        //没选文件也提示
        message.warning('还没添加文件，无法保存内容')

    } else {

        //什么都有才执行仓库平台的update
        switch (repoState.repos.plat) {
            case platNames.github.value:
                updateGtihubContent()
                break

            case platNames.gitee.value:
                updateGiteeContent()
                break
        }

    }
}
//更新github内容
async function updateGtihubContent() {

    const resp = await api.github.getFiles(repoState.repos.usernameInPlat, repoState.repos.nameInPlat, contentModel.path)

    await api.github.putFile({
        owner: repoState.repos.usernameInPlat,
        repo: repoState.repos.nameInPlat,
        path: contentModel.path,
        content: contentModel.body,
        sha: resp.data.sha,
        committerName: repoState.repos.nameInPlat,
        committerEmail: repoState.repos.emailInPlat
    }).then(() => {
        message.success('保存了新内容')
    }).catch((error) => {
        console.log(error)
    })
}
//更新gitee内容
async function updateGiteeContent() {

    const resp = await api.gitee.getFiles({ owner: repoState.repos.usernameInPlat, repo: repoState.repos.nameInPlat, path: contentModel.path })

    await api.gitee.putFile({
        owner: repoState.repos.usernameInPlat,
        repo: repoState.repos.nameInPlat,
        path: contentModel.path,
        content: contentModel.body,
        sha: resp.data.sha
    }).then(() => {
        message.success('保存了新内容')
    }).catch((error) => {
        console.log(error)
    })
}




defineExpose({ decodeContent })
</script>


<style scoped>
.editorStyle {
    height: 95.8vh;
    box-shadow: 0 0px 0px white !important;
    border-radius: 4px !important;
    border: solid 1px #dee2e6 !important;
    position: unset !important;
}
</style>