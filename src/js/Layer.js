import img from "../img/img.png";
import img2 from "../img/img2.png";
import img3 from "../img/img3.png";

import {drawImage, getCoverRect} from "./utils";
import observe from "./observe";

// ******************************技术要点********************************************************************************

// 1. canvas 拖动
//     建立2个图层，其中几个图层作为基础图层，作用是绘制图形；另外一个是移动图层，用于移动组件的时候显示目标组件的虚像。
//     在2个图层外层套一个div容器，用于绑定事件，因为2层 canvas 本身重叠不能很好的绑定事件
//     拖动需要绑定3个事件，
//     1）onmousedown：鼠标左键按下，此时需要判断点击的位置是否在某个组件内，如果是的话，将该组件找出来
//     2）onmousemove：鼠标拖动，找到点击的元素后，将其虚像渲染到移动图层中，没拖动一下，清空所有移动图层，然后重新渲染目标组件虚像。
//         这里需要将高频操作进行节流：我使用时间戳的方式进行节流，将控制器放到循环外面，没有用函数封装闭包，因为那样会难以获取当前event
//     3）onmouseup: 鼠标放开，此时要解除onmouseup和onmousemove的事件绑定，避免内存泄漏，onmousedown不需要，因为这个会被覆盖掉；
//         然后判断当前位置是否合法（没有与其他组件重叠）
//
// 2. 矩形重叠判断
//     两个矩形不重叠，可以归结为四种情况：A在B左边/右边/上边/下边，如果A的左边界在B的右边界的右侧，则A一定在B右边，以此类推。
//     如果不满足任何一个重叠状况，这可判断两个矩形重叠。
//     重叠需要返回重叠部分：如果矩形重叠，则其在水平和垂直方向上一定是都重叠的。上下左右都取最靠近另一边的值，得到的就是重叠部分。

// *********************************************************************************************************************

/**
 * @author:  lanshuai
 * @Date: 2020-08-04
 * @description
 */
function Layer(width, height) {
    this.width = width; // 图层宽度
    this.height = height; // 图层高度
    this.baseLayer = null; // 基础图层
    this.baseCTX = null; // 基础图层上下文

    this.moveLayer = null; // 移动图层
    this.moveCTX = null; // 移动图层上下文
    this.moveAlpha = 0.2; // 移动图层透明度

    this.elements = []; // 界面中的组件

    this.originLeft = 0; // 绘图区域关于屏幕的左上坐标
    this.originTop = 0;

    this.positionLegally = {value: true}; // 当前释放位置是否合法
}

Layer.prototype = {
    init(){
        this.layerContainer = document.getElementById('layerContainer');

        this.baseLayer = document.getElementById('baseLayer');
        this.baseCTX = this.baseLayer.getContext("2d");

        // 移动图层
        this.moveLayer = document.getElementById('moveLayer');
        this.moveCTX = this.moveLayer.getContext("2d");
        this.moveCTX.globalAlpha = 0.2;

        this.baseLayer.setAttribute("width", this.width);
        this.baseLayer.setAttribute("height", this.height);
        this.moveLayer.setAttribute("width", this.width);
        this.moveLayer.setAttribute("height", this.height);

        this.layerContainer.style.width = this.width + "px";
        this.layerContainer.style.height = this.height + "px";

        const legal = document.getElementById('legal');
        const show = () => {
            legal.innerText = this.positionLegally.value ? "合法" : "不合法";
        }
        observe(this.positionLegally, show);

        const rect = this.baseLayer.getBoundingClientRect()
        // console.log("四个角坐标" , rect.left, rect.top);

        this.originLeft = rect.left;
        this.originTop = rect.top;

        const self = this;

        self.layerContainer.onmousedown = function (e){

            // 按下的坐标
            const left = e.clientX - self.originLeft;
            const top = e.clientY - self.originTop;

            // console.log(left);
            // console.log(top);
            // console.log(self.elements);

            // 判断鼠标按下的地方是哪个组件，如果是组件，设置事件，移动；不是组件，不做处理
            self.elements.map(elem => {
                if(left < (elem.left + elem.width) && left > elem.left && top < (elem.top + elem.height) && top > elem.top){
                    // 保存点击位置距离组件左上的距离
                    const dx = left - elem.left;
                    const dy = top - elem.top;

                    const baseLeft = elem.left; // 当前元素原来的左边距， 用于不正确点击和恢复的时候使用
                    const baseTop = elem.top;  // 当前元素原来的上边距

                    // console.log('点击在范围内');
                    // console.log("图片路径为", elem.src);
                    // 找到组件之后再移动图层中建立虚影，表示移动状态
                    const image = new Image();
                    image.onload = function(){
                        self.moveCTX.drawImage(this, elem.left, elem.top);
                    }
                    image.src = elem.src;

                    let timer = Date.now();
                    // TODO：怎么做成节流，事件没法获取啊！
                    // 当前办法：使用 时间来进行节流，而不是使用定时器，但是这样的话外面要多维护一个变量


                    self.layerContainer.onmousemove = function(e){
                        if(Date.now() - timer < 20) return;
                        timer = Date.now();

                        const left = e.clientX -  self.originLeft;
                        const top = e.clientY -  self.originTop;

                        self.moveCTX.clearRect(0,0,  self.moveLayer.width,  self.moveLayer.height);
                        // console.log('清空');

                        const image = new Image();
                        image.onload = function(){
                            // self.moveCTX.drawImage(this, left - dx , top - dy);
                            drawImage(image, left - dx, top - dy, 0.5, self.moveCTX);

                            const ctx = self.moveCTX;
                            ctx.fillStyle = "rgba(0, 255,0, 0.4)"
                            ctx.fillRect(left - dx, top - dy, elem.width, elem.height);

                            const currentMoveRect = {
                                left: left - dx,
                                top: top - dy,
                                width: elem.width,
                                height: elem.height
                            }

                            self.positionLegally.value = true;
                            self.elements.forEach(item => {
                                if(item.src !== elem.src){ // 不是同一个组件
                                    const coverRect = getCoverRect(item, currentMoveRect);
                                    // console.log(coverRect);
                                    if(coverRect){
                                        self.positionLegally.value = false;
                                        // console.log('获得, ', self.positionLegally.value);
                                        ctx.fillStyle = "rgba(255, 0 ,0, 0.8)"
                                        ctx.fillRect(coverRect.left, coverRect.top, coverRect.width, coverRect.height);
                                    }else{
                                        // self.positionLegally.value = true;
                                        // console.log('设为真', self.positionLegally.value);
                                    }
                                }
                            })

                            // console.log('绘制');
                        }
                        image.src = elem.src;
                    }

                    self.layerContainer.onmouseup = function (e){
                        self.layerContainer.onmousemove = null;
                        self.layerContainer.onmouseup = null;

                        // console.log('elements', self.elements);

                        console.log('落下，', self.positionLegally.value);

                        if(self.positionLegally.value){
                            self.moveCTX.clearRect(0,0,  self.moveLayer.width,  self.moveLayer.height);
                            const left = e.clientX -  self.originLeft;
                            const top = e.clientY -  self.originTop;

                            elem.left = left - dx;
                            elem.top = top - dy;

                            self.drawElements();
                        }
                        else{
                            // alert("释放位置不合法");
                            self.moveCTX.clearRect(0,0,  self.moveLayer.width,  self.moveLayer.height);
                        }

                        // if(confirm("确定移动到此位置吗？") === true){
                            // 上来之后删除移动图层中的东西，然后在当前位置施放组件

                        // }
                        // else{
                        //     self.moveCTX.clearRect(0,0,  self.moveLayer.width,  self.moveLayer.height);
                        // }
                    }
                }
            })
        }
    },

    drawElements(){
        const self = this;
        // 重新绘制基础图层
        this.baseCTX.clearRect(0,0, this.baseLayer.width, this.baseLayer.height);
        this.elements.forEach((elem, index) => {
            // console.log("index ", index);
            // console.log("elem ", elem);
            const image = new Image();
            image.onload = function (){
                self.baseCTX.drawImage(this, elem.left, elem.top);
            }
            image.src = elem.src;
        })
    },

    importElem(){
        // TODO： 当前只是例子，项目中需要在左侧建立导航栏，然后拖动引入
        // 引入图片
        // 设置图片上下距离
        const self = this;
        const imgLeft = 10;
        const imgTop = 20
        const image = new Image();
        image.onload = function(){
            self.baseCTX.drawImage(this, imgLeft,imgTop);
            // console.log('图片宽 ', image.width);
            // console.log('图片高 ', image.height);

            // 获取图片宽高
            let imgWidth = image.width;
            let imgHeight = image.height;

            // 将新生成的组件（图片）放到组件列表中；
            const elem = {
                top: imgTop,
                left: imgLeft,
                width: imgWidth,
                height: imgHeight,
                src: img
            }
            // console.log("elem2", elem);
            self.elements.push(elem);
            // console.log('elements', self.elements);
        }
        image.src = img;

        // 引入第二张图片

        const imgLeft2 = 200;
        const imgTop2 = 20
        const image2 = new Image();
        image2.onload = function(){
            self.baseCTX.drawImage(this, imgLeft2,imgTop2);
            // 获取图片宽高
            let imgWidth2 = image2.width;
            let imgHeight2 = image2.height;

            // 将新生成的组件（图片）放到组件列表中；
            const elem2 = {
                top: imgTop2,
                left: imgLeft2,
                width: imgWidth2,
                height: imgHeight2,
                src: img2
            }
            // console.log("elem2 ", elem2);
            self.elements.push(elem2);
            // console.log('elements', self.elements);
        }
        image2.src = img2;

        // 引入第三张图片

        const imgLeft3 = 400;
        const imgTop3 = 20
        const image3 = new Image();
        image3.onload = function(){
            self.baseCTX.drawImage(this, imgLeft3,imgTop3);
            // 获取图片宽高
            let imgWidth3 = image3.width;
            let imgHeight3 = image3.height;

            // 将新生成的组件（图片）放到组件列表中；
            const elem3 = {
                top: imgTop3,
                left: imgLeft3,
                width: imgWidth3,
                height: imgHeight3,
                src: img3
            }
            // console.log("elem3 ", elem3);
            self.elements.push(elem3);
            // console.log('elements', self.elements);
        }
        image3.src = img3;


    },
}

export default Layer
