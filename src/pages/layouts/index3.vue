<!-- 架构页面 -->
<template>
  <div class="layoutsWrapper fx-fd-col">
    
    <Header></Header>
    <router-view class="fx-1" />
    <Footer></Footer>
    <div class="aiSupernatant">
      <!-- 大图 -->
      <div v-if="isShow&&!dialogVisible" class="superCon" @click="handleBtn">
        <el-tooltip class="box-item" effect="dark" content="" placement="top"><template #content>
            <div>哈！天机不可泄露<br>除非你来问我</div>
          </template>
          <div class="bigIcon"></div>
          <div class="text">天机AI助理</div>
        </el-tooltip>

      </div>
      <!-- end -->
      <!-- 小图 -->
      <div v-if="!isShow&&!dialogVisible" class="smallIcon" @click="handleClick"></div>
      <!-- end -->
      <!-- 对话弹层 -->
      <el-dialog v-model="dialogVisible" modal-class="superDialog" title="" draggable @close="handleClose" :show-close="false">
        <template #header>
          <div class="dialogHeader">
            <div :id="titleId" class="title">
              <span class="font">天机AI助理</span>
              <button>创建会话</button>
              <button>历史记录</button>
            </div>
            <div class="text">
              <button>全屏</button>
              <button @click="handleClose">最小化</button>
            </div>
          </div>
        </template>
        <div class="chitchatBox">
            <div>
        <div v-if="typing" class="typing-effect" v-html="typedContent"></div>
                <div v-else v-html="parsedMarkdown"></div>
            </div>
          <!-- 聊天对话 -->
          <div class="chatContainer" ref="scrollTarget" v-if="chatDataArr.length>0">
            <div class="item" v-for="(item,index) in chatDataArr" :key="index">
              <div class="questionContainer" v-if="item.type==='USER'">
                <div class="avatarWrap userAvatarWrap">
                  <div class="questionAnswerCon">
                    <div class="content">{{item.content}}</div>
                  </div>
                </div>
              </div>
              <div class="answerContainer" v-if="item.type==='ASSISTANT'">
                <div class="avatarWrap aiAvatarWrap">
                  <div class="answerCon">
                    <div class="content">
                      <div class="markdown-body">
                        <div v-html="md.render(item.content)"></div>
                      </div>

                      </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 回复的答案 -->
            <div class="answerContainer" v-if="isLoading">...给我点时间，我正在思考你的问题</div>
            <div class="answerContainer" v-else-if="compiledMarkdown!==''">
              <!-- <div class="typing-effect" :class="{ 'show-cursor': isTypingDone, 'hide-cursor': !isTypingDone }">
                <div class="text">{{recognitionResult}}</div>
                <div class="text"><span v-html="recognitionResult"></span><span v-if="isTypingDone" class="cursor">|</span></div>
              </div> -->
              <!-- <div ref="typewriterContainer" class="typewriter-container">
                <span ref="textElement" v-html="compiledMarkdown"></span>
                <span class="cursor">|</span>
              </div> -->
              <div class="markdown-body" :class="{ 'show-cursor': isTypingDone, 'hide-cursor': !isTypingDone }">
                <span ref="textElement" v-html="compiledMarkdown" class="text"></span>
                <!-- <span class="cursor" v-if="isTypingDone"></span> -->
              </div>
            </div>
            <!-- end -->
          </div>
          <!-- end -->
          <!-- 初次进入对话弹层 -->
          <div v-else-if="baseData" class="baseBox">
            <div class="chatLogo"><img src="@/assets/icon03.gif" /></div>
            <div class="head">
              <div class="tit">{{baseData.title}}</div>
              <div class="subTit">{{baseData.describe}}</div>
            </div>
            <div class="newQuestion">
              <div class="tit">
                <div>试试这样问我：</div>
                <div class="barter"><span class="updateIcon"></span>换一换</div>
              </div>
            </div>
            <div class="newList">
              <div class="item" v-for="(item,index) in baseData.examples" :key="index">
                <div class="tit">{{item.title}}</div>
                <div class="tit">{{item.describe}}</div>
              </div>
            </div>
          </div>
          
          <!-- end -->
          <div class="dialogForm">
            <!-- 聊天表单 -->
            <div class="textarea">
              <el-input type='textarea' maxlength="10000" :show-word-limit="textVal.length>9500" v-model="textVal" @keydown.enter.prevent="onEnter" @keydown="handleKeyDown" @input="handleInput" placeholder="请将您的问题告诉我，Shift+Enter换行" :style="{ minHeight: '30px', maxHeight: '300px' }" autocomplete="off"></el-input>
            </div>
            <!-- end -->
            <!-- 操作按钮 -->
            <div class="dialogFooter">
              <div class="leftInfo">
                <span class="uploadImgIcon">图片</span>
                <span class="uploadTextIcon">文本</span>
              </div>
              <div class="rightInfo">
                <span class="voiceIcon">语音</span>
                <el-button @click="handleStop" v-if="outputLoading">停止生成</el-button>
                <el-button v-else @click="handleSend" @keyup.enter.prevent="handleEnter" :disabled="!textVal">发送</el-button>

              </div>
            </div>
            <!-- end -->
          </div>
        </div>
      </el-dialog>
      <!-- end -->
    </div>
  </div>
</template>
<script setup>
import Footer from "@/components/Footer.vue";
import Header from "@/components/Header.vue";
import { onMounted, onUnmounted, ref, watch, computed,reactive } from "vue";
import { useUserStore } from "@/store";
import { fetchEventSource } from "@microsoft/fetch-event-source";


import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js/lib/core';
// 导入语言模块和支持的表情符号
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/monokai-sublime.css'; // 选择你喜欢的主题
// import emojiPlugin from 'markdown-it-emoji';
import tocPlugin from 'markdown-it-table-of-contents';
import anchorPlugin from 'markdown-it-anchor';

// import markdownContent from '@/assets/your-markdown-file.md';
// 获取接口
import { newSession, getChat, getChatHistory } from "@/api/intelligent.js";
const store = useUserStore(); //新建会话时把获取的信息存起来
const isShow = ref(false); // 默认小图显示
const dialogVisible = ref(true); //对话弹层
const outputLoading = ref(false); //ai内容生成中
const textVal = ref(""); //表单内容
const chatDataArr = ref([]); //聊天内容
const scrollTarget = ref(null); //对话框的ref
const baseData = ref(store.sessionInfo);
// const recognitionResult = ref("");
const isLoading = ref(false);
const currentIndex = ref(0);
const textData = ref("");
const typingSpeed = ref(80); //打字速度，单位毫秒
const typingDone = ref(false);
// const typingInterval = ref(null); //定时器
const isSend = ref(false)

const markdownChunks = reactive([]);
    const typing = ref(false);
    const typedContent = ref('');
    const typingIndex = ref(0);
    const typingInterval = ref(null);




// 初始化 markdown-it 实例并添加插件
const textElement = ref(null);
// 注册语言
hljs.registerLanguage('javascript', javascript);

// 初始化 markdown-it 实例并配置插件
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
      } catch (__) {}
    }

    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  }
}).use(tocPlugin)
  .use(anchorPlugin);


const compiledMarkdown = ref('');
const htmlContent =ref('')//md代码
const isTypingDone = computed(
  () => !typingDone.value && compiledMarkdown.value.length > 0
);
const parsedMarkdown = computed(
  () => markdownChunks.length>0?md.render(markdownChunks.join('\n\n')):[]);
onMounted(() => {
  window.addEventListener("keydown", handleEnter);
  // 本地么有存储sessionId需要重新获取
  if (baseData.value===undefined||!baseData.value) {
    getSession();
  }else{
    // 如果有sessionId，直接获取聊天记录
    // getList();
    console.log(store.chatDataList)
    if(store.chatDataList){
      chatDataArr.value =store.chatDataList
    }
    
    
  }
  // getMdHtml()
});
// 获取md文件转html代码
const getMdHtml =async()=>{
    // const response = await fetch('@/assets/api.md');
    // console.log(response)
    // let markdownContent = await response.text();
    // const md = new MarkdownIt();
    // htmlContent.value = md.render(markdownContent);
    // console.log(htmlContent.value)
}
// 新建窗口获取id
const getSession = async () => {
  const res = await newSession();
  baseData.value = res.data;
  store.setSessionInfo(res.data);
  // getList()
};
const getList = async () => {
  const params = {
    sessionId: baseData.value.sessionId,
  };
  const res = await getChatHistory(params);
  if (res.code === 200) {
    chatDataArr.value=res.data;
  }
};
// 点击小图显示大图
const handleClick = () => {
  isShow.value = true;
};
// 打开对话弹层
const handleBtn = () => {
  dialogVisible.value = true;
  isShow.value = false;
};
// 关闭弹层
const handleClose = () => {
  isShow.value = true;
  dialogVisible.value = false;
};
const eventSource = ref();
const ctrl = new AbortController();
// 发送信息
const handleSend = async () => {
  const userObj = {
    type:'USER',
    content:textVal.value
  }
  
  chatDataArr.value.push(userObj)
  store.setChatDataList(chatDataArr.value)
  const params = {
    sessionId: baseData.value.sessionId,
    q: textVal.value,
  };
  isLoading.value = true;
  eventSource.value = fetchEventSource(
    `http://172.17.2.76:10010/ais/chat?sessionId=${baseData.value.sessionId}&q=${textVal.value}`,
    {
      method: "POST",
      headers: {
        Authorization: store.getToken,
      },
      signal: ctrl.signal,
      openWhenHidden: true, // 切换标签页时连接不关闭
      async onopen(response) {
        // getList();
        // handleInput()
        // 处理登录失效
        if (response.status === 401) {
          message.warning("登录过期");
          return;
        }
      },

      onmessage(event) {
        markdownChunks.push(event.data);
        
        // 如果正在打字，则停止当前打字效果并重新开始
        if (typing.value) {
          clearInterval(typingInterval.value);
          typingIndex.value = 0;
          typedContent.value = '';
        }

        /// 开始打字效果（这里为了简单，直接显示整个Markdown内容，但你可以根据需要实现逐字显示）
        startTypingEffect();
        
        // 这里为了简单，不直接开始打字效果，而是等待用户触发（比如点击按钮）
        // 你可以根据需要修改这部分逻辑

        // 清除markdownChunks以便接收新的内容（可选）
        // markdownChunks.splice(0, markdownChunks.length);
        // // if the server emits an error message, throw an exception
        // // so it gets handled by the onerror callback below:
        // console.log(chatDataArr.value,0)
        // outputLoading.value = true
        // if (msg.data === "&complete&") {
        //   // // // 实现打印机效果
        //   // typingInterval.value = setInterval(() => {
        //   //   if (currentIndex.value < compiledMarkdown.value.length) {
        //   //     compiledMarkdown.value += compiledMarkdown.value.charAt(
        //   //       currentIndex.value
        //   //     );
        //   //     currentIndex.value++;
        //   //   } else {
        //   //     clearInterval(typingInterval.value);
        //   //     typingDone.value = true;
        //   //   }
        //   // }, typingSpeed.value);
        //   const assistantObj = {
        //     type:'ASSISTANT',
        //     content:textData.value
        //   }
        // chatDataArr.value.push(assistantObj)
        // store.setChatDataList(chatDataArr.value)
        // console.log(chatDataArr.value,1)
        // console.log(store.chatDataList,2)
        // // if(store.chatDataList){
        // //     chatDataArr.value = [...chatDataArr.value,store.chatDataList]
        // //     console.log
        // //   }
        
        //   typeWriterEffect(textElement.value, compiledMarkdown.value, 100); // 调整延迟时间
        //   return;
        // }
        // // if (msg.data === "&complete&") return
        // textData.value = textData.value + msg.data;
        // compiledMarkdown.value = md.render(textData.value);
        // console.log(compiledMarkdown.value)
        // // isSend.value = true
        // // console.log(compiledMarkdown.value)
        // setInterval(()=>{
        //   isLoading.value = false;
        //   clearInterval()
        // },1000)
        // // console.log('接收消息', recognitionResult.value);
        // // console.log(textData.value)
        // // const eventType = msg.event // 监听event的具名事件
        // // switch (eventType) {
        // //   case 'add':
        // //     // 流式输出事件，add每次会返回具体字符，前端负责拼接展示
        // //     break
        // //   case 'finish':
        // //     setStatu('finish') // 结束标识
        // //     break
        // //   case 'error':
        // //     if (msg.status === 401) {
        // //        message.warning('登录过期')
        // //     }
        // //     console.log('Error occurred:', e)
        // //     break
        // // }
        // // if (msg.event === 'FatalError') {
        // //   throw new FatalError(msg.data);
        // // }
        // // if (msg.data.includes('DONE')) {
        // //    ctrl.abort(); // 结束会话
        // // } else {
        // //   let res = JSON.parse(msg.data);
        // //  console.log('接收消息',res)
        // // }
      },
      onclose() {
        compiledMarkdown.value=''
        console.log('关闭')
        ctrl.abort(); // 结束会话
      },
      onerror(err) {
        isLoading.value = false;
        ctrl.abort(); // 结束会话
      },
    }
  );
  //  发送后清空表单
  textVal.value = "";
};
const startTypingEffect = () => {
      typing.value = true;
      const fullHtmlArray = md.render(markdownChunks.join('\n\n')).split('');

      typingInterval.value = setInterval(() => {
        if (typingIndex.value < fullHtmlArray.length) {
          typedContent.value += fullHtmlArray[typingIndex.value];
          typingIndex.value++;
        } else {
          clearInterval(typingInterval.value);
          typing.value = false;
          // 可以在这里重置markdownChunks，以便接收新的内容（如果需要）
        }
      }, 100); // 设置打字速度
    }
const typeWriterEffect=(element, text, delay = 100)=> {
  let index = 0;
  typingInterval.value = setInterval(() => {
    if (index < text.length) {
      compiledMarkdown.value += text.charAt(index);
      index++;
    } else {
      clearInterval(typingInterval.value);
    }
  }, delay);
}
// 停止生成
const handleStop = () => {
  console.log(typingDone.value)
  // if (typingDone.value) {
    clearInterval(typingInterval.value);
    typingDone.value = false;
    ctrl.abort(); // 结束会话
  // }
};
// Shift+Enter换行
const onEnter = (event) => {
  // 阻止回车键默认行为
  event.preventDefault();
  // 检查shift是否被按下
  if (event.shiftKey) {
    // 换行逻辑
    textVal.value += "\n";
  }
};
// 输入文本时禁止触发回车
const handleKeyDown = (event) => {
  if (event.keyCode === 13 && !event.shiftKey) {
    // 当按下回车键但没有按下Shift键时，不允许换行
    event.preventDefault();
  }
};
// 触发发送信息按钮
const handleEnter = (e) => {
  if (textVal.value !== "" && !e.shiftKey) {
    if (e.keyCode === 13 || e.keyCode === 108) {
      handleSend();
    }
  }
};
//触发输入文本框数据滚动到最后一条
const handleInput = (event) => {
  const scrollTar = scrollTarget.value;
  if (scrollTar) {
    const scrollBehavior = scrollTar.scrollHeight - scrollTar.clientHeight;
    scrollTar.scrollTo({
      top: scrollBehavior,
      behavior: "smooth", // 平滑滚动
    });
  }
};
onUnmounted(()=>{
  ctrl.abort(); // 结束会话
})
</script>
<style lang="scss"  src="./index.scss" scoped></style>
<style scoped>
/* 引用 highlight.js 的样式 */
@import 'highlight.js/styles/monokai-sublime.css';

/* 自定义样式 */
.markdown-body {
  white-space: pre; /* 保留空白符 */
    overflow: hidden; /* 隐藏溢出内容 */
    display: inline-block;
    white-space: pre-wrap; /* 保留换行符 */
}

.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.markdown-body p {
  margin-bottom: 0.5em;
}

.markdown-body a {
  color: #0366d6;
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body code {
  padding: 2px 4px;
  font-size: 90%;
  color: #c7254e;
  background-color: #f9f2f4;
  border-radius: 4px;
}

.markdown-body pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f7f7f7;
  border-radius: 3px;
}

.markdown-body table {
  display: block;
  width: 100%;
  overflow: auto;
}

.markdown-body th {
  font-weight: bold;
}

.markdown-body td, .markdown-body th {
  padding: 6px 13px;
  border: 1px solid #ddd;
}

.markdown-body img {
  max-width: 100%;
  box-sizing: content-box;
}
</style>