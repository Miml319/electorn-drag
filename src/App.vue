<script setup>
import {Graph, Shape} from '@antv/x6'
import {nextTick, ref} from "vue";
import {Dnd} from "@antv/x6-plugin-dnd";
import {Snapline} from "@antv/x6-plugin-snapline";
import {Selection} from '@antv/x6-plugin-selection'
import {History} from '@antv/x6-plugin-history'
import {Export} from '@antv/x6-plugin-export'
import tool from "./tool";

// 生成一个 8 位的随机数
function generateRandom8Digits() {
  const min = 10000000; // 最小值为 10000000
  const max = 99999999; // 最大值为 99999999
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let graph, dnd;
// 属性编辑窗口开关
let dialogVisible = ref(false)
// 当前编辑的属性信息
let paraInputInfo = ref([])
// 空闲编号集合
let deleteArray = []

// 创建画布
function handleCreateContainers() {
  graph = new Graph({
    magnetConnectable: false,
    autoResize: true,
    translating: {
      restrict: true,
    },
    connecting: {
      snap: true,
      router: 'manhattan',
      connector: {
        name: 'rounded',
        args: {
          radius: 8,
        },
      },
      anchor: 'center',
      connectionPoint: 'anchor',
      allowBlank: false,
    },
    createEdge() {
      return new Shape.Edge({
        attrs: {
          line: {
            stroke: '#A2B1C3',
            strokeWidth: 2,
            targetMarker: {
              name: 'block',
              width: 12,
              height: 8,
            },
          },
        },
        zIndex: 0,
      })
    },
    snapline: true, // 启用对齐线
    embedding: {
      enabled: true,
    },
    panning: true, // 画布平移
    mousewheel: true,  // 画布缩放
    container: document.getElementById('container'),
    background: {
      color: '#77787a',
    },
    grid: {
      visible: true,
      type: 'doubleMesh',
      args: [
        {
          color: '#5d5a5a', // 主网格线颜色
          thickness: 1, // 主网格线宽度
        },
        {
          color: '#ddd', // 次网格线颜色
          thickness: 1, // 次网格线宽度
          factor: 4, // 主次网格线间隔
        },
      ],
    },
  })
  // 添加监听事件
  graph.on('cell:dblclick', ({e, x, y, cell, view}) => {
    // 双击 编辑信息
    console.log(cell.data.parameter)
    paraInputInfo.value = cell.data.parameter
    paraInputInfo.value.forEach(item => {
      if (!item.unitsInfo) item.unitsInfo = item.units[0]
    })
    dialogVisible.value = true
  })
  // 监听删除
  graph.on('node:removed', ({ node, index, options}) => {
    deleteArray.push(node.store.data.data.componentNum)
    // e.stopPropagation()
    // view.cell.remove()
  })
  // 初始化工具拖动
  dnd = new Dnd({
    target: graph,
  })
  // 导出
  graph.use(new Export())
  // 配置对齐
  graph.use(
      new Snapline({
        enabled: true
      }),
  )
  // 拖动框
  graph.use(
      new Selection({
        enabled: true,
        modifiers: ['ctrl'],
        multiple: true,
        rubberband: true,
        movable: true,
        showNodeSelectionBox: true,
      }),
  )
  // 撤回
  graph.use(
      new History({
        enabled: true,
      }),
  )
}

nextTick(() => {
  handleCreateContainers()
})

function handleExport() {
  function findElementById(id) {
    // 用于查找对应的节点信息
    return graph.toJSON().cells.find(element => element.id === id);
  }

  function findNameById(id) {
    var value;
    // 查找链接桩信息
    graph.toJSON().cells.forEach(item => {
      item.ports && item.ports.items.forEach(child => {
        if (child.id === Number(id)) {
          value = child
        }
      })
    })
    return value
  }

  const list = graph.toJSON().cells.filter(item => item.shape === "edge")
  list.forEach(item => {
    item.source.parameterInfo = findElementById(item.source.cell).data
    item.target.parameterInfo = findElementById(item.target.cell).data
    item.source.portInfo = findNameById(item.source.port)
    item.target.portInfo = findNameById(item.target.port)
    // 没选单位的 给个默认项
    item.source.parameterInfo.parameter.forEach(item => {
      if (!item.unitsInfo) item.unitsInfo = item.units[0]
    })
    item.source.parameterInfo.parameter.forEach(item => {
      if (!item.unitsInfo) item.unitsInfo = item.units[0]
    })
  })
  // graph.toJSON().cells.forEach((item,index) => {
  //   list[item.id] = item
  // })
  // 导出为PNG
  console.log(list)
}

// 创建一个新的节点
// function handleMouseDown(e) {
//   const dom = e.target
//   const node = graph.createNode({
//     tools: ['button-remove'],
//     ports: { // 连接桩
//       groups: {
//         left: {
//           position: {
//             name: 'left',
//           },
//         },
//         right: {
//           position: {
//             name: 'right',
//           },
//         },
//       },
//       items: [
//         {
//           id: generateRandom8Digits(),
//           group: 'left',
//           attrs: {
//             circle: {
//               magnet: false, // 控制这个节点是否可以链接
//               stroke: '#8f8f8f',
//               r: 5,
//             },
//           },
//         },
//         {
//           id: generateRandom8Digits(),
//           group: 'right',
//           attrs: {
//             circle: {
//               r: 6,
//               magnet: true,
//               stroke: '#31d0c6',
//               strokeWidth: 2,
//               fill: '#fff',
//             },
//           },
//         },
//       ]
//     },
//     width: dom.clientWidth,
//     height: dom.clientHeight,
//     label: dom.innerText,
//     parent: true
//   })
//   dnd.start(node, e)
// }

const groups = {
  left: {
    position: {
      name: 'left',
    },
  },
  bottom: {
    position: {
      name: 'bottom',
    },
  },
  right: {
    position: {
      name: 'right',
    },
  },
}

// 原件编号计数器
var componentNum = 1

// 创建一个电阻
function handleCreateDianZu(e, item) {
  if(!deleteArray.length){
    item.componentNum = componentNum++
  } else {
    item.componentNum = deleteArray[0]
    deleteArray.shift()
  }
  const dom = e.target
  const itemList = []
  item.in.forEach(value => {
    itemList.push({
      id: generateRandom8Digits(),
      group: value.position,
      type: value.type,
      attrs: {
        circle: {
          strokeWidth:6,
          magnet: true, // 控制这个节点是否可以链接
          stroke: '#ffffff',
          r: 5,
        },
      }
    })
  })
  item.out.forEach(value => {
    itemList.push({
      id: generateRandom8Digits(),
      group: value.position,
      type: value.type,
      attrs: {
        circle: {
          strokeWidth:6,
          magnet: true, // 控制这个节点是否可以链接
          stroke: '#ffffff',
          r: 5,
        },
      }
    })
  })
  const node = graph.createNode({
    tools: [{
      name: 'button-remove',
      event: 'node:delete',
    }],
    attrs: {
      "text": {
        "fontSize": 16,
        "fill": "#ffffff",
        "refX": 0.5,
        "refY": 1,
        "textAnchor": "middle",
        "textVerticalAnchor": "middle",
        "text": item.name + item.componentNum
      },
    },
    ports: {
      groups,
      items: [...itemList]
    },
    data: item,
    width: dom.clientWidth,
    height: dom.clientHeight,
    shape: 'image',
    imageUrl:
        `../src/assets/svg/${item.type}.png`,
  })
  dnd.start(node, e)
}

function handleUndo() {
  // 撤回
  graph.undo()
}
</script>

<template>
  <div style="display: flex;flex-direction: column">

    <div class="tool_list">
<!--      <div class="tool_btn" @click="handleUndo">撤回</div>-->
      <div class="tool_btn" @click="handleExport">导出</div>
      <div>ctrl进行框选，鼠标滑轮缩放，画布可拖动</div>
    </div>
    <el-dialog
        v-model="dialogVisible"
        title="信息修改"
        width="30%"
    >
      <div v-for="(item,index) of paraInputInfo" :key="index" style="margin-bottom: 20px">
        <el-form-item :label="item.name">
          <el-input-number v-model="item.value"/>
        </el-form-item>
        <el-form-item label="单位">
          <el-select v-model="item.unitsInfo" class="m-2" placeholder="Select" size="large">
            <el-option
                v-for="child in item.units"
                :key="child"
                :label="child"
                :value="child"
            />
          </el-select>
        </el-form-item>
      </div>
      <!--      <template #footer>-->
      <!--      <span class="dialog-footer">-->
      <!--        <el-button @click="dialogVisible = false">Cancel</el-button>-->
      <!--        <el-button type="primary" @click="dialogVisible = false">-->
      <!--          Confirm-->
      <!--        </el-button>-->
      <!--      </span>-->
      <!--      </template>-->
    </el-dialog>
    <div class="page">
      <div class="tab">
        <div class="item" v-for="(item,index) of tool" @mousedown="handleCreateDianZu($event,item)" :dir="item">
          <img :src="`../src/assets/svg/${item.type}.png`" style="width: 100%;pointer-events: none">
          <div>{{ item.name }}</div>
        </div>
        <!--        <div class="item" style="height: 100px" @mousedown="handleMouseDown">测试模组2</div>-->
      </div>
      <div id="container"></div>
      <!--    <div id="minimap"></div>-->
    </div>
  </div>
</template>

<style>
.tool_btn {
  margin-right: 15px;
  width: 60px;
  height: 30px;
  cursor: pointer;
  background-color: #f9f9f9;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool_list {
  padding: 0 20px;
  display: flex;
  align-items: center;
  width: 100vw;
  height: 40px;
  background-color: #dadada;
}

#minimap {
  position: fixed;
  width: 180px;
  height: 180px;
  bottom: 0;
  right: 0;
  background-color: #646cff;
}

.page {
  display: flex;
  width: 100%;
  height: calc(100vh - 40px);
}

.item {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
  align-items: center;
  justify-content: center;
  width: 100px;
}

.tab {
  flex-direction: column;
  align-items: center;
  padding: 20px;
  display: flex;
  width: 120px;
  height: 100%;
  background-color: #a9b3ea;
}

#container {
  flex: 1;
  height: 100%;
}

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
</style>
