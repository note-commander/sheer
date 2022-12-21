<template>
    <editor-content :editor="editor" @keydown="handleKeydown($event)" />
</template>


<script lang='ts' setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { lowlight } from 'lowlight'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import { Level } from '@tiptap/extension-heading'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import showdown from 'showdown'
import { Base64 } from 'js-base64'
import { tipTapState } from '@/stores'




//tiptap对象
const editor = useEditor({
    // content: '<p>I’m running Tiptap with Vue.js. 🎉</p>',
    extensions: [
        StarterKit.configure({ codeBlock: false }),
        CodeBlockLowlight.configure({ lowlight, }),
        Placeholder.configure({ placeholder: '写点什么...' }),
        Image.configure({ inline: true, allowBase64: true }),
        Highlight.configure({ multicolor: true }),
        Table.configure({ resizable: true, }),
        TableRow,
        TableHeader,
        TableCell,
        Underline,
        Superscript,
        Subscript,
        Link,
    ],
    editorProps: {
        attributes: { style: 'outline:none' },
    },
    autofocus: true,
})




onBeforeUnmount(() => {
    editor.value?.destroy()
})




//新建showdown解析器
const converter = new showdown.Converter()
//设置解析器属性，开启table的解析支持
converter.setOption('tables', true)
//监听currentFile，更新编辑器里的内容
watch(tipTapState.file, (newValue) => {
    //有内容就插入editor
    if (newValue.data?.body) {

        const html = converter.makeHtml(Base64.decode(newValue.data?.body))
        editor.value?.chain().setContent(html).run()
        //改变状态，用于更新anchor列表
        tipTapState.changeFlag()
    } else {
        editor.value?.chain().clearContent().run()
    }
}, { deep: true })




//处理editor的键盘事件
function handleKeydown(e: KeyboardEvent) {
    switch (e.code) {
        case 'Tab'://插入制表符
            e.preventDefault()
            editor.value?.chain().focus().insertContent('\t').run()
            break
        case 'Enter'://把编辑器里的html同步给全局状态，用于anchor
            tipTapState.changeFlag()
            break
    }
}




//让编辑器获取焦点
function setFocus() {
    editor.value?.commands.focus()
}
//处理编辑器指令
function handleCommand(command: string | Level, ...args: any[]) {
    switch (command) {
        //标题
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
            editor.value?.chain().focus().toggleHeading({ level: command }).run()
            break
        //加粗
        case 'bold':
            editor.value?.chain().focus().toggleBold().run()
            break
        //斜体
        case 'italics':
            editor.value?.chain().focus().toggleItalic().run()
            break
        case 'underline':
            editor.value?.chain().focus().toggleUnderline().run()
            break
        case 'strikethrough':
            editor.value?.chain().focus().toggleStrike().run()
            break
        case 'bookmark':
            editor.value?.chain().focus().toggleMark('bold').toggleHighlight().run()
            break
        case 'superscript':
            editor.value?.chain().focus().toggleSuperscript().run()
            break
        case 'subscript':
            editor.value?.chain().focus().toggleSubscript().run()
            break
        case 'quote':
            editor.value?.chain().focus().toggleBlockquote().run()
            break
        case 'listOl':
            editor.value?.chain().focus().toggleOrderedList().run()
            break
        case 'listUl':
            editor.value?.chain().focus().toggleBulletList().run()
            break
        case 'link':
            editor.value?.chain().focus().setLink({ href: args[0] }).run()
            break
        case 'image':
            for (let i = 0; i < args.length; i++) {
                if (!(i % 2)) editor.value?.chain().focus().setImage({ src: args[i], alt: args[i + 1] }).run()
            }
            break
        case 'code':
            editor.value?.chain().focus().toggleCodeBlock().run()
            break
        case 'table':
            editor.value?.chain().focus().insertTable({ rows: parseInt(args[0]), cols: parseInt(args[1]), withHeaderRow: true }).run()
            break
        case 'rotateLeft':
            editor.value?.chain().focus().undo().run()
            break
        case 'rotateRight':
            editor.value?.chain().focus().redo().run()
            break
    }
}




//获取编辑器里的文本
function getText() {
    return editor.value?.getText()
}
//获取编辑器里html
function getHtml() {
    return editor.value?.getHTML()
}
defineExpose({ setFocus, handleCommand, getText, getHtml })
</script>


<style>
.ProseMirror {
    /* font-size: 1.15em;
    letter-spacing: 0.12em;
    word-spacing: 0.2em; */
    text-align: justify;
    color: #1f2225
}

.ProseMirror pre {
    margin-top: 0.75em;
    background: #eee;
    /* color: #eee; */
    font-family: 'JetBrainsMono', monospace;
    font-size: 85%;
    padding: 0.75rem 1rem;
    border-radius: 2px;
}

.ProseMirror pre code {
    color: inherit;
    padding: 0;
    background: none;
    font-size: 0.8rem;
}

.ProseMirror img {
    /* clear使元素在不依赖父元素的情况下实现水平方向居中 */
    clear: both;
    margin: auto;
    display: block;
    margin-top: 0.75em;
    max-width: 100%;
    height: auto;
    box-shadow:
        0px 0px 0.5px rgba(0, 0, 0, 0.02),
        0px 0px 1.1px rgba(0, 0, 0, 0.028),
        0px 0px 2.1px rgba(0, 0, 0, 0.035),
        0px 0px 3.8px rgba(0, 0, 0, 0.042),
        0px 0px 7.1px rgba(0, 0, 0, 0.05),
        0px 0px 17px rgba(0, 0, 0, 0.07);
}

.ProseMirror code {
    font-size: 0.9rem;
    padding: 0.1em 0.25em;
    border-radius: 2.5px;
    background-color: #eee;
    font-family: 'JetBrainsMono', monospace;
    font-size: 85%;
    /* color: #eee; */
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
    display: inline-block;
    justify-content: center;
}

.ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #adb5bd;
    pointer-events: none;
    height: 0;
}

.ProseMirror blockquote {
    padding-left: 0.25em;
    color: #6a737d;
    border-left: 5px solid #eee;
}

.ProseMirror a {
    color: #2080f0;
}

.ProseMirror table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    margin: 0;
    overflow: hidden;
}

.ProseMirror table td,
.ProseMirror table th {
    min-width: 1em;
    border: 2px solid #ced4da;
    padding: 3px 5px;
    vertical-align: top;
    box-sizing: border-box;
    position: relative;
}

.ProseMirror table td>*,
.ProseMirror table th>* {
    margin-bottom: 0;
}

.ProseMirror table th {
    font-weight: bold;
    text-align: left;
    background-color: #f1f3f5;
}

.ProseMirror table .selectedCell:after {
    z-index: 2;
    position: absolute;
    content: "";
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(200, 200, 255, 0.4);
    pointer-events: none;
}

.ProseMirror table .column-resize-handle {
    position: absolute;
    right: -2px;
    top: 0;
    bottom: -2px;
    width: 4px;
    background-color: #adf;
    pointer-events: none;
}

.ProseMirror table p {
    margin: 0;
}


.hljs-comment,
.hljs-quote {
    color: #616161;
}

.hljs-variable,
.hljs-template-variable,
.hljs-attribute,
.hljs-tag,
.hljs-name,
.hljs-regexp,
.hljs-link,
.hljs-name,
.hljs-selector-id,
.hljs-selector-class {
    color: #F98181;
}

.hljs-number,
.hljs-meta,
.hljs-built_in,
.hljs-builtin-name,
.hljs-literal,
.hljs-type,
.hljs-params {
    color: #ca6019;
}

.hljs-string,
.hljs-symbol,
.hljs-bullet {
    color: #5c8557;
}

.hljs-title,
.hljs-section {
    color: #ff9900;
}

.hljs-keyword,
.hljs-selector-tag {
    color: #70CFF8;
}

.hljs-emphasis {
    font-style: italic;
}

.hljs-strong {
    font-weight: 700;
}
</style>