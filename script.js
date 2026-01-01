/**
 * ========================================================
 * SUPER CHAT - COMPLETE WHATSAPP-STYLE FRONTEND LOGIC
 * ========================================================
 * Modular, localStorage-powered, PWA-ready chat app
 * No external APIs - 100% original implementation
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONSTANTS & SELECTORS
    // ==========================================================================
    const SELECTORS = {
        screens: {
            chats: '#chats-screen',
            chat: '#chat-screen',
            status: '#status-screen',
            calls: '#calls-screen',
            settings: '#settings-screen'
        },
        chatList: '.chat-list',
        messagesList: '.messages-list',
        messageInput: '.message-input',
        aiFab: '.ai-fab',
        aiPanel: '.ai-panel',
        bottomNav: '.bottom-nav'
    };

    const STORAGE_KEYS = {
        user: 'superchat_user',
        chats: 'superchat_chats',
        messages: 'superchat_messages',
        statuses: 'superchat_statuses',
        calls: 'superchat_calls',
        aiMemory: 'superchat_ai_memory',
        offlineQueue: 'superchat_offline_queue'
    };

    const MESSAGE_STATUS = {
        SENT: 'sent',
        DELIVERED: 'delivered',
        READ: 'read'
    };

    const ONLINE_STATUS = {
        ONLINE: 'online',
        OFFLINE: 'offline',
        LAST_SEEN: 'last seen'
    };

    // ==========================================================================
    // CORE APP STATE
    // ==========================================================================
    const AppState = {
        currentUser: null,
        currentChatId: null,
        currentScreen: 'chats',
        isOnline: navigator.onLine,
        isTyping: false,
        messageQueue: [],
        aiConversation: [],
        speechRecognition: null,
        isAIPanelOpen: false
    };

    // ==========================================================================
    // UTILITY FUNCTIONS
    // ==========================================================================
    const Utils = {
        /**
         * Generate unique ID
         */
        generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2),

        /**
         * Format timestamp to chat time
         */
        formatTime: (timestamp) => {
            const date = new Date(timestamp);
            const now = Date.now();
            const diff = now - timestamp;

            if (diff < 60000) return 'Just now';
            if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
            if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
            
            const today = new Date(now);
            const msgDate = new Date(timestamp);
            
            if (date.toDateString() === today.toDateString()) {
                return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }
            return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
        },

        /**
         * Save to localStorage with error handling
         */
        saveStorage: (key, data) => {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (e) {
                console.warn('Storage save failed:', e);
                return false;
            }
        },

        /**
         * Load from localStorage
         */
        loadStorage: (key, defaultValue = []) => {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : defaultValue;
            } catch (e) {
                console.warn('Storage load failed:', e);
                return defaultValue;
            }
        },

        /**
         * Debounce function
         */
        debounce: (func, wait) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        }
    };

    // ==========================================================================
    // USER MANAGEMENT
    // ==========================================================================
    const UserManager = {
        /**
         * Initialize user on first launch
         */
        initUser: async () => {
            AppState.currentUser = Utils.loadStorage(STORAGE_KEYS.user);
            
            if (!AppState.currentUser) {
                const name = prompt('Welcome to Super Chat! What\'s your name?') || 'User';
                AppState.currentUser = {
                    id: Utils.generateId(),
                    name: name.trim(),
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=25d366&color=fff`,
                    lastSeen: Date.now(),
                    isOnline: true
                };
                Utils.saveStorage(STORAGE_KEYS.user, AppState.currentUser);
            }
            
            // Update UI
            document.querySelector('.app-name')?.insertAdjacentHTML('afterend', 
                `<span style="font-size:14px;color:var(--text-secondary);margin-left:8px">${AppState.currentUser.name}</span>`
            );
        },

        /**
         * Update user online status
         */
        updateStatus: (status) => {
            AppState.currentUser.isOnline = status === ONLINE_STATUS.ONLINE;
            AppState.currentUser.lastSeen = Date.now();
            Utils.saveStorage(STORAGE_KEYS.user, AppState.currentUser);
        }
    };

    // ==========================================================================
    // CHAT MANAGEMENT
    // ==========================================================================
    const ChatManager = {
        chats: [],
        messages: {},

        /**
         * Initialize chats and messages
         */
        init: () => {
            ChatManager.chats = Utils.loadStorage(STORAGE_KEYS.chats, [
                {
                    id: 'sarah_001',
                    userName: 'Sarah Wilson',
                    avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&size=128&background=202c33&color=e9edef',
                    lastMessage: 'Hey! Are you free this weekend?',
                    lastTime: Date.now() - 60000,
                    unreadCount: 3,
                    pinned: false,
                    muted: false
                },
                {
                    id: 'john_001',
                    userName: 'John Doe',
                    avatar: 'https://ui-avatars.com/api/?name=John+Doe&size=128&background=202c33&color=e9edef',
                    lastMessage: 'Thanks for the info!',
                    lastTime: Date.now() - 3600000,
                    unreadCount: 0,
                    pinned: true,
                    muted: false
                }
            ]);
            ChatManager.messages = Utils.loadStorage(STORAGE_KEYS.messages, {});
            ChatManager.renderChats();
        },

        /**
         * Render chat list
         */
        renderChats: () => {
            const chatList = document.querySelector(SELECTORS.chatList);
            if (!chatList) return;

            chatList.innerHTML = ChatManager.chats
                .sort((a, b) => b.lastTime - a.lastTime || b.unreadCount - a.unreadCount || b.pinned - a.pinned)
                .map(chat => `
                    <article class="chat-item ${chat.unreadCount > 0 ? 'unread' : ''}" data-chat-id="${chat.id}">
                        <img src="${chat.avatar}" alt="${chat.userName}" class="chat-avatar">
                        <div class="chat-info">
                            <div class="chat-header">
                                <h3 class="user-name">${chat.userName}</h3>
                                <span class="message-time">${Utils.formatTime(chat.lastTime)}</span>
                            </div>
                            <p class="last-message">${chat.lastMessage}</p>
                            ${chat.unreadCount > 0 ? `<span class="unread-badge">${chat.unreadCount}</span>` : ''}
                        </div>
                    </article>
                `).join('');
        },

        /**
         * Get chat by ID
         */
        getChat: (chatId) => ChatManager.chats.find(chat => chat.id === chatId),

        /**
         * Create new chat
         */
        createChat: (userName, avatar = null) => {
            const chat = {
                id: Utils.generateId(),
                userName,
                avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=128&background=202c33&color=e9edef`,
                lastMessage: '',
                lastTime: Date.now(),
                unreadCount: 0,
                pinned: false,
                muted: false
            };
            ChatManager.chats.unshift(chat);
            Utils.saveStorage(STORAGE_KEYS.chats, ChatManager.chats);
            ChatManager.renderChats();
            return chat;
        },

        /**
         * Update chat preview
         */
        updateChatPreview: (chatId, message) => {
            const chat = ChatManager.getChat(chatId);
            if (chat) {
                chat.lastMessage = message.length > 40 ? message.slice(0, 40) + '...' : message;
                chat.lastTime = Date.now();
                Utils.saveStorage(STORAGE_KEYS.chats, ChatManager.chats);
                ChatManager.renderChats();
            }
        }
    };

    // ==========================================================================
    // MESSAGE MANAGEMENT
    // ==========================================================================
    const MessageManager = {
        /**
         * Send message
         */
        sendMessage: (text) => {
            if (!text.trim() || !AppState.currentChatId) return;

            const message = {
                id: Utils.generateId(),
                chatId: AppState.currentChatId,
                sender: AppState.currentUser.name,
                text: text.trim(),
                type: 'text',
                timestamp: Date.now(),
                status: MESSAGE_STATUS.SENT
            };

            // Add to messages
            if (!ChatManager.messages[AppState.currentChatId]) {
                ChatManager.messages[AppState.currentChatId] = [];
            }
            ChatManager.messages[AppState.currentChatId].push(message);
            Utils.saveStorage(STORAGE_KEYS.messages, ChatManager.messages);

            // Render message
            MessageManager.renderMessage(message, 'outgoing');

            // Update chat preview
            ChatManager.updateChatPreview(AppState.currentChatId, text);

            // Clear input
            const input = document.querySelector(SELECTORS.messageInput);
            input.value = '';

            // Simulate delivery
            setTimeout(() => {
                message.status = MESSAGE_STATUS.DELIVERED;
                MessageManager.updateMessageStatus(message.id, MESSAGE_STATUS.DELIVERED);
            }, 1000);

            setTimeout(() => {
                message.status = MESSAGE_STATUS.READ;
                MessageManager.updateMessageStatus(message.id, MESSAGE_STATUS.READ);
            }, 3000);

            // Simulate reply
            MessageManager.simulateReply();
        },

        /**
         * Render single message
         */
        renderMessage: (message, direction) => {
            const messagesList = document.querySelector(SELECTORS.messagesList);
            if (!messagesList) return;

            const statusHtml = message.status === MESSAGE_STATUS.READ 
                ? '<span class="message-status read">✓✓</span>'
                : message.status === MESSAGE_STATUS.DELIVERED
                ? '<span class="message-status delivered">✓✓</span>'
                : '';

            const messageHtml = `
                <div class="message ${direction}" data-message-id="${message.id}">
                    <div class="message-bubble">
                        <p>${message.text}</p>
                        <span class="message-time">${Utils.formatTime(message.timestamp)}</span>
                        ${direction === 'outgoing' ? statusHtml : ''}
                    </div>
                </div>
            `;

            messagesList.insertAdjacentHTML('beforeend', messageHtml);
            MessageManager.scrollToBottom();
        },

        /**
         * Update message status
         */
        updateMessageStatus: (messageId, status) => {
            const messageEl = document.querySelector(`[data-message-id="${messageId}"] .message-status`);
            if (messageEl) {
                messageEl.textContent = status === MESSAGE_STATUS.READ ? '✓✓' : '✓✓';
                messageEl.className = `message-status ${status}`;
            }
        },

        /**
         * Load messages for current chat
         */
        loadMessages: () => {
            const messagesList = document.querySelector(SELECTORS.messagesList);
            if (!messagesList || !AppState.currentChatId) return;

            const messages = ChatManager.messages[AppState.currentChatId] || [];
            messagesList.innerHTML = '';

            messages.forEach(msg => {
                const direction = msg.sender === AppState.currentUser.name ? 'outgoing' : 'incoming';
                MessageManager.renderMessage(msg, direction);
            });

            MessageManager.scrollToBottom();
        },

        /**
         * Scroll to bottom
         */
        scrollToBottom: () => {
            const container = document.querySelector('.messages-container');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        },

        /**
         * Simulate AI/user reply
         */
        simulateReply: () => {
            if (!AppState.currentChatId) return;

            setTimeout(() => {
                const replies = [
                    'Sounds good! 🎉',
                    'Let me check my schedule...',
                    'Yes, what time?',
                    'Perfect! See you then 👍',
                    'Maybe, what\'s the plan?',
                    'Great! Where should we meet?',
                    'Sorry, busy tonight 😅'
                ];
                const reply = replies[Math.floor(Math.random() * replies.length)];
                
                const message = {
                    id: Utils.generateId(),
                    chatId: AppState.currentChatId,
                    sender: ChatManager.getChat(AppState.currentChatId)?.userName || 'User',
                    text: reply,
                    type: 'text',
                    timestamp: Date.now(),
                    status: MESSAGE_STATUS.READ
                };

                if (!ChatManager.messages[AppState.currentChatId]) {
                    ChatManager.messages[AppState.currentChatId] = [];
                }
                ChatManager.messages[AppState.currentChatId].push(message);
                Utils.saveStorage(STORAGE_KEYS.messages, ChatManager.messages);

                MessageManager.renderMessage(message, 'incoming');
            }, 1500 + Math.random() * 2000);
        }
    };

    // ==========================================================================
    // NAVIGATION
    // ==========================================================================
    const Navigation = {
        /**
         * Switch screens
         */
        switchScreen: (screenName) => {
            // Hide all screens
            Object.values(SELECTORS.screens).forEach(screen => {
                const el = document.querySelector(screen);
                if (el) el.classList.remove('active');
            });

            // Show target screen
            const targetScreen = document.querySelector(SELECTORS.screens[screenName]);
            if (targetScreen) {
                targetScreen.classList.add('active');
                AppState.currentScreen = screenName;
            }

            // Update nav active state
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            const activeNav = document.querySelector(`[data-screen="${screenName}"]`);
            if (activeNav) activeNav.classList.add('active');

            // Load content for screen
            switch(screenName) {
                case 'chat':
                    MessageManager.loadMessages();
                    break;
                case 'chats':
                    ChatManager.renderChats();
                    break;
            }
        },

        /**
         * Open chat
         */
        openChat: (chatId) => {
            AppState.currentChatId = chatId;
            Navigation.switchScreen('chat');
        }
    };

    // ==========================================================================
    // VOICE FEATURES
    // ==========================================================================
    const VoiceManager = {
        recognition: null,
        synthesis: window.speechSynthesis,
        isListening: false,

        /**
         * Initialize voice features
         */
        init: () => {
            if ('webkitSpeechRecognition' in window) {
                VoiceManager.recognition = new webkitSpeechRecognition();
                VoiceManager.recognition.continuous = false;
                VoiceManager.recognition.interimResults = false;
                VoiceManager.recognition.lang = 'en-US';

                VoiceManager.recognition.onstart = () => {
                    VoiceManager.isListening = true;
                    document.querySelector('.message-input')?.focus();
                };

                VoiceManager.recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    document.querySelector(SELECTORS.messageInput).value = transcript;
                    MessageManager.sendMessage(transcript);
                };

                VoiceManager.recognition.onend = () => {
                    VoiceManager.isListening = false;
                };
            }
        },

        /**
         * Toggle voice input
         */
        toggleVoice: () => {
            if (!VoiceManager.recognition) return;

            if (VoiceManager.isListening) {
                VoiceManager.recognition.stop();
            } else {
                VoiceManager.recognition.start();
            }
        },

        /**
         * Read message aloud
         */
        speak: (text) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            VoiceManager.synthesis.speak(utterance);
        }
    };

    // ==========================================================================
    // FLOATING AI ASSISTANT
    // ==========================================================================
    const AIAssistant = {
        memory: Utils.loadStorage(STORAGE_KEYS.aiMemory, []),
        conversation: [],

        /**
         * Toggle AI panel
         */
        toggle: () => {
            const panel = document.querySelector('.ai-panel');
            const fab = document.querySelector('.ai-fab');
            
            AppState.isAIPanelOpen = !AppState.isAIPanelOpen;
            panel.classList.toggle('active', AppState.isAIPanelOpen);
            fab.style.transform = AppState.isAIPanelOpen ? 'rotate(45deg)' : 'rotate(0deg)';
        },

        /**
         * Process AI input
         */
        processInput: (input) => {
            const response = AIAssistant.generateResponse(input.toLowerCase());
            AIAssistant.addMessage('user', input);
            AIAssistant.addMessage('ai', response);
            Utils.saveStorage(STORAGE_KEYS.aiMemory, AIAssistant.memory);
            VoiceManager.speak(response);
        },

        /**
         * Generate rule-based AI response
         */
        generateResponse: (input) => {
            const memory = AIAssistant.memory.slice(-5);
            const recentWords = input.split(' ');

            // Greeting
            if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
                return `Hello ${AppState.currentUser.name}! How can I help you today? 😊`;
            }

            // Time/Date
            if (input.includes('time') || input.includes('clock')) {
                return `It's ${new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} right now.`;
            }

            if (input.includes('date') || input.includes('today')) {
                return `Today is ${new Date().toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}.`;
            }

            // Chat help
            if (input.includes('chat') || input.includes('message')) {
                return 'To send a message, just type and press Enter! You can also use voice input 🎤';
            }

            // User info
            if (input.includes(AppState.currentUser.name.toLowerCase())) {
                return `Yes, that's you! ${AppState.currentUser.name} - ready to chat! 👋`;
            }

            // Memory recall
            if (input.includes('remember') || input.includes('last')) {
                const last = memory[memory.length - 1];
                return last ? `You mentioned: "${last.text.slice(0, 30)}..."` : 'I don\'t remember anything yet!';
            }

            // Default responses
            const responses = [
                'Interesting! Tell me more... 🤔',
                'Got it! Anything else? 👍',
                "That's cool! What's next?",
                'Understood! 😊',
                'Nice! Keep chatting! 💬'
            ];

            // Avoid repetition
            const recentResponses = AIAssistant.memory.filter(m => m.role === 'ai').slice(-3).map(m => m.text);
            const available = responses.filter(r => !recentResponses.includes(r));
            
            return available.length > 0 ? available[0] : responses[0];
        },

        /**
         * Add message to AI conversation
         */
        addMessage: (role, text) => {
            AIAssistant.conversation.push({ role, text, timestamp: Date.now() });
            AIAssistant.memory.push({ role, text, timestamp: Date.now() });
            
            const messagesContainer = document.querySelector('.ai-messages');
            if (messagesContainer) {
                const messageEl = document.createElement('div');
                messageEl.className = `ai-message ${role}`;
                messageEl.innerHTML = `<p>${text}</p>`;
                messagesContainer.appendChild(messageEl);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }
    };

    // ==========================================================================
    // STATUS (STORIES)
    // ==========================================================================
    const StatusManager = {
        statuses: Utils.loadStorage(STORAGE_KEYS.statuses, []),

        render: () => {
            const statusList = document.querySelector('.status-list');
            if (!statusList) return;

            statusList.innerHTML = `
                ${StatusManager.renderMyStatus()}
                ${StatusManager.statuses.map(status => StatusManager.renderStatus(status)).join('')}
            `;
        },

        renderMyStatus: () => `
            <article class="status-item my-status">
                <div class="status-circle">
                    <img src="${AppState.currentUser.avatar}" alt="My Status">
                </div>
                <div class="status-info">
                    <p>Just now</p>
                </div>
            </article>
        `,

        renderStatus: (status) => `
            <article class="status-item ${status.viewed ? 'viewed' : ''}" data-status-id="${status.id}">
                <div class="status-circle">
                    <img src="${status.avatar}" alt="${status.userName}">
                    <div class="status-ring"></div>
                </div>
                <div class="status-info">
                    <h4>${status.userName}</h4>
                    <p>${Utils.formatTime(status.timestamp)}</p>
                </div>
            </article>
        `
    };

    // ==========================================================================
    // CALLS LOG
    // ==========================================================================
    const CallsManager = {
        calls: Utils.loadStorage(STORAGE_KEYS.calls, []),

        render: () => {
            const callsList = document.querySelector('.calls-list');
            if (!callsList) return;

            callsList.innerHTML = CallsManager.calls.map(call => `
                <article class="call-item ${call.type}">
                    <img src="${call.avatar}" alt="${call.name}" class="call-avatar">
                    <div class="call-info">
                        <h4 class="call-name">${call.name}</h4>
                        <span class="call-type">${call.direction} ${call.type} call</span>
                    </div>
                    <div class="call-actions">
                        <button class="icon-btn call-btn" onclick="CallsManager.callBack('${call.id}')">
                            <!-- Call icon SVG -->
                        </button>
                    </div>
                    <span class="call-time">${Utils.formatTime(call.timestamp)}</span>
                </article>
            `).join('');
        },

        addCall: (name, type, direction = 'incoming') => {
            const call = {
                id: Utils.generateId(),
                name,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=202c33&color=e9edef`,
                type,
                direction,
                timestamp: Date.now(),
                missed: direction === 'incoming' && Math.random() > 0.7
            };
            CallsManager.calls.unshift(call);
            Utils.saveStorage(STORAGE_KEYS.calls, CallsManager.calls.slice(0, 50)); // Keep last 50
        }
    };

    // ==========================================================================
    // OFFLINE SUPPORT
    // ==========================================================================
    const OfflineManager = {
        init: () => {
            window.addEventListener('online', () => {
                AppState.isOnline = true;
                document.body.classList.remove('offline');
                OfflineManager.processQueue();
            });

            window.addEventListener('offline', () => {
                AppState.isOnline = false;
                document.body.classList.add('offline');
            });
        },

        queueMessage: (message) => {
            AppState.messageQueue.push(message);
            Utils.saveStorage(STORAGE_KEYS.offlineQueue, AppState.messageQueue);
        },

        processQueue: () => {
            // Simulate sending queued messages
            AppState.messageQueue.forEach(msg => {
                // Backend hook here
                console.log('Sending queued message:', msg);
            });
            AppState.messageQueue = [];
            Utils.saveStorage(STORAGE_KEYS.offlineQueue, []);
        }
    };

    // ==========================================================================
    // EVENT HANDLERS
    // ==========================================================================
    const EventHandlers = {
        /**
         * Initialize all event listeners
         */
        init: () => {
            // Navigation
            document.querySelector(SELECTORS.bottomNav)?.addEventListener('click', (e) => {
                const navItem = e.target.closest('.nav-item');
                if (navItem?.dataset.screen) {
                    Navigation.switchScreen(navItem.dataset.screen);
                }
            });

            // Chat list clicks
            document.addEventListener('click', (e) => {
                const chatItem = e.target.closest('.chat-item');
                if (chatItem?.dataset.chatId) {
                    Navigation.openChat(chatItem.dataset.chatId);
                }
            });

            // Message input
            document.querySelector(SELECTORS.messageInput)?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    MessageManager.sendMessage(e.target.value);
                }
            });

            // Send button
            document.querySelector('.send-btn')?.addEventListener('click', () => {
                MessageManager.sendMessage(document.querySelector(SELECTORS.messageInput).value);
            });

            // Voice button
            document.querySelector('.input-btn[aria-label="Microphone"]')?.addEventListener('click', VoiceManager.toggleVoice);

            // AI Assistant
            document.querySelector(SELECTORS.aiFab)?.addEventListener('click', AIAssistant.toggle);

            document.querySelector('.ai-send')?.addEventListener('click', () => {
                const input = document.querySelector('.ai-input');
                if (input.value.trim()) {
                    AIAssistant.processInput(input.value);
                    input.value = '';
                }
            });

            document.querySelector('.ai-input')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    document.querySelector('.ai-send').click();
                }
            });

            // Back button
            document.querySelector('.back-btn')?.addEventListener('click', () => {
                Navigation.switchScreen('chats');
            });

            // Close AI
            document.querySelector('.close-ai')?.addEventListener('click', AIAssistant.toggle);
        }
    };

    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================
    const init = async () => {
        console.log('🚀 Super Chat initializing...');

        // Initialize core systems
        await UserManager.initUser();
        ChatManager.init();
        VoiceManager.init();
        OfflineManager.init();
        EventHandlers.init();

        // Render screens
        StatusManager.render();
        CallsManager.render();

        // Add some demo calls
        CallsManager.addCall('Mike Chen', 'video', 'incoming');
        CallsManager.addCall('John Doe', 'audio', 'outgoing');

        // Set initial screen
        Navigation.switchScreen('chats');

        // Simulate online status
        setInterval(() => {
            UserManager.updateStatus(Math.random() > 0.3 ? ONLINE_STATUS.ONLINE : ONLINE_STATUS.OFFLINE);
        }, 30000);

        console.log('✅ Super Chat ready! ✨');
    };

    // Start the app
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for debugging/global access
    window.SuperChat = {
        ChatManager,
        MessageManager,
        Navigation,
        AIAssistant,
        Utils
    };

})();
