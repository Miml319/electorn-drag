<script setup>
import {Graph, Shape} from '@antv/x6'
import {nextTick} from "vue";
import {Dnd} from "@antv/x6-plugin-dnd";
import {Snapline} from "@antv/x6-plugin-snapline";
import {Selection} from '@antv/x6-plugin-selection'
import {History} from '@antv/x6-plugin-history'
import {Export} from '@antv/x6-plugin-export'

// 生成一个 8 位的随机数
function generateRandom8Digits() {
  const min = 10000000; // 最小值为 10000000
  const max = 99999999; // 最大值为 99999999
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let graph, dnd;

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
      color: '#F2F7FA',
    },
    grid: {
      visible: true,
      type: 'doubleMesh',
      args: [
        {
          color: '#eee', // 主网格线颜色
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
  // 导出为PNG
  console.log(graph.toJSON())
}

// 创建一个新的节点
function handleMouseDown(e) {
  const dom = e.target
  const node = graph.createNode({
    tools: ['button-remove'],
    ports: { // 连接桩
      groups: {
        left: {
          position: {
            name: 'left',
          },
        },
        right: {
          position: {
            name: 'right',
          },
        },
      },
      items: [
        {
          id: generateRandom8Digits(),
          group: 'left',
          attrs: {
            circle: {
              magnet: false, // 控制这个节点是否可以链接
              stroke: '#8f8f8f',
              r: 5,
            },
          },
        },
        {
          id: generateRandom8Digits(),
          group: 'right',
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: '#31d0c6',
              strokeWidth: 2,
              fill: '#fff',
            },
          },
        },
      ]
    },
    width: dom.clientWidth,
    height: dom.clientHeight,
    label: dom.innerText,
    parent: true
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
      <div class="tool_btn" @click="handleUndo">撤回</div>
      <div class="tool_btn" @click="handleExport">导出</div>
      <div>ctrl进行框选，鼠标滑轮缩放，画布可拖动</div>
    </div>
    <div class="page">
      <div class="tab">
        <div class="item" @mousedown="handleMouseDown">测试模组</div>
        <div class="item" style="height: 100px" @mousedown="handleMouseDown">测试模组2</div>
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
  margin-bottom: 10px;
  align-items: center;
  justify-content: center;
  width: 100px;
  background-color: #f9f9f9;
  height: 40px;

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
