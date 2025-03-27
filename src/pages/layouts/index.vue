<!-- 架构页面 -->
<template>
  <div class="layoutsWrapper fx-fd-col" @click.stop="handleHidePopover">
    <div id="interactive-area">
      <Header></Header>
      <router-view class="fx-1" />
      <Footer></Footer>
    </div>

    <div class="aiSupernatant">
      <!-- 大图 -->
      <div v-if="!isShow && !dialogVisible" class="superCon">
        <el-tooltip
          popper-class="box-item"
          effect="dark"
          content=""
          placement="top"
        >
          <template #content>
            <div v-if="token">哈！天机不可泄露<br />除非你来问我</div>
            <div v-else>哇！我是天机AI助理<br />你没有登录可不能和我聊哦～</div>
          </template>
          <div>
            <span @click="handleBigClose" class="close"
              ><i class="iconfont icon-a-icon-close2x"></i
            ></span>
            <div @click="handleBtn">
              <div class="bigIcon"></div>
            </div>
          </div>
        </el-tooltip>
      </div>
      <!-- end -->
      <!-- 小图 -->
      <div
        v-if="isShow && !dialogVisible"
        class="smallIcon"
        @click="handleClick"
      >
        <span class="icon"></span>
      </div>
      <!-- end -->
    </div>
    <!-- 对话弹层 -->
    <el-dialog
      v-model="dialogVisible"
      modal-class="superDialog"
      custom-class="custom-dialog"
      title=""
      draggable
      @close="handleClose"
      :close-on-click-modal="false"
      :show-close="false"
      :modal="false"
      :lock-scroll="false"
    >
      <template #header>
        <div class="dialogHeader" @mousedown="startDrag">
          <div :id="titleId" class="title">
            <span class="font">天机AI助理</span>
            <button
              :class="
                chatDataArr.length === 0 || outputLoading ? 'disabled' : ''
              "
              @click="handleCread"
            >
              <i class="iconfont icon-a-icon-cjhh2x"></i>创建会话
            </button>
            <button
              @click.stop="handleHistory"
              :disabled="historyData.length === 0"
            >
              <i class="iconfont icon-a-icon-lsjl2x"></i>历史记录
            </button>
          </div>
          <div class="text">
            <el-tooltip
              class="box-item"
              effect="dark"
              content="右侧窗口吸附"
              placement="top"
            >
              <button @click="handleRight">
                <i class="iconfont icon-a-icon-yc2x"></i>
              </button>
            </el-tooltip>
            <el-tooltip
              class="box-item"
              effect="dark"
              content="全屏"
              placement="top"
            >
              <button @click="handleMagnify">
                <i class="iconfont icon-a-icon-qp2x"></i>
              </button>
            </el-tooltip>
            <el-tooltip
              class="box-item"
              effect="dark"
              content="最小化"
              placement="top"
            >
              <button @click="handleClose">
                <i class="iconfont icon-a-icon-sq2x"></i>
              </button>
            </el-tooltip>
          </div>
        </div>
      </template>
      <div class="chitchatBox">
        <el-popover
          popper-class="historyClass"
          :visible="visible"
          :virtual-ref="historyRef"
          @hover.stop
          trigger="manual"
          title=""
          :teleported="false"
        >
          <div class="historyCon" @click.stop>
            <div class="list">
              <ul class="first">
                <li v-for="(item, index) in historyData" :key="index">
                  <div class="title">
                    <span>{{ item.title }}</span>
                  </div>
                  <ul class="two">
                    <li
                      v-for="(val, i) in item.list"
                      :key="i"
                      :class="isActive === index + '-' + i ? 'active' : ''"
                      @click.stop="handleActive(val.sessionId, index, i)"
                    >
                      <div class="acInput">
                        <el-input
                          v-model="val.title"
                          v-if="isActive === index + '-' + i && isClickEdit"
                          @click.stop="handleAiInput"
                          @input="handleAiInput"
                          @keydown.enter.prevent="handleAiInput"
                          @keyup="handleAiInput"
                          @keypress="handleAiInput"
                        ></el-input>
                        <span v-else>{{ val.title }}</span>
                        <div class="rIcon">
                          <span
                            v-if="isActive === index + '-' + i && isClickEdit"
                          >
                            <i
                              class="saveIcon"
                              @click.stop="handleSave(val)"
                            ></i>
                            <i
                              class="cancelIcon"
                              @click.stop="handleCancel"
                            ></i>
                          </span>
                          <span v-else>
                            <i
                              class="editIcon"
                              @click.stop="handleEdit(val.sessionId, index, i)"
                            ></i>
                            <i
                              class="delectIcon"
                              @click.stop="
                                handleDelect(val.sessionId, index, i)
                              "
                            ></i>
                          </span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
            <div class="totleNum">仅展示最近30条对话</div>
          </div>
        </el-popover>
        <div>
          <audio
            ref="audioElement"
            :src="audioUrl"
            @loadeddata="onAudioLoaded"
            @ended="onAudioEnded"
            @timeupdate="updateHighlight"
          ></audio>
          <div
            v-for="(word, index) in textArray"
            :key="index"
            :class="{ highlight: currentWordIndex === index }"
          >
            {{ word }}
          </div>
          <!-- <button @click="playAudio">播放</button>
          <button @click="pauseAudio">暂停</button>
          <p>音频状态: {{ isAudioLoaded ? '已加载' : '加载中...' }}</p> -->
        </div>
        <!-- 聊天对话 -->
        <div
          v-if="chatDataArr.length > 0"
          ref="scrollContainer"
          class="chitchatCon"
        >
          <div class="scrollBox" style="flex: 1; overflow: auto; width: 100%">
            <div
              ref="scrollTarget"
              class="chatContainer"
              :class="isScroll ? 'chatOverflow' : ''"
              @scroll="handleScroll"
            >
              <div
                class="item"
                v-for="(item, index) in chatDataArr"
                :key="index"
              >
                <div class="questionContainer" v-if="item.type === 'USER'">
                  <div class="avatarWrap userAvatarWrap">
                    <div class="questionAnswerCon">
                      <div class="content">
                        {{ item.content
                        }}<span class="userIcon"
                          ><img
                            :src="userInfo.icon"
                            :onerror="onerrorImg"
                            alt=""
                        /></span>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="answerContainer"
                  v-if="
                    item.type === 'ASSISTANT' &&
                    (compiledMarkdown !== '' || item.content !== '')
                  "
                >
                  <div class="avatarWrap aiAvatarWrap">
                    <div class="answerCon">
                      <div class="content">
                        <span
                          class="serverIcon"
                          v-if="compiledMarkdown !== '' || item.content !== ''"
                        ></span>
                        <div v-if="isSend && index === chatDataArr.length - 1">
                          <div
                            v-if="compiledMarkdown !== ''"
                            class="markdown-body"
                            :class="{
                              'show-cursor': isTypingDone,
                              'hide-cursor': !isTypingDone,
                            }"
                          >
                            <div
                              ref="textElement"
                              v-html="compiledMarkdown"
                              class="text"
                            ></div>
                          </div>
                        </div>
                        <div
                          v-else-if="item.content !== ''"
                          style="display: flex"
                        >
                          <div class="markdown-body">
                            <div
                              v-html="md.render(item.content)"
                              class="htmlBody"
                            ></div>
                          </div>
                        </div>
                        <!-- 订单 -->
                        <div
                          v-if="
                            item.cardOrderDetails &&
                            item.cardOrderDetails.length > 0 &&
                            item.cardType === 1
                          "
                          class="orderCard"
                        >
                          <div class="cardList">
                            <div
                              v-for="(value, i) in item.cardOrderDetails"
                              :key="i"
                              class="item"
                            >
                              <router-link
                                :to="'/details/index?id=' + value.id"
                                target="_blank"
                              >
                                <div class="cardBox">
                                  <div class="cardCon">
                                    <div class="lImg">
                                      <img :src="value.coverUrl" />
                                    </div>
                                    <div class="rText">
                                      <div class="tit">{{ value.name }}</div>
                                      <div class="text">
                                        <span class="ft-16 ft-cl-err"
                                          >￥{{
                                            (Number(value.price) / 100).toFixed(
                                              2
                                            )
                                          }}</span
                                        >
                                      </div>
                                    </div>
                                  </div>
                                  <div class="footText">
                                    <span>共{{ value.cataTotalNum }}节</span>
                                    <span>{{
                                      value.validDuration === 9999
                                        ? '永久有效'
                                        : dayFormat(value.purchaseEndTime) +
                                          '到期'
                                    }}</span>
                                  </div>
                                </div>
                              </router-link>
                            </div>
                            <div class="cardInfo" v-if="item.orderText">
                              <div class="text">
                                <span>订单总价：</span>￥{{
                                  item.orderText.totalAmount.toFixed(2)
                                }}
                              </div>
                              <div class="text">
                                <span>优惠券：</span
                                >{{
                                  item.orderText.couponName
                                    ? item.orderText.couponName
                                    : '无'
                                }}
                              </div>
                              <div class="text">
                                <span>优惠金额：</span>￥{{
                                  item.orderText.discountAmount.toFixed(2)
                                }}
                              </div>
                              <div class="text">
                                <span>实付金额：</span
                                ><span class="ft-cl-err"
                                  >￥{{
                                    item.orderText.payAmount.toFixed(2)
                                  }}</span
                                >
                              </div>
                            </div>
                            <div class="cardBtn">
                              <span
                                class="bt"
                                @click="handleOrder(item.orderText)"
                                >立即下单</span
                              >
                            </div>
                          </div>
                        </div>
                        <!-- end -->
                        <!-- 卡片-->
                        <div
                          v-else-if="
                            item.cardDetails && item.cardDetails.length > 0
                          "
                          class="cardList"
                        >
                          <div
                            v-for="(value, i) in item.cardDetails"
                            :key="i"
                            class="item"
                          >
                            <router-link
                              :to="'/details/index?id=' + value.id"
                              target="_blank"
                            >
                              <div class="cardBox">
                                <div class="cardCon">
                                  <div class="lImg">
                                    <img :src="value.coverUrl" />
                                  </div>
                                  <div class="rText">
                                    <div class="tit">{{ value.name }}</div>
                                    <div class="text">
                                      <span class="ft-16 ft-cl-err"
                                        >￥{{
                                          value.price === 0
                                            ? 0
                                            : (
                                                Number(value.price) / 100
                                              ).toFixed(2)
                                        }}</span
                                      >
                                    </div>
                                  </div>
                                </div>
                                <div class="footText">
                                  <span>共{{ value.cataTotalNum }}节</span>
                                  <span>有{{ value.studyNum }}人在学习</span>
                                </div>
                              </div>
                            </router-link>
                          </div>
                        </div>

                        <div
                          class="conIconBox"
                          v-if="
                            (compiledMarkdown !== '' && isEnd) ||
                            item.content !== ''
                          "
                        >
                          <span
                            class="praiseIcon"
                            :class="isPraise ? 'isPraise' : ''"
                            @click="handlePraise"
                            ><i class="iconfont icon-a-dianzan2x"></i
                          ></span>
                          <span
                            class="treadIcon"
                            :class="isTread ? 'isTread' : ''"
                            @click="handleTread"
                            ><i class="iconfont icon-a-diancai2x"></i
                          ></span>
                          <span class="playIcon">
                            <span v-if="isPlaying && playIndex === index">
                              <div
                                class="toolTip"
                                v-if="showStopTooltip && isIconShow === index"
                              >
                                停止语音播报<span class="arrow"></span>
                              </div>
                              <i
                                @click="pauseAudio(item.content, index)"
                                @mouseenter="handleIconMouseenter(1, index)"
                                @mouseleave="handleIconMouseleave(1, index)"
                                class="iconfont icon-a-yuyinbofangzanting2x"
                              ></i>
                            </span>
                            <span v-else>
                              <i
                                @click="handlePlay(item.content, index)"
                                @mouseenter="handleIconMouseenter(2, index)"
                                @mouseleave="handleIconMouseleave(2, index)"
                                class="iconfont icon-a-yuyinbofang2x"
                              ></i>
                              <div
                                class="toolTip"
                                v-if="showPlayTooltip && isIconShow === index"
                              >
                                语音播报<span class="arrow"></span>
                              </div>
                            </span>

                            <!-- <audio
                            id="audio"
                              ref="audio"
                              :src="audioUrl"
                              @loadeddata="onAudioLoaded"
                            ></audio> -->
                            <!-- <audio ref="audioElement" :src="audioUrl" @loadeddata="onAudioLoaded"  controls style="display:none"></audio> -->
                          </span>
                          <span
                            class="copyIcon"
                            @mouseenter="handleIconMouseenter(3, index)"
                            @mouseleave="handleIconMouseleave(3, index)"
                            v-clipboard="item.content"
                            ><i
                              class="iconfont icon-a-fuzhi2x"
                              @click="handleCopy"
                            ></i>
                            <div
                              v-if="showCopyTooltip && isIconShow === index"
                              class="toolTip"
                            >
                              复制<span class="arrow"></span>
                            </div>
                          </span>
                          <span
                            class="updateIcon"
                            @mouseenter="handleIconMouseenter(4, index)"
                            @mouseleave="handleIconMouseleave(4, index)"
                            v-if="
                              index === chatDataArr.length - 1 && !outputLoading
                            "
                            ><i
                              @click="handleUp()"
                              class="iconfont icon-a-zhongxinshengcheng2x"
                            ></i>
                            <div
                              v-if="showUpdateTooltip && isIconShow === index"
                              class="toolTip"
                            >
                              重新生成<span class="arrow"></span>
                            </div>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 高亮显示的文本 -->
              </div>
              <div class="recommendList" v-if="questionList.length > 0">
                <div
                  v-for="(val, index) in questionList"
                  :key="index"
                  class="item"
                  @click="handleNew(val)"
                >
                  <div class="text"><div class="bg">{{ val }}</div></div>
                </div>
              </div>
              <!--  -->
              <div v-if="isLoading" class="answerContainer answerLoad">
                <div class="aiAvatarWrap">
                  <span class="serverIcon"></span
                  >给我点时间，我正在思考你的问题<span
                    class="three-dots"
                  ></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- end -->
        <!-- 初次进入对话弹层 -->
        <div v-else-if="baseData" class="baseBox">
          <div class="chatLogo"><img src="@/assets/pic-hello.png" /></div>
          <div class="head">
            <div class="font tit">{{ baseData.title }}</div>
            <div class="subTit">{{ baseData.describe }}</div>
          </div>
          <div class="newQuestion">
            <div class="tit">
              <div class="lRight">试试这样问我：</div>
              <div class="barter">
                <span @click="handleUpdateData"
                  ><i class="iconfont icon-a-icon-hyh2x"></i>换一换</span
                >
              </div>
            </div>
          </div>
          <div class="newList">
            <div
              class="item"
              v-for="(item, index) in examplesData"
              :key="index"
              @click="handleUpdete(item.describe)"
            >
              <span class="icon" :class="'iconTj' + index"></span>
              <div class="tit">{{ item.title }}</div>
              <div class="text">{{ item.describe }}</div>
            </div>
          </div>
        </div>

        <!-- end -->
        <div class="dialogForm">
          <div class="dialogCon">
            <!-- 聊天表单 -->

            <div class="textarea">
              <textarea
                ref="textareaRef"
                maxlength="3000"
                v-model="textVal"
                @keydown.enter.prevent="onEnter"
                @keydown="handleKeyDown"
                @input="handleInput"
                @focus="handleInput"
                @blur="questionVisible = false"
                @mouseenter="handleMouseEnter(2)"
                @mouseleave="handleMouseLeave(2)"
                class="hide-scrollbar"
                placeholder="请将您的问题告诉我，Shift+Enter换行"
                :style="{
                  height: dynamicHeight,
                  overflowY: overflowY,
                  resize: 'none',
                }"
                autocomplete="off"
              ></textarea>
            </div>
            <!-- end -->
            <!-- 操作按钮 -->
            <div class="dialogFooter">
              <div class="leftInfo">
                <span class="uploadImgIcon" @click="handleUpdateImg"
                  ><i class="iconfont icon-tupian"></i
                ></span>
                <span class="uploadTextIcon" @click="handleUpdateText"
                  ><i class="iconfont icon-a-wenjianjia1"></i
                ></span>
                <span
                  class="textNum"
                  :class="textVal.length > 2950 ? 'textShow' : ''"
                  ><span :class="textVal.length === 3000 ? 'red' : ''">{{
                    textNum
                  }}</span
                  >/3000</span
                >
              </div>
              <div class="rightInfo">
                <el-popover
                  v-if="!isMicrophoneGranted"
                  popper-class="microphoneVisible"
                  :visible="microphoneVisible"
                  title="尚未获得麦克风权限"
                  :show-arrow="false"
                >
                  <template #reference>
                    <div class="TooltipBox">
                      <span
                        class="tooltipBox"
                        v-if="tooltipVisible"
                        :class="
                          !tooltipVisible && timeoutStarted
                            ? 'fadeOut'
                            : 'fadeIn'
                        "
                        >语音输入<span class="triangle-up"></span
                      ></span>
                      <span
                        class="voiceIcon"
                        ref="AadioButtonRef"
                        @click="handleUpdateYy"
                        @mouseenter="handleAadioEnter"
                        @mouseleave="handleAadioLeave"
                        ><i class="iconfont icon-yuyin"></i
                      ></span>
                    </div>
                  </template>
                  <div class="con">
                    <p>
                      语音转文字功能需要开启浏览器的麦克风权限，请前网浏览器设置页面开启权限
                    </p>
                    <div class="forbidBg"><span class="icon"></span></div>
                  </div>
                  <div class="footBtn">
                    <span class="bt" @click="handleCloseMic">我知道了</span>
                  </div>
                </el-popover>
                <el-tooltip
                  v-else
                  class="box-item"
                  effect="dark"
                  content="停止语音输入"
                  placement="top"
                >
                  <div class="voice-container" @click="handleStopMicrophone">
                    <div
                      v-for="i in 5"
                      :key="i"
                      class="voice-line"
                      :style="{ '--i': Math.random() }"
                    ></div>
                  </div>
                </el-tooltip>
                <!-- <div class="voice-container">
                    <div class="voice-line"></div>
                    <div class="voice-line"></div>
                    <div class="voice-line"></div>
                    <div class="voice-line"></div>
                    <div class="voice-line"></div>
                  </div> -->

                <span class="line"></span>
                <el-button
                  class="stopIcon"
                  @click="handleStop"
                  v-if="outputLoading && compiledMarkdown !== ''"
                  ><span class="bg"></span><span class="btn"></span
                ></el-button>

                <el-button
                  class="sendIcon"
                  id="sendBtn"
                  v-else
                  @click="handleSend"
                  @keydown.enter.prevent="handleEnter"
                  :disabled="!textVal"
                  ><span class="bg"></span><span class="btn"></span
                ></el-button>
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
import Footer from '@/components/Footer.vue';
import Header from '@/components/Header.vue';
import axios from 'axios';
import {
  onMounted,
  onUnmounted,
  onUpdated,
  ref,
  watchEffect,
  computed,
  nextTick,
  unref,
  watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ElMessage,
  ElMessageBox,
  ClickOutside as vClickOutside,
} from 'element-plus';
import { useUserStore } from '@/store';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { getClassDetails } from '@/api/classDetails.js';
import { setOrder } from '@/api/order.js';
import { dayFormat } from '@/utils/tool.js';
// import sdk from "microsoft-cognitiveservices-speech-sdk";
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js'; // 只导入核心库
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import 'highlight.js/styles/monokai-sublime.css'; // 选择你喜欢的主题
import 'highlight.js/styles/github.css'; // GitHub风格
import 'highlight.js/styles/dark.css'; // Solarized Dark风格
import 'highlight.js/styles/github-dark-dimmed.css'; // 使用更美观的主题
// import emojiPlugin from 'markdown-it-emoji';
import tocPlugin from 'markdown-it-table-of-contents';
import anchorPlugin from 'markdown-it-anchor';
import defaultImage from '@/assets/icon.jpeg';
import defaultAudio from '@/assets/katiesteve.wav';
import 'highlight.js/styles/default.css'; // 你可以根据需要选择其他主题
import AzureTtsService from './azureTtsService';
import RecordRTC from 'recordrtc';
// import { recognizeSpeech } from './speechService.js';
// import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
// import markdownContent from '@/assets/your-markdown-file.md';
import { convertWebMToWav } from './audioConverter.js';
// 获取接口
import {
  newSession,
  newHot,
  updateSession,
  getChatHistoryList,
  getChatHistory,
  delectHistory,
  chatStop,
  audioTextStt,
  audioStt,
  getChatTemplates,
  getChatText,
  getChat,
} from '@/api/intelligent.js';
import { Failed } from '@element-plus/icons-vue';
import { Howl } from 'howler';
const store = useUserStore(); //新建会话时把获取的信息存起来
const router = useRouter();
const route = useRoute();
const isShow = ref(false); // 默认小图显示
const dialogVisible = ref(false); //对话弹层
const dialogRef = ref(null);
let isDragging = ref(false);
let startPos = { x: 0, y: 0 };
let offset = { x: 0, y: 0 };
const outputLoading = ref(false); //ai内容生成中
const isTypewriting = ref(true); //打字是否结束
const textVal = ref(''); //表单内容
const chatDataArr = ref([]); //聊天内容
const scrollTarget = ref(null); //对话框的ref
const scrollContainer = ref(null);
const baseData = ref({});
// const recognitionResult = ref("");
const isLoading = ref(false);
const currentIndex = ref(0);
const textData = ref('');
const typingSpeed = ref(80); //打字速度，单位毫秒
const typingDone = ref(false);
const isSend = ref(false);
const isEnd = ref(false); //内容是否展示完毕，用来显示点赞，更新按钮
// 初始化 markdown-it 实例并添加插件
const textElement = ref(null);
const isPraise = ref(false); //是否点过赞
const detailsId = ref(null); //详情页id
const hrefLink = ref(null);
const userInfo = ref(store.getUserInfo); //用户数据
const token = store.token;
const isClick = ref(false); //内容正在生成中，回车是否可以发送内容
const textareaRef = ref(false); //textarea设置ref
const textNum = ref(); //文本框输入的字数
const maxNum = ref(3000);
const dynamicHeight = ref('40px'); // 动态高度
const overflowY = ref('hidden'); // 滚动条控制
const maxLines = 5; // 最大显示行数

const audioUrl = ref(null);
const azureService = ref(null);

const isPlaying = ref(false);

const audioElement = ref(null);
const isAudioLoaded = ref(false);
const orderData = ref('');
// const orderStr = ref('');

const historyRef = ref(); //历史记录按钮ref
const popoverRef = ref(); //历史记录列表ref
const isActive = ref('');
const historyData = ref([]); //左侧菜单数据
const isClickEdit = ref(false); //是否出发了编辑按钮
const myPopover = ref(null);
const questionList = ref([]);
const showUpdateTooltip = ref(false); //控制更新提示框
const showCopyTooltip = ref(false); //控制复制提示框
const showPlayTooltip = ref(false); //控制播放提示框
const showStopTooltip = ref(false); //控制停止提示框
const isIconShow = ref(null);
const handleIconMouseenter = (type, index) => {
  isIconShow.value = index;
  if (type === 1) {
    showStopTooltip.value = true;
  } else if (type === 2) {
    showPlayTooltip.value = true;
  } else if (type === 3) {
    showCopyTooltip.value = true;
  } else {
    showUpdateTooltip.value = true;
  }
};
const handleIconMouseleave = (type, index) => {
  if (type === 1) {
    showStopTooltip.value = false;
  } else if (type === 2) {
    showPlayTooltip.value = false;
  } else if (type === 3) {
    showCopyTooltip.value = false;
  } else {
    showUpdateTooltip.value = false;
  }
};
// Azure 配置（建议存放到环境变量）
const azure = {
  key: 'REMOVED',
  region: 'eastasia',
};
const playIndex = ref(0);
const onAudioLoaded = () => {
  isAudioLoaded.value = true;
  console.log(isAudioLoaded.value);
};
const onAudioEnded = () => {
  console.log('音频播放已结束');
  isPlaying.value = false;
  audioUrl.value = null;
  // 在这里可以添加其他你需要执行的操作
};
// 注册语言
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);

// 初始化 markdown-it 实例并配置插件
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    // console.log(str, 1);
    // console.log(lang, 2);
    // console.log(hljs.getLanguage(lang), 3);
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="code-block"><code class="hljs ${lang}">${
          hljs.highlight(str, { language: lang }, true).value
        }</code></pre>`;
      } catch (__) {}
    }
    return `<pre class="code-block"><code class="hljs">${md.utils.escapeHtml(
      str
    )}</code></pre>`;
  },
  // highlight: function (str, lang) {
  //   if (lang && hljs.getLanguage(lang)) {
  //     try {
  //       // 去除多余空格
  //       const trimmedStr = str
  //         .split('\n')
  //         .map((line) => line.trimStart())
  //         .join('\n')
  //         .trim();
  //       return `<pre class="hljs"><code>${
  //         hljs.highlight(trimmedStr, { language: lang }).value
  //       }</code></pre>`;
  //     } catch (__) {}
  //   }

  //   return '';
  // },
})
  .use(tocPlugin)
  .use(anchorPlugin);
// 自定义渲染器：重写 h1, h2, h3 标签的渲染规则，并去除空格
['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'div', 'p'].forEach((tag) => {
  md.renderer.rules[`${tag}_open`] = function (
    tokens,
    idx,
    options,
    env,
    self
  ) {
    const token = tokens[idx];

    // 添加额外的属性、类名等
    return `<${token.tag} class="custom-${tag}">`;
  };

  md.renderer.rules[`${tag}_close`] = function (
    tokens,
    idx,
    options,
    env,
    self
  ) {
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
  // 使用默认的方式渲染标签
  return self.renderToken(tokens, idx, options);
};
// 覆盖默认的元素渲染规则、元素默认会有一行的空白间距
// 覆盖段落渲染规则
md.renderer.rules.paragraph_open = () => '<p>';
md.renderer.rules.paragraph_close = () => '</p>';

// 覆盖列表渲染规则
const orderedListRE = /^(\d+)\.\s*(.*)/;
md.renderer.rules.bullet_list_open = () => '<ul class="listUl">';
md.renderer.rules.bullet_list_close = () => '</ul>';
md.renderer.rules.list_open = () => '<ol>';
md.renderer.rules.list_close = () => '</ol>';
md.renderer.rules.list_item_close = () => '</li>';

// 覆盖代码块渲染规则
md.renderer.rules.code_block = (tokens, idx) => {
  const content = tokens[idx].content.trim();
  return `<pre><code>${content}</code></pre>`;
};
// 添加自定义规则
md.core.ruler.push('custom-class-rule', function (state) {
  const tokens = state.tokens;
  tokens.forEach((token) => {
    //  && token.level === 1
    if (token.type === 'heading_open') {
      // 为 h1 标签添加 custom-class 类
      token.attrSet('class', ['custom-class-tit']);
    } else if (token.type === 'bullet_list_open') {
      token.attrSet('class', ['custom-class-ullist']);
    } else if (token.type === 'ordered_list_open') {
      token.attrSet('class', ['custom-class-ollist']);
    }
  });
});

const ids = ref([]);
const compiledMarkdown = ref('');
// const compiledMarkdownData = ref('')
const markdownData = ref(''); //md代码
const isTypingDone = computed(
  () => !typingDone.value && compiledMarkdown.value.length > 0
);
// 获取 textarea 的行高（包含 padding）
const getLineHeight = (textareaRef) => {
  const style = window.getComputedStyle(textareaRef);
  const lineHeight = parseInt(style.lineHeight, 10);
  const paddingTop = parseInt(style.paddingTop, 10);
  const paddingBottom = parseInt(style.paddingBottom, 10);
  return lineHeight + paddingTop + paddingBottom;
};
// const compiledMarkdown = computed(
//   () => {
//       if(compiledMarkdownData.value!==''){
//         return md.render(compiledMarkdownData.value);
//       }

//   }
// );
// markdownContent.value
watch(compiledMarkdown, () => {
  // 在 DOM 更新后手动触发 highlight.js
  nextTick(() => {
    if (textElement.value) {
      document.querySelectorAll('pre code').forEach((block) => {
        // 移除 data-highlighted 属性以便重新高亮

        delete block.dataset.highlighted; // 移除 data-highlighted 属性
        if (!block.classList.contains('hljs')) {
          hljs.highlightBlock(block);
          console.log(block.classList.contains('hljs'));
        }
      });
    }
  });
});
onMounted(() => {
  if (!token) return;
  getList();
  getHotList();
  getTextType();
  baseData.value = store.sessionInfo ? store.sessionInfo : {};
  if (baseData.value === null || baseData.value.sessionId === undefined) {
    getSession();
  }
});
onUpdated(() => {
  // 在 DOM 更新后手动触发 highlight.js
  // nextTick(() => {
  //     document.querySelectorAll('pre code').forEach((block) => {
  //       // 移除 data-highlighted 属性以便重新高亮
  //       delete block.dataset.highlighted; // 移除 data-highlighted 属性
  //       hljs.highlightBlock(block);
  //     });
  // });
  scrollToBottom();
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
};
// newHot
// 获取热门问题
const examplesData = ref([]);
const getHotList = async () => {
  const res = await newHot({ n: 3 });
  examplesData.value = res.data;
};
// 获取历史记录列表
const getList = async (val) => {
  // 发送的时候不走详情接口，直接用保存在本地的数据
  const res = await getChatHistoryList();
  if (res.code === 200) {
    const datas = res.data;
    // 处理后端返回的数据
    const objectArray = Object.entries(datas).map(([key, value]) => ({
      title: key,
      list: value,
    }));
    historyData.value = objectArray.reverse();
    // if (!val && isActive.value === '0-0') {
    //   baseData.value.sessionId = historyData.value[0].list[0].sessionId;
    // }
    if (isActive.value !== '') {
      historyData.value.forEach((val, index) => {
        val.list.forEach((obj, i) => {
          if (obj.sessionId === baseData.value.sessionId) {
            isActive.value = index + '-' + i;
          }
        });
      });
    }
    //getListData(baseData.value.sessionId);
  }
};
// 文本聊天类型
const textTypeData = ref({});
const getTextType = async () => {
  const res = await getChatTemplates();
  if (res.code === 200) {
    textTypeData.value = res.data;
  }
};
// 获取历史记录详情
const listDataArr = ref([]);
const getDetails = async (id) => {
  const res = await getClassDetails(id).then((respon) => {
    return respon.data;
  });
  return res;
};
// 获取历史记录详情
const getListData = async (id) => {
  chatDataArr.value = [];
  const params = {
    sessionId: id,
  };
  const res = await getChatHistory(params);
  if (res.code === 200) {
    listDataArr.value = res.data;
    nextTick(async () => {
      let processedData = listDataArr.value.map(async (val) => {
        if (val.type === 'ASSISTANT') {
          // const dadaHtml = md.render(val.content);
          // const extractArr = extractStrings(val.content);
          if (val.params&&val.params.prePlaceOrder !== undefined) {
            // 处理订单逻辑
            let idsArray = val.params.prePlaceOrder.courseIds;
            let details = await Promise.all(
              idsArray.map((id) => getDetails(id))
            );
            return {
              ...val, // 保留原有的info和其他属性
              ids: idsArray, // 更新ids为数组
              orderText: val.params.prePlaceOrder,
              cardType: 1,
              cardOrderDetails: details, // 添加details属性
            };
          } else {
            // 卡片
            objArr.value = Object.values(val.params);
            let idsArray = [];
            if (objArr.value !== undefined) {
              idsArray = objArr.value.map((val) => val.id);
            }
            // 获取每个id的详情
            let details = await Promise.all(
              idsArray.map((id) => getDetails(id))
            );
            // 返回更新后的对象
            return {
              ...val, // 保留原有的info和其他属性
              ids: idsArray, // 更新ids为数组
              cardDetails: details, // 添加details属性
            };
          }
          // // // 获取的后台内容
          // // findATagsWithAttributes(markdownData.value);
          // if(objArr.value!==undefined){
          //   objArr.value.forEach((val)=>{
          //     planDataIds.value.push(val.id)
          //   })
          // }
          // if (extractArr.length > 0) {
          //   // const orderStr = extractArr[1].replace(/aram\|order\|/, '');
          //   // // 分割成键值对数组
          //   // const entries = orderStr.split('#');
          //   // // 转换为对象
          //   // const obj = entries.reduce((acc, entry) => {
          //   //   const [key, value] = entry.split('=');
          //   //   acc[key] = value !== '' ? value : null; // 如果值为空，则赋值为null或其他你认为合适的默认值
          //   //   return acc;
          //   // }, {});
          //   // let idsArray = obj.courseIds.split(',');
          //   // let details = await Promise.all(
          //   //   idsArray.map((id) => getDetails(id))
          //   // );
          //   // // 返回更新后的对象
          //   // val.content = removeSpecialSubstrings(val.content);
          //   // return {
          //   //   ...val, // 保留原有的info和其他属性
          //   //   ids: idsArray, // 更新ids为数组
          //   //   orderText: obj,
          //   //   cardType: 1,
          //   //   cardOrderDetails: details, // 添加details属性
          //   // };
          // } else {
          //   // 使用正则表达式匹配info字段中的所有ID
          //   let matches = md.render(dadaHtml).match(/id=(\d+)/g);
          //   // 提取ids
          //   let idsArray = matches
          //     ? matches.map((match) => match.replace('id=', ''))
          //     : [];
          //   // 获取每个id的详情

          //   let details = await Promise.all(
          //     idsArray.map((id) => getDetails(id))
          //   );
          //   // 返回更新后的对象
          //   return {
          //     ...val, // 保留原有的info和其他属性
          //     ids: idsArray, // 更新ids为数组
          //     cardDetails: details, // 添加details属性
          //   };
          // }
        } else {
          return {
            ...val,
          };
        }
      });
      chatDataArr.value = await Promise.all(processedData);
    });
  }
};
const planData = ref(); //课程详情
// 获取课程详情
const orderDetails = ref([]);
const getCourseLearningData = async (ids) => {
  orderDetails.value = [];
  ids.forEach(async (val) => {
    await getClassDetails(val)
      .then((res) => {
        const { data } = res;
        if (res.code === 200 && data) {
          planData.value = data;
          let arrs = chatDataArr.value[chatDataArr.value.length - 1];
          if (arrs.type === 'ASSISTANT' && arrs.cardType === 1) {
            orderDetails.value.push(data);
            arrs.cardOrderDetails = orderDetails.value;
          } else {
            arrs.cardDetails.push(data);
          }
          chatDataArr.value[chatDataArr.value.length - 1] = arrs;

          // store.setChatDataList(chatDataArr.value);
          nextTick(() => {
            scrollToBottom();
          });
        }
      })
      .catch(() => {
        ElMessage({
          message: '用户学习信息数据请求出错！',
          type: 'error',
        });
      });
  });
};
// 清理音频
const clearAudio = () => {
  audioElement.value.pause();
  audioUrl.value = '';
};
// 创建新对话
const handleCread = () => {
  isActive.value =''
  if (!token) {
    dialogVisible.value = false;
    return false;
  }
  if (outputLoading.value) return;
  // 清空本地对话的数据
  
  clearData();
  const times = setTimeout(() => {
    resTextHeight();
    clearTimeout(times);
  }, 0);
  clearAudio();
  // console.log(ctrl);
  if (ctrl) {
    ctrl.abort(); // 结束会话
    handleStop();
  }

  if (chatDataArr.value.length > 0) {
    // baseData.value = {};
    chatDataArr.value = [];
    store.setSessionInfo({});
    store.setChatDataList([]);
    getSession();
  }
};
// 点击小图显示大图
const handleClick = () => {
  isShow.value = false;
};

// 点击关闭大鸡
const handleBigClose = (event) => {
  event.preventDefault();
  dialogVisible.value = false;
  isShow.value = true;
};
const scrollShow=()=>{
  if (scrollTarget.value && scrollTarget.value.scrollHeight > 400) {
  isScroll.value = true;
  }else{
    isScroll.value = false;
  }
}
// 打开对话弹层
const handleBtn = (event) => {
  event.preventDefault();
  if (token) {
    const times = setTimeout(() => {
      scrollToBottom();
      clearTimeout(times);
    }, 150);
    dialogVisible.value = true;
    isShow.value = false;
    nextTick(()=>{
      scrollShow()
    })
    
  } else {
    router.push('/login');
  }
};
// 关闭弹层
const handleClose = () => {
  isShow.value = false;
  dialogVisible.value = false;
};
const eventSource = ref();
const ctrl = new AbortController();
// 发送信息
const extractStrings = (str) => {
  // 匹配以 & 开头、以 # 结束的字符串
  const matches = str.match(/&param|[^&]+&/g);

  if (!matches) {
    return []; // 没有匹配项时返回空数组
  }

  // 去掉 & 和 #，提取内容
  return matches.map((match) => match.slice(1, -1));
};
// const removeSpecialSubstrings = (str) => {
//   // 使用正则表达式匹配以&开头以#结尾的子串，并替换为空字符串
//   const regex = /&param[^&]*&/g;
//   return str.replace(regex, '');
// };
// // 保存标题
// const handleSaveTit = async () => {
//   const data = chatDataArr.value[0];
//   const params = {
//     sessionId: baseData.value.sessionId,
//     title: data.content,
//   };
//   await saveSession(params);
// };
const objArr = ref([]);
const prePlaceOrder = ref({});
const isClickBtn = ref(false); //禁止连续发送信息
const isScroll = ref(false);
const handleSend = async () => {
  if (isClickBtn.value) return;
  questionList.value =[]
  isClickBtn.value = true;
  // questionVisible.value = false;
  planDataIds.value = [];
  compiledMarkdown.value = '';
  markdownContent.value = '';
  const times = setTimeout(() => {
    resTextHeight();
    clearTimeout(times);
  }, 0);
  // orderStr.value = '';
  objArr.value = [];
  // textVal.value = textVal.value.replace(/\s+/g, '');
  let updateText = null;
  let userObj = {
    type: 'USER',
  };
  if (isClickUpdate.value) {
    updateText = chatDataArr.value[chatDataArr.value.length - 2].content; //点击更新获取最后一条数据的问题内容
    userObj = {
      ...userObj,
      content: updateText,
    };
  } else if (textVal.value !== '') {
    userObj = {
      ...userObj,
      content: textVal.value,
    };
  } else {
    return;
  }

  chatDataArr.value.push(userObj);
  let assistantObj = {
    type: 'ASSISTANT',
    content: '',
    cardDetails: [],
    cardOrderDetails: [],
  };
  chatDataArr.value.push(assistantObj);
  isLoading.value = true;
  outputLoading.value = true;
  // handleSaveTit();
  // 先显示发送的消息
  nextTick(() => {
    scrollToBottom();
  });

  if (baseData.value === undefined) return;
  nextTick(() => {
    eventSource.value = fetchEventSource(`http://api.tianji.com/ais/chat`, {
      method: 'POST',
      headers: {
        Authorization: store.getToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: baseData.value.sessionId,
        question: updateText ? updateText : textVal.value,
      }),
      signal: ctrl.signal,
      openWhenHidden: true, // 切换标签页时连接不关闭
      async onopen(response) {
        // 处理登录失效
        if (response.status === 401) {
          message.warning('登录过期');
          return;
        }
      },

      onmessage(msg) {
        isLoading.value = false;
        isSend.value = true;
        let msgData = JSON.parse(msg.data);
        let objArr = {};
        // let arr =[]
        if (msgData.eventType === 1003) {
          if (msgData.eventData.prePlaceOrder !== undefined) {
            prePlaceOrder.value = msgData.eventData.prePlaceOrder;
          } else {
            objArr.value = Object.values(msgData.eventData);
          }
          // // 获取的后台内容
          // findATagsWithAttributes(markdownData.value);
          if (objArr.value !== undefined) {
            objArr.value.forEach((val) => {
              planDataIds.value.push(val.id);
            });
          }
          assistantObj = {
            ...assistantObj,
            type: 'ASSISTANT',
            content: textData.value,
          };
          // orderData.value = extractStrings(orderStr.value);

          if (planDataIds.value.length > 0) {
            getCourseLearningData(planDataIds.value);
          } else {
            // if (orderData.value.length > 1) {
            planDataIds.value = [];
            assistantObj = {
              ...assistantObj,
              orderText: prePlaceOrder.value,
              cardType: 1,
            };
            getCourseLearningData(prePlaceOrder.value.courseIds);
            // }
          }
        } else if (msgData.eventType === 1002) {
          updateText = chatDataArr.value[chatDataArr.value.length - 2].content
          getText(updateText);
          ctrl.abort(); // 结束会话
          isSend.value = false;
          isClickBtn.value = false;
          // // ctrl.close(); // 结束会话
          assistantObj = {
            ...assistantObj,
            content: textData.value,
          };
          chatDataArr.value[chatDataArr.value.length - 1] = assistantObj;
          store.setChatDataList(chatDataArr.value);
          
          outputLoading.value = false;
          textData.value = '';
          isClick.value = false;
          isEnd.value = true; //内容已经展示完毕
          // 解决消息底部显示不全的问题
          const times = setTimeout(() => {
            scrollToBottom();
            clearTimeout(times);
          }, 800);
        } else {
          textData.value += msgData.eventData;
          // orderStr.value += msgData.eventData;

          appendAndType(msgData.eventData);
          // markdownData.value = md.render(textData.value);
          isClick.value = true;
          scrollShow()
        }
        isClickUpdate.value = false;
      },
      onerror(err) {
        console.log(err);
        textData.value = '';
        // orderStr.value = '';
        markdownContent.value = '';
        // compiledMarkdown.value = '';
        textData.value = '';
        isLoading.value = false;
        outputLoading.value = false;
        ElMessage({
          message: '内容输出异常，请重新生成！',
          type: 'error',
        });

        throw err;
      },
      onclose(date) {
        console.log(date);
        isClick.value = false;
        ctrl.abort(); // 结束会话
        isEnd.value = false;
        outputLoading.value = false;
        // compiledMarkdown.value=''
        detailsId.value = null;
        console.log('guanle');
        // ElMessage({
        //   message: '内容输出异常，请重新生成！',
        //   type: 'error',
        // });
      },
    });
    //  发送后清空表单
    textVal.value = '';
    // dynamicHeight.value = `24px`;
  });
};
const planDataIds = ref([]);
// 给回答后的数据a标签加上btarget=_blank，用新窗口打开
const findATagsWithAttributes = (htmlString) => {
  // 使用正则表达式匹配 <a> 标签，确保不重复添加 target 属性

  htmlString.replace(/<a([^>]*)>/gi, (match, $1) => {
    planDataIds.value.push(getId(match.toString()));
    // planDataIds.value = arr.filter((item, index) => arr.indexOf(item) === index);
  });
};
const getTextBetweenChars = (str, startChar, endChar) => {
  const startIndex = str.indexOf(startChar);
  if (startIndex === -1) return ''; // 如果起始字符不存在，返回空字符串

  const endIndex = str.indexOf(endChar, startIndex + 1);
  if (endIndex === -1) return ''; // 如果结束字符不存在，返回空字符串

  return str.substring(startIndex + 1, endIndex); // 返回起始字符和结束字符之间的部分
};
// 获取id
const getId = (link) => {
  getTextBetweenChars(link, '?', '"');
  // 解析查询参数
  const urlParams = new URLSearchParams(getTextBetweenChars(link, '?', '"'));
  const id = urlParams.get('id');
  const courseId = urlParams.get('courseId');
  return id ? id : courseId;
};
const parseCodeBlocks = (text) => {
  const regex = /```([\s\S]*?)```/g;
  return text.replace(regex, (match, code) => {
    //
    // .replace(/    /g,' \n').replace(/ /g,' ')
    const escapedCode = code.replace(/\n/g, '\n');
    return `<pre class="code-block java"><code>${escapedCode}</code></pre>`;
  });
};
const markdownContent = ref('');
const appendAndType = (fragment) => {
  // 将新的 Markdown 片段追加到现有的内容后面
  const existingContent = markdownContent.value;
  markdownContent.value = existingContent + fragment;
  // 应用打字机效果到新追加的部分

  // 立即更新已有的内容，以便开始新的打字机效果
  compiledMarkdown.value = md.render(markdownContent.value);
  // // 在 DOM 更新后手动触发 highlight.js
  // 确保 DOM 更新后再执行高亮

  // nextTick(() => {
  // //   // setTimeout(() => {
  document.querySelectorAll('pre code').forEach((block) => {
    // 移除 data-highlighted 属性以便重新高亮
    delete block.dataset.highlighted; // 移除 data-highlighted 属性
    hljs.highlightBlock(block);
  });
  // //   // }, 0);
  // });

  scrollToBottom();
};
const scrollToBottom = () => {
  const scrollTar = scrollTarget.value;
  // console.log(scrollTar);
  if (scrollTar) {
    // console.log(123);
    // scrollTar.scrollTop = scrollTar.scrollHeight;
    const scrollBehavior = scrollTar.scrollHeight - scrollTar.clientHeight;
    scrollTar.scrollTo({
      top: scrollBehavior,
      behavior: 'smooth', // 平滑滚动
    });
  }
};

// 停止生成
const handleStop = () => {
  // if (typingDone.value) {
  ctrl.abort(); // 结束会话
  outputLoading.value = false;
  isClick.value = false;
  isClickBtn.value = false;
  hadlechatStop();
  if (chatDataArr.value.length > 0) {
    chatDataArr.value[chatDataArr.value.length - 1].content =
      compiledMarkdown.value;
    store.setChatDataList(chatDataArr.value);
  }

  typingDone.value = false;

  // }
};
const hadlechatStop = async () => {
  const params = {
    sessionId: baseData.value.sessionId,
  };
  const res = await chatStop(params);
  // if (res.code === 200) {
  //   ElMessage({
  //     message: "此功能暂未开发！",
  //     type: 'error'
  //   });
  // }
};
// Shift+Enter换行
const onEnter = (event) => {
  // 阻止回车键默认行为
  event.preventDefault();
  // 检查shift是否被按下
  if (event.shiftKey) {
    // 换行逻辑
    textVal.value += '\n';
  }
  if (event.keyCode === 13) {
    scrollToBottom();
    handleSend();
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
  // 如果正在生成禁止回车发送
  if (isClick.value) return;
  if (e.target.value !== undefined) {
    textVal.value = e.target.value.replace(/\s+/g, '');
    if (textVal.value !== '' && !e.shiftKey) {
      if (e.keyCode === 13 || e.keyCode === 108) {
        scrollToBottom();
        handleSend();
      }
    }
  }
};
// 是否触发了联想问题
const handleselectText = (val) => {
  // questionVisible.value = false; //联想弹层关闭
  questionList.value = [];
  textVal.value = val;
};
// 触发热门问题
const handleUpdete = (val) => {
  textVal.value = val;
  // questionVisible.value = false;
  const times = setTimeout(() => {
    resTextHeight();
    clearTimeout(times);
  }, 0);
};
// 获取模板列表
const getText = async (val) => {
  // if (!questionVisible.value) return;
  const text = val.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '');
  
  const res = await getChatText(
    textTypeData.value.associationalWord.split('$input').join(text)
  );
  const arrData = res.data.split('|');
  questionList.value = arrData;
  // nextTick(() => {
  //   const arrData = res.data.split('|');
  //   if (arrData && arrData.length > 0) {
  //     questionList.value = arrData.filter((item) =>
  //       item.toLowerCase().includes(textVal.value.toLowerCase())
  //     );
  //   }
  // });
};
// 触发热门问题
const handleNew =(val)=>{
  textVal.value = val
}
// 隐藏联想结果
const hideSuggestions = () => {
  setTimeout(() => {
    questionVisible.value = false;
  }, 200); // 延迟隐藏，以便用户点击联想结果
};
//触发输入文本框数据滚动到最后一条
const questionVisible = ref(false);
// watch(()=>textVal.value,(newValue, oldValue)=>{
//   if(newValue.length>oldValue.length){
//     const text = newValue.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '');
//     if (text.length > 0) {
//       questionVisible.value = true;
//       // 过滤联想数据
//       if (text.length === 1) {
//         getText();
//       } else {
//         setTimeout(() => {
//           getText();
//           clearTimeout();
//         }, 200);
//       }
//     }
//   }
// })
const handleInput = (event) => {
  // const scrollTar = scrollTarget.value;
  // if (scrollTar) {
  // const scrollBehavior = scrollTar.scrollHeight - scrollTar.clientHeight;
  // scrollTar.scrollTo({
  //   top: scrollBehavior,
  //   behavior: 'smooth', // 平滑滚动
  // });
  if (textVal.value !== '') {
    scrollToBottom();
  }
  resTextHeight();
  // }
};
const resTextHeight = () => {
  const textarea = textareaRef.value;
  if (textVal.value !== '') {
    textarea.style.height = `auto`;
    // 重置高度为 auto 以计算真实高度

    const currentScrollHeight = textarea.scrollHeight;
    const lineHeight = getLineHeight(textarea);
    const maxHeight = lineHeight * maxLines;

    if (currentScrollHeight > maxHeight) {
      console.log(currentScrollHeight, maxHeight);
      // 超过 5 行：固定高度并显示滚动条
      dynamicHeight.value = `${maxHeight}px`;
      textarea.style.height = `${maxHeight}px`;
      overflowY.value = 'auto';
    } else {
      console.log(currentScrollHeight, maxHeight);
      // 不足 5 行：动态调整高度
      dynamicHeight.value = `${currentScrollHeight}px`;
      textarea.style.height = `${currentScrollHeight}px`;
      overflowY.value = 'hidden';
    }
    // 限制输入最多的字数
    if (textVal.value.length > maxNum.value) {
      textVal.value = textVal.value.slice(0, maxNum.value);
    }
    textNum.value = textVal.value.length;
  } else {
    dynamicHeight.value = `auto`;
    textarea.style.height = `auto`;
  }
};
// 联想高亮匹配部分
const highlightMatch = (item) => {
  const inputValue = textVal.value.toLowerCase();
  const index = item.toLowerCase().indexOf(inputValue);

  if (index >= 0) {
    // 将匹配部分用 <span> 包裹并添加高亮样式
    return (
      item.substring(0, index) +
      `<span class="filterHighlight">${item.substring(
        index,
        index + inputValue.length
      )}</span>` +
      item.substring(index + inputValue.length)
    );
  }
  return item;
};
// 下单
const handleOrder = async (val) => {
  const params = {
    courseIds: val.courseIds,
    orderId: val.orderId,
  };
  if (val.couponId != null) {
    params.couponIds = val.couponId.split(',');
  }
  const res = await setOrder(params);
  if (res.code === 200) {
    router.push({
      path: '/pay/payment',
      query: { orderId: res.data.orderId },
    });
  } else {
    ElMessage({
      message: res.msg,
      type: 'error',
    });
  }
};
// 默认头像
const onerrorImg = () => {
  userInfo.value.icon = defaultImage;
};
// 换一换
const handleUpdateData = () => {
  getHotList();
};
const handleUpdate = () => {
  ElMessage({
    message: '此功能暂未开发！',
    type: 'warning',
  });
};
// 上传图片
const handleUpdateImg = () => {
  handleUpdate();
};
// 上传图片
const handleUpdateText = () => {
  handleUpdate();
};
// // 初始化语音识别器
// const initializeRecognizer=()=> {
//       const subscriptionKey = azure.key;
//       const region = azure.region;
//       const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region);

//       // 设置识别语言（例如中文）
//       speechConfig.speechRecognitionLanguage = 'zh-CN';

//       // 创建音频配置（默认使用麦克风）
//       const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

//       // 创建语音识别器
//       this.recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

//       // 监听识别结果
//       this.recognizer.recognizing = (_, event) => {
//         this.recognizedText = event.result.text;
//       };

//       // 监听识别结束事件
//       this.recognizer.recognized = (_, event) => {
//         if (event.result.reason === sdk.ResultReason.RecognizedSpeech) {
//           this.recognizedText = event.result.text;
//         } else if (event.result.reason === sdk.ResultReason.NoMatch) {
//           console.warn('未识别到语音');
//         }
//       };

//       // 监听错误事件
//       this.recognizer.sessionStopped = (_, event) => {
//         console.log('识别会话已停止');
//         this.isRecognizing = false;
//         this.recognizer.close();
//       };
//     }
// 上传图片
const AadioPopoverRef = ref(null);
const AadioButtonRef = ref(null);
const isMicrophoneGranted = ref(false); //是否授予麦克风权限
const isMicrophoneDenied = ref(false); // 是否拒绝麦克风权限
const microphoneVisible = ref(false); //如果没有授权麦克风，需要弹层显示
const tooltipVisible = ref(false);
const timeoutStarted = ref(false);
const mediaRecorder = ref(null);
const audioChunks = ref([]);
// 语音
const handleUpdateYy = async () => {
  questionVisible.value = false;
  try {
    // 请求麦克风权限
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    isMicrophoneGranted.value = true;
    isMicrophoneDenied.value = false;
    microphoneVisible.value = false; //隐藏麦克风弹层
    mediaRecorder.value = new MediaRecorder(stream);
    // 监听数据可用事件
    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data);
    };
    // 监听停止事件
    mediaRecorder.value.onstop = async () => {
      // await sendAudioToAzure()
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' });
      // console.log(audioBlob,11)
      await sendAudioToAzure(audioBlob);
      // const webmBlob = new Blob(audioChunks.value, { type: 'audio/webm' });
      // const wavBlob = await convertWebmToWav(webmBlob);
      // // const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' });
      // //       const wavBlob = await convertWebMToWav(audioBlob);
      // //       console.log('Converted to WAV:', wavBlob);

      // await sendAudioToAzure(wavBlob);
    };
    // 开始录音
    mediaRecorder.value.start();
    // recognizeSpeech('audioConfig')
  } catch (error) {
    // 处理错误
    console.error('获取麦克风权限失败:', error);

    if (error.name === 'NotAllowedError') {
      isMicrophoneDenied.value = true; // 用户拒绝了权限
    } else if (error.name === 'NotFoundError') {
      console.error('未找到麦克风设备');
    } else {
      console.error('其他错误:', error);
    }

    isMicrophoneGranted.value = false;
    microphoneVisible.value = true; //显示麦克风弹层
  }
};
const sendAudioToAzure = async (audioBlob) => {
  // let audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' });
  let formData = new FormData();
  formData.append('audioFile', audioBlob);
  // const audioFile = new File([audioBlob], 'recording.wav');

  const res = await audioTextStt(formData);
  if (res.code === 200) {
    textVal.value = textVal.value + res.data.replace(/[\r\n]+/g, '');
    textNum.value = textVal.value.length;
  }
  // try {
  //       const response = await axios.post(
  //         `https://${azure.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`,
  //         audioBlob,
  //         {
  //           headers: {
  //             'Ocp-Apim-Subscription-Key': azure.key,
  //             'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
  //           },
  //           // params: {
  //           //   'language': 'zh-CN', // 根据需要更改语言
  //           // },
  //           // responseType: 'json',
  //         }
  //       );

  //       const texts=response.data.DisplayText;
  //       console.log(response.data)
  //     } catch (error) {
  //       console.error(error);
  //     }
  // // const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' });
  // // const audioFile = new File([audioBlob], 'recording.wav');

  // // const audioConfig = sdk.AudioConfig.fromWavFileInput(audioFile);
  // // try {
  // //   const transcription = await recognizeSpeech(audioConfig);
  // //   console.log(transcription,11)
  // // } catch (error) {
  // //   console.error('Error recognizing speech:', error);
  // // }
  // if (audioChunks.value.length === 0) {
  //       alert('未捕获到音频数据');
  //       return;
  //     }
  // const region = azure.region; // 替换为你的服务区域
  // const subscriptionKey = azure.key; // 替换为你的订阅密钥

  // const endpoint = `https://${azure.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;

  // // 将音频数据转换为 Blob
  // const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' });
  // console.log(endpoint)
  // try {
  //   const response = await fetch(endpoint, {
  //     method: 'POST',
  //     headers: {
  //       'Ocp-Apim-Subscription-Key': azure.key,
  //       'Content-Type': 'audio/wav; codec=audio/pcm; samplerate=16000',
  //     },
  //     body: audioBlob,
  //   });

  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }

  //   const result = await response.json();
  //   const transcription = result.DisplayText || '未识别到文本';
  //   console.log(transcription)
  // } catch (error) {
  //   console.error('Error transcribing audio:', error);
  //   const transcription = '识别失败';
  //   console.log(transcription)
  // } finally {
  //   // 清空音频数据
  //   audioChunks.value = [];
  // }
};
// const convertWebmToWav = async (webmBlob) => {
//   // 将 WebM Blob 解码为 AudioBuffer
//   const audioContext = new AudioContext();
//   const arrayBuffer = await webmBlob.arrayBuffer();
//   const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

//   // 将 AudioBuffer 转换为 WAV 格式的 Blob
//   const wavBuffer = encodeAudioBufferToWav(audioBuffer);
//   console.log(wavBuffer);
//   return new Blob([wavBuffer], { type: 'audio/wav' });
// };
// const encodeAudioBufferToWav = (audioBuffer) => {
//   const numChannels = audioBuffer.numberOfChannels;
//   const sampleRate = audioBuffer.sampleRate;
//   const bitsPerSample = 16; // WAV 文件通常使用 16 位深度
//   const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
//   const blockAlign = (numChannels * bitsPerSample) / 8;
//   const dataSize = audioBuffer.length * numChannels * 2; // 16 位 = 2 字节

//   // 创建 ArrayBuffer 存储 WAV 文件数据
//   const buffer = new ArrayBuffer(44 + dataSize);
//   const view = new DataView(buffer);

//   // 写入 WAV 文件头
//   writeString(view, 0, 'RIFF'); // RIFF 头
//   view.setUint32(4, 36 + dataSize, true); // 文件长度
//   writeString(view, 8, 'WAVE'); // WAVE 格式
//   writeString(view, 12, 'fmt '); // fmt 子块
//   view.setUint32(16, 16, true); // fmt 子块长度
//   view.setUint16(20, 1, true); // PCM 格式
//   view.setUint16(22, numChannels, true); // 声道数
//   view.setUint32(24, sampleRate, true); // 采样率
//   view.setUint32(28, byteRate, true); // 字节率
//   view.setUint16(32, blockAlign, true); // 块对齐
//   view.setUint16(34, bitsPerSample, true); // 位深度
//   writeString(view, 36, 'data'); // data 子块
//   view.setUint32(40, dataSize, true); // data 子块长度
//   console.log(12563);
//   // 写入 PCM 数据
//   floatTo16BitPCM(view, 44, audioBuffer);
//   // 返回 WAV Blob
//   return new Blob([view], { type: 'audio/wav' });
// };
// const writeString = (view, offset, string) => {
//   console.log(view, offset, string);
//   for (let i = 0; i < string.length; i++) {
//     view.setUint8(offset + i, string.charCodeAt(i));
//   }
// };
// const floatTo16BitPCM = (view, offset, audioBuffer) => {
//   const numChannels = audioBuffer.numberOfChannels;
//   const length = audioBuffer.length;

//   for (let i = 0; i < length; i++) {
//     for (let channel = 0; channel < numChannels; channel++) {
//       const sample = Math.max(
//         -1,
//         Math.min(1, audioBuffer.getChannelData(channel)[i])
//       ); // 限制在 [-1, 1] 范围内
//       const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff; // 转换为 16 位整数
//       view.setInt16(offset, int16, true); // 写入数据
//       offset += 2;
//     }
//   }
// };
// 停止语音输入
const handleStopMicrophone = () => {
  mediaRecorder.value.stop();
  mediaRecorder.value = null;
  audioChunks.value = [];
  isMicrophoneGranted.value = false;
};
const timeout = ref(null);
const handleAadioEnter = () => {
  tooltipVisible.value = true;
  clearTimeout(timeout.value); // 清除可能存在的计时器
  timeoutStarted.value = false; // 重置计时器标志
};

const handleAadioLeave = () => {
  timeoutStarted.value = true; // 设置计时器标志为true
  timeout.value = setTimeout(() => {
    tooltipVisible.value = false;
  }, 600); // 1秒后隐藏标签
};
// 关闭麦克风权限弹层
const handleCloseMic = () => {
  microphoneVisible.value = false;
};
// 历史记录
const visible = ref(false);
const handleHistory = () => {
  // unref(popoverRef.value).popperRef.value?.delayHide?.();
  visible.value = true;
  // if (ctrl) {
  //   ctrl.abort(); // 结束会话
  //   handleStop();
  // }

  clearData();
  const times = setTimeout(() => {
    resTextHeight();
    clearTimeout(times);
  }, 0);
  getList();
};
const handleHidePopover = () => {
  isClickEdit.value = false;
  visible.value = false;
};
// 右侧窗口吸附
const handleRight = () => {
  handleUpdate();
};
// 全屏
const handleMagnify = () => {
  handleUpdate();
};
// handlePraise\handleTread\handlePlay\handleCopy\handleUp
// 点赞
const handlePraise = () => {
  // isPraise.value = true;
  // isTread.value=false
  handleUpdate();
};
// 点踩
const isTread = ref(false);
const handleTread = () => {
  // isTread.value = true;
  // isPraise.value = false
  handleUpdate();
};
// 复制
const handleCopy = () => {
  ElMessage({
    message: '复制成功',
    type: 'success',
  });
};
// 停止语音
const pauseAudio = () => {
  isPlaying.value = false;
  if (audioElement.value && isAudioLoaded.value) {
    audioElement.value.pause();
  } else {
    console.error('音频未加载完成');
  }
};
// 语音播放
let textArray = ref([]);
// const charDurations=ref([])
let sound = null;
let currentCharIndex = ref(-1);
const handlePlay = async (val, i) => {
  isPlaying.value = true;
  audioElement.value.pause();

  if (playIndex.value !== i) {
    audioUrl.value = '';
  }
  playIndex.value = i;
  let result = val.replace(/\(#\/details\/index\?id=\d+\)/, '');
  if (!audioUrl.value) {
    const res = await audioStt(result);
    if (res) {
      // 创建音频的url
      const url = window.URL.createObjectURL(new Blob([res]));
      audioUrl.value = url;
      // if (sound) {
      //   sound.stop(); // 如果正在播放，先停止
      // }

      // // 初始化音频
      // sound = new Howl({
      //   src: [audioUrl.value], // 语音文件地址
      //   onplay: () => {
      //     console.log('语音开始播放');
      //     currentCharIndex.value = 0; // 开始播放时高亮第一个单词
      //   },
      //   onend: () => {
      //     console.log('语音播放结束');
      //     currentCharIndex.value = -1; // 播放结束时取消高亮
      //   },
      // });

      // sound.play();

      // // 根据语音播放时间高亮单词
      // // 假设每个单词的持续时间是固定的（例如 1 秒）
      // const wordDuration = 1000; // 每个单词的持续时间（单位：毫秒）
      // textArray.value.forEach((_, index) => {
      //   setTimeout(() => {
      //     currentCharIndex.value = index;
      //     console.log(currentCharIndex.value)
      //   }, index * wordDuration);
      // });
    }
  }

  // const audio = new Audio(url);
  // audio.play().catch(error => {
  //   console.warn("Audio play failed", error);
  // });
  // azureService.value = new AzureTtsService(azure.key, azure.region);
  // const ids = document.getElementById('audio');
  // if (val.trim() !== '') {
  //   const blob = await azureService.value.textToSpeech(val);
  //   // 创建音频的url
  //   const url = window.URL.createObjectURL(
  //     new Blob([blob], { type: 'audio/wav' })
  //   );
  //   audioUrl.value = url;
  //   // // 初始化文本数组和字符持续时间
  //   // textArray.value = val.split('');
  //   // charDurations.value = calculateCharDurations(textArray.value.length, blob.size);
  // }

  setTimeout(() => {
    if (audioElement.value && isAudioLoaded.value) {
      audioElement.value.play();
      clearTimeout();
    }
  }, 500);
};
// const calculateCharDurations=(charCount, audioSize)=> {
//       const totalDuration = audioElement.value.duration || 10; // 假设音频时长为10秒
//       return Array(charCount).fill(totalDuration / charCount);
//     }
// const  updateHighlight=()=> {
//       const currentTime = audioElement.value.currentTime;
//       let elapsedTime = 0;
//       for (let i = 0; i < charDurations.value.length; i++) {
//         elapsedTime += charDurations.value[i];
//         console.log(i)
//         if (currentTime <= elapsedTime) {
//           currentCharIndex.value = i;
//           console.log(currentCharIndex.value)
//           break;
//         }
//       }
//     }
// 更新
const isClickUpdate = ref(false); //是否触发了更新按钮
const handleUp = () => {
  // handleUpdate();
  isClickUpdate.value = true;
  console.log(isClick.value);
  if (isClick.value) return;
  handleSend();
};
// 鼠标进入时的操作
const handleMouseEnter = (type) => {
  let val = null;
  if (type === 1) {
    val = scrollTarget.value;
  } else {
    val = textareaRef.value;
  }
  val.classList.add('show-scrollbar');
  val.classList.remove('hide-scrollbar');
};

// 鼠标离开时的操作
const handleMouseLeave = (type) => {
  let val = null;
  if (type === 1) {
    val = scrollTarget.value;
  } else {
    val = textareaRef.value;
  }
  val.classList.add('hide-scrollbar');
  val.classList.remove('show-scrollbar');
};
const clearData = () => {
  // 清空本地对话的数据
  markdownContent.value = '';
  compiledMarkdown.value = '';
  textData.value = '';
  textVal.value = '';
  isLoading.value = false;
  isSend.value = false;
  isScroll.value = false
  showUpdateTooltip.value = false; //控制更新提示框
  showCopyTooltip.value = false; //控制复制提示框
  showPlayTooltip.value = false; //控制播放提示框
  showStopTooltip.value = false; //控制停止提示框
  isPlaying.value = false;
  questionList.value=[]
};
// 触发历史记录
const handleActive = (sessionId, index, i) => {
  if (outputLoading.value) return false;
  aiIsActive(index, i);
  isClickEdit.value = false;
  chatDataArr.value = [];
  baseData.value.sessionId = sessionId;
  getListData(sessionId);
  
  setTimeout(()=>{
    scrollShow()
  },100)
    const times = setTimeout(() => {
    scrollToBottom();
    clearTimeout(times);
  }, 150);
  
  
  

  visible.value = false;
  clearData();
  clearAudio();
  // console.log(ctrl);
  if (ctrl) {
    ctrl.abort(); // 结束会话
    handleStop();
  }
};
// 触发历史记录编辑按钮
const handleEdit = (sessionId, index, i) => {
  aiIsActive(index, i);
  isClickEdit.value = true;
};
// 触发历史记录删除按钮
const handleDelect = (sessionId, index, i) => {
  aiIsActive(index, i);
  ElMessageBox.confirm(`删除后对话记录无法恢复和找回，请谨慎操作`, '确认删除', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'delete',
  })
    .then(async (e) => {
      await delectHistory(sessionId);
      getList();
    })
    .catch(() => {});
};
const aiIsActive = (index, i) => {
  isActive.value = index + '-' + i;
};
const handleAiInput = (e) => {
  if (e.type === 'keyup') {
    textVal.value = '';
    // 可以在这里添加你的逻辑
  }
};
// 触发历史记录保存按钮
const handleSave = async (val) => {
  const params = {
    sessionId: val.sessionId,
    title: val.title,
  };
  const res = await updateSession(params);
  if (res.code === 200) {
    isClickEdit.value = false;
    getList();
  }
};
// 触发历史记录取消按钮
const handleCancel = () => {
  isClickEdit.value = false;
  getList();
};
// 弹层拖拽
// // 默认显示在右下角
// const dialogStyle = computed(() => ({
//   position: 'fixed',
//   left: `${dialogPosition.value.x}px`,
//   top: `${dialogPosition.value.y}px`,
//   transform: 'translate(-50%, -50%)', // 居中定位
// }));

// // 初始化对话框位置到右下角
// const initializeDialogPosition = () => {
//   const viewportWidth = window.innerWidth;
//   const viewportHeight = window.innerHeight;
//   dialogPosition.value.x = viewportWidth - 258; // 假设对话框宽度为 400px
//   dialogPosition.value.y = viewportHeight - 370; // 假设对话框高度为 300px
// };

// // // 打开对话框时初始化位置
// // watch(dialogVisible, (newVal) => {
// //   if (newVal) {
// //     initializeDialogPosition();
// //   }
// // });

// const handleMouseDown = (event) => {
//   // 排除 input 和其他交互元素
//   console.log(event.target.tagName);
//   if (event.target.tagName !== 'div.title') {
//     return;
//   }

//   isDragging.value = true;
//   dragStartX.value = event.clientX - dialogPosition.value.x;
//   dragStartY.value = event.clientY - dialogPosition.value.y;

//   document.addEventListener('mousemove', handleMouseMove);
//   document.addEventListener('mouseup', handleMouseUp);
// };

// const handleMouseMove = (event) => {
//   if (isDragging.value) {
//     const newX = event.clientX - dragStartX.value;
//     const newY = event.clientY - dragStartY.value;

//     // 限制拖拽范围
//     const maxX = window.innerWidth - 258; // 假设对话框宽度为 400px
//     const maxY = window.innerHeight - 300; // 假设对话框高度为 300px

//     dialogPosition.value.x = Math.max(0, Math.min(newX, maxX));
//     dialogPosition.value.y = Math.max(0, Math.min(newY, maxY));
//   }
// };

// const handleMouseUp = () => {
//   isDragging.value = false;
//   document.removeEventListener('mousemove', handleMouseMove);
//   document.removeEventListener('mouseup', handleMouseUp);
// };
onUnmounted(() => {
  ctrl.abort(); // 结束会话
  // ctrl.close(); // 结束会话
});
</script>
<style lang="scss" src="./index.scss" scoped></style>
<style>
/* 引用 highlight.js 的样式 */
@import 'highlight.js/styles/monokai-sublime.css';
* {
  margin: 0;
  padding: 0;
}
/* 自定义样式 */
.markdown-body {
  white-space: initial !important; /* 保留空白符 */
  overflow: hidden; /* 隐藏溢出内容 */
  display: inline-block;
  font-size: 14px;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: bold;
  font-size: 14px;
}

.markdown-body a {
  color: #0366d6;
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

/* .markdown-body code {
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
} */

.markdown-body table {
  display: block;
  width: 100%;
  overflow: auto;
}

.markdown-body th {
  font-weight: bold;
}

.markdown-body td,
.markdown-body th {
  padding: 6px 13px;
  border: 1px solid #ddd;
}

.markdown-body img {
  max-width: 100%;
  box-sizing: content-box;
}
</style>
<style lang="scss">
.el-popper {
  &.box-item {
    padding: 9px 20px;
    text-align: center;
    line-height: 18px;
    &.is-dark {
      background-image: linear-gradient(
        268deg,
        #43b7fc 5%,
        #9a20f7 100%
      ) !important;
      box-shadow: 0 2px 7px 0 #002db636 !important;
      border-radius: 11px 11px 11px 0 0 0 11px !important;
      border: 0 none;
      & > .el-popper__arrow:before {
        background: #6c70f9 !important;
        border: 0 none;
        box-shadow: none;
      }
    }
  }
}

.chatContainer h1,
.chatContainer h2,
.chatContainer h3,
.chatContainer h4,
.chatContainer h5,
.chatContainer h6 {
  color: #19232b;
  font-size: 14px;
}
.chatContainer .code-block{
  margin-bottom: 12px;
  background: rgb(24, 29, 40);
  color: rgb(248, 248, 242);
  border-radius: 8px;
}
.chatContainer .code-block code,
.chatContainer .code-block pre {
  display: block;
  overflow-x: auto;
  background: transparent;
  padding: 16px 12px;
  margin: 0px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont;
}

.chatContainer .code-block pre {
  code {
    word-wrap: normal;
    white-space: pre;
    background-color: transparent;
    border: 0;
    display: inline;
    line-height: inherit;
    padding: 0;
    word-break: normal;
  }
}
.htmlBody {
  p {
    padding-bottom: 12px;
    font-size: 14px;
    // margin-block:0;
    // margin-inline:0;
    // padding-block:0;
    // padding-inline:0;
    overflow-wrap: break-word;
    font-family: -apple-system, BlinkMacSystemFont;
  }
  strong {
    font-weight: 550;
  }
  & > p {
    &:last-child {
      padding-bottom: 0;
    }
  }
  img {
    width: 100%;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: 14px;
    font-weight: 700;
  }
  .custom-class-tit {
    font-size: 16px;
    font-weight: bold;

    margin-block: 0;
    margin-inline: 0;
    padding-block: 0;
    padding-inline: 0;
    unicode-bidi: isolate;
    padding-bottom: 7px;
  }
  .custom-class-ullist {
    li {
      padding-bottom: 10px;
      &:last-child {
        padding-right: 0;
      }
    }
  }
  ul {
    margin-block: 0;
    margin-inline: 0;
    padding-block: 0;
    padding-inline: 0;
    display: inline-grid;
  }
  ol {
    // margin-block-start: 0;
    // margin-block-end: 0;
    // margin-inline-start: 0px;
    // margin-inline-end: 0px;
    // padding-inline-start: 0px;
    // margin-block: 0;
    // margin-inline: 0;
    // padding-block: 0;
    // padding-inline: 0;
    // display: inline-grid;
    list-style-type: decimal;
    li {
      line-height: 24px;
    }
  }
  ul,
  ol {
    &:last-child {
      li {
        &:last-child {
          p {
            padding-bottom: 0;
          }
        }
      }
    }
  }
  & > .listUl {
    list-style: disc; /* 使用默认的实心圆点 */
    color: black; /* 设置项目符号的颜色 */
    padding-inline-start: 10px;
    & > li {
      padding-left: 14px;
      padding-bottom: 4px;
      display: list-item;
      text-align: -webkit-match-parent;
      unicode-bidi: isolate;
      position: relative;
      // display: flex;
      &::before {
        position: absolute;
        display: inline-block;
        content: '•'; /* 自定义标记内容 */
        font-size: 18px; /* 调整标记大小 */
        color: black; /* 设置标记颜色 */
        margin-right: 8px;
        line-height: 20px;
        left: 0;
      }
      & > p {
        padding-bottom: 0;
        display: inline-block;
      }
    }
  }
}
// .custom-dialog .el-dialog__wrapper {
//   pointer-events: none;
// }
// .custom-dialog .el-dialog {
//   pointer-events: auto;
// }
.highlight {
  background-color: yellow;
  font-weight: bold;
}
.filterHighlight {
  color: #2080f7;
}
.el-popover {
  font-size: 12px;
  &.historyClass {
    width: 430px !important;
    box-shadow: 0 4px 6px 2px 76 rgba(#2b6c70, 0.76);
    border-radius: 20px;
    margin: 55px 0 0 14px;
    padding: 0 2px 0 0;
    .el-popper__arrow {
      top: -9px;
      left: 55%;
      border-left: 6px solid transparent; /* 左边透明 */
      border-right: 6px solid transparent; /* 右边透明 */
      border-bottom: 10px solid #e4e7ed; /* 底部灰色，控制三角形的高度 */
      &:after {
        content: '';
        position: absolute;
        top: 2px; /* 调整位置以形成边框效果 */
        left: -5px; /* 根据border-left宽度调整 */
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 8px solid white; /* 内部填充白色，与背景色相同或根据实际背景颜色调整 */
      }
      &:before {
        display: none;
      }
      // width:0px;
      //   height:0px;
      //   border: 10px solid transparent;
      //   border-bottom-color: #0082df;
      // &::after{
      //   content: "";
      //   position: absolute;
      //   right:-10px;
      //   top:-8px;
      //   width:0px;
      //   height:0px;
      //   border:1px solid transparent;
      //   border-bottom-color: #fff ;
      // }
    }
  }
  .historyCon {
    margin: 20px 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: auto;
    max-height: 466px;
    padding-left: 10px;
    &::-webkit-scrollbar {
      width: 5px;
      height: 8px; /* 滚动条高度 */
      margin-left: 0;
      margin-right: 0px;
    }
    &::-webkit-scrollbar-thumb {
      width: 3px;
      border-radius: 2.5px; /* 圆角 */
      background-color: #e7e7e7; /* 滑块颜色 */
    }
    &::-webkit-scrollbar-track {
      background-color: transparent; /* 轨道背景色 */
    }
    .list {
      .title {
        padding-left: 10px;
        color: #80878c;
        font-size: 12px !important;
        padding-bottom: 8px;
      }
      .two {
        padding-bottom: 8px;
        padding-right: 3px;

        li {
          line-height: 32px;
          padding-right: 50px;
          height: 32px;
          position: relative;
          margin: 2px 0;
          cursor: pointer;
          display: flex;
          align-items: center;

          &:hover {
            background: #f0f0f0;
            border-radius: 8px;
          }
          &.active {
            background: #f0f0f0;
            border-radius: 8px;
          }
          .rIcon {
            position: absolute;
            right: 8px;
            top: 7px;
            & > span {
              display: flex;
              align-items: center;
              margin: 0 1px;
              cursor: pointer;
            }
            i {
              display: inline-block;
              width: 18px;
              height: 18px;
            }
            .editIcon {
              background: url(@/assets/icon/editIcon.png) no-repeat 50% 50%;
              background-size: contain;
            }
            .delectIcon {
              background: url(@/assets/icon/icon-sch.png) no-repeat 50% 50%;
              background-size: contain;
            }
            .saveIcon {
              background: url(@/assets/icon/icon-gx.png) no-repeat 50% 50%;
              background-size: contain;
            }
            .cancelIcon {
              background: url(@/assets/icon/canceIcon.png) no-repeat 50% 50%;
              background-size: contain;
            }
          }
          .acInput {
            height: 32px;
            padding: 0 0 0 5px;
            display: flex;
            align-items: center;
            width: 100%;
            & > span {
              padding-left: 5px;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 1; /* 限制显示的行数为1行 */
              overflow: hidden;
              text-overflow: ellipsis; /* 文本溢出时显示省略号 */
            }
          }
        }
      }
    }
    .el-input__wrapper {
      padding: 0 10px;
      border: 0px none;
      box-shadow: none;
      height: 24px;
      line-height: 24px;
      .el-input__inner {
        height: 24px;
        line-height: 24px;
      }
    }
  }
  .totleNum {
    text-align: center;
    font-size: 12px;
    color: #80878c;
  }
  &.microphoneVisible {
    width: 300px !important;
    box-shadow: 0 4px 6px 2px #6c70762b;
    border-radius: 26px;
    border: 0 none;
    margin-left: -30px;
    padding: 22px;
    line-height: 18px;
    font-size: 12px;
    .el-popover__title {
      font-size: 16px;
      color: #000;
      margin-bottom: 6px;
      line-height: 22px;
    }
    .con {
      color: #80878c;
      .forbidBg {
        margin: 8px 0 22px;
        background-image: linear-gradient(-88deg, #daefff 0%, #ebdeff 100%);
        border-radius: 10px;
        padding: 21px;
        display: flex;
        justify-content: center;
        .icon {
          display: inline-block;
          width: 38px;
          height: 44px;
          background: url(@/assets/icon/icon-yy.png) no-repeat;
          background-size: contain;
        }
      }
    }
    .footBtn {
      text-align: right;
      display: flex;
      justify-content: right;
      .bt {
        width: 74px;
        border-radius: 16px;
        font-size: 12px;
      }
    }
  }
  &.questionVisible {
    width: 424px !important;
    margin-left: 2px;
    .questionBox {
      background-image: linear-gradient(180deg, #ffffff 0%, #ffffff 100%);
      box-shadow: 0 2px 8px 0 #7e60ab12;
      border-radius: 10px;
      padding: 0 6px;
      top: -30px;
      .tit {
        font-size: 12px;
        color: #80878c;
        padding-bottom: 3px;
      }
      ul {
        li {
          line-height: 28px;
          padding-left: 20px;
          cursor: pointer;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          background: url(@/assets/icon/icon-jt.png) no-repeat 0 50%;
          background-size: 14px;
        }
      }
    }
  }
}

.TooltipBox {
  position: relative;
  .tooltipBox {
    position: absolute;
    left: -30px;
    top: -38px;
    min-width: 58px;
    height: 18px;
    line-height: 18px;
    color: #fff;
    background: #242629;
    border-radius: 8px;
    padding: 6px 8px;
    opacity: 0;

    &.fadeIn {
      animation: fadeIn 0.2s ease-in-out forwards;
    }
    &.fadeOut {
      animation: fadeOut 0.2s ease-in-out forwards;
    }
  }
  .triangle-up {
    width: 0;
    height: 0;
    position: absolute;
    left: 50%;
    bottom: -5px;
    transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #242629; /* 底部边界为实际显示颜色 */
  }
  div,
  span {
    box-sizing: content-box;
  }
}
ol.custom-class-ollist {
  list-style-type: decimal !important;
  display: block !important;
  padding-inline-start: 16px;
  li {
    list-style: auto;
    &:last-child {
      padding-bottom: 0;
    }
    p {
      padding-bottom: 7px;
    }
  }
  .listUl {
    padding-inline-start: 8px;
    padding-bottom: 10px;
    list-style-type: disc !important;
    & > li {
      position: relative;
      padding-left: 6px;
      &::marker {
        position: absolute;
        display: inline-block;
        content: '•'; /* 自定义标记内容 */
        font-size: 18px; /* 调整标记大小 */
        color: black; /* 设置标记颜色 */
        margin-right: 8px;
        line-height: 20px;
        left: 0;
      }
    }
  }
}
.listUl {
}
/* 调整 z-index 避免遮挡 */
.el-tooltip__popper {
  z-index: 9999 !important;
}
.voice-container {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px; /* 竖线之间的间距 */
  &:hover {
    background: #f4f4f5;
    border-radius: 4px;
  }
}

.voice-line {
  width: 1px;
  height: 16px;
  background-color: #2080f7; /* 竖线颜色 */
  animation: bounce 1.2s infinite ease-in-out;
}
.voice-line {
  animation: bounce calc(0.8s + 0.4s * var(--i)) infinite ease-in-out;
}
/* 为每个竖线设置不同的动画延迟 */
.voice-line:nth-child(1) {
  animation-delay: 0s;
}
.voice-line:nth-child(2) {
  animation-delay: 0.3s;
}
.voice-line:nth-child(3) {
  animation-delay: 0.6s;
}
.voice-line:nth-child(4) {
  animation-delay: 0.9s;
}

/* 定义上下波动动画 */
@keyframes bounce {
  0%,
  100% {
    transform: scaleY(1); /* 原始高度 */
  }
  50% {
    transform: scaleY(0.3); /* 缩小高度 */
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
