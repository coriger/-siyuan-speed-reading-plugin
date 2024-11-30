import {
    Plugin,
    showMessage,
    confirm,
    Dialog,
    Menu,
    openTab,
    adaptHotkey,
    getFrontend,
    getBackend,
    IModel,
    Protyle,
    openWindow,
    IOperation,
    Constants,
    openMobileFileById,
    lockScreen,
    ICard,
    ICardData
} from "siyuan";
import "@/index.scss";

export default class PluginSample extends Plugin {

    async onload() {

        const topBarElement = this.addTopBar({
            icon: "iconInfo",
            title: "速读",
            position: "right",
            callback: () => {
                let rect = topBarElement.getBoundingClientRect();

                const menu = new Menu("topBarSample");
                // 关闭速读模式
                menu.addItem({
                    label: "关闭速读",
                    click: () => {
                        document.querySelector("#speedReadMode").setAttribute('data-value', '0');
                    }
                });
        
                // 单篇速读模式
                menu.addItem({
                    label: "单篇速读",
                    click: () => {
                        document.querySelector("#speedReadMode").setAttribute('data-value', '1');
                    }
                });
        
                // 译注版双排速读模式
                menu.addItem({
                    label: "译注双排速读",
                    click: () => {
                        document.querySelector("#speedReadMode").setAttribute('data-value', '2');
                    }
                });

                // 知乎速读模式
                menu.addItem({
                    label: "知乎速读",
                    click: () => {
                        document.querySelector("#speedReadMode").setAttribute('data-value', '3');
                    }
                });

                menu.open({
                    x: rect.right,
                    y: rect.bottom,
                    isLeft: true,
                  });


            }
        });


        // 定义工具栏选项
        this.protyleOptions = {
            toolbar: ["block-ref",
                "a",
                "|",
                "text",
                "strong",
                "em",
                "u",
                "s",
                "mark",
                "sup",
                "sub",
                "clear",
                "|",
                "code",
                "kbd",
                "tag",
                "inline-math",
                "inline-memo",
                "|",
                {
                    name: "insert-smail-emoji",
                    icon: "iconInfo",
                    tipPosition: "n",
                    tip: this.i18n.insertComment,
                    click(protyle: Protyle) {
                        var targetText = "✅" + protyle.protyle.toolbar.range.startContainer.parentNode.textContent
                        // 清空之前的内容
                        protyle.protyle.toolbar.range.startContainer.parentNode.textContent = "";
                        // 重新插入
                        protyle.insert(targetText)
                        // 在下一行继续插入
                        protyle.insert('{: style="color: var(--b3-card-error-color);background-color: var(--b3-card-error-background);"}',true)
                    }
                }],
        };

        this.eventBus.on("switch-protyle", this.switchDoc);
        // 监听选中编辑器
        this.eventBus.on("click-editorcontent", this.switchDoc);
    }

    private switchDoc({ detail }: any) {
        let speedReadMode = document.querySelector("#speedReadMode")?.getAttribute('data-value');
        // console.log(detail.protyle.element);
        console.log(speedReadMode);

        if(speedReadMode === "0"){
            // 还原
            detail.protyle.element.style.color = '';
            detail.protyle.element.querySelectorAll("[data-type='NodeSuperBlock']").forEach((element: HTMLElement) => {
                // 找data-type="NodeParagraph"的第二个元素
                element.querySelectorAll("[data-type='NodeParagraph']")[1].style.color = ''
            });
            // 强刷页面ctrl+f5
            // window.location.reload();
        }else if(speedReadMode === "1"){   // 单篇速读
            detail.protyle.element.style.color = 'transparent'
            detail.protyle.element.querySelectorAll("[data-type='mark']").forEach((element: HTMLElement) => {
                element.style.color = '#65b84d'
            });
        }else if(speedReadMode === "2"){ // 双排速读  保留左侧文字  右侧保留标注  适用于古文译注版书籍
            // 遍历文档所有data-type="NodeSuperBlock"的元素
            detail.protyle.element.querySelectorAll("[data-type='NodeSuperBlock']").forEach((element: HTMLElement) => {
                // 找data-type="NodeParagraph"的第二个元素
                element.querySelectorAll("[data-type='NodeParagraph']")[1].style.color = 'transparent'
            });
        }else if(speedReadMode === "3"){ // 隐藏未标注文字，保留author、总结、标注  适用于知乎页
            // 遍历文档所有data-type="NodeSuperBlock"的元素
            detail.protyle.element.querySelectorAll("div").forEach((element: HTMLElement) => {
                // 如果是data-type=NodeHeading  
                if (element.getAttribute("data-type") === "NodeHeading") {
                    // 判断当前是否有标记
                    if(!element.firstChild.textContent.includes("✅")){
                        // 这一轮直接隐藏掉
                        element.style.display = "none";
                    }
                }

                if (element.getAttribute("data-type") === "NodeParagraph" && element.style.color) {
                    // 这个是总结，需要保留
                }else if (element.getAttribute("data-type") === "NodeParagraph") {
                    // 判断当前子元素是否有mark
                    if(!element.querySelector("[data-type='mark']")){
                        // 这一轮直接隐藏掉
                        element.style.display = "none";
                    } else {
                        const marks = element.querySelectorAll('span[data-type="mark"]');
                        const result = Array.from(marks).map(mark => mark.outerHTML).join('  ');
                        element.innerHTML = result;
                    }
                }


                // NodeListItem
                if ((element.getAttribute("data-type") === "NodeListItem" || element.getAttribute("data-type") === "NodeBlockquote")) {
                    // 再找里面的NodeParagraph
                    element.querySelectorAll("[data-type='NodeParagraph']").forEach((el: HTMLElement) => {
                        // 判断当前子元素是否有mark
                        if(!el.querySelector("[data-type='mark']")){
                            // 这一轮直接隐藏掉
                            el.style.display = "none";
                            // 把父元素也隐藏
                            element.style.display = "none";
                        }else{
                            const marks = el.querySelectorAll('span[data-type="mark"]');
                            const result = Array.from(marks).map(mark => mark.outerHTML).join('  ');
                            el.innerHTML = result;
                        }
                    })
                }

                // NodeThematicBreak全部隐藏
                if (element.getAttribute("data-type") === "NodeThematicBreak") {
                    element.style.display = "none";
                }

                // 在屏幕上绘制一个圆形


            });
        }
    }


    onLayoutReady() {
        // 先判断是否存在speedReadMode元素
        if(!document.querySelector("#speedReadMode")){
            // 如果不存在则创建
            let speedReadMode = document.createElement("div");
            speedReadMode.id = "speedReadMode";
            speedReadMode.setAttribute('data-value','0');
            document.body.appendChild(speedReadMode);
        }
    }

    async onunload() {
        
    }

    uninstall() {
        
    }


}