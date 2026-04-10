/**
 * 社区相关接口
 * @description 社区帖子、评论、点赞相关API
 * @note 本地调试版本：使用模拟数据
 */

// ==================== 模拟数据 ====================

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟话题
const mockTopics = [
  { id: 1, name: '#新娘妆容大赛#', heat: 12580, posts: 856 },
  { id: 2, name: '#每日妆容打卡#', heat: 8960, posts: 2341 },
  { id: 3, name: '#古风仿妆挑战#', heat: 6580, posts: 1203 },
  { id: 4, name: '#新手化妆求助#', heat: 4320, posts: 892 },
  { id: 5, name: '#口红色号推荐#', heat: 3890, posts: 567 },
  { id: 6, name: '#约会妆容教程#', heat: 2890, posts: 445 }
];

// 模拟帖子列表
const mockPosts = [
  {
    id: 1,
    userId: 101,
    userName: '备婚新娘小美',
    userAvatar: 'https://picsum.photos/60/60?random=u1',
    content: '分享我试妆的第三套造型中式秀禾服，红金色搭配太喜庆了！求姐妹们给点意见~',
    images: ['https://picsum.photos/400/500?random=p1', 'https://picsum.photos/400/500?random=p2'],
    video: '',
    topicId: 1,
    topicName: '#新娘妆容大赛#',
    likeCount: 1256,
    commentCount: 89,
    shareCount: 45,
    isLiked: false,
    isFavorite: false,
    createTime: '2小时前'
  },
  {
    id: 2,
    userId: 102,
    userName: '古风爱好者云裳',
    userAvatar: 'https://picsum.photos/60/60?random=u2',
    content: '今天尝试了唐代仕女图仿妆，用了3个小时完成！眼妆是重点，大家觉得像不像？',
    images: ['https://picsum.photos/400/500?random=p3', 'https://picsum.photos/400/500?random=p4', 'https://picsum.photos/400/500?random=p5'],
    video: '',
    topicId: 3,
    topicName: '#古风仿妆挑战#',
    likeCount: 2356,
    commentCount: 167,
    shareCount: 89,
    isLiked: false,
    isFavorite: false,
    createTime: '4小时前'
  },
  {
    id: 3,
    userId: 103,
    userName: '化妆师小林',
    userAvatar: 'https://picsum.photos/60/60?random=u3',
    content: '学员作品分享｜零基础学化妆的第30天，她已经能独立完成日常妆容了！',
    images: ['https://picsum.photos/400/500?random=p6', 'https://picsum.photos/400/500?random=p7'],
    video: '',
    topicId: 2,
    topicName: '#每日妆容打卡#',
    likeCount: 3456,
    commentCount: 234,
    shareCount: 156,
    isLiked: false,
    isFavorite: false,
    createTime: '6小时前'
  },
  {
    id: 4,
    userId: 104,
    userName: '口红控萌萌',
    userAvatar: 'https://picsum.photos/60/60?random=u4',
    content: '救命！雅诗兰黛333和迪奥999到底选哪个？求推荐适合黄皮的！',
    images: ['https://picsum.photos/400/400?random=p8'],
    video: '',
    topicId: 5,
    topicName: '#口红色号推荐#',
    likeCount: 456,
    commentCount: 78,
    shareCount: 12,
    isLiked: false,
    isFavorite: false,
    createTime: '8小时前'
  },
  {
    id: 5,
    userId: 105,
    userName: '约会达人小雨',
    userAvatar: 'https://picsum.photos/60/60?random=u5',
    content: '第一次约会妆容分享！这款斩男妆真的太绝了，男票看呆的那种～',
    images: ['https://picsum.photos/400/500?random=p9', 'https://picsum.photos/400/500?random=p10'],
    video: '',
    topicId: 6,
    topicName: '#约会妆容教程#',
    likeCount: 5678,
    commentCount: 345,
    shareCount: 234,
    isLiked: false,
    isFavorite: false,
    createTime: '1天前'
  },
  {
    id: 6,
    userId: 106,
    userName: '新手小白兔',
    userAvatar: 'https://picsum.photos/60/60?random=u6',
    content: '我是化妆新手，请问单眼皮怎么画眼妆啊？求大神指导！',
    images: [],
    video: '',
    topicId: 4,
    topicName: '#新手化妆求助#',
    likeCount: 123,
    commentCount: 56,
    shareCount: 8,
    isLiked: false,
    isFavorite: false,
    createTime: '1天前'
  }
];

// 模拟评论
const mockComments = [
  { id: 1, userId: 201, userName: '美妆达人', userAvatar: 'https://picsum.photos/40/40?random=c1', content: '太好看了！求教程', rating: 5, likeCount: 45, createTime: '1小时前', replies: [] },
  { id: 2, userId: 202, userName: '备婚新娘', userAvatar: 'https://picsum.photos/40/40?random=c2', content: '这款妆容很适合你，期待成片！', rating: 0, likeCount: 23, createTime: '2小时前', replies: [] }
];

// 模拟用户
const mockUsers = [
  { id: 101, name: '备婚新娘小美', avatar: 'https://picsum.photos/60/60?random=u1', posts: 23, followers: 1256, following: 89 },
  { id: 102, name: '古风爱好者云裳', avatar: 'https://picsum.photos/60/60?random=u2', posts: 45, followers: 3456, following: 234 },
  { id: 103, name: '化妆师小林', avatar: 'https://picsum.photos/60/60?random=u3', posts: 89, followers: 5678, following: 123 }
];

// ==================== API 函数 ====================

/**
 * 获取话题列表
 */
export function getTopics(page = 1, pageSize = 20) {
  return delay(200).then(() => ({
    list: mockTopics.slice((page - 1) * pageSize, page * pageSize),
    total: mockTopics.length,
    page,
    pageSize
  }));
}

/**
 * 获取热门话题
 */
export function getHotTopics(limit = 10) {
  return delay(200).then(() => ({
    list: mockTopics.slice(0, limit)
  }));
}

/**
 * 获取帖子列表
 */
export function getPostList(params = {}) {
  return delay(300).then(() => {
    let list = [...mockPosts];
    
    if (params.topicId) {
      list = list.filter(p => p.topicId === params.topicId);
    }
    
    if (params.sort === 'hot') {
      list = list.sort((a, b) => b.likeCount - a.likeCount);
    }
    
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    
    return {
      list: list.slice((page - 1) * pageSize, page * pageSize),
      total: list.length,
      page,
      pageSize
    };
  });
}

/**
 * 获取帖子详情
 */
export function getPostDetail(postId) {
  return delay(200).then(() => {
    const post = mockPosts.find(p => p.id === postId) || mockPosts[0];
    return post;
  });
}

/**
 * 发布帖子
 */
export function publishPost(data) {
  return delay(500).then(() => ({
    id: Date.now(),
    ...data,
    userId: 101,
    userName: '当前用户',
    userAvatar: 'https://picsum.photos/60/60?random=current',
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    isLiked: false,
    isFavorite: false,
    createTime: '刚刚'
  }));
}

/**
 * 删除帖子
 */
export function deletePost(postId) {
  return delay(200).then(() => ({ success: true }));
}

/**
 * 点赞帖子
 */
export function likePost(postId) {
  return delay(100).then(() => ({ success: true, liked: true }));
}

/**
 * 取消点赞
 */
export function unlikePost(postId) {
  return delay(100).then(() => ({ success: true, liked: false }));
}

/**
 * 收藏帖子
 */
export function favoritePost(postId) {
  return delay(100).then(() => ({ success: true, favorited: true }));
}

/**
 * 取消收藏帖子
 */
export function unfavoritePost(postId) {
  return delay(100).then(() => ({ success: true, favorited: false }));
}

/**
 * 获取帖子评论列表
 */
export function getPostComments(postId, page = 1, pageSize = 20) {
  return delay(200).then(() => ({
    list: mockComments,
    total: mockComments.length,
    page,
    pageSize
  }));
}

/**
 * 添加评论
 */
export function addComment(postId, content, parentId = 0) {
  return delay(300).then(() => ({
    id: Date.now(),
    postId,
    userId: 101,
    userName: '当前用户',
    userAvatar: 'https://picsum.photos/40/40?random=current',
    content,
    parentId,
    rating: 0,
    likeCount: 0,
    createTime: '刚刚',
    replies: []
  }));
}

/**
 * 删除评论
 */
export function deleteComment(commentId) {
  return delay(200).then(() => ({ success: true }));
}

/**
 * 举报帖子
 */
export function reportPost(postId, type, reason) {
  return delay(300).then(() => ({ success: true }));
}

/**
 * 举报评论
 */
export function reportComment(commentId, type, reason) {
  return delay(300).then(() => ({ success: true }));
}

/**
 * 获取我的帖子列表
 */
export function getMyPosts(page = 1, pageSize = 10) {
  return delay(200).then(() => ({
    list: [],
    total: 0,
    page,
    pageSize
  }));
}

/**
 * 获取我点赞的帖子列表
 */
export function getMyLikedPosts(page = 1, pageSize = 10) {
  return delay(200).then(() => ({
    list: [],
    total: 0,
    page,
    pageSize
  }));
}

/**
 * 获取我收藏的帖子列表
 */
export function getMyFavoritePosts(page = 1, pageSize = 10) {
  return delay(200).then(() => ({
    list: [],
    total: 0,
    page,
    pageSize
  }));
}

/**
 * 分享帖子
 */
export function sharePost(postId) {
  return delay(100).then(() => ({ success: true }));
}

/**
 * 获取话题详情
 */
export function getTopicDetail(topicId) {
  return delay(200).then(() => {
    const topic = mockTopics.find(t => t.id === topicId) || mockTopics[0];
    return topic;
  });
}

/**
 * 获取话题帖子列表
 */
export function getTopicPosts(topicId, page = 1, pageSize = 20) {
  return delay(300).then(() => {
    const list = mockPosts.filter(p => p.topicId === topicId);
    return {
      list: list.slice((page - 1) * pageSize, page * pageSize),
      total: list.length,
      page,
      pageSize
    };
  });
}

// ========== 补充接口 ==========

/**
 * 获取社区话题分类
 */
export function getCommunityTopics() {
  return getTopics();
}

/**
 * 获取话题广场列表
 */
export function getTopicsList() {
  return delay(200).then(() => ({
    list: mockTopics
  }));
}

/**
 * 获取评论列表
 */
export function getCommentList(params) {
  return delay(200).then(() => ({
    list: mockComments,
    total: mockComments.length
  }));
}

/**
 * 评论点赞
 */
export function likeComment(commentId) {
  return delay(100).then(() => ({ success: true }));
}

/**
 * 取消评论点赞
 */
export function unlikeComment(commentId) {
  return delay(100).then(() => ({ success: true }));
}

/**
 * 收藏帖子
 */
export function collectPost(postId) {
  return favoritePost(postId);
}

/**
 * 取消收藏帖子
 */
export function uncollectPost(postId) {
  return unfavoritePost(postId);
}

/**
 * 获取最近互动用户
 */
export function getRecentUsers() {
  return delay(200).then(() => ({
    list: mockUsers.slice(0, 5)
  }));
}

/**
 * 关注用户
 */
export function followUser(userId) {
  return delay(200).then(() => ({ success: true, followed: true }));
}

/**
 * 取消关注用户
 */
export function unfollowUser(userId) {
  return delay(200).then(() => ({ success: true, followed: false }));
}

/**
 * 获取用户主页信息
 */
export function getUserProfile(userId) {
  return delay(200).then(() => {
    const user = mockUsers.find(u => u.id === userId) || mockUsers[0];
    return user;
  });
}

/**
 * 获取用户帖子列表
 */
export function getUserPosts(params) {
  return delay(300).then(() => ({
    list: mockPosts.slice(0, 6),
    total: 6
  }));
}

/**
 * 获取用户收藏列表
 */
export function getMyCollections(params) {
  return delay(200).then(() => ({
    list: [],
    total: 0
  }));
}

/**
 * 获取用户课程列表
 */
export function getUserCourses(params) {
  return delay(200).then(() => ({
    list: []
  }));
}
