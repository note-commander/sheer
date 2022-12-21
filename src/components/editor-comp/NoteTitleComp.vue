<template>

    <textarea v-model="tipTapState.filename.value" ref="titleInputRef" placeholder="这是笔记文件的名称..." class="title-box"
        @keydown="handlekeyDown($event)" />

</template>


<script lang='ts' setup>
import { tipTapState } from '@/stores'




const emits = defineEmits(['focus:editor'])
const titleInputRef = ref<HTMLElement>()




//处理textarea弹性高度,
watch(
    tipTapState.filename,
    (newValue) => {
        //@ts-ignore
        titleInputRef.value.style.height = '42px'
        //@ts-ignore
        titleInputRef.value.style.height = `${titleInputRef.value?.scrollHeight}px`
    },
)




//处理标题输入框按键事件
function handlekeyDown(e: KeyboardEvent) {
    if (e.code === 'Enter' || e.code === 'ArrowDown') {

        e.preventDefault()

        emits('focus:editor')
    }
}
</script>


<style scoped>
.title-box {
    outline: none;
    border: none;
    resize: none;
    color: #616161;
    width: 100%;
    height: 42px;
    font-size: 28px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    text-align: justify;
}

.title-box::-webkit-input-placeholder {
    color: #adb5bd;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.title-box::-moz-placeholder {
    color: #adb5bd;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.title-box::placeholder {
    color: #adb5bd;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.title-box::placeholder {
    color: #adb5bd;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>