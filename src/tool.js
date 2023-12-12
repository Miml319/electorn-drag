const tool = [{
    name: "电阻",
    type: 'Resistor',
    in: [{
        position: 'left',
        type: 'realIn'
    }],
    out: [ {
        position: 'right',
        type: 'realOut'
    }],
    parameter: [{
        name: '阻值',
        value: 1,
        units: ['mohm', 'ohm', 'kohm']
    }, {
        name: '温度',
        value: 1,
        units: ['mohm', 'ohm', 'kohm']
    }]
},{
    name: "电容",
    type: 'Capacitor',
    in: [{
        position: 'bottom',
        type: 'currIn'
    }],
    out: [{
        position: 'bottom', // 当前连接点所在的位置
        type: 'currOut'
    }],
    parameter: [{
        name: '阻值',
        value: 1,
        units: ['mohm', 'ohm', 'kohm']
    }, {
        name: '温度',
        value: 1,
        units: ['mohm', 'ohm', 'kohm'],
    }]
},{
    name: "电感",
    type: 'Inductor',
    in: [{
        position: 'left',
        type: 'currIn'
    }],
    out: [{
        position: 'right', // 当前连接点所在的位置
        type: 'currOut'
    }],
    parameter: [{
        name: '阻值',
        value: 1,
        units: ['mohm', 'ohm', 'kohm']
    }, {
        name: '温度',
        value: 1,
        units: ['mohm', 'ohm', 'kohm']
    }]
}]

export default tool