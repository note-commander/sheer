<template>
    <n-space vertical class="anchor-group">
        <n-button v-for="(item, index) in anchores" size="small" :quaternary="index !== anchorActive"
            :strong="index === anchorActive" :secondary="index === anchorActive"
            :class="`anchor-item ${item.tag}-style`" acti @click="scrollToAnchor(item.el, index)">
            {{ item.label }}
        </n-button>
    </n-space>
</template>


<script lang='ts' setup>
import { tipTapState } from '@/stores'



//用于修正锚点滚动的偏差
function scrollToAnchor(target: Element, index: number) {
    const bound = target.getBoundingClientRect()
    const bar = document.querySelector('div.bar') as HTMLElement
    window.scrollTo({
        top: bound.top + window.scrollY - (bar?.clientHeight || 60) - 10,
        behavior: 'smooth'
    })
    //修改按钮选中状态的标记
    anchorActive.value = index
}




//存储锚点的数组
interface anchorElType {
    label: string,
    tag: string,
    el: Element
}
const anchores = ref<anchorElType[]>([])
//作为锚点的h标签
const hs = ['H1', 'H2', 'H3', 'H4']
//处理tiptap里的h标签
function handleH() {
    //获取当前tiptap的dom
    const dom = document.querySelector('div.ProseMirror') as HTMLElement
    if (!dom) return
    const children = dom.children
    const childSize = children.length
    //收集当前tiptap内的h标签
    const arr = []
    for (let i = 0; i < childSize; i++)
        if (hs.includes(children[i].tagName)) arr.push(children[i])
    //遍历收集好的h标签
    for (let i = 0; i < arr.length; i++)
        //h标签的顺序跟anchor列表里的不一样就在不一样的位置插入新锚点
        if (!anchores.value[i]?.el || !arr[i].isSameNode(anchores.value[i]?.el))
            anchores.value.splice(i, 0, { label: arr[i].innerHTML, tag: arr[i].tagName, el: arr[i] })
}
//监听tiptap的enter事件，触发了就处理器中的h标签
watch(tipTapState.flag, (newValue) => handleH(), { immediate: true })




//更新anchor的名称
function syncUpdateName() {
    for (let i = 0; i < anchores.value.length; i++) {
        if (!anchores.value[i].el) anchores.value.splice(i, 1)
        anchores.value[i].tag = anchores.value[i].el.tagName
        anchores.value[i].label = anchores.value[i].el.innerHTML
    }
}
//当前锚点列表里已存在的锚点
const currentAnchorEls = computed(() => {
    const arr = []
    for (let i = 0; i < anchores.value.length; i++)arr.push(anchores.value[i].el)
    return arr
})
//同步tiptap删除anchor
function syncRemoveAnchor() {
    //获取当前tiptap的dom
    const dom = document.querySelector('div.ProseMirror') as HTMLElement
    if (!dom) return
    const children = dom.children
    const childSize = children.length
    //收集当前tiptap内的h标签
    const arr = []
    for (let i = 0; i < childSize; i++)
        if (hs.includes(children[i].tagName) && currentAnchorEls.value.includes(children[i]))
            arr.push(children[i])
    //把tiptap里没有的dom从锚点列表里删除
    for (let i = 0; i < anchores.value.length; i++)
        if (!arr.includes(anchores.value[i].el)) anchores.value.splice(i, 1)

}
//定时任务，使锚点列表的状态与真实dom同步
let interval: NodeJS.Timer | Promise<null> | null = null
function syncDomToAnchores() {
    //单例验证
    if (interval) return
    //初始化定时任务
    interval = setInterval(() => {
        //更新锚点名称
        syncUpdateName()
        //同步删除锚点
        syncRemoveAnchor()
    }, 500)
}




//锚点按钮活跃状态的开关
const anchorActive = ref()
//更改锚点按钮状态的函数
function changeAnchorActive() {
    const bar = document.querySelector('div.bar') as HTMLElement

    for (let i = 0; i < anchores.value.length; i++) {
        const bound = anchores.value[i].el.getBoundingClientRect()
        const y = bound.top + window.scrollY - (bar?.clientHeight || 60) - 30

        if (window.scrollY >= Math.round(y)) anchorActive.value = i
    }
}





//组件注册时执行
onMounted(() => {
    //开启定时任务
    syncDomToAnchores()
    //监听浏览器的scroll事件，用于更改锚点按钮状态
    window.addEventListener('scroll', changeAnchorActive)
})
//组件销毁使停止定时任务
onBeforeUnmount(() => {
    clearInterval(interval as NodeJS.Timer)
    interval = null
})
</script>


<style>
.anchor-group {
    position: sticky;
    top: 0.5rem;
    margin-right: 0.5rem;
}

.anchor-item {
    width: 100%;
    display: block;
    white-space: normal;
    word-wrap: break-word;
    word-break: break-all;
    text-align: justify;
    height: 100%;
    padding: 0.5rem 0;
}

.H1-style {
    padding-left: 0rem;
}

.H2-style {
    padding-left: 0.5rem;
}

.H3-style {
    padding-left: 1rem;
}

.H4-style {
    padding-left: 1.5rem;
}

.H2-style .n-button__content,
.H3-style .n-button__content,
.H4-style .n-button__content {
    border-left: 2px #adb5bd solid;
    height: 100%;
    padding-left: 0.2rem;
}
</style>