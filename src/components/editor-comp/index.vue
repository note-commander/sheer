<template>
    <ToolBarComp ref="toolBarRef" @click:command="handleClickCommand" @click:info="handleClickInfo"
        @click:save="handleClickSave">
    </ToolBarComp>

    <div class="page">
        <div class="linner" @click.self="handleClickLinner">
            <NoteTitleComp @focus:editor="handleClickLinner"></NoteTitleComp>
            <div class="hr-style">
            </div>
            <Tiptap ref="tiptapRef" />
        </div>
    </div>
</template>


<script lang='ts' setup>
const tiptapRef = ref()




//处理点击save按钮
function handleClickSave() {
    toolBarRef.value.decodeContent(tiptapRef.value.getHtml())
}




//toolbar的ref
const toolBarRef = ref()
//toolbar点击info按钮的处理函数
function handleClickInfo() {
    toolBarRef.value.openInfoModal(tiptapRef.value.getText())
}





function handleClickLinner() {
    tiptapRef.value.setFocus()
}




function handleClickCommand(sign: string, ...args: any[]) {
    tiptapRef.value.handleCommand(sign, ...args)
}





</script>


<style scoped>
.page {
    background-color: white;
    padding: 0.3rem;
    margin-bottom: 0.5rem;
    border-radius: 2.5px;
    box-shadow:
        0px 0.2px 0.4px rgba(0, 0, 0, 0.02),
        0px 0.6px 0.9px rgba(0, 0, 0, 0.028),
        0px 1.1px 1.8px rgba(0, 0, 0, 0.035),
        0px 2px 3.1px rgba(0, 0, 0, 0.042),
        0px 3.8px 5.8px rgba(0, 0, 0, 0.05),
        0px 9px 14px rgba(0, 0, 0, 0.07);
}

.linner {
    padding: 2.4rem 6rem;
    min-height: 90vh;
    border-radius: 2.5px;
    border-width: 1px;
    border-color: #eee;
    border-style: solid;
    /* border: 1px solid transparent;
    background: linear-gradient(white, white) padding-box,
        repeating-linear-gradient(-45deg, #eee 0, #eee 5px, white 5px, white 10px); */
}

.hr-style {
    height: 1px;
    width: 100%;
    background-color: #eee;
    margin: 1rem 0 2rem 0;
}
</style>