<template>

    <n-space justify="space-around" class="bar">
        <div v-for="(item, index) in btns">

            <n-button v-if="arr.includes(item.sign)" quaternary size="small" @click="handleClickBtn(item.sign)">
                <div class="icon-style" :style="`background-position-x: -${14 * index}px`"></div>
            </n-button>

            <n-dropdown v-else trigger="hover" :animated="false" :options="getOptions(item.sign)"
                @select="handleSelect($event, item.sign)">

                <n-button quaternary size="small">
                    <div class="icon-style" :style="`background-position-x: -${14 * index}px`"></div>
                </n-button>

            </n-dropdown>

        </div>
    </n-space>

    <n-modal v-model:show="showLinkModal" preset="card" style="width:38rem;" :bordered="false" title="添加链接"
        @after-leave="linkValue = ''">
        <n-form>
            <n-form-item :show-label="false">
                <n-input clearable v-model:value="linkValue" :input-props="{ type: 'url' }"
                    placeholder="请输入URL, 空时表示'#'" />
            </n-form-item>
        </n-form>
        <n-space justify="end">
            <n-button secondary @click="showLinkModal = false">取消</n-button>
            <n-button secondary type="info" @click="handleLinkClick">确认</n-button>
        </n-space>
    </n-modal>

    <n-modal v-model:show="showImageLinkModal" preset="card" style="width:38rem;" :bordered="false" title="图片链接"
        @after-leave="resetImageLink">
        <n-form>
            <n-form-item :show-label="false">
                <n-input clearable v-model:value="imageLinkValue.src" :input-props="{ type: 'url' }"
                    placeholder="图片链接，即src" />
            </n-form-item>
            <n-form-item :show-label="false">
                <n-input clearable v-model:value="imageLinkValue.alt" placeholder="图片描述，即alt，空时为'image'" />
            </n-form-item>
        </n-form>
        <n-space justify="end">
            <n-button secondary @click="showImageLinkModal = false">取消</n-button>
            <n-button secondary type="info" @click="handleImageLinkClick">确认</n-button>
        </n-space>
    </n-modal>

    <n-modal v-model:show="showTableModal" preset="card" style="width:38rem;" :bordered="false" title="添加表格"
        @after-leave="tableBuilderValue = ['', '']; showTablePopover = false">
        <n-form>
            <n-form-item :show-label="false">
                <n-popover trigger="manual" placement="top" style="color:crimson" :show="showTablePopover">
                    <template #trigger>
                        <n-input clearable pair separator=':' v-model:value="tableBuilderValue"
                            :placeholder="['行', '列']" @update:value="showTablePopover = false" />
                    </template>
                    <span>{{ tablePopoverTip }}</span>
                </n-popover>
            </n-form-item>
        </n-form>
        <n-space justify="end">
            <n-button secondary @click="showTableModal = false">取消</n-button>
            <n-button secondary type="info" @click="handleClickTableBuilder">确认</n-button>
        </n-space>
    </n-modal>

    <n-modal v-model:show="showInfoModal" preset="card" style="width:38rem;" :bordered="false" title="信息">
        <n-grid x-gap="8" responsive="screen">
            <n-gi span="12">
                <n-statistic label="字符数量">
                    <n-h3>{{ charCount }}</n-h3>
                </n-statistic>
            </n-gi>
            <n-gi span="12">
                <n-statistic label="符号数量">
                    <n-h3>{{ symbolCount }}</n-h3>
                </n-statistic>
            </n-gi>
        </n-grid>
        <n-divider />

        <n-text style="margin-top:-0rem ;" depth="3">
            {{ createTime }}
        </n-text>
    </n-modal>
</template>


<script lang='ts' setup>
import { NSpace, NButton, NDropdown, NForm, NFormItem, NInput, NModal, NUpload, UploadFileInfo } from 'naive-ui'
import { api } from '@/api'
import { platNames } from '@/utils/enum'
import showdown from 'showdown'
type objType = { [prop in string]: any }




const message = useMessage()
const emits = defineEmits(['click:command', 'click:info', 'click:save'])




interface btnObj { sign: string | number }
//工具栏按钮列表
const btns = ref<btnObj[]>([
    { sign: 'save' },
    { sign: 'heading' },
    { sign: 'bold' },
    { sign: 'italics' },
    { sign: 'underline' },
    { sign: 'strikethrough' },
    { sign: 'bookmark' },
    { sign: 'superscript' },
    { sign: 'subscript' },
    { sign: 'quote' },
    { sign: 'listOl' },
    { sign: 'listUl' },
    { sign: 'link' },
    { sign: 'image' },
    { sign: 'code' },
    { sign: 'table' },
    { sign: 'rotateLeft' },
    { sign: 'rotateRight' },
    { sign: 'info' },
])
//对照组，用于验证sign的有效性
const arr = computed(() => {
    const arr: (string | number)[] = []
    for (let i = 0; i < btns.value.length; i++) {
        if (btns.value[i].sign !== 'heading' && btns.value[i].sign !== 'image') arr.push(btns.value[i].sign)
    }
    return arr
})
//标题按钮列表
const headings = [
    { label: '一级标题', key: 1 },
    { label: '二级标题', key: 2 },
    { label: '三级标题', key: 3 },
    { label: '四级标题', key: 4 },
    { label: '五级标题', key: 5 },
    { label: '六级标题', key: 6 }
]
//图片按钮列表
const images = [
    { type: 'render', key: 1, render: renderUploader },
    { type: 'render', key: 2, render: renderImageLink },
]
//获取下拉列表选项的函数
function getOptions(sign: string | number) {
    switch (sign) {
        case 'heading':
            return headings

        case 'image':
            return images

        default:
            return headings
    }
}




//点击工具栏任意按钮的处理函数
function handleClickBtn(sign: string | number) {
    switch (sign) {
        case 'link':
            showLinkModal.value = true
            break
        case 'table':
            showTableModal.value = true
            break
        case 'info':
            emits('click:info')
            break
        case 'save':
            emits('click:save')
            break
        default:
            if (arr.value.includes(sign)) emits('click:command', sign)
    }
}




//下拉列表选择的处理函数，之用于处理标题渲染
function handleSelect(key: string | number, sign: string | number) {
    if (sign === 'heading') emits('click:command', key)
}




//link模态弹窗的开关
const showLinkModal = ref(false)
//link输入框的数据模型
const linkValue = ref('')
//处理link输入框确定的函数
function handleLinkClick() {
    emits('click:command', 'link', linkValue.value || '#')
    nextTick(() => {
        showLinkModal.value = false
    })

}




//渲染上传图片node
function renderUploader() {
    return h(NUpload,
        {
            multiple: true,
            'default-upload': false,
            'show-file-list': false,
            'on-before-upload': handleBefore,
            'on-change': handleChange
        },
        () => h(NButton, { quaternary: true, style: 'margin-left:0.22rem;margin-right:0.22rem' }, () => '本地上传')
    )
}
//渲染打开图片链接输入框按钮的node
function renderImageLink() {
    return h(NButton, {
        quaternary: true,
        style: 'margin-left:0.22rem;margin-right:0.22rem',
        onClick: () => showImageLinkModal.value = true
    }, () => '图片链接')
}
//图片上传组件改变时的处理函数
function handleChange(options: { file: UploadFileInfo, fileList: Array<UploadFileInfo>, event?: Event }) {
    //用FormData封装file
    // const formData = new FormData()
    // formData.append('file', options.file.file as File)
    //用fileReader读取file的base64
    const reader = new FileReader()
    reader.readAsDataURL(options.file.file as File)
    const arr = options.file.file?.name.split('.')
    const nameArr = arr?.slice(0, arr.length - 1)

    reader.onload = () => {
        //发送图片base64和名字给tiptop
        emits('click:command', 'image', reader.result, nameArr?.join(''))
    }
}
//图片上传的格式校验处理函数
async function handleBefore(options: { file: UploadFileInfo, fileList: UploadFileInfo[] }) {
    if (!options.file.file) return false
    if ((options.file.file?.type as string).indexOf('image/') === -1) {
        message.error('只能上传svg或ico格式的图片文件，请重新上传')
        return false
    } else if (options.file.file.size > 1024 * 1024 * 5) {
        message.error('只能上传大小不超过5MB的图片文件，请重新上传')
        return false
    }
    return true
}
//图片链接模态弹窗的开关
const showImageLinkModal = ref(false)
//图片链接输入框的数据模型
const imageLinkValue = reactive({ src: '', alt: '' })
//图片链接表单submit事件处理
function handleImageLinkClick() {
    nextTick(() => {
        if (imageLinkValue.src.length > 0) emits('click:command', 'image', imageLinkValue.src, imageLinkValue.alt || 'image')
    }).then(() => {
        showImageLinkModal.value = false
    })
}
//重置图片链接表单的数据模型
function resetImageLink() {
    Object.keys(imageLinkValue).forEach(key => {
        //@ts-ignore
        imageLinkValue[key] = ''
    })
}






//表格模态弹窗的开关
const showTableModal = ref(false)
//表格行列数输入框的数据模型
const tableBuilderValue = ref<[string, string]>(['', ''])
//监听行列数
watch(tableBuilderValue, (newValue, oldValue) => {
    for (let i = 0; i < newValue.length; i++) {
        //让模型只允许输入数字
        if (newValue[i].length > 0 && !/^\d*$/.test(newValue[i])) {
            newValue[i] = oldValue[i]
        }
    }
})
//表格行列数popover的开关
const showTablePopover = ref(false)
//表格行列数popover的提示文案
const tablePopoverTip = ref('请输入表格的行列数')
//表格行列数表单的submit处理函数
function handleClickTableBuilder() {
    for (let i = 0; i < tableBuilderValue.value.length; i++) {
        if (tableBuilderValue.value[i].length <= 0) {
            tablePopoverTip.value = '请输入表格的行列数'
            showTablePopover.value = true
            return
        }
    }
    emits('click:command', 'table', tableBuilderValue.value[0], tableBuilderValue.value[1])
    nextTick(() => {
        showTableModal.value = false
    })
}




//笔记信息模态窗的开关
const showInfoModal = ref(false)
//字符数量
const charCount = ref(0)
//符号数量
const symbolCount = ref(0)
//当前笔记文件的创建日期
const createTime = ref('')
//显示信息模态窗的函数
function openInfoModal(text: string) {
    //归零
    charCount.value = symbolCount.value = 0
    //记录字符数
    for (let i = 0; i < text.length; i++) {
        if (/[\u4e00-\u9fa5]|(\w+)/.test(text.charAt(i))) charCount.value++
    }
    //算符号数
    symbolCount.value = text.length - charCount.value
    //处理创建日期
    createTime.value = tipTapState.file.data.createTime ? '创建于 ' + tipTapState.file.data.createTime : '还没选择笔记文件'
    //显示模态窗
    showInfoModal.value = true
}




//html的table转md
function makeMDTable(element: HTMLElement) {

    const div = document.createElement('div')
    div.innerHTML = `<table><thead></thead><tbody></tbody></table>`
    const table = div.getElementsByTagName('table')[0]
    const thead = table.getElementsByTagName('thead')[0]
    const tbody = table.getElementsByTagName('tbody')[0]

    const trs = element.getElementsByTagName('tr')

    for (let i = 0; i < trs.length; i++) {
        if (i === 0) {
            thead.append(trs[i].cloneNode(true))
        } else {
            tbody.append(trs[i].cloneNode(true))
        }
    }

    const ps = table.getElementsByTagName('p')
    const psLenght = ps.length
    for (let i = 0; i < psLenght; i++) {
        const text = ps[i].innerText
        const parent = ps[i].parentElement as HTMLElement
        parent.append(text)

    }

    for (let i = 0; i < psLenght; i++) ps.item(0)?.remove()


    const html = div.innerHTML
    div.remove()
    return html

}




const contentModel = reactive({ parent: '', data: { body: '', path: '', sha: '', createTime: '' } })
const converter = new showdown.Converter()
function decodeContent(content: string) {
    //处理文件名
    checkFilename()
    //合并成content对象
    Object.assign(contentModel, {
        ...tipTapState.file,
        data: {
            ...tipTapState.file.data,
        }
    })
    //没有内容直接写空
    if (content.length <= 0) {
        contentModel.data.body = ''
        //更新
        updateContent()
    } else {//有内容就解析
        //创建临时dom用来把html字符串转成dom
        const dom = document.createElement('div')
        dom.innerHTML = content

        //获取dom中的table元素
        const tables = dom.getElementsByTagName('table')
        const tableLenght = tables.length
        //dom里有table元素就解析
        if (tableLenght > 0) {
            for (let i = 0; i < tableLenght; i++) {
                const div = document.createElement('div')
                div.innerHTML = makeMDTable(tables[i])
                //把临时dom里的table换成解析后的table
                dom.replaceChild(div.getElementsByTagName('table')[0].cloneNode(true), tables[i])
                div.remove()
            }
        }
        //html转markdown
        contentModel.data.body = converter.makeMarkdown(dom.innerHTML)
        //销毁临时dom
        dom.remove()
        //更新
        updateContent()
    }
}
//更新内容到仓库
async function updateContent() {

    if (repoState.repos.id === 0) {

        //没有仓库就提示
        message.warning('还没有仓库，无法保存内容')

    } else if (!contentModel.data.path) {

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

    const resp = await api.github.getFiles(repoState.repos.usernameInPlat, repoState.repos.nameInPlat, contentModel.data.path)

    await api.github.putFile({
        owner: repoState.repos.usernameInPlat,
        repo: repoState.repos.nameInPlat,
        path: contentModel.data.path,
        content: contentModel.data.body,
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

    const resp = await api.gitee.getFiles({ owner: repoState.repos.usernameInPlat, repo: repoState.repos.nameInPlat, path: contentModel.data.path })

    await api.gitee.putFile({
        owner: repoState.repos.usernameInPlat,
        repo: repoState.repos.nameInPlat,
        path: contentModel.data.path,
        content: contentModel.data.body,
        sha: resp.data.sha
    }).then(() => {
        message.success('保存了新内容')
    }).catch((error) => {
        console.log(error)
    })
}




//处理文件名的函数
function checkFilename() {
    if (tipTapState.filename.value.length <= 0) return
    tipTapState.changeName()
}




defineExpose({ openInfoModal, decodeContent })
</script>


<style scoped>
.bar {
    margin-top: 0.5rem;
    z-index: 1;
    position: -webkit-sticky;
    position: sticky;
    top: 0px;
    background-color: white;
    border-radius: 2.5px;
    box-shadow:
        0px 0px 0.3px rgba(0, 0, 0, 0.022),
        0px 0px 0.9px rgba(0, 0, 0, 0.031),
        0px 0px 1.8px rgba(0, 0, 0, 0.039),
        0px 0px 3.7px rgba(0, 0, 0, 0.048),
        0px 0px 10px rgba(0, 0, 0, 0.07);
    margin-bottom: 0.5rem;
    padding: 0.4rem 0 0.4rem 0;
    align-items: center;
}

.icon-style {
    width: 14px;
    height: 14px;
    background: no-repeat left/cover url('@/assets/btn-icon-script.svg');
}
</style>