import { QuizQuestion } from '../types/quiz.types';

export const QUIZ_BANK: QuizQuestion[] = [
  {
    id: 1,
    question: 'Chai nhua PET sau khi su dung nen duoc xu ly nhu the nao?',
    options: [
      'Vut vao thung rac thuong',
      'Rua sach, ep dep va bo vao thung tai che',
      'Dot bo',
      'Chon lap',
    ],
    correctIndex: 1,
    explanation:
      'Chai PET co the tai che tot neu duoc lam sach va ep gon truoc khi thu gom.',
    emoji: 'recycle',
    topic: 'plastic',
    difficulty: 'easy',
  },
  {
    id: 2,
    question: 'Pin cu thuoc loai rac nao?',
    options: ['Rac huu co', 'Rac tai che', 'Rac nguy hai', 'Rac thong thuong'],
    correctIndex: 2,
    explanation:
      'Pin chua kim loai nang va hoa chat nen phai duoc thu gom nhu rac nguy hai.',
    emoji: 'battery',
    topic: 'battery',
    difficulty: 'easy',
  },
  {
    id: 3,
    question: 'Giay ban dinh dau mo co nen bo vao nhom tai che giay khong?',
    options: [
      'Co, vi van la giay',
      'Khong, vi lam hong quy trinh tai che',
      'Co, neu gap gon lai',
      'Chi khi phoi kho',
    ],
    correctIndex: 1,
    explanation:
      'Dau mo va tap chat khien giay ban kho tai che va de lam nhiem ban lo giay sach.',
    emoji: 'paper',
    topic: 'recycling',
    difficulty: 'easy',
  },
  {
    id: 4,
    question:
      'Tui nilon thong thuong can khoang bao lau de phan huy ngoai tu nhien?',
    options: ['10 nam', '50 nam', '100-500 nam', '1000 nam'],
    correctIndex: 2,
    explanation:
      'Tui nilon mat rat lau de phan huy, vi vay nen han che su dung va thay bang tui tai dung.',
    emoji: 'bag',
    topic: 'plastic',
    difficulty: 'medium',
  },
  {
    id: 5,
    question:
      'Diem thu gom rac nguy hai phu hop nhat cho pin va bong den la gi?',
    options: [
      'Thung rac sinh hoat gan nha',
      'Diem thu gom rac nguy hai chuyen dung',
      'Thung rac tai che giay',
      'Kenh hoac ao ho',
    ],
    correctIndex: 1,
    explanation:
      'Pin va bong den can duoc thu gom tai diem chuyen dung de tranh ro ri hoa chat.',
    emoji: 'lightbulb',
    topic: 'battery',
    difficulty: 'medium',
  },
  {
    id: 6,
    question:
      'Dieu gi giup tang chat luong cua vat lieu tai che truoc khi mang di doi?',
    options: [
      'Tron chung tat ca loai rac',
      'Giu nguyen thuc an thua tren bao bi',
      'Phan loai dung va lam sach so bo',
      'Bop nat vat lieu thuy tinh',
    ],
    correctIndex: 2,
    explanation:
      'Phan loai dung va ve sinh so bo giup vat lieu tai che it bi nhiem ban hon.',
    emoji: 'seedling',
    topic: 'recycling',
    difficulty: 'easy',
  },
  {
    id: 7,
    question: 'Ly do chinh khong nen dot rac nhua ngoai troi la gi?',
    options: [
      'Lam nhua dat hon',
      'Phat sinh khi doc va anh huong suc khoe',
      'Nhua se tan ra thanh nuoc',
      'Khong tao ra khoi',
    ],
    correctIndex: 1,
    explanation:
      'Dot nhua ngoai troi co the phat sinh khi doc, bui min va nhieu chat gay hai.',
    emoji: 'fire',
    topic: 'plastic',
    difficulty: 'medium',
  },
  {
    id: 8,
    question:
      'Mot thoi quen nao sau day giup giam rac nhua dung mot lan hieu qua nhat?',
    options: [
      'Mang binh nuoc ca nhan',
      'Mua nhieu tui nilon hon',
      'Dung ly nhua moi ngay',
      'Bo tat ca vao cung mot thung',
    ],
    correctIndex: 0,
    explanation:
      'Mang binh nuoc ca nhan giup cat giam dang ke luong chai va ly nhua dung mot lan.',
    emoji: 'cup',
    topic: 'general',
    difficulty: 'easy',
  },
  {
    id: 9,
    question:
      'Khi thu gom nhieu loai vat lieu tai che, dieu nao quan trong nhat?',
    options: [
      'Phan loai theo chat lieu',
      'Buoc that chat tat ca lai voi nhau',
      'Ngam nuoc truoc khi mang di',
      'Tron voi rac huu co de tiet kiem cho',
    ],
    correctIndex: 0,
    explanation:
      'Phan loai theo chat lieu la buoc cot loi de don vi tai che xu ly dung luong vat lieu.',
    emoji: 'box',
    topic: 'recycling',
    difficulty: 'medium',
  },
  {
    id: 10,
    question:
      'Tai sao pin sac thuong than thien hon voi moi truong so voi pin dung mot lan?',
    options: [
      'Vi luon re hon',
      'Vi co the tai su dung nhieu chu ky',
      'Vi khong can dien de sac',
      'Vi duoc bo chung voi rac huu co',
    ],
    correctIndex: 1,
    explanation:
      'Pin sac co the dung lai nhieu lan, giup giam luong pin thai bo ra moi truong.',
    emoji: 'plug',
    topic: 'battery',
    difficulty: 'medium',
  },
  {
    id: 11,
    question: 'Nhua so 1 (PET) thuong duoc dung cho vat dung nao?',
    options: ['Binh nuoc giai khat', 'Vo day dien', 'Noi kim loai', 'Pin tieu'],
    correctIndex: 0,
    explanation:
      'PET thuong xuat hien o chai nuoc giai khat va nhieu loai bao bi nhua dung mot lan.',
    emoji: 'bottle',
    topic: 'plastic',
    difficulty: 'hard',
  },
  {
    id: 12,
    question:
      'Neu mot vat lieu tai che bi lan qua nhieu tap chat, hau qua pho bien la gi?',
    options: [
      'Giam kha nang tai che hoac bi loai bo',
      'Tang gia tri tai che len cao',
      'Khong anh huong gi',
      'Tu phan huy nhanh hon',
    ],
    correctIndex: 0,
    explanation:
      'Tap chat khien vat lieu kho tai che hon, lam giam chat luong dau ra hoac bi tu choi thu gom.',
    emoji: 'warning',
    topic: 'recycling',
    difficulty: 'hard',
  },
];
