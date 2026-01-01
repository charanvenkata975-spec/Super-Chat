/**
 * ============================================================================
 * SUPER CHAT WEB - WHATSAPP WEB STYLE FRONTEND LOGIC
 * ============================================================================
 * Complete two-pane desktop chat app with real-time feel
 * 100% original, localStorage-powered, PWA-ready
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONSTANTS & SELECTORS
    // ==========================================================================
    const SELECTORS = {
        app: '.super-chat-app',
        sidebar: '.chat-sidebar',
        chatList: '.chat-list',
        chatItems: '.chat-item',
        activeChat: '.chat-item.active',
        messagesContent: '.messages-content',
        messageInput: '.message-input',
        chatHeader: '.chat-header',
        participantName: '.participant-name',
        participantStatus: '.participant-status',
        aiButton: '.ai-button',
        aiPanel: '.ai-panel',
        searchInput: '.search-input'
    };

    const STORAGE = {
        USER: 'superchatweb_user',
        CHATS: 'superchatweb_chats',
        MESSAGES: 'superchatweb_messages',
        ACTIVE_CHAT: 'superchatweb_activeChat',
        AI_MEMORY: 'superchatweb_aiMemory',
        OFFLINE_QUEUE: 'superchatweb_offlineQueue'
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
    // APP STATE
    // ==========================================================================
    const State = {
        currentUser: null,
        chats: [],
        messages: {},
        activeChatId: null,
        isOnline: navigator.onLine,
        isTyping: false,
        aiPanelOpen: false,
        searchTerm: '',
        messageQueue: [],
        speech: null
    };

    // ==========================================================================
    // UTILITY FUNCTIONS
    // ==========================================================================
    const Utils = {
        uid: () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        
        formatTime: (timestamp) => {
            const date = new Date(timestamp);
            const now = Date.now();
            const diffMs = now - timestamp;
            
            if (diffMs < 60000) return 'now';
            if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m`;
            if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h`;
            
            const today = new Date(now).toDateString();
            return date.toDateString() === today 
                ? date.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})
                : date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
        },

        storage: {
            save(key, data) {
                try {
                    localStorage.setItem(key, JSON.stringify(data));
                    return true;
                } catch {
                    return false;
                }
            },
            load(key, fallback = null) {
                try {
                    const data = localStorage.getItem(key);
                    return data ? JSON.parse(data) : fallback;
                } catch {
                    return fallback;
                }
            }
        },

        debounce(fn, ms) {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => fn(...args), ms);
            };
        }
    };

    // ==========================================================================
    // USER MANAGEMENT
    // ==========================================================================
    const User = {
        async init() {
            State.currentUser = Utils.storage.load(STORAGE.USER) || {
                id: Utils.uid(),
                name: 'You',
                avatar: `https://ui-avatars.com/api/?name=You&size=128&background=25d366&color=fff`,
                status: ONLINE_STATUS.ONLINE,
                lastSeen: Date.now()
            };
            Utils.storage.save(STORAGE.USER, State.currentUser);
        },

        updateStatus(status) {
            State.currentUser.status = status;
            State.currentUser.lastSeen = Date.now();
            Utils.storage.save(STORAGE.USER, State.currentUser);
            this.renderStatus();
        },

        renderStatus() {
            const statusEl = document.querySelector(SELECTORS.participantStatus);
            if (statusEl) {
                statusEl.textContent = State.currentUser.status;
                statusEl.className = `participant-status ${State.currentUser.status}`;
            }
        }
    };

    // ==========================================================================
    // CHAT MANAGEMENT
    // ==========================================================================
    const Chats = {
        init() {
            State.chats = Utils.storage.load(STORAGE.CHATS, [
                {
                    chatId: 'sarah_wilson',
                    userName: 'Sarah Wilson',
                    avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&size=128&background=667781&color=e9edef',
                    lastMessage: 'Hey! Are you free this weekend?',
                    lastTime: Date.now() - 300000,
                    unreadCount: 4,
                    pinned: false,
                    muted: false
                },
                {
                    chatId: 'john_doe',
                    userName: 'John Doe',
                    avatar: 'https://ui-avatars.com/api/?name=John+Doe&size=128&background=667781&color=e9edef',
                    lastMessage: 'Thanks for the info!',
                    lastTime: Date.now() - 7200000,
                    unreadCount: 0,
                    pinned: true,
                    muted: false
                },
                {
                    chatId: 'mike_chen',
                    userName: 'Mike Chen',
                    avatar: 'https://ui-avatars.com/api/?name=Mike+Chen&size=128&background=667781&color=e9edef',
                    lastMessage: 'See you tomorrow 👍',
                    lastTime: Date.now() - 86400000,
                    unreadCount: 0,
                    pinned: false,
                    muted: true
                }
            ]);
            
            State.messages = Utils.storage.load(STORAGE.MESSAGES, {});
            const lastChat = Utils.storage.load(STORAGE.ACTIVE_CHAT);
            State.activeChatId = lastChat || State.chats[0]?.chatId;
            
            this.render();
            Messages.load(State.activeChatId);
        },

        render() {
            const filteredChats = State.chats
                .filter(chat => 
                    !State.searchTerm || 
                    chat.userName.toLowerCase().includes(State.searchTerm) ||
                    chat.lastMessage.toLowerCase().includes(State.searchTerm)
                )
                .sort((a, b) => 
                    b.pinned - a.pinned ||
                    b.lastTime - a.lastTime ||
                    b.unreadCount - a.unreadCount
                );

            const chatList = document.querySelector(SELECTORS.chatList);
            if (!chatList) return;

            chatList.innerHTML = `
                ${filteredChats.some(c => c.pinned) ? `
                    <section class="chat-section pinned-chats">
                        <h2 class="section-title">PINNED</h2>
                        ${filteredChats.filter(c => c.pinned).map(this.renderChatItem).join('')}
                    </section>
                ` : ''}
                <section class="chat-section recent-chats">
                    <h2 class="section-title">${State.searchTerm ? 'RESULTS' : 'RECENT CHATS'}</h2>
                    ${filteredChats.filter(c => !c.pinned).map(this.renderChatItem).join('')}
                </section>
            `;
        },

        renderChatItem(chat) {
            const unreadBadge = chat.unreadCount > 0 
                ? `<div class="unread-indicator"><span class="unread-count">${chat.unreadCount > 99 ? '99+' : chat.unreadCount}</span></div>`
                : '';
            
            const pinIndicator = chat.pinned ? '<div class="pin-indicator"></div>' : '';
            
            return `
                <article class="chat-item ${chat.chatId === State.activeChatId ? 'active' : ''} ${chat.unreadCount > 0 ? 'unread' : ''}" data-chat-id="${chat.chatId}">
                    <div class="chat-avatar-container">
                        <img src="${chat.avatar}" alt="${chat.userName}" class="chat-avatar">
                        ${pinIndicator}
                    </div>
                    <div class="chat-content">
                        <div class="chat-header">
                            <h3 class="chat-name">${chat.userName}</h3>
                            <span class="chat-time">${Utils.formatTime(chat.lastTime)}</span>
                        </div>
                        <p class="chat-preview">${chat.lastMessage}</p>
                        ${unreadBadge}
                    </div>
                </article>
            `;
        },

        select(chatId) {
            State.activeChatId = chatId;
            Utils.storage.save(STORAGE.ACTIVE_CHAT, chatId);
            
            const chat = this.find(chatId);
            if (chat) {
                // Clear unread
                chat.unreadCount = 0;
                Utils.storage.save(STORAGE.CHATS, State.chats);
                
                // Update header
                document.querySelector(SELECTORS.participantName).textContent = chat.userName;
                User.renderStatus();
            }
            
            this.render();
            Messages.load(chatId);
        },

        find(chatId) {
            return State.chats.find(chat => chat.chatId === chatId);
        },

        updatePreview(chatId, message) {
            const chat = this.find(chatId);
            if (chat) {
                chat.lastMessage = message.slice(0, 50) + (message.length > 50 ? '...' : '');
                chat.lastTime = Date.now();
                Utils.storage.save(STORAGE.CHATS, State.chats);
                this.render();
            }
        }
    };

    // ==========================================================================
    // MESSAGE MANAGEMENT
    // ==========================================================================
    const Messages = {
        send(text) {
            if (!text.trim() || !State.activeChatId) return;

            const message = {
                id: Utils.uid(),
                chatId: State.activeChatId,
                sender: 'me',
                text: text.trim(),
                type: 'text',
                timestamp: Date.now(),
                status: MESSAGE_STATUS.SENT
            };

            // Add to messages
            if (!State.messages[State.activeChatId]) {
                State.messages[State.activeChatId] = [];
            }
            State.messages[State.activeChatId].push(message);
            Utils.storage.save(STORAGE.MESSAGES, State.messages);

            // Render
            this.render([message]);
            
            // Update chat preview
            Chats.updatePreview(State.activeChatId, text);
            
            // Clear input
            const input = document.querySelector(SELECTORS.messageInput);
            if (input) input.value = '';

            // Simulate delivery
            setTimeout(() => this.updateStatus(message.id, MESSAGE_STATUS.DELIVERED), 800);
            setTimeout(() => this.updateStatus(message.id, MESSAGE_STATUS.READ), 2500);
            
            // Simulate reply
            this.simulateReply();
        },

        render(messages) {
            const container = document.querySelector(SELECTORS.messagesContent);
            if (!container) return;

            messages.forEach(msg => {
                const isOutgoing = msg.sender === 'me';
                const statusHtml = isOutgoing ? 
                    `<span class="message-status ${msg.status}">${msg.status === MESSAGE_STATUS.READ ? '✓✓' : '✓✓'}</span>` 
                    : '';

                const messageHtml = `
                    <div class="message-group">
                        <div class="message ${isOutgoing ? 'outgoing' : 'incoming'}" data-msg-id="${msg.id}">
                            <div class="message-bubble">
                                <div class="message-content">
                                    <p>${msg.text}</p>
                                </div>
                                <div class="message-meta">
                                    <span class="message-time">${Utils.formatTime(msg.timestamp)}</span>
                                    ${statusHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                container.insertAdjacentHTML('beforeend', messageHtml);
            });
            
            this.scrollToBottom();
        },

        load(chatId) {
            const container = document.querySelector(SELECTORS.messagesContent);
            if (!container || !chatId) return;

            const messages = State.messages[chatId] || [];
            container.innerHTML = '';
            
            // Group by day (simplified)
            const grouped = {};
            messages.forEach(msg => {
                const dateKey = new Date(msg.timestamp).toDateString();
                if (!grouped[dateKey]) grouped[dateKey] = [];
                grouped[dateKey].push(msg);
            });

            Object.values(grouped).forEach(dayMessages => {
                this.render(dayMessages);
            });
            
            this.scrollToBottom();
        },

        updateStatus(msgId, status) {
            const msgEl = document.querySelector(`[data-msg-id="${msgId}"] .message-status`);
            if (msgEl) {
                msgEl.textContent = status === MESSAGE_STATUS.READ ? '✓✓' : '✓✓';
                msgEl.className = `message-status ${status}`;
            }
        },

        scrollToBottom() {
            const container = document.querySelector('.messages-scrollable');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        },

        simulateReply() {
            const replies = [
                'Sounds good!',
                'Perfect! 👍',
                'See you then!',
                'Great plan!',
                'Yes, works for me!',
                'Awesome! 😊'
            ];
            
            setTimeout(() => {
                const replyMsg = {
                    id: Utils.uid(),
                    chatId: State.activeChatId,
                    sender: 'other',
                    text: replies[Math.floor(Math.random() * replies.length)],
                    type: 'text',
                    timestamp: Date.now(),
                    status: MESSAGE_STATUS.READ
                };

                if (!State.messages[State.activeChatId]) {
                    State.messages[State.activeChatId] = [];
                }
                State.messages[State.activeChatId].push(replyMsg);
                Utils.storage.save(STORAGE.MESSAGES, State.messages);
                
                this.render([replyMsg]);
            }, 1000 + Math.random() * 2000);
        }
    };

    // ==========================================================================
    // VOICE SYSTEM
    // ==========================================================================
    const Voice = {
        recognition: null,
        synthesis: window.speechSynthesis,

        init() {
            if ('webkitSpeechRecognition' in window) {
                this.recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
                this.recognition.continuous = false;
                this.recognition.interimResults = false;
                this.recognition.lang = 'en-US';
                
                this.recognition.onresult = (e) => {
                    const text = e.results[0][0].transcript;
                    document.querySelector(SELECTORS.messageInput).value = text;
                    Messages.send(text);
                };
            }
        },

        toggle() {
            if (this.recognition && !this.recognition.listening) {
                this.recognition.start();
                this.setMicState(true);
            } else {
                this.recognition?.stop();
                this.setMicState(false);
            }
        },

        setMicState(listening) {
            const micBtn = document.querySelector('.mic-button');
            if (micBtn) {
                micBtn.style.background = listening ? 'var(--accent)' : 'rgba(18, 27, 33, 0.6)';
            }
        },

        speak(text) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95;
            utterance.pitch = 1.05;
            this.synthesis.speak(utterance);
        }
    };

    // ==========================================================================
    // AI ASSISTANT
    // ==========================================================================
    const AI = {
        memory: Utils.storage.load(STORAGE.AI_MEMORY, []),
        conversation: [],

        toggle() {
            State.aiPanelOpen = !State.aiPanelOpen;
            const panel = document.querySelector(SELECTORS.aiPanel);
            const button = document.querySelector(SELECTORS.aiButton);
            
            panel.classList.toggle('active', State.aiPanelOpen);
            button.style.transform = State.aiPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        },

        send(input) {
            this.conversation.push({ role: 'user', text: input, time: Date.now() });
            this.memory.push({ role: 'user', text: input, time: Date.now() });
            
            const response = this.generateResponse(input);
            this.conversation.push({ role: 'ai', text: response, time: Date.now() });
            this.memory.push({ role: 'ai', text: response, time: Date.now() });
            
            Utils.storage.save(STORAGE.AI_MEMORY, this.memory.slice(-50)); // Keep last 50
            
            this.renderConversation();
            Voice.speak(response);
        },

        generateResponse(input) {
            const lower = input.toLowerCase();
            
            if (lower.includes('hello') || lower.includes('hi')) {
                return `Hi ${State.currentUser.name}! How can I help? 😊`;
            }
            
            if (lower.includes('time')) {
                return `Current time: ${new Date().toLocaleTimeString()}`;
            }
            
            if (lower.includes(State.activeChatId)) {
                const chat = Chats.find(State.activeChatId);
                return `You're chatting with ${chat?.userName}. Need help drafting a reply?`;
            }
            
            const responses = [
                'Got it! 👍',
                'Interesting! Tell me more.',
                'Perfect! 😊',
                'Understood.',
                'Great! What next?'
            ];
            
            return responses[Math.floor(Math.random() * responses.length)];
        },

        renderConversation() {
            const container = document.querySelector('.ai-messages-container');
            if (!container) return;
            
            container.innerHTML = this.conversation.slice(-10).map(msg => `
                <div class="ai-message ${msg.role}">
                    <p>${msg.text}</p>
                    <span class="ai-message-time">${Utils.formatTime(msg.time)}</span>
                </div>
            `).join('');
            
            container.scrollTop = container.scrollHeight;
        }
    };

    // ==========================================================================
    // OFFLINE SUPPORT
    // ==========================================================================
    const Offline = {
        init() {
            window.addEventListener('online', () => {
                State.isOnline = true;
                document.body.classList.remove('offline');
                this.flushQueue();
            });
            
            window.addEventListener('offline', () => {
                State.isOnline = false;
                document.body.classList.add('offline');
            });
        },

        queue(message) {
            State.messageQueue.push(message);
            Utils.storage.save(STORAGE.OFFLINE_QUEUE, State.messageQueue);
        },

        flushQueue() {
            State.messageQueue.forEach(msg => {
                // Backend sync hook
                console.log('Syncing offline message:', msg);
            });
            State.messageQueue = [];
            Utils.storage.save(STORAGE.OFFLINE_QUEUE, []);
        }
    };

    // ==========================================================================
    // EVENT HANDLERS
    // ==========================================================================
    const Events = {
        init() {
            // Chat selection
            document.addEventListener('click', (e) => {
                const chatItem = e.target.closest(SELECTORS.chatItems);
                if (chatItem?.dataset.chatId) {
                    Chats.select(chatItem.dataset.chatId);
                }
            });

            // Message sending
            document.addEventListener('keydown', (e) => {
                if (e.target.matches(SELECTORS.messageInput) && e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    Messages.send(e.target.value);
                }
            });

            document.querySelector('.send-button')?.addEventListener('click', () => {
                Messages.send(document.querySelector(SELECTORS.messageInput).value);
            });

            // Voice
            document.querySelector('.mic-button')?.addEventListener('click', () => Voice.toggle());

            // AI
            document.querySelector(SELECTORS.aiButton)?.addEventListener('click', AI.toggle);
            document.querySelector('.ai-send')?.addEventListener('click', () => {
                const input = document.querySelector('.ai-input');
                if (input?.value.trim()) {
                    AI.send(input.value);
                    input.value = '';
                }
            });

            // Search
            document.querySelector(SELECTORS.searchInput)?.addEventListener('input', Utils.debounce((e) => {
                State.searchTerm = e.target.value.toLowerCase();
                Chats.render();
            }, 200));

            // Message context menu (right-click)
            document.addEventListener('contextmenu', (e) => {
                const message = e.target.closest('.message');
                if (message) {
                    e.preventDefault();
                    this.showMessageMenu(e, message);
                }
            });

            // Back button (mobile)
            document.querySelector('.back-button')?.addEventListener('click', () => {
                document.querySelector(SELECTORS.sidebar).classList.remove('mobile-open');
            });
        },

        showMessageMenu(e, messageEl) {
            // Context menu logic (simplified)
            console.log('Message actions for:', messageEl.dataset.msgId);
        }
    };

    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================
    async function init() {
        console.log('🚀 Super Chat Web initializing...');
        
        await User.init();
        Chats.init();
        Voice.init();
        Offline.init();
        Events.init();
        AI.renderConversation();
        
        // Restore last chat
        if (State.activeChatId) {
            Chats.select(State.activeChatId);
        }
        
        // Simulate activity
        setInterval(() => {
            User.updateStatus(Math.random() > 0.2 ? ONLINE_STATUS.ONLINE : ONLINE_STATUS.LAST_SEEN);
        }, 15000);
        
        console.log('✅ Super Chat Web ready! ✨');
    }

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Global API
    window.SuperChatWeb = {
        State,
        Chats,
        Messages,
        AI,
        Utils
    };

})();
