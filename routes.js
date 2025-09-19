// 所有巴士路線資料
const busRoutes = {
  "1": {
    name_zh: "1 號線 - 佐敦 → 九龍塘",
    name_en: "Route 1 - Jordan → Kowloon Tong",
    stops: [
      { name_zh: "佐敦", name_en: "Jordan", coord: [22.302711, 114.177216] },
      { name_zh: "旺角", name_en: "Mong Kok", coord: [22.307246, 114.171936] },
      { name_zh: "太子", name_en: "Prince Edward", coord: [22.318531, 114.168709] },
      { name_zh: "九龍塘", name_en: "Kowloon Tong", coord: [22.330886, 114.160839] }
    ]
  },
  "2": {
    name_zh: "2 號線 - 尖沙咀 → 沙田",
    name_en: "Route 2 - Tsim Sha Tsui → Sha Tin",
    stops: [
      { name_zh: "尖沙咀", name_en: "Tsim Sha Tsui", coord: [22.296, 114.172] },
      { name_zh: "紅磡", name_en: "Hung Hom", coord: [22.303, 114.182] },
      { name_zh: "大圍", name_en: "Tai Wai", coord: [22.373, 114.178] },
      { name_zh: "沙田", name_en: "Sha Tin", coord: [22.382, 114.189] }
    ]
  },
  "3": {
    name_zh: "3 號線 - 中環 → 北角",
    name_en: "Route 3 - Central → North Point",
    stops: [
      { name_zh: "中環", name_en: "Central", coord: [22.2819, 114.1582] },
      { name_zh: "金鐘", name_en: "Admiralty", coord: [22.2795, 114.1655] },
      { name_zh: "銅鑼灣", name_en: "Causeway Bay", coord: [22.2803, 114.185] },
      { name_zh: "北角", name_en: "North Point", coord: [22.291, 114.2004] }
    ]
  }
};
