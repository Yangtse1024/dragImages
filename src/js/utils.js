/**
 * @author:  lanshuai
 * @Date: 2020-08-04
 * @description
 */

function throttle(fun, delay = 500) {
    let timer = null;
    const self = this;
    const args = arguments;
    return function () {
        if(timer){
            return;
        }
        timer = setTimeout(function () {
            fun.apply(self, args);
            timer = null;
        }, delay);
    }
}

function drawImage (image , x  , y , alpha, ctx)
{
    // 绘制图片
    ctx.drawImage(image , x , y);
    // 获取从x、y开始，宽为image.width、高为image.height的图片数据
    // 也就是获取绘制的图片数据
    var imgData = ctx.getImageData(x , y , image.width , image.height);
    for (var i = 0 , len = imgData.data.length ; i < len ; i += 4 )
    {
        // 改变每个像素的透明度
        imgData.data[i + 3] = imgData.data[i + 3] * alpha;
    }
    // 将获取的图片数据放回去。
    ctx.putImageData(imgData , x , y);
}

function getCoverRect(elem1, elem2) {
    // console.log(elem1, elem2);
    let res = null;
    elem1.bottom = elem1.top + elem1.height
    elem1.right = elem1.left + elem1.width;
    elem2.bottom = elem2.top + elem2.height
    elem2.right = elem2.left + elem2.width;

    if(!(
        elem1.left >= elem2.right || // 在右边
        elem1.right <= elem2.left || // 在左边
        elem1.top >= elem2.bottom || // 在下边
        elem1.bottom <= elem2.top // 在上边
    )){
        // 有重叠部分
        const minLeft = Math.max(elem1.left, elem2.left);
        const minTop = Math.max(elem1.top, elem2.top);
        const minRight = Math.min(elem1.right, elem2.right);
        const minBottom = Math.min(elem1.bottom, elem2.bottom);

        res = {
            left: minLeft,
            top: minTop,
            width: minRight - minLeft,
            height: minBottom - minTop
        }
    }
    return res;
}

export {
    throttle, drawImage, getCoverRect
}

