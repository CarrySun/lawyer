//通过window.screen.width获取屏幕的宽度
var offWidth = window.screen.width / 10; //这里用宽度/10表示1rem取得的px
document.getElementsByTagName("html")[0].style.fontSize = offWidth + 'px'; //把rem的值复制给顶级标签html的font-size