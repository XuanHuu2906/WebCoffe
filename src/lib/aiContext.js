// AI Context for DREAM COFFEE - Business Information for Chatbot

export const AI_CONTEXT = {
  business: {
    name: "DREAM COFFEE",
    type: "Premium Coffee Shop",
    description: "A premium coffee shop in the heart of Ho Chi Minh City, offering exceptional coffee, pastries, and a welcoming atmosphere for work and relaxation.",
    established: "2020",
    mission: "To provide the finest coffee experience while fostering community connections."
  },

  location: {
    address: "123 Đường Cà Phê, Quận 1, Thành phố Hồ Chí Minh",
    englishAddress: "123 Coffee Street, District 1, Ho Chi Minh City",
    city: "Ho Chi Minh City",
    district: "District 1",
    country: "Vietnam",
    coordinates: {
      lat: 10.7769,
      lng: 106.7009
    },
    landmarks: "Near Ben Thanh Market, walking distance from Nguyen Hue Walking Street"
  },

  contact: {
    phone: "+84 28 1234 5678",
    hotline: "+84 28 1234 5678",
    email: "info@dreamcoffee.vn",
    website: "https://dreamcoffee.vn",
    socialMedia: {
      facebook: "https://facebook.com/dreamcoffee",
      instagram: "https://instagram.com/dreamcoffee",
      twitter: "https://twitter.com/dreamcoffee"
    }
  },

  hours: {
    weekdays: {
      open: "06:00",
      close: "20:00",
      display: "Thứ 2 - Thứ 6: 6:00 - 20:00 (GMT+7)"
    },
    weekends: {
      open: "07:00",
      close: "19:00",
      display: "Thứ 7 - Chủ Nhật: 7:00 - 19:00 (GMT+7)"
    },
    timezone: "GMT+7 (ICT)",
    notes: "Closed on major holidays",
    kitchen: "Kitchen closes 30 minutes before closing time"
  },

  menu: {
    categories: [
      {
        name: "Coffee",
        vietnamese: "Cà Phê",
        items: [
          {
            name: "Cà Phê Matcha Sữa",
            english: "Matcha Milk Coffee",
            description: "Cà phê sữa tươi hòa quyền cùng lớp matcha xanh mịn",
            price: "45,000 VND",
            sizes: ["Small", "Medium", "Large"]
          },
          {
            name: "Cà Phê Cốt Dừa",
            english: "Coconut Coffee",
            description: "Cà phê nguyên chất kết hợp với nước cốt dừa, sữa đặc và đá viên",
            price: "42,000 VND",
            sizes: ["Small", "Medium", "Large"],
            badge: "Best Seller"
          },
          {
            name: "Cà Phê Trứng",
            english: "Egg Coffee",
            description: "Sự kết hợp giữa cà phê đen và lớp trứng đánh bông với đường và sữa đặc",
            price: "48,000 VND",
            sizes: ["Small", "Medium", "Large"],
            badge: "Best Seller"
          },
          {
            name: "Capuchino",
            english: "Cappuccino",
            description: "Sự kết hợp giữa cà phê espresso và sữa đánh bông",
            price: "38,000 VND",
            sizes: ["Small", "Medium", "Large"]
          }
        ]
      },
      {
        name: "Pastries",
        vietnamese: "Bánh Ngọt",
        items: [
          {
            name: "Croissant",
            description: "Fresh baked daily",
            price: "25,000 VND"
          },
          {
            name: "Chocolate Muffin",
            description: "Rich chocolate muffin",
            price: "30,000 VND"
          }
        ]
      },
      {
        name: "Light Meals",
        vietnamese: "Món Ăn Nhẹ",
        items: [
          {
            name: "Sandwich",
            description: "Fresh sandwiches with various fillings",
            price: "55,000 VND"
          }
        ]
      }
    ],
    specialties: [
      "Vietnamese Egg Coffee",
      "Coconut Coffee",
      "Matcha Milk Coffee",
      "Fresh Daily Pastries"
    ]
  },

  services: {
    dineIn: true,
    takeaway: true,
    delivery: true,
    catering: true,
    events: {
      available: true,
      notice: "Contact us at least 48 hours in advance for bookings",
      types: ["Private events", "Meetings", "Celebrations"]
    },
    wholesale: {
      available: true,
      contact: "wholesale@dreamcoffee.vn",
      description: "Coffee beans and catering services for businesses"
    }
  },

  amenities: [
    "Free WiFi",
    "Air Conditioning",
    "Outdoor Seating",
    "Power Outlets",
    "Free Parking (20 spots, including 2 accessible spaces)",
    "Pet Friendly",
    "Study Area",
    "Meeting Rooms"
  ],

  payment: {
    methods: ["Cash", "Credit Card", "Debit Card", "Mobile Payment", "Bank Transfer"],
    currency: "VND (Vietnamese Dong)"
  },

  policies: {
    wifi: "Free high-speed WiFi for all customers",
    parking: "Free parking available - 20 spots including 2 accessible spaces",
    pets: "Pet-friendly environment",
    smoking: "Non-smoking establishment",
    reservations: "Walk-ins welcome, reservations recommended for groups of 6+"
  },

  responseTemplates: {
    greeting: "Xin chào! Tôi là trợ lý AI của DREAM COFFEE. Tôi có thể giúp bạn tìm hiểu về menu, giờ mở cửa, địa chỉ và các dịch vụ của chúng tôi. Bạn cần hỗ trợ gì?",
    fallback: "Xin lỗi, tôi không hiểu câu hỏi của bạn. Bạn có thể hỏi về menu, giờ mở cửa, địa chỉ, hoặc các dịch vụ của DREAM COFFEE không?",
    contact: "Bạn có thể liên hệ với chúng tôi qua:\n📞 Điện thoại: +84 28 1234 5678\n📧 Email: info@dreamcoffee.vn\n📍 Địa chỉ: 123 Đường Cà Phê, Quận 1, TP.HCM"
  }
};

// Helper functions for AI context
export const getBusinessHours = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const isWeekend = day === 0 || day === 6;
  
  return isWeekend ? AI_CONTEXT.hours.weekends : AI_CONTEXT.hours.weekdays;
};

export const isCurrentlyOpen = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  const hours = getBusinessHours();
  const openTime = parseInt(hours.open.split(':')[0]) * 60 + parseInt(hours.open.split(':')[1]);
  const closeTime = parseInt(hours.close.split(':')[0]) * 60 + parseInt(hours.close.split(':')[1]);
  
  return currentTime >= openTime && currentTime <= closeTime;
};

export const getMenuByCategory = (category) => {
  return AI_CONTEXT.menu.categories.find(cat => 
    cat.name.toLowerCase() === category.toLowerCase() || 
    cat.vietnamese.toLowerCase() === category.toLowerCase()
  );
};

export const searchMenuItems = (query) => {
  const results = [];
  AI_CONTEXT.menu.categories.forEach(category => {
    category.items.forEach(item => {
      if (
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        (item.english && item.english.toLowerCase().includes(query.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
      ) {
        results.push({ ...item, category: category.name });
      }
    });
  });
  return results;
};

export default AI_CONTEXT;