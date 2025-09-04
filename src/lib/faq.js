// FAQ Library with Fuzzy Search for DREAM COFFEE AI Chatbot Fallback
import Fuse from 'fuse.js';
import { AI_CONTEXT, getBusinessHours, isCurrentlyOpen, searchMenuItems } from './aiContext.js';

// Build comprehensive FAQ database from AI context
export const buildFAQ = (context = AI_CONTEXT) => {
  const faqs = [
    // Business Hours
    {
      question: "What are your opening hours?",
      vietnamese: "Giờ mở cửa của quán là khi nào?",
      answer: `Chúng tôi mở cửa:\n${context.hours.weekdays.display}\n${context.hours.weekends.display}\n\nLưu ý: ${context.hours.notes}`,
      keywords: ["hours", "open", "close", "time", "giờ", "mở cửa", "đóng cửa", "thời gian"]
    },
    {
      question: "Are you open now?",
      vietnamese: "Bây giờ quán có mở cửa không?",
      answer: () => {
        const open = isCurrentlyOpen();
        const hours = getBusinessHours();
        return open 
          ? `Có, chúng tôi đang mở cửa! Hôm nay chúng tôi mở cửa từ ${hours.display}`
          : `Xin lỗi, chúng tôi hiện đang đóng cửa. Hôm nay chúng tôi mở cửa từ ${hours.display}`;
      },
      keywords: ["open now", "currently open", "bây giờ", "hiện tại", "đang mở"]
    },

    // Location & Contact
    {
      question: "Where are you located?",
      vietnamese: "Quán ở đâu?",
      answer: `📍 Địa chỉ: ${context.location.address}\n🏙️ Gần: ${context.location.landmarks}\n📞 Điện thoại: ${context.contact.phone}`,
      keywords: ["location", "address", "where", "địa chỉ", "ở đâu", "vị trí"]
    },
    {
      question: "How can I contact you?",
      vietnamese: "Làm thế nào để liên hệ?",
      answer: `📞 Điện thoại: ${context.contact.phone}\n📧 Email: ${context.contact.email}\n🌐 Website: ${context.contact.website}\n📱 Facebook: ${context.contact.socialMedia.facebook}`,
      keywords: ["contact", "phone", "email", "liên hệ", "điện thoại", "số điện thoại"]
    },

    // Menu & Prices
    {
      question: "What's on your menu?",
      vietnamese: "Menu có gì?",
      answer: () => {
        let menuText = "🍵 **MENU DREAM COFFEE**\n\n";
        context.menu.categories.forEach(category => {
          menuText += `**${category.vietnamese} (${category.name})**\n`;
          category.items.forEach(item => {
            const badge = item.badge ? ` 🌟 ${item.badge}` : '';
            menuText += `• ${item.name} - ${item.price}${badge}\n`;
          });
          menuText += "\n";
        });
        return menuText;
      },
      keywords: ["menu", "food", "drink", "coffee", "thực đơn", "món", "cà phê", "đồ uống"]
    },
    {
      question: "What coffee do you have?",
      vietnamese: "Có những loại cà phê gì?",
      answer: () => {
        const coffeeCategory = context.menu.categories.find(cat => cat.name === 'Coffee');
        if (!coffeeCategory) return "Xin lỗi, không tìm thấy thông tin cà phê.";
        
        let coffeeText = "☕ **CÀ PHÊ DREAM COFFEE**\n\n";
        coffeeCategory.items.forEach(item => {
          const badge = item.badge ? ` 🌟 ${item.badge}` : '';
          coffeeText += `**${item.name}** - ${item.price}${badge}\n${item.description}\n\n`;
        });
        return coffeeText;
      },
      keywords: ["coffee", "cà phê", "espresso", "cappuccino", "latte", "americano"]
    },
    {
      question: "What are your prices?",
      vietnamese: "Giá cả như thế nào?",
      answer: () => {
        let priceText = "💰 **BẢNG GIÁ**\n\n";
        context.menu.categories.forEach(category => {
          category.items.forEach(item => {
            priceText += `${item.name}: ${item.price}\n`;
          });
        });
        priceText += "\n*Giá có thể thay đổi mà không báo trước*";
        return priceText;
      },
      keywords: ["price", "cost", "how much", "giá", "bao nhiêu tiền", "chi phí"]
    },

    // Services
    {
      question: "Do you have WiFi?",
      vietnamese: "Có WiFi không?",
      answer: `Có! ${context.policies.wifi}. Hoàn hảo cho làm việc từ xa, học tập hoặc lướt web.`,
      keywords: ["wifi", "internet", "wireless", "mạng", "internet"]
    },
    {
      question: "Is parking available?",
      vietnamese: "Có chỗ đậu xe không?",
      answer: `Có! ${context.policies.parking}. Rất thuận tiện cho khách hàng lái xe.`,
      keywords: ["parking", "car", "vehicle", "đậu xe", "bãi xe", "chỗ đậu"]
    },
    {
      question: "Do you offer delivery?",
      vietnamese: "Có giao hàng không?",
      answer: context.services.delivery 
        ? "Có, chúng tôi có dịch vụ giao hàng. Vui lòng gọi điện để đặt hàng và biết thêm chi tiết về phí giao hàng."
        : "Hiện tại chúng tôi chưa có dịch vụ giao hàng, nhưng bạn có thể đặt mang về.",
      keywords: ["delivery", "takeaway", "order", "giao hàng", "đặt hàng", "mang về"]
    },
    {
      question: "Can I book events here?",
      vietnamese: "Có thể tổ chức sự kiện không?",
      answer: context.services.events.available 
        ? `Có! Chúng tôi tổ chức ${context.services.events.types.join(', ')}. ${context.services.events.notice}`
        : "Hiện tại chúng tôi chưa có dịch vụ tổ chức sự kiện.",
      keywords: ["event", "party", "meeting", "booking", "sự kiện", "tiệc", "họp", "đặt chỗ"]
    },

    // Payment & Policies
    {
      question: "What payment methods do you accept?",
      vietnamese: "Nhận thanh toán bằng gì?",
      answer: `Chúng tôi nhận các hình thức thanh toán: ${context.payment.methods.join(', ')}. Đơn vị tiền tệ: ${context.payment.currency}`,
      keywords: ["payment", "cash", "card", "thanh toán", "tiền mặt", "thẻ"]
    },
    {
      question: "Are pets allowed?",
      vietnamese: "Có cho phép mang thú cưng không?",
      answer: context.policies.pets || "Chúng tôi chào đón thú cưng của bạn!",
      keywords: ["pet", "dog", "cat", "animal", "thú cưng", "chó", "mèo"]
    },

    // Specialties
    {
      question: "What are your specialties?",
      vietnamese: "Món đặc sản là gì?",
      answer: `🌟 **MÓN ĐẶC SẢN DREAM COFFEE**\n\n${context.menu.specialties.map(item => `• ${item}`).join('\n')}\n\nĐặc biệt nổi tiếng với cà phê trứng và cà phê cốt dừa - hương vị độc đáo của Việt Nam!`,
      keywords: ["specialty", "special", "signature", "đặc sản", "đặc biệt", "nổi tiếng"]
    },

    // General Info
    {
      question: "Tell me about DREAM COFFEE",
      vietnamese: "Giới thiệu về DREAM COFFEE",
      answer: `🏪 **DREAM COFFEE**\n\n${context.business.description}\n\n📅 Thành lập: ${context.business.established}\n🎯 Sứ mệnh: ${context.business.mission}\n\n${context.location.landmarks}`,
      keywords: ["about", "info", "information", "giới thiệu", "thông tin", "dreamcoffee"]
    }
  ];

  return faqs;
};

// Fuzzy search configuration
const fuseOptions = {
  keys: [
    { name: 'question', weight: 0.4 },
    { name: 'vietnamese', weight: 0.4 },
    { name: 'keywords', weight: 0.2 }
  ],
  threshold: 0.4, // Lower = more strict matching
  distance: 100,
  includeScore: true,
  minMatchCharLength: 2
};

// Initialize Fuse search
let fuseInstance = null;

export const initializeFuzzySearch = () => {
  const faqs = buildFAQ();
  fuseInstance = new Fuse(faqs, fuseOptions);
  return fuseInstance;
};

// Search FAQ with fuzzy matching
export const searchFAQ = (query) => {
  if (!fuseInstance) {
    initializeFuzzySearch();
  }

  if (!query || query.trim().length < 2) {
    return {
      found: false,
      answer: AI_CONTEXT.responseTemplates.fallback,
      confidence: 0
    };
  }

  const results = fuseInstance.search(query.trim());
  
  if (results.length === 0) {
    // Try searching menu items if no FAQ match
    const menuResults = searchMenuItems(query);
    if (menuResults.length > 0) {
      let menuAnswer = "🍽️ **TÌM THẤY TRONG MENU**\n\n";
      menuResults.slice(0, 3).forEach(item => {
        const badge = item.badge ? ` 🌟 ${item.badge}` : '';
        menuAnswer += `**${item.name}** - ${item.price}${badge}\n${item.description}\nDanh mục: ${item.category}\n\n`;
      });
      return {
        found: true,
        answer: menuAnswer,
        confidence: 0.8,
        type: 'menu'
      };
    }
    
    return {
      found: false,
      answer: AI_CONTEXT.responseTemplates.fallback,
      confidence: 0
    };
  }

  const bestMatch = results[0];
  const confidence = 1 - bestMatch.score; // Convert Fuse score to confidence
  
  // If confidence is too low, return fallback
  if (confidence < 0.3) {
    return {
      found: false,
      answer: AI_CONTEXT.responseTemplates.fallback,
      confidence
    };
  }

  const faq = bestMatch.item;
  let answer = typeof faq.answer === 'function' ? faq.answer() : faq.answer;
  
  return {
    found: true,
    answer,
    confidence,
    question: faq.question,
    vietnamese: faq.vietnamese
  };
};

// Get random FAQ suggestions
export const getRandomFAQs = (count = 3) => {
  const faqs = buildFAQ();
  const shuffled = faqs.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(faq => ({
    question: faq.question,
    vietnamese: faq.vietnamese
  }));
};

// Quick responses for common queries
export const getQuickResponse = (query) => {
  const lowerQuery = query.toLowerCase();
  
  // Greeting detection
  if (/^(hi|hello|hey|xin chào|chào|chào bạn)$/i.test(lowerQuery.trim())) {
    return {
      found: true,
      answer: AI_CONTEXT.responseTemplates.greeting,
      confidence: 1.0,
      type: 'greeting'
    };
  }
  
  // Contact request
  if (/contact|liên hệ|số điện thoại|phone/.test(lowerQuery)) {
    return {
      found: true,
      answer: AI_CONTEXT.responseTemplates.contact,
      confidence: 0.9,
      type: 'contact'
    };
  }
  
  return null;
};

export default {
  buildFAQ,
  searchFAQ,
  initializeFuzzySearch,
  getRandomFAQs,
  getQuickResponse
};