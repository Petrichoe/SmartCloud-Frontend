<!-- 架构页面 -->
<template>
<div class="layoutsWrapper fx-fd-col">
  <Header></Header>
    <router-view class="fx-1"/>
  <Footer></Footer>
  <div class="aiSupernatant">
    <div v-if="isShow" class="superCon" @click="handleBtn">
      <el-tooltip
        class="box-item"
        effect="dark"
        content=""
        placement="top"
      ><template #content>
        <div>哈！天机不可泄露<br>除非你来问我</div>
      </template>
        <div class="bigIcon"></div>
        <div class="text">天机AI助理</div>
      </el-tooltip>
      
    </div>
    <div v-else class="smallIcon" @click="handleClick"></div>
    <!-- 对话弹层 -->
    <el-dialog v-model="dialogVisible" modal-class="superDialog" title="" width="500" draggable @close="handleClose" :show-close="false">
      <template #header="{ close, titleId, titleClass }">
        <div class="dialogHeader">
          <span :id="titleId" :class="titleClass">天机AI助理</span>
          <div class="text">
            <button>创建会话</button>
            <button>历史记录</button>
            <button>全屏</button>
            <button @click="handleClose">最小化</button>
          </div>
        </div>
      </template>
      <div class="chitchatCon">
        <div class="dialogForm">
          <el-input v-model="textarea" type="textarea" :resize="false"></el-input>
        </div>
        <div class="dialogFooter">
          <div class="leftInfo"></div>
          <div class="rightInfo">
            <el-button @click="handleSend">发送</el-button>
            <el-button @click="handleStop">停止发送</el-button>
          </div>
        </div>
      </div>
      <!-- <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="dialogVisible = false">
            发送
          </el-button>
        </div>
      </template> -->
    </el-dialog>
    <!-- end -->
  </div>
</div>
</template>
<script setup>
import Footer from '@/components/Footer.vue';
import Header from '@/components/Header.vue';
import { onMounted, ref } from "vue";
const isShow = ref(false) // 默认小图显示
const dialogVisible = ref(false) //对话弹层
// 点击小图显示大图
const handleClick = ()=>{
    isShow.value=true
}
// 打开对话弹层
const handleBtn=()=>{
  dialogVisible.value = true
  isShow.value=false
}
// 关闭弹层
const handleClose=()=>{
  isShow.value=true
  dialogVisible.value = false
}
// 发送信息
const handleSend=()=>{

}
// 停止生成
const handleStop=()=>{
  
}
</script>
<style lang="scss" scoped>
.layoutsWrapper {
  min-height: 100vh;
}
.aiSupernatant{
  position: fixed;
  right: 10px;
  bottom: 100px;
  z-index: 9;
  
}
:deep(.superDialog){
  // .el-overlay-dialog{
  //   left: auto;
  //   right: 30px;
  //   top:auto;
  //   bottom: 30px;
  // }
    
    .el-dialog{
      margin: auto;
      padding: 0;
      .el-dialog__header{
        background: #ececec;
        border-radius: 4px 4px 0 0;
        .dialogHeader{
          display: flex;
          line-height: 30px;
          padding: 16px 15px 0;
          span,.text{
            line-height: 30px;
          }
          .text{
            flex: 1;
            text-align: right;
          }
        }
      }
    }
  }
  
.superCon{
 .text{
   text-align: center;
 }
}
.smallIcon{
  cursor: pointer;
  width: 100px;
  height: 120px;
  background: url(@/assets/icon02.png) no-repeat;
  background-size: contain;
  opacity: 1;
  animation: fadeHide 2s ease-in-out forwards;
}
.bigIcon{
  width: 200px;
  height: 240px;
  background: url(@/assets/icon01.gif) no-repeat;
  background-size: contain;
  opacity: 0;
  animation: fadeIn 2s ease-in-out forwards;
}
.chitchatCon{
  padding: 30px;
}
.dialogFooter{
  display: flex;
  padding: 30px 0 0;
  .leftInfo{
    flex: 1;
  }
  .rightInfo{
    flex: 1;
    text-align: right;
  }
}
@keyframes fadeIn {
  from{
    opacity: 0;
  }
  to {
    opacity: 1; /* 目标透明度为1 */
  }
}
@keyframes fadeHide {
  from{
    opacity: 0;
  }
  to {
    opacity: 1; /* 目标透明度为1 */
  }
}
</style>