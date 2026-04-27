import { DailyQuizDifficulty, DailyQuizTopic } from '../types/quiz.types';

export const DAILY_QUIZ_TOPICS: DailyQuizTopic[] = [
  {
    id: 'recycling',
    name: 'Tai che dung cach',
    icon: 'recycle',
    description: 'Kien thuc co ban ve phan loai rac',
  },
  {
    id: 'plastic',
    name: 'Giam thieu rac nhua',
    icon: 'bag',
    description: 'Cach han che do nhua dung mot lan',
  },
  {
    id: 'battery',
    name: 'Xu ly rac nguy hai',
    icon: 'battery',
    description: 'Kien thuc ve pin va thiet bi dien tu',
  },
  {
    id: 'general',
    name: 'Song xanh moi ngay',
    icon: 'earth',
    description: 'Thoi quen bao ve moi truong',
  },
  {
    id: 'energy',
    name: 'Tiet kiem nang luong',
    icon: 'lightbulb',
    description: 'Cach su dung dien hieu qua',
  },
  {
    id: 'water',
    name: 'Bao ve nguon nuoc',
    icon: 'water',
    description: 'Giam lang phi va o nhiem nuoc',
  },
  {
    id: 'food',
    name: 'Chong lang phi thuc pham',
    icon: 'food',
    description: 'Mua sam va tieu dung thong minh',
  },
  {
    id: 'ecosystem',
    name: 'Bao ve he sinh thai',
    icon: 'leaf',
    description: 'Bao ton da dang sinh hoc',
  },
  {
    id: 'climate',
    name: 'Bien doi khi hau',
    icon: 'thermometer',
    description: 'Nguyen nhan va cach ung pho',
  },
  {
    id: 'transportation',
    name: 'Giao thong xanh',
    icon: 'bike',
    description: 'Di chuyen than thien voi moi truong',
  },
  {
    id: 'fashion',
    name: 'Thoi trang ben vung',
    icon: 'shirt',
    description: 'Han che rac thai tu quan ao',
  },
  {
    id: 'paper',
    name: 'Tiet kiem giay',
    icon: 'paper',
    description: 'Su dung va tai che giay',
  },
];

export const DAILY_QUIZ_DIFFICULTIES: DailyQuizDifficulty[] = [
  'easy',
  'medium',
  'hard',
  'mixed',
];

export const DAILY_QUIZ_TOPIC_COUNT = 4;
export const DAILY_QUIZ_QUESTION_COUNT = 5;
export const DAILY_QUIZ_CACHE_TTL_SECONDS = 48 * 3600;
export const POINTS_PER_CORRECT_ANSWER = 10;
