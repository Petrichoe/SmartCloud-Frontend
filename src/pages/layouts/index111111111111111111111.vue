<!-- 架构页面 -->
<template>
  <div class="layoutsWrapper fx-fd-col">
    <Header></Header>
    <router-view class="fx-1" />
    <Footer></Footer>
    <div class="aiSupernatant">
      <!-- 大图 -->
      <div v-if="!isShow&&!dialogVisible" class="superCon">
        
        <el-tooltip popper-class="box-item" effect="dark" content="" placement="top">
          <template #content>
            
            <div v-if="token">哈！天机不可泄露<br>除非你来问我</div>
            <div v-else>哇！我是天机AI助理<br>你没有登录可不能和我聊哦～</div>
          </template>
          <div>
            <span @click="handleBigClose" class="close"><i class="iconfont icon-a-icon-close2x"></i></span>
            <div @click="handleBtn">
              <div class="bigIcon"></div>
            </div>
          </div>
          
          
        </el-tooltip>

      </div>
      <!-- end -->
      <!-- 小图 -->
      <div v-if="isShow&&!dialogVisible" class="smallIcon" @click="handleClick">
        <span class="icon"></span>
      </div>
      <!-- end -->
      
    </div>
    <!-- 对话弹层 -->
      <el-dialog v-model="dialogVisible" modal-class="superDialog" title="" draggable @close="handleClose" :show-close="false">
        <template #header>
          <div class="dialogHeader">
            <div :id="titleId" class="title">
              <span class="font">天机AI助理</span>
              <button :class="chatDataArr.length===0?'disabled':''" @click="handleCread"><i class="iconfont icon-a-icon-cjhh2x"></i>创建会话</button>
              <button @click="handleHistory"><i class="iconfont icon-a-icon-lsjl2x"></i>历史记录</button>
            </div>
            <div class="text">
              <button @click="handleRight"><i class="iconfont icon-a-icon-yc2x"></i></button>
              <button @click="handleMagnify"><i class="iconfont icon-a-icon-qp2x"></i></button>
              <button @click="handleClose"><i class="iconfont icon-a-icon-sq2x"></i></button>
            </div>
          </div>
        </template>
        <div class="chitchatBox">
          
          <!-- 聊天对话 -->
          <div class="chatContainer" ref="scrollTarget" v-if="chatDataArr.length>0">
            <div class="item" v-for="(item,index) in chatDataArr" :key="index">
              <div class="questionContainer" v-if="item.type==='USER'">
                <div class="avatarWrap userAvatarWrap">
                  <div class="questionAnswerCon">
                    <div class="content">{{item.content}}<span class="userIcon"><img :src="userInfo.icon" :onerror="onerrorImg" alt=""></span></div>
                  </div>
                </div>
              </div>
              <div class="answerContainer" v-if="item.type==='ASSISTANT'">
                <div class="avatarWrap aiAvatarWrap">
                  <div class="answerCon">
                    <div class="content">
                      <span class="serverIcon"></span>
                      {{isSend}}{{index}}{{chatDataArr.length-1}}
                      <div v-if="isSend&&index===chatDataArr.length-1">
                        <div v-if="compiledMarkdown!==''" class="markdown-body" :class="{ 'show-cursor': isTypingDone, 'hide-cursor': !isTypingDone }">
                          <span ref="textElement" v-html="md.render(compiledMarkdown)" class="text"></span>
                        </div>
                        
                      </div>
                      <div v-else>
                        <div class="markdown-body">
                          <div v-html="md.render(item.content)"></div>
                        </div>
                      </div>
                      <div v-if="item.cardDetails&&isTypewriting">
                        <router-link :to="item.cardDetails.link" target="_blank">
                          <div class="cardBox">
                            <div class="cardCon">
                              <div class="lImg"><img :src="item.cardDetails.coverUrl"/></div>
                              <div class="rText">
                                <div class="tit">{{item.cardDetails.name}}</div>
                                <div class="text"><span class="ft-16 ft-cl-err">￥{{(Number(item.cardDetails.price)/100).toFixed(2)}}</span></div>
                              </div>
                            </div>
                            <div class="footText">
                              <span>共{{item.cardDetails.cataTotalNum}}节</span>
                              <span>有{{item.cardDetails.studyNum}}人在学习</span>
                            </div>
                          </div>
                        </router-link>
                      </div>
                      <div class="conIconBox">
                        <span class="praiseIcon" :class="isPraise?'isPraise':''" @click="handlePraise"><i class="iconfont icon-a-dianzan2x"></i></span>
                        <span class="treadIcon" @click="handleTread"><i class="iconfont icon-a-diancai2x"></i></span>
                        <span class="playIcon" @click="handlePlay"><i class="iconfont icon-a-yuyinbofang2x"></i></span>
                        <span class="copyIcon" @click="handleCopy"><i class="iconfont icon-a-fuzhi2x"></i></span>
                        <span class="updateIcon" @click="handleUp" v-if="index===chatDataArr.length-1&&!outputLoading"><i class="iconfont icon-a-zhongxinshengcheng2x"></i></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- <div v-if="compiledMarkdown!==''" class="markdown-body" :class="{ 'show-cursor': isTypingDone, 'hide-cursor': !isTypingDone }">
              <span ref="textElement" v-html="compiledMarkdown" class="text"></span>
            </div> -->
            <div v-if="isLoading" class="answerContainer answerLoad"><span class="serverIcon"></span>给我点时间，我正在思考你的问题...</div>
          </div>
          <!-- end -->
          <!-- 初次进入对话弹层 -->
          <div v-else-if="baseData" class="baseBox">
            <div class="chatLogo"><img src="@/assets/icon03.gif" /></div>
            <div class="head">
              <div class="font tit">{{baseData.title}}</div>
              <div class="subTit">{{baseData.describe}}</div>
            </div>
            <div class="newQuestion">
              <div class="tit">
                <div class="lRight">试试这样问我：</div>
                <div class="barter"><span @click="handleUpdate"><i class="iconfont icon-a-icon-hyh2x"></i>换一换</span></div>
              </div>
            </div>
            <div class="newList">
              <div class="item" v-for="(item,index) in baseData.examples" :key="index">
                <span class="icon" :class="'iconTj'+index"></span>
                <div class="tit">{{item.title}}</div>
                <div class="text">{{item.describe}}</div>
              </div>
            </div>
          </div>
          
          <!-- end -->
          <div class="dialogForm">
            <div class="dialogCon">
              <!-- 聊天表单 -->
            <div class="textarea">
              <!-- <el-input type='textarea' :autosize="{ minRows: 1, maxRows: 5 }" maxlength="10000" :show-word-limit="textVal.length>9500" :class="textVal.length>9500?'textPad':''" v-model="textVal" @keydown.enter.prevent="onEnter" @keydown="handleKeyDown" @input="handleInput" placeholder="请将您的问题告诉我，Shift+Enter换行" :style="{ minHeight: '30px', maxHeight: '300px' }" autocomplete="off"></el-input> -->
              <textarea :autosize="{ minRows: 1, maxRows: 5 }" maxlength="10000" :show-word-limit="textVal.length>9500" :class="textVal.length>9500?'textPad':''" v-model="textVal" @keydown.enter.prevent="onEnter" @keydown="handleKeyDown" @input="handleInput" placeholder="请将您的问题告诉我，Shift+Enter换行" :style="{ minHeight: '30px', maxHeight: '300px' }" autocomplete="off"></textarea>
            </div>
            <!-- end -->
            <!-- 操作按钮 -->
            <div class="dialogFooter">
              <div class="leftInfo">
                <span class="uploadImgIcon" @click="handleUpdateImg"><i class="iconfont icon-tupian"></i></span>
                <span class="uploadTextIcon" @click="handleUpdateText"><i class="iconfont icon-a-wenjianjia1"></i></span>
              </div>
              <div class="rightInfo">
                <span class="voiceIcon" @click="handleUpdateYy"><i class="iconfont icon-yuyin"></i></span>
                <span class="line"></span>
                <el-button class="stopIcon" @click="handleStop" v-if="outputLoading"><span class="bg"></span><span class="btn"></span></el-button>
                
                <el-button class="sendIcon" v-else @click="handleSend" @keyup.enter.prevent="handleEnter" :disabled="!textVal"><span class="bg"></span><span class="btn"></span></el-button>

              </div>
            </div>
            <!-- end -->
            </div>
          </div>
        </div>
      </el-dialog>
      <!-- end -->
  </div>
</template>
<script setup>
import Footer from "@/components/Footer.vue";
import Header from "@/components/Header.vue";
import { onMounted, onUnmounted, ref, watchEffect, computed, nextTick, watch } from "vue";
import { useRoute, useRouter } from 'vue-router'
import { ElMessage} from "element-plus";
import { useUserStore } from "@/store";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { getClassDetails } from "@/api/classDetails.js";

import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js/lib/core';
// 导入语言模块和支持的表情符号
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/monokai-sublime.css'; // 选择你喜欢的主题
// import emojiPlugin from 'markdown-it-emoji';
import tocPlugin from 'markdown-it-table-of-contents';
import anchorPlugin from 'markdown-it-anchor';
import defaultImage from '@/assets/icon.jpeg'
// import markdownContent from '@/assets/your-markdown-file.md';
// 获取接口
import { newSession, getChat, getChatHistory } from "@/api/intelligent.js";
const store = useUserStore(); //新建会话时把获取的信息存起来
const router = useRouter()
const route = useRoute()
const isShow = ref(false); // 默认小图显示
const dialogVisible = ref(false); //对话弹层
const outputLoading = ref(false); //ai内容生成中
const isTypewriting = ref(false) //打字是否结束
const textVal = ref(""); //表单内容
const chatDataArr = ref([]); //聊天内容
const scrollTarget = ref(null); //对话框的ref
const baseData = ref({});
// const recognitionResult = ref("");
const isLoading = ref(false);
const currentIndex = ref(0);
const textData = ref("");
const typingSpeed = ref(80); //打字速度，单位毫秒
const typingDone = ref(false);
const typingInterval = ref(null); //定时器
const isSend = ref(false)
// 初始化 markdown-it 实例并添加插件
const textElement = ref(null);
const isPraise = ref(false) //是否点过赞
const detailsId = ref(null)//详情页id
const hrefLink = ref(null)
const userInfo = ref(store.getUserInfo) //用户数据
const token = store.token
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
// 自定义渲染器：重写 h1, h2, h3 标签的渲染规则，并去除空格
['h1', 'h2', 'h3'].forEach(tag => {
  md.renderer.rules[`${tag}_open`] = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    
    // 添加额外的属性、类名等
    return `<${token.tag} class="custom-${tag}">`;
  };

  md.renderer.rules[`${tag}_close`] = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    return `</${token.tag}>`;
  };

  // 修改文本内容去除首尾空格
  md.renderer.rules[`${tag}`] = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    if (token.type === `${tag}`) {
      // 去除首尾空格
      token.content = token.content.trim();
    }
    return self.renderToken(tokens, idx, options);
  };
});
// 自定义渲染规则，针对链接标签
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      // 添加 target="_blank" 和 rel="noopener" 到所有的 <a> 标签
      tokens[idx].attrPush(['target', '_blank']);
      tokens[idx].attrPush(['rel', 'noopener']);
      // console.log(tokens, idx, options, env, self)
      
      // // 可选：如果你需要对某些特定的链接做例外处理，可以在这里添加逻辑
      // let href = null;
      // if (tokens[idx].attrs) {
      //   for (let i = 0; i < tokens[idx].attrs.length; i++) {
      //     if (tokens[idx].attrs[i][0] === 'href') {
      //       href = tokens[idx].attrs[i][1];
      //       break;
      //     }
      //   }
      // }

      // if (href) {
      //   // 解析查询字符串部分以找到 id 参数
      //   const urlParams = new URLSearchParams(href.split('?')[1]);
      //   const id = urlParams.get('id');

      //   if (id) {
      //     // 将提取到的 id 添加到数组中
      //     // extractedIds.value.push(id);
      //     console.log(id,1111)
      //     if(isSend.value){
      //       // ids.value.push(id)
      //       // console.log(ids.value)
      //       // detailsId.value = id
      //       hrefLink.value = href //获取详情的路由连接
      //     }
      //   }

        
      // }
      // 使用默认的方式渲染标签
      return self.renderToken(tokens, idx, options);
};
const ids = ref([])
const compiledMarkdown = ref('');
const markdownData =ref('')//md代码
const isTypingDone = computed(
  () => !typingDone.value && compiledMarkdown.value.length > 0
);
onMounted(() => {
  window.addEventListener("keydown", handleEnter);
  clearInterval(typingInterval.value);
  // 本地么有存储sessionId需要重新获取
  baseData.value=store.sessionInfo?store.sessionInfo:{}
  if (baseData.value===null||baseData.value.sessionId===undefined) {
    getSession();
  }else{
    if(store.chatDataList){
      chatDataArr.value =store.chatDataList
      nextTick(()=>{
        scrollToBottom()
        // targetLind()
      })
      console.log(chatDataArr.value)
    }
  }
  
});
// // 给默认聊天数组的超连接加上_blank，以新窗口打开
// const targetLind = ()=>{
//   if(scrollTarget.value){
//           const links = scrollTarget.value.querySelectorAll('a');
//           links.forEach(function(link) {
//             link.setAttribute("target", "_blank");
            
//           });
//         }
// }


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
const planData = ref() //课程详情
// 获取课程详情
const getCourseLearningData = async (id) => {
  await getClassDetails(id)
  .then((res) => {
    const { data } = res
    if (res.code === 200 && data) {
      planData.value = data
    }
    chatDataArr.value.forEach((ele)=>{
      if(ele.type==='ASSISTANT'){
        ele.cardDetails=planData.value
      }
    })
    store.setChatDataList(chatDataArr.value)
  })
  .catch(() => {
    ElMessage({
      message: "用户学习信息数据请求出错！",
      type: 'error'
    });
  });
}
// 创建新对话
const handleCread=()=>{
  // 清空本地对话的数据
  if(chatDataArr.value.length>0){
    baseData.value ={}
    chatDataArr.value=[]
    store.setSessionInfo({})
    store.setChatDataList([])
    getSession()
  }
  
}
// 点击小图显示大图
const handleClick = () => {
  isShow.value = false;
};

// 点击关闭大鸡
const handleBigClose=(event)=>{
  event.preventDefault()
  dialogVisible.value=false
  isShow.value = true;
}
// 打开对话弹层
const handleBtn = (event) => {
  event.preventDefault()
  if(token){
    dialogVisible.value = true;
    isShow.value = false;
  }else{
    router.push('/login')
  }
  
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
  textVal.value = textVal.value.replace(/\s+/g, '');
  if(textVal.value==='') return
  isLoading.value = true;
  outputLoading.value = true
  
  const userObj = {
    type:'USER',
    content:textVal.value
  }
  
  chatDataArr.value.push(userObj)
  store.setChatDataList(chatDataArr.value)
  // const params = {
  //   sessionId: baseData.value.sessionId,
  //   q: textVal.value,
  // };
  if(baseData.value===undefined) return
  
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

      onmessage(msg) {
        
        isSend.value = true
        if (msg.data === "&complete&") {
          ctrl.abort(); // 结束会话
          isLoading.value = false;
          // 获取的后台内容
         findATagsWithAttributes(markdownData.value)
         if(detailsId.value){
            getCourseLearningData(detailsId.value)
          }
          const assistantObj = {
            type:'ASSISTANT',
            content:textData.value,
            link:detailsId.value?'#/details/index?id='+detailsId.value:null,
            courseId:detailsId.value?detailsId.value:null
          }
        chatDataArr.value.push(assistantObj)
        store.setChatDataList(chatDataArr.value)
        // typeWriterEffect(textElement.value, markdownData.value, 50); // 调整延迟时间
        
       return; 
        
        }else{
        
        // textData.value +=msg.data;
        const receivedMarkdownFragment = msg.data;
        appendAndType(receivedMarkdownFragment);
        // markdownData.value = md.render(textData.value);
        console.log(textData.value)
        // console.log(compiledMarkdown.value)
        // console.log(markdownData.value)
          compiledMarkdown.value= ''
          // typeWriterEffect(textData.value); // 调整延迟时间

        
        // markdownData.value=findATagsWithAttributes(markdownData.value)
        
        // isSend.value = true
        // console.log(compiledMarkdown.value)
        // setInterval(()=>{
        //   isLoading.value = false;
        //   clearInterval()
        // },1000)
        }
        
        
        
      },
      onclose() {
        // textData.value=''
        // markdownData.value = ''
        // compiledMarkdown.value=''
        detailsId.value=null
        console.log('guanle')
        ctrl.abort(); // 结束会话
        // ctrl.close(); // 结束会话
      },
      onerror(err) {
        isLoading.value = false;
        ctrl.abort(); // 结束会话
        // ctrl.close(); // 结束会话
      },
    }
  );
  //  发送后清空表单
  textVal.value = "";
};
// 给回答后的数据a标签加上btarget=_blank，用新窗口打开
const findATagsWithAttributes=(htmlString)=> {
  console.log(htmlString)
  // 使用正则表达式匹配 <a> 标签，确保不重复添加 target 属性
    htmlString.replace(/<a([^>]*)>/gi, (match, $1) => {
    // 检查是否已经有 target 属性
    console.log(getId(match.toString()),1589)
    detailsId.value=getId(match.toString())
    // return getId(match.toString())
    
  });

}
const getTextBetweenChars=(str, startChar, endChar)=> {
  const startIndex = str.indexOf(startChar);
  if (startIndex === -1) return ''; // 如果起始字符不存在，返回空字符串

  const endIndex = str.indexOf(endChar, startIndex + 1);
  if (endIndex === -1) return ''; // 如果结束字符不存在，返回空字符串

  return str.substring(startIndex + 1, endIndex); // 返回起始字符和结束字符之间的部分
}
// 获取id
const getId = (link)=>{
  getTextBetweenChars(link,'?','"')
    // 解析查询参数
    const urlParams = new URLSearchParams(getTextBetweenChars(link,'?','"'));
    const id = urlParams.get('id');
    const courseId = urlParams.get('courseId');
    return id?id:courseId
}
const markdownContent = ref('');
const appendAndType = (fragment)=>{
  // 如果当前有正在运行的打字机效果，则等待其完成
  if (typingInterval.value) {
        clearInterval(typingInterval.value);
  }
 // 将新的 Markdown 片段追加到现有的内容后面
      const existingContent = markdownContent.value;
      markdownContent.value = existingContent + fragment;

      // 应用打字机效果到新追加的部分
      typeWriterEffect(fragment, 50);

      // 立即更新已有的内容，以便开始新的打字机效果
      compiledMarkdown.value = md.render(existingContent);
      console.log(compiledMarkdown.value,11112222)
}
// vue3+markdown +sse实现markdown 格式的内容，实现打字机效果
const typeWriterEffect=(newText, delay)=> {
  let index = 0;
  typingInterval.value = setInterval(() => {
    if (index < newText.length) {
      markdownContent.value += newText.charAt(index++);
      compiledMarkdown.value = md.render(markdownContent.value);
    } else {
      clearInterval(typingInterval.value);
    }
  }, delay);
  // typingInterval.value = setInterval(() => {
    
  //   if (index.value < text.length) {
  //     console.log(index,text)
  //     compiledMarkdown.value += text.charAt(index);
  //     index++;
  //   } 
  //   // else {
  //   //   console.log(index,text)
  //   //   index.value = 0
  //   //   isTypewriting.value = true
  //   //   outputLoading.value = false
  //   //   clearInterval(typingInterval.value);
  //   //   // ctrl.abort(); // 结束会话
  //   // }
  //   scrollToBottom()
  // }, delay)
  };
  const scrollToBottom = ()=>{
    const scrollTar = scrollTarget.value;
    if (scrollTar) {
        scrollTar.scrollTop = scrollTar.scrollHeight;
    }
}
// 停止生成
const handleStop = () => {
  // if (typingDone.value) {
    outputLoading.value = false
    // isSend.value = false
    clearInterval(typingInterval.value);
    chatDataArr.value[chatDataArr.value.length-1].content = compiledMarkdown.value
    store.setChatDataList(chatDataArr.value)
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
  if(e.target.value!==undefined){
    textVal.value = e.target.value.replace(/\s+/g, '');
    if (textVal.value !== "" && !e.shiftKey) {
      if (e.keyCode === 13 || e.keyCode === 108) {
        clearInterval(typingInterval.value);
        scrollToBottom()
        handleSend();
      }
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

// 默认头像
const onerrorImg = () => {
  userInfo.value.icon = defaultImage;
}
// 换一换
const handleUpdate=()=>{
  ElMessage({
      message: "此功能暂未开发！",
      type: 'warning'
    });
}
// 上传图片
const handleUpdateImg=()=>{
  handleUpdate()
}
// 上传图片
const handleUpdateText=()=>{
  handleUpdate()
}
// 上传图片
const handleUpdateYy=()=>{
  handleUpdate()
}
// 历史记录
const handleHistory=()=>{
  handleUpdate()
}
// 右侧窗口吸附
const handleRight=()=>{
  handleUpdate()
}
// 全屏
const handleMagnify=()=>{
  handleUpdate()
}
// handlePraise\handleTread\handlePlay\handleCopy\handleUp
// 点赞
const handlePraise=()=>{
  isPraise.value = true
  handleUpdate()
}
// 点踩
const handleTread=()=>{
  handleUpdate()
}
// 语音播放
const handlePlay=()=>{
  handleUpdate()
}
// 复制
const handleCopy=()=>{
  handleUpdate()
}
// 更新
const handleUp=()=>{
  handleUpdate()
}
onUnmounted(()=>{
  ctrl.abort(); // 结束会话
  // ctrl.close(); // 结束会话
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
<style lang="scss">
.el-popper{
  &.box-item{
    padding: 10px 20px;
    text-align:center;
    line-height: 18px;
    &.is-dark{
    background-image: linear-gradient(268deg, #43B7FC 10%, #9A20F7 100%) !important;
    box-shadow: 0 2px 7px 0 #002db636 !important;
    border-radius: 11px 11px 11px 0 0 0 11px !important;
    border: 0 none;
    &>.el-popper__arrow:before{
        background:#6c70f9!important;
        border: 0 none;
        box-shadow: none;
      }
    }
  }
}
</style>