<template>
  <div class="container">
    <h1>💬 Chat Vue 3</h1>

    <!-- Formulaire d'authentification -->
    <div v-if="!jwtToken" class="auth-form">
      <h3>{{ isLoginMode ? 'Connexion' : 'Inscription' }}</h3>
      <input v-model="tempUsername" type="text" placeholder="Nom d'utilisateur" />
      <input v-model="password" type="password" placeholder="Mot de passe" />
      <button @click="handleAuth">
        {{ isLoginMode ? 'Se connecter' : 'S’inscrire' }}
      </button>
      <p @click="isLoginMode = !isLoginMode" class="toggle-mode">
        {{ isLoginMode ? 'Pas de compte ? Inscris-toi' : 'Déjà inscrit ? Connecte-toi' }}
      </p>
    </div>
    <div v-else-if="!username" class="form">
      <input v-model="tempUsername" type="text" placeholder="Entrez votre pseudo" />
      <button @click="setUsername">Valider</button>
    </div>

    <div v-else class="chat-container">
      <!-- Le chat -->
      <div class="chat-main">
        <p>Connecté en tant que : <strong>{{ username }}</strong></p>

        <input
          class="message-input"
          v-model="message"
          type="text"
          placeholder="Votre message 😊"
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage">Envoyer</button>

        <ul class="messages">
          <li v-for="(msg, index) in messages" :key="index" :style="{ borderLeft: '4px solid ' + (msg.color || '#0077cc') }">
            <img :src="getAvatar(msg.sender)" class="avatar" />
            <div class="content">
              <span class="sender" :style="{ color: msg.color || '#0077cc' }">
                {{ msg.sender }}
              </span>
              <span class="time">({{ formatTime(msg.timestamp) }})</span>
              <div class="text">{{ msg.content }}</div>
              <button class="like-button" @click="likeMessage(msg.id)">❤️ {{ msg.likes ?? 0}}</button>
            </div>
          </li>
        </ul>

        <button @click="resetUsername">Changer de pseudo</button>
        <!-- Sélecteur de couleur -->
        <div class="theme-switcher">
          <span>🎨 Couleur du chat :</span>
          <button @click="openColorPicker = !openColorPicker">
            Choisir une couleur
          </button>
          <input
            v-if="openColorPicker"
            type="color"
            v-model="themeColor"
            @input="updateThemeColor"
          />
        </div>
      </div>

      <!-- Sidebar utilisateurs connectés -->
      <div v-if="users.length" class="chat-sidebar">
        <h3>👥 Connectés ({{ users.length }})</h3>
        <div class="user-list">
          <div class="user" v-for="(user, index) in users" :key="index">
            <img :src="getAvatar(user)" class="avatar-small" />
            <span>{{ user }}</span>
          </div>
        </div>
      </div>

      

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { io } from 'socket.io-client';
import { useToast } from 'vue-toast-notification';

const socket = io('http://localhost:3000');

const username = ref('');
const tempUsername = ref('');
const message = ref('');
const messages = ref([]);
const users = ref([]);
const themeColor = ref(localStorage.getItem('themeColor') || '#0077cc');
const openColorPicker = ref(false);
const toast = useToast();

onMounted(() => {
  const saved = sessionStorage.getItem('username');
  if (saved) {
    username.value = saved;
    socket.emit('register', saved);
  }

  socket.on('message', (data) => {
    if (typeof data.likes !== 'number') data.likes = 0;
    messages.value.push(data);
  });

  socket.on('users', (userList) => {
    users.value = userList;
  });

  document.documentElement.style.setProperty('--theme-color', themeColor.value);
});

watch(themeColor, (newColor) => {
  document.documentElement.style.setProperty('--theme-color', newColor);
  localStorage.setItem('themeColor', newColor);
});

const setUsername = () => {
  if (!jwtToken.value) {
  alert("Veuillez vous connecter pour entrer un pseudo.");
  return;
}
  if (tempUsername.value.trim()) {
    username.value = tempUsername.value.trim();
    sessionStorage.setItem('username', username.value);
    socket.emit('register', username.value);
  }
};

const resetUsername = () => {
  sessionStorage.removeItem('username');
  location.reload();
};

const sendMessage = () => {
  if (message.value.trim()) {
    socket.emit('message', {
      sender: username.value,
      content: message.value,
      timestamp: new Date().toISOString(),
      color: themeColor.value,
    });
    message.value = '';
  }
};

const getAvatar = (name) => `https://api.dicebear.com/7.x/thumbs/svg?seed=${name}`;
const formatTime = (iso) => {
  const date = new Date(iso);
  return isNaN(date) ? '' : date.toLocaleTimeString();
};

const updateThemeColor = () => {
  document.documentElement.style.setProperty('--theme-color', themeColor.value);
  localStorage.setItem('themeColor', themeColor.value);
};


const jwtToken = ref(localStorage.getItem('token') || '');
const isLoginMode = ref(true);
const password = ref('');

const handleAuth = async () => {
  const endpoint = isLoginMode.value ? 'login' : 'register';
  const url = `http://localhost:3000/auth/${endpoint}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: tempUsername.value,
        password: password.value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Une erreur est survenue');
    }

    if (isLoginMode.value) {
      jwtToken.value = data.access_token;
      toast.success('Connexion réussie');
    } else {
      toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter');
      isLoginMode.value = true;
    }

    tempUsername.value = '';
    password.value = '';
  } catch (err) {
    toast.error(err.message);
  }
};


const likeMessage = (messageId) => {
  socket.emit('like', messageId);
};

socket.on('like', ({ messageId, likes }) => {
  const msg = messages.value.find(m => m.id === messageId);
  if (msg) {
    msg.likes = likes;
  }
});


</script>

<style scoped>
:root {
  --theme-color: #0077cc;
}

body {
  background-color: #f0f2f5;
}

.container {
  max-width: 900px;
  margin: auto;
  padding: 20px;
  font-family: 'Segoe UI', sans-serif;
}

.form {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.chat-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  margin-top: 20px;
}

.chat-main {
  flex: 1;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.chat-sidebar {
  width: 220px;
  background: #f9f9f9;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #ddd;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.chat-sidebar h3 {
  font-size: 1rem;
  margin-bottom: 10px;
  text-align: center;
}

.like-button {
  background: transparent;
  color: black;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  transition: transform 0.1s ease;
}

.like-button:hover {
  transform: scale(1.2);
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid #eee;
  font-size: 0.9rem;
}

.user:hover {
  background: #f0f0f0;
}

.avatar-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

input[type="text"] {
  width: 90%;
  padding: 12px 14px;
  margin-top: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input[type="text"]:focus {
  outline: none;
  border-color: var(--theme-color);
  box-shadow: 0 0 0 2px rgba(0, 119, 204, 0.2);
}

button {
  margin-top: 10px;
  padding: 10px 16px;
  background-color: var(--theme-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

button:hover {
  background-color: #005fa3;
  transform: translateY(-1px);
}

.messages {
  list-style: none;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 20px;
}

.messages li {
  background: #fff;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  display: flex;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 10px;
}

.content {
  display: flex;
  flex-direction: column;
}

.sender {
  font-weight: bold;
  color: var(--theme-color);
}

.time {
  font-size: 0.8em;
  color: gray;
}

.text {
  margin-top: 2px;
}

.theme-switcher {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.theme-switcher span {
  font-weight: bold;
}

.theme-switcher button {
  padding: 10px 16px;
  background-color: var(--theme-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
  }

  .chat-sidebar {
    width: 100%;
    position: static;
  }
}

.auth-form {
  max-width: 400px;
  margin: 80px auto;
  padding: 30px;
  background: #112434;
  color: #d5dbe1;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  font-family: 'Segoe UI', sans-serif;
  text-align: center;
}

.auth-form h3 {
  margin-bottom: 20px;
  font-size: 24px;
}

.auth-form input {
  width: 90%;
  padding: 12px;
  margin-bottom: 15px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
}

.auth-form input::placeholder {
  color: #999;
}

.auth-form button {
  width: 100%;
  padding: 12px;
  background-color: #5a8ea4;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.auth-form button:hover {
  background-color: #3c6c81;
}

.toggle-mode {
  margin-top: 15px;
  cursor: pointer;
  color: #d5dbe1;
  text-decoration: underline;
  font-size: 14px;
}
</style>