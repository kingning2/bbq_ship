const baseSize = 16;
// 页面宽度
const pageWidth = 1920;
//
// 设置rem函数
function setRem() {
  // 当前页面宽度相对于 750 宽的缩放比例，可根据自己需要修改。
  const scale = document.documentElement.clientWidth / pageWidth;
  // 设置页面根节点字体大小
  document.documentElement.style.fontSize =
    baseSize * Math.min(scale, 2) + "px";
}

// 初始化
setRem();
// 改变窗口大小时重新设置rem
window.onresize = function () {
  setRem();
};

export default setRem;