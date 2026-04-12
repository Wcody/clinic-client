interface ViewerPrintFunction {
  extendOptions: Function;
  getStyle: Function;
  setDomHeight: Function;
  toPrint: Function;
}

const ViewerPrint = function (items, options?: object): ViewerPrintFunction {
  options = options || {};
  // @ts-expect-error
  if (!(this instanceof ViewerPrint)) return new ViewerPrint(items, options);
  this.conf = {
    styleStr: "",
    appendHtml: "",
    sign: {},
    // Elements that need to dynamically get and set the height
    setDomHeightArr: [],
    // Callback before printing
    printBeforeFn: null,
    // Callback after printing
    printDoneCallBack: null
  };
  for (const key in this.conf) {
    if (key && options.hasOwnProperty(key)) {
      this.conf[key] = options[key];
    }
  }
  this.items = items;
  if (this.conf.setDomHeightArr && this.conf.setDomHeightArr.length) {
    this.setDomHeight(this.conf.setDomHeightArr);
  }
  this.init();
};

ViewerPrint.prototype = {
  /**
   * init
   */
  init: function (): void {
    const content = this.getStyle() + this.getHtml();
    this.writeIframe(content);
  },
  /**
   * Configuration property extension
   * @param {Object} obj
   * @param {Object} obj2
   */
  extendOptions: function <T>(obj, obj2: T): T {
    for (const k in obj2) {
      obj[k] = obj2[k];
    }
    return obj;
  },
  /**
    Copy all styles of the original page
  */
  getStyle: function (): string {
    let str = "";
    str += `<style>.no-print{display:none;}${this.conf.styleStr}</style>`;
    str += `<style>
        @media print {
            html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                -webkit-print-color-adjust:exact;
                -moz-print-color-adjust:exact;
                -ms-print-color-adjust:exact;
                print-color-adjust:exact;
            }

            button{display:none;}

            .print-page-div {
                page-break-before: always;
                page-break-after: always;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
            }
        }
    </style>`;
    return str;
  },
  // form assignment
  getHtml: function (): string {
    const sign = this.conf.sign;
    let html = "";
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      html += `<div class="print-page-div" style="position: relative;"><img style="width: 100%" src="${item.url}"/>`;
      if (sign) {
        html += `<img style="width: ${sign.width}; position: absolute; bottom: ${sign.bottom}; right:${sign.right}; opacity: ${sign.opacity};" src="${sign.src}" />`;
      }
      if (this.conf.appendHtml) {
        html += this.conf.appendHtml;
      }
      html += "</div>";
    }
    return html;
  },
  /**
    create iframe
  */
  writeIframe: function (content) {
    let w: Document | Window;
    let doc: Document;
    const iframe: HTMLIFrameElement = document.createElement("iframe");
    const f: HTMLIFrameElement = document.body.appendChild(iframe);
    iframe.id = "bqIframe";
    iframe.setAttribute(
      "style",
      "position:absolute;width:0;height:0;top:-10px;left:-10px;"
      //"position:absolute;width:600px;height:800px;top:100px;left:300px;"
    );

    w = f.contentWindow || f.contentDocument;

    doc = f.contentDocument || f.contentWindow.document;
    doc.open();
    doc.write(content);
    doc.close();

    // const removes = document.querySelectorAll(".isNeedRemove");
    // for (let k = 0; k < removes.length; k++) {
    //   removes[k].parentNode.removeChild(removes[k]);
    // }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    iframe.onload = function (): void {
      // Before popping, callback
      if (_this.conf.printBeforeFn) {
        _this.conf.printBeforeFn({ doc });
      }
      _this.toPrint(w);
      setTimeout(function () {
        document.body.removeChild(iframe);
        // After popup, callback
        if (_this.conf.printDoneCallBack) {
          _this.conf.printDoneCallBack();
        }
      }, 100);
    };
  },
  /**
    Print
  */
  toPrint: function (frameWindow): void {
    try {
      setTimeout(function () {
        frameWindow.focus();
        try {
          if (!frameWindow.document.execCommand("print", false, null)) {
            frameWindow.print();
          }
        } catch (e) {
          frameWindow.print();
        }
        frameWindow.close();
      }, 10);
    } catch (err) {
      console.error(err);
    }
  },
  isDOM:
    typeof HTMLElement === "object"
      ? function (obj) {
          return obj instanceof HTMLElement;
        }
      : function (obj) {
          return (
            obj &&
            typeof obj === "object" &&
            obj.nodeType === 1 &&
            typeof obj.nodeName === "string"
          );
        },
  /**
   * Set the height of the specified dom element by getting the existing height of the dom element and setting
   * @param {Array} arr
   */
  setDomHeight(arr) {
    console.log(arr);
    if (arr && arr.length) {
      arr.forEach(name => {
        const domArr = document.querySelectorAll(name);
        domArr.forEach(dom => {
          dom.style.height = dom.offsetHeight + "px";
        });
      });
    }
  }
};

export default ViewerPrint;
