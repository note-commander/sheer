<template>
    <NInput clearable style="position:sticky; top:0.5rem; z-index: 1;" type="text" v-model:value="searchInputText"
        :placeholder="fileCount + ' 条记录'"></NInput>
    <slot name="breadcrumb"></slot>

    <n-empty v-show="isEmpty" size="huge" style="height:60vh; justify-content: center;">
        <template #default>
            <n-h2 align-text>
                没有文件
            </n-h2>
        </template>
        <template #icon>
            <svg t="1664467829956" class="icon" viewBox="0 0 1351 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                p-id="9264" width="54" height="54">
                <path
                    d="M467.19776 479.648s2.688 2.688 8.096 2.688h393.44c2.688 0 5.376-2.688 8.096-2.688V358.4h409.6c-2.688-8.096-2.688-13.472-8.096-21.568l-264.096-277.568H335.16576l-264.096 277.568c-5.376 2.688-8.096 10.784-8.096 21.568h409.6v121.248h-5.376z m-409.6-61.952v476.96c0 37.728 40.416 70.048 88.928 70.048h1053.632c48.512 0 88.928-32.352 88.928-70.048V412.288H936.06176v64.672c0 32.352-29.632 59.296-61.984 59.296H480.63776c-35.04 0-61.984-26.944-61.984-59.296v-64.672H62.94176v5.376zM1200.18976 1024H146.55776C65.72576 1024 1.05376 964.704 1.05376 894.656V417.696c-2.688-48.512-2.688-94.304 29.632-123.968L313.62976 0H1038.52576l282.944 293.728c32.352 29.632 29.632 83.552 29.632 142.816v455.424C1345.72576 964.736 1278.33376 1024 1200.18976 1024z"
                    p-id="9265" fill="#cdcdcd"></path>
            </svg>
        </template>
    </n-empty>

    <div v-show="!isEmpty">
        <n-list bordered style="margin:0">
            <n-list-item v-for="(item, index) in mapState.current.value" :tabindex="index" class="listItemStyle"
                @click="getChildObj(item[1], $event)">
                <template #prefix>
                    <n-icon style="display:flex;align-content:center;" v-if="item[1].data.type === 'file'" size="1.2rem"
                        color="#777d83" :component="DocumentText24Filled">
                    </n-icon>
                    <n-icon style="display:flex;align-content:center;" v-if="item[1].data.type === 'dir'" size="1.2rem"
                        color="#ffd45c" :component="Folder28Filled">
                    </n-icon>
                </template>

                <n-ellipsis style="width:100%;">
                    {{ item[1].data.name }}
                </n-ellipsis>

                <template #suffix>
                    <n-dropdown placement="bottom" trigger="hover" :options="options" :show-arrow="true"
                        @select="handleSelect($event, item)">
                        <n-icon style="display: flex;align-content:center;" size="1rem" color="#ccc"
                            :component="MoreVertical28Filled">
                        </n-icon>
                    </n-dropdown>
                </template>
            </n-list-item>
        </n-list>
        <n-space justify="center">
            <n-text depth="3">
                见底了
            </n-text>
        </n-space>
    </div>

</template>


<script lang='ts' setup>
import { DocumentText24Filled, Folder28Filled, MoreVertical28Filled } from '@vicons/fluent';
import { Base64 } from 'js-base64';
import { api } from '@/api';
import { platNames, MAPFILEPATH, OBJMODELINMAP } from '@/utils/enum';
import { repoState, mapState, dirType, fileType } from '@/stores';
import { useLoadingBar } from 'naive-ui'
import { saveAs } from 'file-saver';
import { join } from 'path-browserify'
type mapValueType = dirType | fileType
type objType = { [prop: string]: any }




const props = defineProps(['dataModel'])
const emits = defineEmits(['click:dirObj', 'click:fileObj', 'click:rename', 'update:fileList', 'click:rootObj', 'download:dir'])
const message = useMessage()
const loadingBar = useLoadingBar()




//缺省图的哨兵，默认false不显示缺省图
const isEmpty = computed(() => {
    if (mapState.current.value.size === 0) {
        return true
    } else {
        return false
    }
})
//表示raw的map是否更新过的哨兵，默认true用于第一次加载预热
const theMapHasBeenUpdated = ref(true)
//搜索框数据模型
const searchInputText = ref<string>()
//搜索框中的文件数量
const fileCount = computed(() => mapState.current.value.size)




//创建仓库.map文件
function createMap(plat: string) {
    switch (plat) {
        case platNames.github.value:
            return api.github.createMap({
                owner: repoState.repos.usernameInPlat,
                repo: repoState.repos.nameInPlat,
                committerName: repoState.repos.usernameInPlat,
                committerEmail: repoState.repos.emailInPlat
            })

        case platNames.gitee.value:
            return api.gitee.createMap({
                owner: repoState.repos.usernameInPlat,
                repo: repoState.repos.nameInPlat
            })
    }
}
//仓库找不到.map文件时的异常处理
async function handleErrorNotFoundMap(callbackFun: any) {
    //先给没有map文件的仓库创建一个map文件
    await createMap(repoState.repos.plat)
    if (callbackFun[Symbol.toStringTag] === 'AsyncFunction') {
        //异步函数就直接await执行
        await callbackFun()
    } else if (typeof callbackFun === 'function') {
        //普通函数就封装成Promise再await执行
        await new Promise((resolve) => {
            resolve(callbackFun())
        })
    }

}




//处理切换仓库的交互
function handleChangeRepos() {
    emits('update:fileList', 'begin')

    mapState.current.value.clear()
    mapState.backup.value.clear()
    mapState.map.value.clear()

    getFileContentFromSwitch(MAPFILEPATH).then((value) => {
        const data = value as objType
        const content = Base64.decode(data.data.content)

        //索引文件为空直接return
        if (content.trim().length === 0) return

        //轮询索引map
        for (const item of JSON.parse(content)) {

            mapState.map.value.set(item[0], item[1])

            if (item[1].parent === OBJMODELINMAP.dir.data.id) {
                //切换仓库时当前dirObj还没有child，所以需要使用parent上卷查找
                mapState.current.value.set(item[0], item[1])
                mapState.backup.value.set(item[0], item[1])
            }
        }

        //填装完map对象后把第1个元素发送给breadcrumb作为root节点
        emits('click:rootObj', mapState.map.value.get('1'))
    }).catch((error) => {
        //没有map文件就执行对应处理函数
        handleErrorNotFoundMap(handleChangeRepos)
    }).finally(() => {
        //标记表示已同步过map文件，此时本地map对象是最新的
        theMapHasBeenUpdated.value = false

        emits('update:fileList', 'end')
    })
}




//根据plat选择执行对应的获取文件列表处理函数
function getFileList(dir: objType) {

    mapState.current.value.clear()
    mapState.backup.value.clear()

    if (theMapHasBeenUpdated.value) {
        //theMapHasBeenUpdated为真表示本地map对象不是最新的，所以需要获取远程
        updateMapObj(dir)
    } else if (dir.child.length > 0) {

        for (const childId of dir.child) {
            const currentObj = mapState.map.value.get(childId) as mapValueType
            //没有childId对应的元素就执行下次循环，用于容错
            if (!currentObj) continue
            mapState.current.value.set(currentObj.data.id, currentObj)
            mapState.backup.value.set(currentObj.data.id, currentObj)
        }
    }
}
//获取最新的map文件并更新本地map对象
function updateMapObj(dirObj: objType) {
    emits('update:fileList', 'begin')

    getFileContentFromSwitch(MAPFILEPATH).then((value) => {
        const data = value as objType
        const content = Base64.decode(data.data.content)

        //索引文件为空直接return
        if (content.trim().length === 0) return

        mapState.map.value.clear()

        //轮询索引map
        for (const item of JSON.parse(content)) {

            mapState.map.value.set(item[0], item[1])

            if (dirObj.child.indexOf(item[0]) !== -1) {
                //有child就下钻查找
                mapState.current.value.set(item[0], item[1])
                mapState.backup.value.set(item[0], item[1])
            }
        }
    }).catch((error) => {
        //没有map文件就执行对应处理函数
        handleErrorNotFoundMap(updateMapObj)
    }).finally(() => {
        //标记表示已同步过map文件，此时本地map对象是最新的
        theMapHasBeenUpdated.value = false

        emits('update:fileList', 'end')
    })
}




//假搜索，current map里文件名称包含关键词的fileObj
watch(
    searchInputText,
    (newValue) => {
        const reg = new RegExp(newValue as string, "i");
        mapState.current.value.clear()
        for (const item of mapState.backup.value) {
            if (reg.test(item[1].data.name)) mapState.current.value.set(item[0], item[1])
        }
    }
)




//下钻objMap，用于获取次级文件列表
function getChildObj(obj: mapValueType, event?: any) {
    if (obj.data.type === 'dir') {
        emits('click:dirObj', obj)
        getFileList(obj)

        //清除当前事件源的焦点
        if (event) event.currentTarget.blur()

    } else if (obj.data.type === 'file') {
        getFileContent(obj.data.path)
    }
}




//异步获取文件内容
function getFileContentFromSwitch(path: string) {
    switch (repoState.repos.plat) {

        case platNames.github.value:
            return api.github.getFiles(repoState.repos.usernameInPlat, repoState.repos.nameInPlat, path)

        case platNames.gitee.value:
            return api.gitee.getFiles({ owner: repoState.repos.usernameInPlat, repo: repoState.repos.nameInPlat, path: path })

        default:
            return new Promise((resolve) => { resolve(null) })
    }
}
//获取文件内容
async function getFileContent(path: string) {

    await new Promise((resolve) => {
        resolve(loadingBar.start())
    })

    //获取文件内容
    const resp = await getFileContentFromSwitch(path).catch(() => loadingBar.error()) as objType
    if (!resp) return

    await new Promise((resolve) => {
        //把文件内容发射给index
        emits('click:fileObj', {
            body: resp.data.content,
            path: path,
            sha: resp.data.sha
        })

        resolve(loadingBar.finish())
    })
}




//popover列表的数据模型
const options = [{ label: '下载', key: 'download' }, { label: '改名', key: 'rename' }, { label: '删除', key: 'remove' }]
//popover列表项点击事件处理函数
function handleSelect(key: string | number, obj: any) {
    switch (key) {
        case 'download':
            downloadObj(obj[1])
            break
        case 'rename':
            emits('click:rename', obj[1])
            break
        case 'remove':

            emits('update:fileList', 'begin')

            removeObj(obj).then(() => {
                message.success('成功删除')
            }).finally(() => {
                emits('update:fileList', 'end')
            })

            break
    }
}




//popover：根据plat选择执行下载的函数，用在popover列表中的‘下载’功能
function downloadObj(obj: mapValueType) {

    if (obj.data.type === 'dir') {
        //type为dir就下载文件夹中所有文件
        emits('download:dir', obj)

    } else if (obj.data.type === 'file') {
        //type为file就下载该文件
        downloadFile(obj)

    }
}
//下载文件
async function downloadFile(obj: mapValueType) {
    //获取文件内容
    const resp = await getFileContentFromSwitch(obj.data.path) as objType

    //写文件内容并下载文件
    await new Promise((resolve) => {
        const tempContent = resp.data.content || '';
        const aBlob = new Blob([Base64.decode(tempContent)]);

        saveAs(aBlob, `${obj.data.name}.md`)
        resolve(null)
    })
}




//popover：给obj改名
function renameObj(obj: mapValueType) {
    mapState.current.value.set(obj.data.id, obj)
    mapState.backup.value.set(obj.data.id, obj)
    mapState.map.value.set(obj.data.id, obj)

    updateMapFile()
}




//popover：根据plat选择执行删除的函数，用在popover列表中的‘删除’功能
async function removeObj(obj: any, dontUpdateMap?: boolean) {

    //type是file就删除单个，是dir就递归删除
    if (obj[1].data.type === 'file') {
        console.log(1)
        await removeFileObj(obj[1].data.path).catch((reason) => {
            if (reason.response.status === 409) removeFileObj(obj[1].data.path)
        })

        await removeObjRromMap(obj[1])

    } else if (obj[1].data.type === 'dir') {
        console.log(1)
        await removeDirObj(obj[1])

    }

    //更新map文件
    return await new Promise((resolve) => {
        console.log(3)
        //控制是否提交新map文件，避免频繁请求平台仓库造成sha混乱
        if (!dontUpdateMap) updateMapFile()

        resolve(null)
    })

}
//缓存dir删除的obj
const objTrash = ref<objType[]>([])
//下钻dir并将其和其下所有obj放进objTrash
function pushAndDrillObjToTrash(obj: objType): any {

    objTrash.value.push(obj)

    if (obj.data.type === 'file') return

    if (obj.child.length > 0) {

        for (const childId of obj.child) {
            const currentObj = mapState.map.value.get(childId) as mapValueType
            pushAndDrillObjToTrash(currentObj)
        }
    }
}
//删除objTrash里obj
async function removeDirAndFileInObjTrash() {

    while (objTrash.value.length > 0) {

        const obj = objTrash.value.pop() as mapValueType

        if (obj.data.type === 'file') {
            await removeObj([obj.data.id, obj], true)
        } else {
            await removeObjRromMap(obj)
        }
    }
}
//删除dirObj
async function removeDirObj(obj: mapValueType) {

    await new Promise((resolve) => {
        resolve(pushAndDrillObjToTrash(obj))
    })

    await removeDirAndFileInObjTrash()

}
//从map和parent的child里删除obj
const removeObjRromMap = (obj: objType) => new Promise((resolve) => {
    //将obj的id从父元素的child数组里切除
    if (obj.parent !== 1) {

        const parent = mapState.map.value.get(obj.parent) as objType

        if (parent && parent.child.length > 0) {

            const index = parent.child.indexOf(obj.data.id)
            parent.child.splice(index, 1)

            console.log('1.5: ', obj.parent, toRaw(parent.child), obj.data.id)

        }

    }

    //删除缓存map数据
    mapState.current.value.delete(obj.data.id)
    mapState.backup.value.delete(obj.data.id)
    mapState.map.value.delete(obj.data.id)

    resolve(console.log('2: ', obj.data.id))
})
//删除单个文件
async function removeFileObj(path: string) {
    //获取sha
    const resp = await getFileContentFromSwitch(path) as objType

    return await new Promise((resolve, reject) => {
        switch (repoState.repos.plat) {

            case platNames.github.value:
                api.github.deleteFile({
                    owner: repoState.repos.usernameInPlat,
                    repo: repoState.repos.nameInPlat,
                    path: path,
                    sha: resp.data.sha,
                    committerName: repoState.repos.nameInPlat,
                    committerEmail: repoState.repos.emailInPlat
                }).then((resp) => { resolve(resp) }).catch((error) => { reject(error) })
                break

            case platNames.gitee.value:
                api.gitee.deleteFile({
                    owner: repoState.repos.usernameInPlat,
                    repo: repoState.repos.nameInPlat,
                    path: path,
                    sha: resp.data.sha
                }).then((resp) => { resolve(resp) }).catch((error) => { reject(error) })
                break

        }
    })
}




//更新map文件
function updateMapFile() {
    setTimeout(async () => {
        const resp = await getFileContentFromSwitch(MAPFILEPATH) as objType

        try {
            await updateMapRespAsync(resp)
            //标记表示更新过map文件，此时本地map对象是旧的
            theMapHasBeenUpdated.value = true
            console.log(4)
        } catch (error) {
            updateMapFile()
        }

    }, 1000)
}
//异步上传map文件
function updateMapRespAsync(resp: objType) {
    switch (repoState.repos.plat) {

        case platNames.github.value:
            return api.github.updateMap({
                owner: repoState.repos.usernameInPlat,
                repo: repoState.repos.nameInPlat,
                content: JSON.stringify([...toRaw(mapState.map.value)]),
                sha: resp.data.sha,
                committerName: repoState.repos.nameInPlat,
                committerEmail: repoState.repos.emailInPlat
            })

        case platNames.gitee.value:
            return api.gitee.updateMap({
                owner: repoState.repos.usernameInPlat,
                repo: repoState.repos.nameInPlat,
                content: JSON.stringify([...toRaw(mapState.map.value)]),
                sha: resp.data.sha
            })

        default:
            return new Promise((resolve) => resolve(null))
    }
}




//往map插入新节点
async function setNewObjToMap(obj: mapValueType) {

    const newObj: mapValueType = await new Promise((resolve) => {

        const newObj = { ...obj }

        while (mapState.map.value.has(newObj.data.id)) {
            //obj的id重复就重新创建直到不重复
            newObj.data.id = Math.random().toString(36).slice(2)
            //id改了，path也得跟着改
            newObj.data.path = join(props.dataModel.dir.data.path, `${newObj.data.id}`)
        }

        resolve(newObj)
    })

    await new Promise((resolve) => {
        //获取其父节点并将父节点child数组插入该节点的id
        const parent = mapState.map.value.get(newObj.parent) as dirType
        parent.child.push(newObj.data.id)

        mapState.current.value.set(newObj.data.id, newObj)
        mapState.backup.value.set(newObj.data.id, newObj)
        resolve(null)
    })

    await new Promise((resolve) => {
        mapState.map.value.set(newObj.data.id, newObj)
        resolve(null)
    })

    return await new Promise((resolve) => {
        updateMapFile()
        resolve(newObj)
    })
}




//导出函数给index.vue使用
defineExpose({ setNewObjToMap, renameObj, handleChangeRepos, getFileList })
</script>


<style>
.n-list .n-list-item .n-list-item__main {
    flex: 1;
    display: contents;
}

.listItemStyle:hover {
    background-color: rgb(250 250 252);
    cursor: pointer
}

.listItemStyle:focus {
    background-color: rgb(250 250 252);
}
</style>