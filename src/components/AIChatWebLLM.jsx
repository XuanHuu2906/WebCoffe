import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Fade,
  Zoom,
  Alert
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { searchFAQ, getQuickResponse } from '../lib/faq';
import { AI_CONTEXT } from '../lib/aiContext';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5004/api';

// Normalize Vietnamese (remove accents) for robust intent matching
const norm = (s = '') =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

// Fetch shop data from API
const fetchShopData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/shop/ai-context`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching shop data:', error);
    return null;
  }
};

// Build a concise menu text from shop data
const renderMenu = (shopData = null) => {
  // Use fetched shop data or fallback to AI_CONTEXT
  const ctx = shopData || AI_CONTEXT;
  const categories = ctx.menu?.categories || [];
  
  const lines = categories.map(category => {
    const categoryName = category.vietnamese || category.name;
    const items = (category.items || []).map(item => {
      const price = item.price.replace(' VND', '').replace(',', '.');
      const formattedPrice = Number(price.replace('.', '')).toLocaleString('vi-VN') + 'đ';
      const sizes = item.sizes ? ` (${item.sizes.join(', ')})` : '';
      return `  • ${item.name}: ${formattedPrice}${sizes}`;
    }).join('\n');
    return `**${categoryName}:**\n${items}`;
  }).join('\n\n');
  
  if (!lines) {
    return 'Đang cập nhật menu.\nBạn muốn mình gợi ý theo ngân sách không? — DREAM COFFEE';
  }
  
  const shopName = ctx.business?.name || 'DREAM COFFEE';
  return `**Menu ${shopName}:**\n\n${lines}\n\nBạn muốn mình gợi ý theo ngân sách không? 😊`;
};

// WebLLM lazy import with improved performance
let webLLMEngine = null;
let webLLMPromise = null;
let isWebLLMLoading = false;
let engineLoadProgress = 0;

const loadWebLLM = async (onProgress = null) => {
  // Return existing engine if already loaded
  if (webLLMEngine) return webLLMEngine;
  
  // Return existing promise if already loading
  if (webLLMPromise) return webLLMPromise;
  
  isWebLLMLoading = true;
  engineLoadProgress = 0;
  
  webLLMPromise = (async () => {
    try {
      // Use dynamic import with timeout
      const importPromise = import('@mlc-ai/web-llm');
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Import timeout')), 30000)
      );
      
      const { CreateMLCEngine } = await Promise.race([importPromise, timeoutPromise]);
      const modelId = import.meta.env.VITE_WEBLLM_MODEL || 'Llama-3.2-1B-Instruct-q4f32_1-MLC';
      
      // Create engine with optimized settings
      webLLMEngine = await CreateMLCEngine(modelId, {
        initProgressCallback: (progress) => {
          engineLoadProgress = progress.progress || 0;
          if (onProgress) onProgress(engineLoadProgress);
          console.log('WebLLM Loading:', Math.round(engineLoadProgress * 100) + '%');
        },
        // Optimize for performance
        logLevel: 'ERROR', // Reduce logging overhead
        useIndexedDBCache: true // Enable caching
      });
      
      console.log('WebLLM Engine loaded successfully');
      return webLLMEngine;
    } catch (error) {
      console.warn('WebLLM failed to load:', error);
      webLLMEngine = null;
      throw error;
    } finally {
      isWebLLMLoading = false;
      webLLMPromise = null;
    }
  })();
  
  return webLLMPromise;
};

const checkWebGPUSupport = () => {
  return 'gpu' in navigator;
};

const AIChatWebLLM = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [shopData, setShopData] = useState(null);
  const [shopDataLoading, setShopDataLoading] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Xin chào! Tôi là trợ lý AI của DREAM COFFEE. Tôi có thể giúp bạn về thực đơn, giá cả, giờ mở cửa và nhiều thông tin khác. Bạn cần hỗ trợ gì?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [webLLMStatus, setWebLLMStatus] = useState('checking'); // checking, available, unavailable, loading, error
  const [hasWebGPU, setHasWebGPU] = useState(false);
  const [modelProgress, setModelProgress] = useState(0);
  const [modelLoadError, setModelLoadError] = useState(null);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Check WebGPU support
    const webGPUSupported = checkWebGPUSupport();
    setHasWebGPU(webGPUSupported);
    
    if (webGPUSupported) {
      setWebLLMStatus('available');
    } else {
      setWebLLMStatus('unavailable');
    }
  }, []);

  useEffect(() => {
    // Fetch shop data from database
    const loadShopData = async () => {
      setShopDataLoading(true);
      const data = await fetchShopData();
      if (data) {
        setShopData(data);
        // Update greeting message with actual shop name
        const shopName = data.business?.name || 'DREAM COFFEE';
        const greetingText = data.responseTemplates?.greeting || 
          `Xin chào! Tôi là trợ lý AI của ${shopName}. Tôi có thể giúp bạn về thực đơn, giá cả, giờ mở cửa và nhiều thông tin khác. Bạn cần hỗ trợ gì?`;
        
        setMessages(prev => [
          {
            ...prev[0],
            text: greetingText
          },
          ...prev.slice(1)
        ]);
      }
      setShopDataLoading(false);
    };
    
    loadShopData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;
    
    // Debounce: prevent rapid message sending
    const now = Date.now();
    if (now - lastMessageTime < 1000) return; // 1 second cooldown
    setLastMessageTime(now);

    const userMessage = {
      id: now,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      // Strong, language-agnostic menu intent (no keywords required in exact form)
      const t = norm(currentInput)
      const isMenuIntent =
        /\b(menu|thuc don)\b/.test(t) ||
        /(xem|cho|co).*(menu)/.test(t) ||
        /(menu).*(nhu the nao|gi|the nao)/.test(t)

      let response = ''

      // ➊ Always satisfy menu intent immediately (fast + deterministic)
      if (isMenuIntent) {
        response = renderMenu(shopData)
      }
      
      if (!response) {
        const quickResponse = getQuickResponse(currentInput)
        if (quickResponse) response = quickResponse
      }
      if (!response && hasWebGPU && (webLLMStatus === 'available' || webLLMStatus === 'checking')) {
        response = await getWebLLMResponse(currentInput, shopData)
      }
      if (!response) {
        const faqResult = searchFAQ(currentInput)
        response = faqResult?.answer ||
          'Xin lỗi, tôi không hiểu câu hỏi của bạn. Bạn có thể hỏi về thực đơn, giá cả, giờ mở cửa, địa chỉ hoặc dịch vụ của chúng tôi không?'
      }

      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, hasWebGPU, webLLMStatus, isLoading, lastMessageTime]);

  const getWebLLMResponse = async (userInput, shopData = null) => {
    try {
      if (!webLLMEngine) {
        setWebLLMStatus('loading');
        setModelLoadError(null);
        
        // Load with progress callback
        webLLMEngine = await loadWebLLM((progress) => {
          setModelProgress(progress);
        });
        
        if (!webLLMEngine) {
          setWebLLMStatus('unavailable');
          setModelLoadError('Không thể tải mô hình AI');
          return null;
        }
        setWebLLMStatus('available');
        setModelProgress(0);
      }

      // Optimized system prompt using fetched shop data
      const ctx = shopData || AI_CONTEXT;
      const shop = ctx.business?.name || ctx.businessName || ctx.storeName || 'DREAM COFFEE';
      const address = ctx.location?.address || ctx.address || 'Đang cập nhật';
      const hours = ctx.hours?.weekdays?.display || ctx.hours || 'Đang cập nhật';
      const phone = ctx.contact?.phone || ctx.phone || '—';
      const email = ctx.contact?.email || ctx.email || '—';
      
      const systemPrompt = `Bạn là trợ lý AI của ${shop}. Trả lời ngắn gọn bằng tiếng Việt.

Thông tin cửa hàng:
- Tên: ${shop}
- Địa chỉ: ${address}
- Giờ mở cửa: ${hours}
- Điện thoại: ${phone}
- Email: ${email}

Trả lời thân thiện và chính xác. Nếu không biết, gợi ý liên hệ trực tiếp.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput }
      ];

      // Add timeout for response generation
      const responsePromise = webLLMEngine.chat.completions.create({
        messages,
        temperature: 0.4,
        max_tokens: 180, // Reduced for faster response
        stream: false // Disable streaming for better performance
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Response timeout')), 15000)
      );
      
      const response = await Promise.race([responsePromise, timeoutPromise]);
      return response.choices[0]?.message?.content || null;
      
    } catch (error) {
      console.error('WebLLM Error:', error);
      
      if (error.message === 'Response timeout') {
        setModelLoadError('AI phản hồi quá chậm, vui lòng thử lại');
      } else if (error.message === 'Import timeout') {
        setModelLoadError('Tải mô hình AI quá chậm, kiểm tra kết nối mạng');
      } else {
        setModelLoadError('Lỗi AI: ' + error.message);
      }
      
      setWebLLMStatus('error');
      
      // Fallback to menu if it was a menu intent and AI failed
      const t = norm(userInput)
      const isMenuIntent =
        /\b(menu|thuc don)\b/.test(t) ||
        /(xem|cho|co).*(menu)/.test(t) ||
        /(menu).*(nhu the nao|gi|the nao)/.test(t)
      
      if (error.message.includes('timeout') && isMenuIntent) {
        return renderMenu(shopData);
      }
      
      return null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusChip = useMemo(() => {
    switch (webLLMStatus) {
      case 'checking':
        return <Chip size="small" label="Đang kiểm tra..." color="default" />;
      case 'loading':
        const progressText = modelProgress > 0 ? ` ${Math.round(modelProgress * 100)}%` : '';
        return (
          <Chip 
            size="small" 
            label={`Đang tải AI...${progressText}`} 
            color="warning" 
            icon={<CircularProgress size={12} />} 
          />
        );
      case 'available':
        return <Chip size="small" label="AI Thông minh" color="success" />;
      case 'unavailable':
        return <Chip size="small" label="Chế độ cơ bản" color="info" />;
      case 'error':
        return <Chip size="small" label="Lỗi AI" color="error" />;
      default:
        return null;
    }
  }, [webLLMStatus, modelProgress]);

  if (!isOpen) {
    return (
      <Zoom in={true}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000
          }}
        >
          <IconButton
            onClick={() => setIsOpen(true)}
            sx={{
              width: 60,
              height: 60,
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.3s ease',
              boxShadow: 3
            }}
          >
            <ChatIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Box>
      </Zoom>
    );
  }

  return (
    <Fade in={isOpen}>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: { xs: 'calc(100vw - 32px)', sm: 400 },
          height: { xs: 'calc(100vh - 100px)', sm: 600 },
          maxHeight: '80vh',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            backgroundColor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BotIcon />
            <Box>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                DREAM COFFEE AI
              </Typography>
              {statusChip}
            </Box>
          </Box>
          <IconButton
            onClick={() => setIsOpen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Messages */}
        <Box
          ref={chatContainerRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 1,
            backgroundColor: '#f5f5f5'
          }}
        >
          {!hasWebGPU && (
            <Alert severity="info" sx={{ mb: 2, fontSize: '0.875rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon sx={{ fontSize: 16 }} />
                Thiết bị không hỗ trợ WebGPU. Sử dụng chế độ cơ bản.
              </Box>
            </Alert>
          )}
          
          {modelLoadError && (
            <Alert severity="error" sx={{ mb: 2, fontSize: '0.875rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon sx={{ fontSize: 16 }} />
                {modelLoadError}
              </Box>
            </Alert>
          )}
          
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 1
              }}
            >
              <Box
                sx={{
                  maxWidth: '80%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: message.sender === 'user' ? 'primary.main' : 'grey.300',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {message.sender === 'user' ? (
                    <PersonIcon sx={{ fontSize: 18, color: 'white' }} />
                  ) : (
                    <BotIcon sx={{ fontSize: 18, color: 'grey.700' }} />
                  )}
                </Box>
                <Box>
                  <Paper
                    sx={{
                      p: 1.5,
                      backgroundColor: message.sender === 'user' ? 'primary.main' : 'white',
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                      borderRadius: 2,
                      boxShadow: 1
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.text}
                    </Typography>
                  </Paper>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      mt: 0.5,
                      display: 'block',
                      textAlign: message.sender === 'user' ? 'right' : 'left'
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
          
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'grey.300',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <BotIcon sx={{ fontSize: 18, color: 'grey.700' }} />
                </Box>
                <Paper sx={{ p: 1.5, borderRadius: 2, boxShadow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      Đang suy nghĩ...
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box sx={{ p: 2, backgroundColor: 'white', borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi của bạn..."
              disabled={isLoading}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              sx={{
                minWidth: 48,
                height: 40,
                borderRadius: 2
              }}
            >
              <SendIcon sx={{ fontSize: 20 }} />
            </Button>
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
};

export default AIChatWebLLM;