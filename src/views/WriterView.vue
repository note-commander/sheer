<template>
    <n-layout has-sider style="height:100vh; ">
        <n-layout-sider content-style="padding: 0.5rem 1rem; background-color: #eee" show-trigger="bar"
            collapse-mode="transform" :width="450" :collapsed-width="0" :show-collapsed-content="false"
            :native-scrollbar="false">
            <FileTocComp @get-content="handleGetContent"></FileTocComp>
        </n-layout-sider>
        <n-layout-content content-style="padding: 0.5rem 1rem; background-color: #eee">
            <EditorComp ref="editorCompRef"></EditorComp>
        </n-layout-content>
    </n-layout>
</template>


<script lang='ts' setup>
const editorCompRef = ref()
function handleGetContent(contentObj: any) {
    editorCompRef.value.decodeContent(contentObj)
}
</script>


<style>
.n-layout-sider {
    flex-shrink: 0;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
    color: var(--n-text-color);
    transition: color .3s var(--n-bezier), border-color .3s var(--n-bezier), min-width .3s var(--n-bezier), max-width .3s var(--n-bezier), transform .3s var(--n-bezier), background-color .3s var(--n-bezier);
    background-color: #eee;
    display: flex;
    justify-content: flex-end;
}
</style>