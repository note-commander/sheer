<template>
    <n-breadcrumb>
        <n-scrollbar ref="scrollbarRef" style="width: 100%; padding-bottom: 0.8rem;" trigger="none"
            :x-scrollable="true">
            <div ref="breadcrumbRef" class="scrollbarContentStyle">
                <n-breadcrumb-item v-for="(item, index) in crumbList" @click="handleClickCrumb(item, index)">
                    <n-h4 v-if="index === 0" type="info" style="margin-bottom: 0;" :align-text="true">
                        <n-text type="info">
                            root
                        </n-text>
                    </n-h4>
                    <span v-if="index !== 0" style="margin-bottom: 0;">
                        {{ item.data.name }}
                    </span>
                </n-breadcrumb-item>
            </div>
        </n-scrollbar>
    </n-breadcrumb>

</template>


<script lang='ts' setup>
import { mapState } from '@/stores'




type objType = { [prop in string]: any }




//breadcrumb的数据模型
const props = defineProps(['dataModel'])
const crumbList = ref<objType[]>([{ ...props.dataModel }])




//scrollbar滚动到内容尾部
const scrollbarRef = ref()
const breadcrumbRef = ref()
function scrollToEnd() {
    const width = breadcrumbRef.value.offsetWidth
    scrollbarRef.value.scrollTo({ left: width, behavior: 'smooth' })
}




//push新节点到crumbList
function pushCrumb(crumb: objType) {
    //判断crumbList里是否已存在指定path的节点
    let hasPath = false

    for (const [index, item] of crumbList.value.entries()) {
        if (hasPath === false && crumb.data.id === item.data.id) {
            hasPath = true
            Object.assign(crumbList.value[index], crumb)
        }
    }
    //crumbList里节点的path都不重复就把新节点push进数组
    if (!hasPath) {
        nextTick(() => crumbList.value.push(crumb)).then(() => {
            scrollToEnd()
        })
    }
}




//breadcrumb的点击事件
const emits = defineEmits(['click:crumb'])
//breadcrumb-item的点击处理函数
function handleClickCrumb(crumb: objType, index: number) {
    emits('click:crumb', crumb)
    crumbList.value.splice(index + 1)
}




//初始化breadcrumb，用于切换仓库后构建root节点
function makeRootCrumb(rootCrumb: objType) {
    Object.assign(crumbList.value[0], rootCrumb)
    crumbList.value.splice(1)
}




defineExpose({ pushCrumb, handleClickCrumb, makeRootCrumb })
</script>


<style scoped>
.scrollbarContentStyle {
    background-color: white;
    border: 1px solid rgb(224, 224, 230);
    border-radius: 3px;
    display: flex;
    align-items: center;
    height: 2rem;
    line-height: 2rem;
}
</style>