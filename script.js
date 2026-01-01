/**
 * ============================================================================
 * SUPER CHAT WEB - WHATSAPP WEB STYLE CSS
 * ============================================================================
 * Desktop-first, two-pane layout, dark mode, fully responsive
 */

:root {
  /* Color Palette */
  --app-bg: #0b141a;
  --sidebar-bg: #111b21;
  --header-bg: #202c33;
  --bubble-in: #202c33;
  --bubble-out: #005c4b;
  --accent: #25d366;
  --accent-hover: #128c7e;
  --text-primary: #e9edef;
  --text-secondary: #8696a0;
  --border-color: #2a3942;
  --hover-bg: rgba(29, 37, 44, 0.5);
  
  /* Layout */
  --sidebar-width: 30%;
  --sidebar-width-mobile: 100%;
  --header-height: 60px;
  --input-height: 56px;
  
  /* Spacing */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 18px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  
  /* Transitions */
  --transition-fast: all 0.15s ease;
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ============================================================================
 * RESET & BASE STYLES
 * ============================================================================ */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  height: 100%;
  font-size: 16px;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, 
               Cantarell, sans-serif;
  background: var(--app-bg);
  color: var(--text-primary);
  line-height: 1.4;
  height: 100vh;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Custom Scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(140, 150, 160, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(140, 150, 160, 0.5);
}

/* ============================================================================
 * APP LAYOUT - TWO PANE STRUCTURE
 * ============================================================================ */
.super-chat-app {
  display: flex;
  height: 100vh;
  max-width: 100vw;
  background: var(--app-bg);
}

/* LEFT SIDEBAR (CHAT LIST) */
.chat-sidebar {
  width: var(--sidebar-width);
  min-width: 360px;
  max-width: 500px;
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
  position: relative;
  z-index: 10;
}

.chat-sidebar.mobile-collapsed {
  transform: translateX(-100%);
}

/* RIGHT CHAT PANEL */
.chat-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--app-bg);
  position: relative;
}

/* ============================================================================
 * LEFT SIDEBAR COMPONENTS
 * ============================================================================ */

/* APP HEADER */
.app-header {
  height: var(--header-height);
  background: var(--header-bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.header-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.app-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.header-right {
  display: flex;
  gap: var(--spacing-xs);
}

/* Icon Buttons */
.header-icon {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: var(--text-secondary);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.header-icon:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.header-icon svg {
  width: 20px;
  height: 20px;
}

.menu-dots {
  font-size: 24px;
  line-height: 1;
  font-weight: 100;
}

/* SEARCH SECTION */
.search-section {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-lg);
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
}

.search-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-md) 44px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: rgba(18, 27, 33, 0.8);
  color: var(--text-primary);
  font-size: 15px;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
}

/* CHAT LIST */
.chat-list-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

.chat-section {
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  margin: 0 0 var(--spacing-md) var(--spacing-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Chat Items */
.chat-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-smooth);
  position: relative;
}

.chat-item:hover {
  background: var(--hover-bg);
}

.chat-item.active {
  background: rgba(37, 211, 102, 0.1);
}

.chat-item.unread {
  background: rgba(0, 0, 0, 0.2);
}

.chat-avatar {
  width: 49px;
  height: 49px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.chat-avatar-container {
  position: relative;
}

.pin-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: var(--accent);
  border-radius: 50%;
  border: 2px solid var(--sidebar-bg);
}

.chat-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.chat-name {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-time {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 400;
  white-space: nowrap;
}

.chat-preview {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-indicator {
  position: absolute;
  right: var(--spacing-lg);
  bottom: 36px;
  background: var(--accent);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* ============================================================================
 * RIGHT CHAT PANEL COMPONENTS
 * ============================================================================ */

/* CHAT HEADER */
.chat-header {
  height: var(--header-height);
  background: var(--header-bg);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  z-index: 5;
}

.back-button {
  display: none;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: var(--text-secondary);
  border-radius: 50%;
  cursor: pointer;
  margin-right: var(--spacing-sm);
}

.chat-participant {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  min-width: 0;
}

.participant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.participant-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.participant-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.participant-status {
  font-size: 13px;
  color: var(--accent);
}

.participant-status.offline {
  color: var(--text-secondary);
}

.chat-header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* Action Buttons */
.action-button {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: var(--text-secondary);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.action-button:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.action-button svg {
  width: 20px;
  height: 20px;
}

/* MESSAGES AREA */
.messages-container {
  flex: 1;
  position: relative;
  background: var(--app-bg);
}

.messages-scrollable {
  height: 100%;
  overflow: hidden;
}

.messages-content {
  height: 100%;
  overflow-y: auto;
  padding: var(--spacing-lg) var(--spacing-lg) calc(var(--input-height) + var(--spacing-lg));
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* Message Groups */
.message-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.message {
  max-width: 70%;
}

.message.incoming {
  align-self: flex-start;
}

.message.outgoing {
  align-self: flex-end;
}

.message-bubble {
  display: flex;
  flex-direction: column;
  max-width: 100%;
  border-radius: var(--radius-lg);
  position: relative;
  animation: messageSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.message.incoming .message-bubble {
  background: var(--bubble-in);
  border-bottom-left-radius: var(--radius-sm);
}

.message.incoming .message-bubble::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 12px;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-right-color: var(--bubble-in);
}

.message.outgoing .message-bubble {
  background: var(--bubble-out);
  border-bottom-right-radius: var(--radius-sm);
}

.message.outgoing .message-bubble::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 12px;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-left-color: var(--bubble-out);
}

.message-content {
  padding: var(--spacing-md) var(--spacing-lg);
}

.message-content p {
  margin: 0;
  font-size: 15px;
  line-height: 1.4;
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 var(--spacing-lg) var(--spacing-sm);
  gap: var(--spacing-xs);
}

.message-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
}

.message-status {
  font-size: 12px;
  font-weight: 600;
}

.message-status.delivered {
  color: rgba(255, 255, 255, 0.7);
}

.message-status.read {
  color: var(--accent);
}

/* Media Messages */
.media-message .message-media {
  position: relative;
}

.media-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
}

/* Message Animations */
@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* MESSAGE INPUT AREA */
.message-input-area {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--input-height);
  background: var(--header-bg);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: flex-end;
  padding: 0 var(--spacing-lg);
  gap: var(--spacing-md);
  z-index: 4;
}

.input-container {
  flex: 1;
  min-width: 0;
  position: relative;
}

.input-wrapper {
  position: relative;
}

.message-input {
  width: 100%;
  min-height: 44px;
  max-height: 120px;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: rgba(18, 27, 33, 0.8);
  color: var(--text-primary);
  font-size: 15px;
  resize: none;
  outline: none;
  transition: var(--transition-fast);
}

.message-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
}

.message-input::placeholder {
  color: var(--text-secondary);
}

/* Input Actions */
.input-action {
  width: 44px;
  height: 44px;
  border: none;
  background: rgba(18, 27, 33, 0.6);
  color: var(--text-secondary);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.input-action:hover {
  background: rgba(18, 27, 33, 0.8);
  color: var(--text-primary);
}

.input-action svg {
  width: 20px;
  height: 20px;
}

.send-button {
  width: 44px;
  height: 44px;
  border: none;
  background: var(--accent);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.send-button:hover {
  background: var(--accent-hover);
  transform: scale(1.05);
}

.send-button svg {
  width: 20px;
  height: 20px;
}

/* ============================================================================
 * FLOATING AI ASSISTANT
 * ============================================================================ */
.ai-assistant {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.ai-button {
  position: relative;
  width: 60px;
  height: 60px;
  border: none;
  background: linear-gradient(135deg, var(--accent), #00bfa5);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  box-shadow: 0 8px 24px rgba(37, 211, 102, 0.4);
  transition: var(--transition-smooth);
  animation: aiPulse 2s infinite;
}

.ai-button:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(37, 211, 102, 0.6);
}

.ai-icon {
  font-size: 24px;
}

.ai-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

@keyframes aiPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* AI Panel */
.ai-panel {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 360px;
  max-height: 480px;
  background: rgba(12, 18, 25, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  transition: var(--transition-smooth);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.ai-panel.active {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.ai-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.ai-close {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  transition: var(--transition-fast);
}

.ai-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.ai-messages-container {
  height: 300px;
  overflow-y: auto;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.ai-message {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  animation: messageSlideIn 0.3s ease-out;
}

.ai-message.ai {
  background: rgba(37, 211, 102, 0.15);
  align-self: flex-start;
}

.ai-message.user {
  background: rgba(255, 255, 255, 0.1);
  align-self: flex-end;
}

.ai-message p {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 14px;
}

.ai-message-time {
  font-size: 11px;
  color: var(--text-secondary);
}

.ai-input-section {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-input {
  flex: 1;
  padding: var(--spacing-md);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-size: 14px;
}

.ai-input::placeholder {
  color: var(--text-secondary);
}

.ai-input:focus {
  outline: none;
  border-color: var(--accent);
}

.ai-send {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--accent);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: var(--transition-fast);
}

.ai-send:hover {
  background: var(--accent-hover);
}

/* ============================================================================
 * OPTIONAL PANELS (STATUS, CALLS, SETTINGS)
 * ============================================================================ */
.status-panel,
.calls-panel,
.settings-panel {
  display: none;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: var(--transition-fast);
}

.settings-item:hover {
  background: var(--hover-bg);
}

.settings-info h3 {
  font-size: 15px;
  margin: 0 0 var(--spacing-xs) 0;
}

.settings-info p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.settings-chevron {
  font-size: 20px;
  color: var(--text-secondary);
}

/* ============================================================================
 * RESPONSIVE DESIGN
 * ============================================================================ */
@media (max-width: 1024px) {
  .chat-sidebar {
    --sidebar-width: 35%;
    min-width: 320px;
  }
}

@media (max-width: 768px) {
  .super-chat-app {
    flex-direction: column;
  }
  
  .chat-sidebar {
    width: var(--sidebar-width-mobile);
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 100;
    transform: translateX(-100%);
    transition: var(--transition-smooth);
  }
  
  .chat-sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .back-button {
    display: flex;
  }
  
  .chat-header-actions {
    gap: var(--spacing-xs);
  }
  
  .action-button {
    width: 36px;
    height: 36px;
  }
  
  .ai-panel {
    width: 90vw;
    right: 5vw;
  }
}

@media (max-width: 480px) {
  .messages-content {
    padding: var(--spacing-md) var(--spacing-md) calc(var(--input-height) + var(--spacing-md));
  }
  
  .message-input-area {
    padding: 0 var(--spacing-md);
  }
}

/* ============================================================================
 * ACCESSIBILITY & PERFORMANCE
 * ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-contrast: high) {
  :root {
    --bubble-in: #333;
    --bubble-out: #00695c;
    --border-color: #555;
  }
}

/* Focus visible for keyboard navigation */
.header-icon:focus,
.action-button:focus,
.input-action:focus,
.send-button:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
