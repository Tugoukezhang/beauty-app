/**
 * 课程相关接口
 * @description 课程列表、详情、购买、学习相关API
 * @note 本地调试版本：使用模拟数据
 */

// ==================== 模拟数据 ====================

// 模拟课程列表
const mockCourseList = [
  {
    id: 101,
    title: '新娘妆入门必修课：从零基础到专业',
    cover: '/assets/images/course-cover-1.png',
    teacher: { name: '美妆导师Lily', avatar: '/assets/images/avatar-lily.png' },
    price: 299,
    originalPrice: 599,
    studyCount: 12580,
    rating: 4.9,
    chapterCount: 12,
    isFree: false,
    isVip: false
  },
  {
    id: 102,
    title: '古风妆容设计教程：唐妆汉服清宫妆',
    cover: '/assets/images/course-cover-2.png',
    teacher: { name: '古风化妆师小雪', avatar: '/assets/images/avatar-xue.png' },
    price: 199,
    originalPrice: 399,
    studyCount: 8932,
    rating: 4.8,
    chapterCount: 8,
    isFree: false,
    isVip: false
  },
  {
    id: 103,
    title: '日常通勤妆容技巧：5分钟快速出门妆',
    cover: 'https://picsum.photos/300/200?random=course3',
    teacher: { name: '美妆博主Amy', avatar: '/assets/images/avatar-amy.png' },
    price: 0,
    originalPrice: 0,
    studyCount: 25680,
    rating: 4.7,
    chapterCount: 6,
    isFree: true,
    isVip: false
  },
  {
    id: 104,
    title: '韩式新娘妆：自然清透的浪漫风格',
    cover: '/assets/images/course-cover-4.png',
    teacher: { name: '韩式美妆师秀贤', avatar: '/assets/images/avatar-soo.png' },
    price: 399,
    originalPrice: 799,
    studyCount: 6580,
    rating: 4.9,
    chapterCount: 10,
    isFree: false,
    isVip: true
  },
  {
    id: 105,
    title: 'Cosplay仿妆：日漫角色还原教程',
    cover: '/assets/images/course-cover-5.png',
    teacher: { name: 'Cos化妆师阿杰', avatar: '/assets/images/avatar-jie.png' },
    price: 159,
    originalPrice: 299,
    studyCount: 4560,
    rating: 4.6,
    chapterCount: 8,
    isFree: false,
    isVip: false
  },
  {
    id: 106,
    title: '影视特效化妆：伤效老年妆入门',
    cover: '/assets/images/course-cover-6.png',
    teacher: { name: '特效化妆师老陈', avatar: '/assets/images/avatar-chen.png' },
    price: 499,
    originalPrice: 999,
    studyCount: 3240,
    rating: 4.8,
    chapterCount: 15,
    isFree: false,
    isVip: true
  },
  {
    id: 107,
    title: '约会小心机：斩男妆容教程',
    cover: '/assets/images/course-cover-7.png',
    teacher: { name: '美妆博主小雨', avatar: '/assets/images/avatar-yu.png' },
    price: 99,
    originalPrice: 199,
    studyCount: 15890,
    rating: 4.9,
    chapterCount: 5,
    isFree: false,
    isVip: false
  },
  {
    id: 108,
    title: '眼妆技巧：单眼皮内双必学',
    cover: '/assets/images/course-cover-8.png',
    teacher: { name: '眼妆达人小鹿', avatar: '/assets/images/avatar-lu.png' },
    price: 0,
    originalPrice: 0,
    studyCount: 32100,
    rating: 4.8,
    chapterCount: 4,
    isFree: true,
    isVip: false
  }
];

// 模拟分类
const mockCategories = [
  { id: 1, name: '新娘妆', icon: 'https://picsum.photos/80/80?random=bride', count: 128 },
  { id: 2, name: '古风妆', icon: 'https://picsum.photos/80/80?random=ancient', count: 96 },
  { id: 3, name: '日常妆', icon: 'https://picsum.photos/80/80?random=daily', count: 256 },
  { id: 4, name: '宴会妆', icon: 'https://picsum.photos/80/80?random=party', count: 84 },
  { id: 5, name: 'Cosplay', icon: 'https://picsum.photos/80/80?random=cos', count: 72 },
  { id: 6, name: '影视特效', icon: 'https://picsum.photos/80/80?random=film', count: 48 },
  { id: 7, name: '美甲', icon: 'https://picsum.photos/80/80?random=nail', count: 156 },
  { id: 8, name: '护肤', icon: 'https://picsum.photos/80/80?random=skincare', count: 189 }
];

// 模拟课程详情
const mockCourseDetail = {
  id: 101,
  title: '新娘妆入门必修课：从零基础到专业',
  cover: '/assets/images/course-cover-1.png',
  teacher: {
    id: 1,
    name: '美妆导师Lily',
    avatar: '/assets/images/avatar-lily.png',
    title: '资深婚礼化妆师',
    followers: 12580,
    courses: 28
  },
  price: 299,
  originalPrice: 599,
  studyCount: 12580,
  rating: 4.9,
  chapterCount: 12,
  duration: '12小时',
  isFree: false,
  isVip: false,
  description: '本课程涵盖新娘妆从入门到专业的全部知识，包括妆前护理、底妆技巧、眼妆画法、唇妆搭配、整体造型等。',
  chapters: [
    { id: 1, title: '第一章：妆前准备', duration: '45分钟', isFree: true },
    { id: 2, title: '第二章：底妆技巧', duration: '60分钟', isFree: true },
    { id: 3, title: '第三章：眼妆基础', duration: '55分钟', isFree: false },
    { id: 4, title: '第四章：眼妆进阶', duration: '50分钟', isFree: false },
    { id: 5, title: '第五章：腮红与修容', duration: '40分钟', isFree: false },
    { id: 6, title: '第六章：唇妆搭配', duration: '35分钟', isFree: false }
  ],
  comments: [
    { id: 1, userName: '备婚小新娘', avatar: 'https://picsum.photos/40/40?random=u1', rating: 5, content: '老师讲得很详细，新手也能学会！', createTime: '2024-01-15' },
    { id: 2, userName: '美妆爱好者', avatar: 'https://picsum.photos/40/40?random=u2', rating: 5, content: '课程很实用，已推荐给闺蜜', createTime: '2024-01-10' }
  ]
};

// 模拟章节列表
const mockChapters = [
  { id: 1, title: '第一章：妆前准备', duration: '45分钟', isFree: true, videoUrl: '' },
  { id: 2, title: '第二章：底妆技巧', duration: '60分钟', isFree: true, videoUrl: '' },
  { id: 3, title: '第三章：眼妆基础', duration: '55分钟', isFree: false, videoUrl: '' },
  { id: 4, title: '第四章：眼妆进阶', duration: '50分钟', isFree: false, videoUrl: '' },
  { id: 5, title: '第五章：腮红与修容', duration: '40分钟', isFree: false, videoUrl: '' },
  { id: 6, title: '第六章：唇妆搭配', duration: '35分钟', isFree: false, videoUrl: '' }
];

// 模拟老师列表
const mockTeachers = [
  { id: 1, name: '美妆导师Lily', avatar: '/assets/images/avatar-lily.png', title: '资深婚礼化妆师', courses: 28, followers: 12580 },
  { id: 2, name: '古风化妆师小雪', avatar: '/assets/images/avatar-xue.png', title: '古风妆容专家', courses: 18, followers: 8932 },
  { id: 3, name: '美妆博主Amy', avatar: '/assets/images/avatar-amy.png', title: '时尚美妆博主', courses: 35, followers: 25680 }
];

// ==================== 延迟函数（模拟网络请求） ====================
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== API 函数 ====================

/**
 * 获取课程分类
 */
export function getCourseCategories() {
  return delay(200).then(() => ({ list: mockCategories }));
}

/**
 * 获取课程列表
 */
export function getCourseList(params = {}) {
  return delay(300).then(() => {
    let list = [...mockCourseList];
    
    // 按分类筛选
    if (params.categoryId) {
      // 模拟按分类筛选（实际应该按真实分类筛选）
    }
    
    // 按排序
    if (params.sortBy === 'hot') {
      list = list.sort((a, b) => b.studyCount - a.studyCount);
    } else if (params.sortBy === 'new') {
      // 最新：按ID倒序
      list = list.sort((a, b) => b.id - a.id);
    } else if (params.sortBy === 'price_asc') {
      list = list.sort((a, b) => a.price - b.price);
    } else if (params.sortBy === 'price_desc') {
      list = list.sort((a, b) => b.price - a.price);
    }
    
    return { list };
  });
}

/**
 * 获取课程详情
 */
export function getCourseDetail(courseId) {
  return delay(300).then(() => {
    // 如果有对应ID的详情就返回，否则返回默认详情
    const detail = { ...mockCourseDetail, id: courseId };
    if (courseId === 102) {
      detail.title = '古风妆容设计教程';
      detail.teacher = mockTeachers[1];
    } else if (courseId === 103) {
      detail.title = '日常通勤妆容技巧';
      detail.price = 0;
      detail.isFree = true;
    }
    return detail;
  });
}

/**
 * 获取课程章节列表
 */
export function getCourseChapters(courseId) {
  return delay(200).then(() => ({ list: mockChapters }));
}

/**
 * 获取课程评论列表
 */
export function getCourseComments(courseId, page = 1, pageSize = 10) {
  return delay(200).then(() => ({
    list: mockCourseDetail.comments,
    total: 2,
    page,
    pageSize
  }));
}

/**
 * 添加课程评论
 */
export function addCourseComment(courseId, rating, content, parentId = 0) {
  return delay(300).then(() => ({
    id: Date.now(),
    courseId,
    rating,
    content,
    parentId,
    createTime: new Date().toISOString().split('T')[0]
  }));
}

/**
 * 检查课程购买状态
 */
export function checkCoursePurchased(courseId) {
  return delay(200).then(() => ({ purchased: false }));
}

/**
 * 获取课程学习进度
 */
export function getCourseProgress(courseId) {
  return delay(200).then(() => ({
    progress: 0,
    currentChapter: null
  }));
}

/**
 * 更新学习进度
 */
export function updateLearnProgress(courseId, chapterId, progress) {
  return delay(200).then(() => ({ success: true }));
}

/**
 * 获取章节视频播放凭证
 */
export function getChapterPlayUrl(chapterId) {
  return delay(200).then(() => ({
    videoUrl: '',
    expiresIn: 7200
  }));
}

/**
 * 创建课程订单
 */
export function createCourseOrder(courseId, payMethod = 'wxpay') {
  return delay(300).then(() => ({
    orderId: 'ORD' + Date.now(),
    orderNo: 'WX' + Date.now(),
    amount: mockCourseList.find(c => c.id === courseId)?.price || 0,
    payMethod
  }));
}

/**
 * 获取老师详情
 */
export function getTeacherDetail(teacherId) {
  return delay(200).then(() => {
    const teacher = mockTeachers.find(t => t.id === teacherId) || mockTeachers[0];
    return teacher;
  });
}

/**
 * 获取老师的课程列表
 */
export function getTeacherCourses(teacherId, page = 1, pageSize = 10) {
  return delay(300).then(() => ({
    list: mockCourseList.slice(0, 4),
    total: 4,
    page,
    pageSize
  }));
}

/**
 * 关注老师
 */
export function followTeacher(teacherId) {
  return delay(200).then(() => ({ success: true, followed: true }));
}

/**
 * 取消关注老师
 */
export function unfollowTeacher(teacherId) {
  return delay(200).then(() => ({ success: true, followed: false }));
}

/**
 * 获取我的课程列表
 */
export function getMyCourses(page = 1, pageSize = 10) {
  return delay(300).then(() => ({
    list: [],
    total: 0,
    page,
    pageSize
  }));
}

/**
 * 获取课程工具清单
 */
export function getCourseTools(courseId) {
  return delay(200).then(() => ({
    list: [
      { id: 1, name: '粉底刷', price: 89, cover: 'https://picsum.photos/60/60?random=tool1' },
      { id: 2, name: '眼影盘', price: 168, cover: 'https://picsum.photos/60/60?random=tool2' },
      { id: 3, name: '化妆箱', price: 299, cover: 'https://picsum.photos/60/60?random=tool3' }
    ]
  }));
}

/**
 * 获取推荐课程
 */
export function getRecommendCourses(courseId, limit = 6) {
  return delay(200).then(() => ({
    list: mockCourseList.filter(c => c.id !== courseId).slice(0, limit)
  }));
}

/**
 * 获取热门课程
 */
export function getHotCourses(limit = 10) {
  return delay(200).then(() => ({
    list: mockCourseList.sort((a, b) => b.studyCount - a.studyCount).slice(0, limit)
  }));
}

/**
 * 获取新课列表
 */
export function getNewCourses(limit = 10) {
  return delay(200).then(() => ({
    list: mockCourseList.sort((a, b) => b.id - a.id).slice(0, limit)
  }));
}

// 导出默认模拟数据供直接引用
module.exports = {
  mockCourseList,
  mockCategories,
  mockCourseDetail,
  mockChapters,
  mockTeachers
};
