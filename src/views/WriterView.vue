<template>
    <n-grid x-gap="12 m:26 l:40" item-responsive responsive="screen">
        <n-grid-item span="6 m:5">
            <FileTocComp></FileTocComp>
        </n-grid-item>

        <n-grid-item span="18 m:14">
            <editor-comp></editor-comp>
        </n-grid-item>

        <n-grid-item span="0 m:5">
            <AnchorListComp></AnchorListComp>
        </n-grid-item>
    </n-grid>
</template>


<script lang='ts' setup>

</script>


<style>
/* .n-layout-sider {
    flex-shrink: 0;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
    color: var(--n-text-color);
    transition: color .3s var(--n-bezier), border-color .3s var(--n-bezier), min-width .3s var(--n-bezier), max-width .3s var(--n-bezier), transform .3s var(--n-bezier), background-color .3s var(--n-bezier);
    background-color: #eee;
    display: flex;
    justify-content: flex-end;
} */
</style>