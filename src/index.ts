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