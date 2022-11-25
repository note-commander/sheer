<template>
    <!-- naiveUI 主题颜色的全局配置 -->
    <nConfig-provider :theme-overrides="themeOverrides">
        <!-- naiveUI dialog的全局配置 -->
        <n-dialog-provider>
            <!-- naiveUI toast message的全局配置 -->
            <n-message-provider :placement="'top-right'">
                <!-- naiveUI toast notification的全局配置 -->
                <n-notification-provider :placement="'top-right'">
                    <!-- naiveUI 加载条的全局配置 -->
                    <n-loading-bar-provider :loading-bar-style="{ loading: 'background-color:#145EB4FF' }">
                        <Test></Test>
                        <WriterView></WriterView>
                    </n-loading-bar-provider>
                </n-notification-provider>
            </n-message-provider>
        </n-dialog-provider>
    </nConfig-provider>
</template>



<script lang='ts' setup>
import WriterView from './views/WriterView.vue'
import Test from '../test/Test.vue'


const themeOverrides = {
    Input: {
        caretColor: '#2080f0',
        loadingColor: '#2080f0',
        borderFocus: '1px solid #2080f0',
        borderHover: '1px solid #2080f0',
        boxShadowFocus: '0 0 0 2px rgba(24, 138, 160, 0.2)',
    },
    Card: {
        colorTarget: '#2080f0'
    },
    Button: {
        borderFocus: '1px solid #145EB4FF',
        borderHover: '1px solid #2080f0',
        borderPressed: '1px solid #2080f0',
        rippleColor: '#2080f0',
        textColorHover: '#145EB4FF',
        textColorPressed: '#145EB4FF',
        textColorFocus: '#2080f0',
        textColorTextHover: '#2080f0',
        textColorTextPressed: '#145EB4FF',
        textColorTextFocus: '#2080f0',
        textColorGhostHover: '#2080f0',
        textColorGhostPressed: '#145EB4FF',
        textColorGhostFocus: '#2080f0',
    },
    Menu: {
        itemColorActive: 'rgba(24, 138, 160, 0.1)',
        itemColorActiveHover: 'rgba(24, 138, 160, 0.1)',
        itemColorActiveCollapsed: 'rgba(24, 138, 160, 0.1)',
        arrowColorActive: '#2080f0',
        arrowColorActiveHover: '#2080f0',
        arrowColorChildActive: '#2080f0',
        arrowColorChildActiveHover: '#2080f0',
        itemIconColorHoverHorizontal: '#145EB4FF',
        itemIconColorActiveHorizontal: '#2080f0',
        itemIconColorActiveHoverHorizontal: '#2080f0',
        itemIconColorChildActiveHorizontal: '#2080f0',
        itemIconColorChildActiveHoverHorizontal: '#2080f0',
        itemTextColorHoverHorizontal: '#2080f0',
        itemTextColorActiveHorizontal: '#2080f0',
        itemTextColorChildActiveHorizontal: '#2080f0',
        itemTextColorChildActiveHoverHorizontal: '#2080f0',
        itemTextColorActiveHoverHorizontal: '#2080f0',
        itemIconColorActive: '#2080f0',
        itemIconColorActiveHover: '#2080f0',
        itemIconColorChildActive: '#2080f0',
        itemIconColorChildActiveHover: '#2080f0',
        itemTextColorActive: '#2080f0',
        itemTextColorChildActive: '#2080f0',
        itemTextColorChildActiveHover: '#2080f0',
        itemTextColorActiveHover: '#2080f0',
    },
    Radio: {
        boxShadowActive: 'inset 0 0 0 1px #2080f0',
        boxShadowFocus: 'inset 0 0 0 1px #2080f0, 0 0 0 2px rgba(24, 138, 160, 0.1)',
        boxShadowHover: 'inset 0 0 0 1px #2080f0',
        dotColorActive: '#2080f0',
        buttonBorderColorActive: '#2080f0',
        buttonTextColorActive: '#2080f0',
        buttonTextColorHover: '#2080f0',
        buttonBoxShadowFocus: 'inset 0 0 0 1px #2080f0, 0 0 0 2px rgba(24, 138, 160, 0.1)'

    },
    Anchor: {
        railColorActive: '#2080f0',
        linkColor: 'rgba(24, 138, 160, 0.1)',
        linkTextColorHover: '#145EB4FF',
        linkTextColorPressed: '#145EB4FF',
        linkTextColorActive: '#2080f0',
    },
    Upload: {
        draggerBorderHover: '1px dashed #2080f0',
    }
}

</script>


<style>
html {
    height: 100%;
}

body {
    background-color: #eee !important;
    min-width: 300px;
    height: 100%;
}
</style>