<template>
  <div class="chat-container">
    <div class="header">
      <div class="back-btn" @click="goBack">← 返回</div>
      <h1 class="title">AI 对话</h1>
    </div>
    
    <div class="chat-messages" ref="chatMessages">
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
        <div class="message-avatar">{{ message.role === 'user' ? '我' : 'AI' }}</div>
        <div class="message-content">{{ message.content }}</div>
      </div>
    </div>
    
    <div class="input-area">
      <input
        v-model="inputMessage"
        @keyup.enter="sendMessage"
        placeholder="请输入您的问题..."
        class="chat-input"
        :disabled="loading"
      />
      <button @click="sendMessage" :disabled="loading || !inputMessage.trim()" class="send-btn">
        {{ loading ? '发送中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script>
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7432'

export default {
  name: 'Chat',
  data() {
    return {
      messages: [
        {
          role: 'ai',
          content: '您好！我是AI助手，请问有什么可以帮助您的吗？'
        }
      ],
      inputMessage: '',
      loading: false,
      eventSource: null
    }
  },
  methods: {
    goBack() {
      if (this.eventSource) {
        this.eventSource.close()
      }
      this.$router.push('/')
    },
    sendMessage() {
      const message = this.inputMessage.trim()
      if (!message || this.loading) return
      
      this.messages.push({
        role: 'user',
        content: message
      })
      this.inputMessage = ''
      this.loading = true
      
      const aiMessageIndex = this.messages.length
      this.messages.push({
        role: 'ai',
        content: ''
      })
      
      const url = `${apiBaseUrl}/ai/ai?question=${encodeURIComponent(message)}`
      this.eventSource = new EventSource(url)
      
      this.eventSource.onmessage = (event) => {
        if (event.data && event.data !== '[DONE]') {
          this.messages[aiMessageIndex].content += event.data
          this.$nextTick(() => {
            this.$refs.chatMessages.scrollTop = this.$refs.chatMessages.scrollHeight
          })
        }
      }
      
      this.eventSource.onerror = () => {
        this.eventSource.close()
        this.eventSource = null
        this.loading = false
        if (!this.messages[aiMessageIndex].content) {
          this.messages[aiMessageIndex].content = '抱歉，发生了错误，请稍后再试。'
        }
      }
      
      this.eventSource.onopen = () => {
        this.loading = false
      }
    }
  },
  beforeDestroy() {
    if (this.eventSource) {
      this.eventSource.close()
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Space+Grotesk:wght@400;500&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.chat-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  font-family: 'Space Grotesk', sans-serif;
  overflow: hidden;
}

.header {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #667eea;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.3s;
}

.back-btn:hover {
  color: #764ba2;
}

.title {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 80%;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.message.ai .message-avatar {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.message.user .message-avatar {
  background: linear-gradient(135deg, #42b983, #00d4aa);
  color: white;
}

.message-content {
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  line-height: 1.6;
  color: #333;
}

.input-area {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 30px;
  display: flex;
  gap: 12px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  padding: 14px 20px;
  font-size: 15px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.3s;
  font-family: 'Space Grotesk', sans-serif;
}

.chat-input:focus {
  border-color: #667eea;
}

.chat-input:disabled {
  background: #f5f5f5;
}

.send-btn {
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Space Grotesk', sans-serif;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>
