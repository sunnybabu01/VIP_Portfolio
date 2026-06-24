document.addEventListener('DOMContentLoaded', () => {
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotForm = document.getElementById('chatbot-form');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatbotSuggestionChips = document.querySelectorAll('.chatbot-chip');

  let chatHistory = [];

  if (!chatbotToggle || !chatbotWindow) return;

  // Toggle Chatbot Window Open/Close
  chatbotToggle.addEventListener('click', () => {
    chatbotWindow.classList.toggle('hidden');
    chatbotWindow.classList.toggle('flex');
    if (chatbotWindow.classList.contains('flex')) {
      chatbotInput.focus();
      scrollMessages();
    }
  });

  if (chatbotClose) {
    chatbotClose.addEventListener('click', () => {
      chatbotWindow.classList.add('hidden');
      chatbotWindow.classList.remove('flex');
    });
  }

  // Handle Suggestion Chips
  chatbotSuggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.getAttribute('data-query');
      if (text) {
        chatbotInput.value = text;
        submitMessage(text);
      }
    });
  });

  // Handle message submission
  if (chatbotForm) {
    chatbotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatbotInput.value.trim();
      if (!text) return;
      
      chatbotInput.value = '';
      submitMessage(text);
    });
  }

  // Submit Message function
  async function submitMessage(userText) {
    // 1. Render User Message
    appendMessage(userText, 'user');
    scrollMessages();

    // 2. Render Loading/Typing Indicator
    const loaderId = appendLoadingIndicator();
    scrollMessages();

    try {
      // 3. Make API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userText,
          history: chatHistory
        })
      });

      const data = await response.json();
      
      // Remove loading indicator
      removeLoadingIndicator(loaderId);

      if (data.success) {
        // 4. Render AI response
        appendMessage(data.reply, 'model');
        
        // Update history
        chatHistory.push({ role: 'user', content: userText });
        chatHistory.push({ role: 'model', content: data.reply });
        
        // Keep history capped to last 10 messages for token usage limits
        if (chatHistory.length > 20) {
          chatHistory = chatHistory.slice(chatHistory.length - 20);
        }
      } else {
        throw new Error(data.message || 'API request failed');
      }
    } catch (err) {
      removeLoadingIndicator(loaderId);
      appendMessage(`Oops! I ran into an error: ${err.message}. Please try again shortly.`, 'error');
    } finally {
      scrollMessages();
    }
  }

  // Helper to append message bubble to UI
  function appendMessage(text, role) {
    const bubble = document.createElement('div');
    bubble.className = `flex mb-4 ${role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`;

    let parsedHtml = '';
    if (role === 'error') {
      parsedHtml = `<div class="bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300 text-sm max-w-[80%] rounded-2xl px-4 py-2 border border-red-200 dark:border-red-800 shadow-sm">${text}</div>`;
    } else if (role === 'user') {
      parsedHtml = `<div class="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm max-w-[80%] rounded-2xl rounded-tr-none px-4 py-2.5 shadow-md shadow-blue-500/15 leading-relaxed">${escapeHtml(text)}</div>`;
    } else {
      // Model / AI Response: parse Markdown
      const htmlContent = parseMarkdown(text);
      parsedHtml = `
        <div class="flex items-start max-w-[85%]">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs mr-2.5 flex-shrink-0 shadow-md font-heading ring-2 ring-blue-500/20">S</div>
          <div class="bg-slate-100 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-sm rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm border border-slate-200/60 dark:border-slate-800/60 leading-relaxed font-normal overflow-x-auto select-text chatbot-bubble-content">
            <p class="font-semibold text-xs text-blue-600 dark:text-blue-400 mb-1 flex items-center">
              <i class="fas fa-magic mr-1 text-[10px]"></i> AI Twin
            </p>
            ${htmlContent}
          </div>
        </div>
      `;
    }

    bubble.innerHTML = parsedHtml;
    chatbotMessages.appendChild(bubble);
  }

  // Helper to append typing placeholder
  function appendLoadingIndicator() {
    const id = `loading-${Date.now()}`;
    const bubble = document.createElement('div');
    bubble.id = id;
    bubble.className = 'flex mb-4 justify-start';
    bubble.innerHTML = `
      <div class="flex items-start max-w-[80%]">
        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs mr-2.5 flex-shrink-0 shadow-md font-heading ring-2 ring-blue-500/20">S</div>
        <div class="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl rounded-tl-none px-4 py-3.5 flex space-x-1.5 items-center border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
          <div class="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.25s"></div>
          <div class="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
        </div>
      </div>
    `;
    chatbotMessages.appendChild(bubble);
    return id;
  }

  function removeLoadingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) {
      indicator.remove();
    }
  }

  // Scroll message window to base
  function scrollMessages() {
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  // Escape HTML helper for safe user text input
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  // Simple, lightweight custom Markdown Parser for AI answers
  function parseMarkdown(markdown) {
    let html = markdown;

    // Convert code blocks
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre class="bg-gray-900 text-gray-100 p-2.5 rounded-lg text-xs overflow-x-auto my-2 font-mono border border-gray-800">${escapeHtml(code.trim())}</pre>`;
    });

    // Convert bold text
    html = html.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');

    // Convert headers (### H3, ## H2, # H1)
    html = html.replace(/^\s*###\s+(.*?)$/gm, '<h4 class="font-bold text-sm text-blue-600 dark:text-blue-400 mt-2 mb-1">$1</h4>');
    html = html.replace(/^\s*##\s+(.*?)$/gm, '<h3 class="font-bold text-base mt-3 mb-1 text-gray-900 dark:text-gray-100">$1</h3>');
    html = html.replace(/^\s*#\s+(.*?)$/gm, '<h2 class="font-extrabold text-lg mt-4 mb-2 text-gray-900 dark:text-gray-100">$1</h2>');

    // Convert bullet points (list blocks)
    // First translate individual items starting with * or -
    html = html.replace(/^\s*[\*\-]\s+(.*?)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>');

    // Convert newlines to breaks (if not inside block elements)
    html = html.replace(/(?:\r\n|\r|\n)/g, '<br>');

    // Tidy duplicate breaks around HTML tags
    html = html.replace(/<br><li/g, '<li');
    html = html.replace(/<\/li><br>/g, '</li>');
    html = html.replace(/<br><h/g, '<h');
    html = html.replace(/<\/pre><br>/g, '</pre>');

    return html;
  }
});
