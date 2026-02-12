<template>
  <div>
    <div class="top-right-icon" @click="showTaskList">
      <span class="tooltip">任务列表</span>
      任
    </div>
    <div class="upload-container">
      <h1>文件上传</h1>
      <div class="upload-box">
        <input
          type="file"
          ref="fileInput"
          @change="handleFileChange"
          accept="video/*"
          style="display: none"
        />
        <button @click="triggerFileInput" :disabled="uploading">
          {{ uploading ? '上传中...' : '选择文件' }}
        </button>
        <div v-if="selectedFile" class="file-info">
          已选择: {{ selectedFile.name }}
        </div>
      </div>
      <div v-if="uploading" class="loading">上传中，请稍候...</div>
      <div v-if="result" class="response-box">
        <h3>返回结果:</h3>
        <div class="result-item">
          <span class="label">状态码:</span>
          <span :class="result.code === 200 ? 'success' : 'fail'">{{ result.code }}</span>
        </div>
        <div class="result-item">
          <span class="label">消息:</span>
          <span>{{ result.message }}</span>
        </div>
        <div v-if="result.data" class="result-item">
          <span class="label">数据:</span>
          <pre>{{ result.data }}</pre>
        </div>
      </div>
      <div v-if="error" class="error-box">
        <h3>错误信息:</h3>
        <pre>{{ error }}</pre>
      </div>
    </div>
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>任务列表</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="loadingTasks" class="loading-tasks">加载中...</div>
          <div v-else-if="taskList.length === 0" class="no-tasks">暂无任务</div>
          <div v-else class="task-list">
            <div v-for="(task, index) in taskList" :key="index" class="task-item">
              <span class="task-id" @click="getTaskDetail(task.id)">{{ task.id }}</span>
              <span class="task-name">{{ task.fileName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export default {
  name: 'App',
  data() {
    return {
      selectedFile: null,
      uploading: false,
      result: null,
      error: '',
      showModal: false,
      loadingTasks: false,
      taskList: []
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.selectedFile = file
        this.uploadFile()
      }
    },
    async uploadFile() {
      if (!this.selectedFile) {
        return
      }

      this.uploading = true
      this.result = null
      this.error = ''

      const formData = new FormData()
      formData.append('video', this.selectedFile)

      try {
        const res = await axios.post(`${apiBaseUrl}/toAudio`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.result = res.data
      } catch (err) {
        this.error = err.response?.data || err.message || '上传失败'
      } finally {
        this.uploading = false
        this.selectedFile = null
        this.$refs.fileInput.value = ''
      }
    },
    async showTaskList() {
      this.showModal = true
      this.loadingTasks = true
      this.taskList = []
      
      try {
        const res = await axios.get(`${apiBaseUrl}/getPendingAndRunning`)
        if (res.data.code === 200 && res.data.data) {
          const data = res.data.data
          this.taskList = Object.keys(data).map(id => ({
            id: id,
            fileName: data[id]
          }))
        }
      } catch (err) {
        console.error('获取任务列表失败:', err)
      } finally {
        this.loadingTasks = false
      }
    },
    closeModal() {
      this.showModal = false
    },
    async getTaskDetail(taskId) {
      try {
        const res = await axios.get(`${apiBaseUrl}/getTask/${taskId}`)
        this.result = res.data
        this.error = ''
      } catch (err) {
        this.error = err.response?.data || err.message || '获取任务详情失败'
        this.result = null
      } finally {
        this.showModal = false
      }
    }
  }
}
</script>

<style scoped>
.top-right-icon {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background-color: #f56c6c;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.top-right-icon .tooltip {
  position: absolute;
  right: 50px;
  background-color: #333;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s;
  pointer-events: none;
}

.top-right-icon:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

.top-right-icon:hover {
  background-color: #e64545;
}

.upload-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  text-align: center;
}

h1 {
  color: #333;
}

.upload-box {
  margin: 30px 0;
}

button {
  padding: 12px 24px;
  font-size: 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: #3aa876;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.file-info {
  margin-top: 15px;
  color: #666;
  font-size: 14px;
}

.loading {
  margin: 20px 0;
  color: #42b983;
  font-weight: bold;
}

.response-box {
  margin-top: 30px;
  padding: 20px;
  background-color: #f0f9f4;
  border-radius: 4px;
  text-align: left;
}

.response-box h3 {
  margin-top: 0;
  color: #42b983;
}

.result-item {
  margin-bottom: 12px;
}

.label {
  font-weight: bold;
  margin-right: 10px;
}

.success {
  color: #42b983;
  font-weight: bold;
}

.fail {
  color: #f56c6c;
  font-weight: bold;
}

.response-box pre {
  background-color: white;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}

.error-box {
  margin-top: 30px;
  padding: 20px;
  background-color: #fef0f0;
  border-radius: 4px;
  text-align: left;
}

.error-box h3 {
  margin-top: 0;
  color: #f56c6c;
}

.error-box pre {
  background-color: white;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.loading-tasks {
  text-align: center;
  color: #666;
  padding: 40px 0;
}

.no-tasks {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.task-id {
  font-weight: bold;
  color: #333;
  cursor: pointer;
}

.task-id:hover {
  color: #42b983;
  text-decoration: underline;
}

.task-name {
  color: #666;
}
</style>
