/**
 * @author:  lanshuai
 * @Date: 2020-08-03
 * @description
 */
import "../css/style.css"
import {throttle} from "./utils";

// require('style-loader!css-loader!../css/style.css')

const width = 500;
const height = 500;

// 初始化
// 基础图层
const baseLayer = document.getElementById('moveLayer');
const baseCTX = baseLayer.getContext("2d");

// 移动图层
const moveLayer = document.getElementById('moveLayer');
const moveCTX = moveLayer.getContext("2d");
moveCTX.globalAlpha = 0.2;

baseLayer.setAttribute("width", width);
baseLayer.setAttribute("height", height);
moveLayer.setAttribute("width", width);
moveLayer.setAttribute("height", height);

var rect = baseLayer.getBoundingClientRect()
console.log("四个角坐标" , rect.left, rect.top);

const originLeft = rect.left;
const originTop = rect.top;

// 引入图片
// 设置图片上下距离
const imgLeft = 10;
const imgTop = 20
import img from "../img/img.png";
const image = new Image();
image.onload = function(){
    baseCTX.drawImage(this, imgLeft,imgTop);
}
image.src = img;

// 获取图片宽高
const imgWidth = image.width;
const imgHeight = image.height;

// 将新生成的组件（图片）放到组件列表中；
const elem = {
    top: imgTop,
    left: imgLeft,
    width: imgWidth,
    height: imgHeight,
    src: img
}
const elements = [];
elements.push(elem);
console.log('elements', elements);


baseLayer.onmousedown = function (e) {
    // baseLayer.onmousemove = throttle(function(e){
    //     const left = e.clientX - originLeft;
    //     const top = e.clientY - originTop;
    //     console.log(e);
    //     console.log('haha');
    // }.bind(this, event), 100);
    // let src = null; // 如果点击的是组件，则是组件的路径，没有点击到组件则是null


    // 按下的坐标
    const left = e.clientX - originLeft;
    const top = e.clientY - originTop;
    // 判断鼠标按下的地方是哪个组件，如果是组件，设置事件，移动；不是组件，不做处理
    elements.map(elem => {
        if(left < (elem.left + elem.width) && left > elem.left && top < (elem.top + elem.height) && top > elem.top){
            // 保存点击位置距离组件左上的距离
            const dx = left - elem.left;
            const dy = top - elem.top;
            console.log("elem.left", elem.left);
            console.log("elem.width", elem.width);
            console.log("left", left);
            console.log("dx", dx);
            // console.log("dy", dy);

            console.log('点击在范围内');
            console.log("图片路径为", elem.src);
            // 找到组件之后再移动图层中建立虚影，表示移动状态
            const image = new Image();
            image.onload = function(){
                moveCTX.drawImage(this, elem.left, elem.top);
            }
            image.src = elem.src;


            let timer = Date.now();
            // TODO：怎么做成节流，事件没法获取啊！
            // 当前办法：使用 时间来进行节流，而不是使用定时器，但是这样的话外面要多维护一个变量
            baseLayer.onmousemove = function(e){
                if(Date.now() - timer < 50) return;
                timer = Date.now();

                const left = e.clientX - originLeft;
                const top = e.clientY - originTop;

                moveCTX.clearRect(0,0, moveLayer.width, moveLayer.height);
                const image = new Image();
                image.onload = function(){
                    moveCTX.drawImage(this, left - dx , top - dy);
                }
                image.src = elem.src;
            }

            baseLayer.onmouseup = function (e) {
                console.log('开始清理');
                baseLayer.onmousemove = null;
                baseLayer.onmouseup = null;

                // 上来之后删除移动图层中的东西，然后在当前位置施放组件
                moveCTX.clearRect(0,0, moveLayer.width, moveLayer.height);
                const left = e.clientX - originLeft;
                const top = e.clientY - originTop;

                const image = new Image();
                image.onload = function(){
                    moveCTX.drawImage(this, left - dx, top - dy);
                }
                elem.left = left - dx;
                elem.top = top - dy;
                image.src = elem.src;
            }

        }
    })

}
