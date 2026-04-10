/**
 * 课程播放页面
 * 功能：视频播放、章节切换、学习进度
 */

const courseApi = require('../../api/course');

Page({
  data: {
    // 课程信息
    courseId: null,
    courseInfo: null,
    currentChapter: null,
    chapters: [],
    // 播放状态
    isPlaying: false,
    videoContext: null,
    currentTime: 0,
    duration: 0,
    // 进度
    progress: 0,
    completedChapters: [],
    // UI状态
    showCatalog: false,
    showTool: false,
    tools: []
  },

  onLoad(options) {
    const { courseId, chapterId } = options;
    this.setData({
      courseId: parseInt(courseId) || 1,
      currentChapterId: parseInt(chapterId) || 1
    });
    this.loadCourseData();
  },

  onReady() {
    this.videoContext = wx.createVideoContext('courseVideo');
  },

  onUnload() {
    // 保存学习进度
    this.saveLearningProgress();
  },

  onShareAppMessage() {
    return {
      title: this.data.courseInfo?.title || '课程学习',
      path: `/pages/coursePlay/coursePlay?courseId=${this.data.courseId}&chapterId=${this.data.currentChapterId}`
    };
  },

  // 加载课程数据
  async loadCourseData() {
    try {
      const result = await courseApi.getCourseDetail({ id: this.data.courseId });
      const chapters = result.chapters || [];
      const currentChapter = chapters.find(c => c.id === this.data.currentChapterId) || chapters[0];

      this.setData({
        courseInfo: result.course,
        chapters,
        currentChapter,
        currentChapterId: currentChapter?.id,
        tools: result.tools || []
      });
    } catch (err) {
      this.setMockData();
    }
  },

  // 模拟数据
  setMockData() {
    const courseInfo = {
      id: 101,
      title: '新娘妆入门必修课',
      cover: 'https://picsum.photos/300/200?random=course1'
    };

    const chapters = [
      { id: 1, title: '第一章：新娘妆基础理论', duration: '45分钟', videoUrl: '', isFree: true },
      { id: 2, title: '第二章：肤质分析与护理', duration: '38分钟', videoUrl: '', isFree: true },
      { id: 3, title: '第三章：完美底妆技巧', duration: '52分钟', videoUrl: '' },
      { id: 4, title: '第四章：眼妆打造（单眼皮）', duration: '48分钟', videoUrl: '' },
      { id: 5, title: '第五章：眼妆打造（双眼皮）', duration: '45分钟', videoUrl: '' },
      { id: 6, title: '第六章：腮红与修容', duration: '35分钟', videoUrl: '' }
    ];

    const tools = [
      { name: '隔离霜', recommend: '滋色隔离霜' },
      { name: '粉底液', recommend: 'MAC定制无暇粉底液' },
      { name: '遮瑕', recommend: 'NARS遮瑕膏' },
      { name: '眼影盘', recommend: '完美日记眼影盘' }
    ];

    this.setData({
      courseInfo,
      chapters,
      currentChapter: chapters[0],
      currentChapterId: chapters[0].id,
      tools,
      completedChapters: [1]
    });
  },

  // 视频播放
  onPlay() {
    this.setData({ isPlaying: true });
  },

  // 视频暂停
  onPause() {
    this.setData({ isPlaying: false });
  },

  // 播放进度更新
  onTimeUpdate(e) {
    const { currentTime, duration } = e.detail;
    const progress = Math.round((currentTime / duration) * 100);

    this.setData({ currentTime, duration, progress });
  },

  // 视频播放结束
  onEnded() {
    this.setData({ isPlaying: false });
    this.markChapterCompleted();
    this.playNextChapter();
  },

  // 标记章节完成
  markChapterCompleted() {
    const { completedChapters, currentChapterId } = this.data;
    if (!completedChapters.includes(currentChapterId)) {
      this.setData({
        completedChapters: [...completedChapters, currentChapterId]
      });
    }
  },

  // 播放/暂停切换
  togglePlay() {
    if (this.data.isPlaying) {
      this.videoContext.pause();
    } else {
      this.videoContext.play();
    }
  },

  // 切换章节
  switchChapter(e) {
    const { chapterId } = e.currentTarget.dataset;
    const chapter = this.data.chapters.find(c => c.id === chapterId);

    if (chapter) {
      this.setData({
        currentChapter: chapter,
        currentChapterId: chapterId,
        currentTime: 0,
        progress: 0,
        isPlaying: false
      });
      this.videoContext.seek(0);
      this.videoContext.play();
    }
  },

  // 上一章
  playPrevChapter() {
    const { chapters, currentChapterId } = this.data;
    const currentIndex = chapters.findIndex(c => c.id === currentChapterId);

    if (currentIndex > 0) {
      this.switchChapter({ currentTarget: { dataset: { chapterId: chapters[currentIndex - 1].id } } });
    } else {
      wx.showToast({ title: '已经是第一章了', icon: 'none' });
    }
  },

  // 下一章
  playNextChapter() {
    const { chapters, currentChapterId } = this.data;
    const currentIndex = chapters.findIndex(c => c.id === currentChapterId);

    if (currentIndex < chapters.length - 1) {
      this.switchChapter({ currentTarget: { dataset: { chapterId: chapters[currentIndex + 1].id } } });
    } else {
      wx.showToast({ title: '已经是最后一章了', icon: 'none' });
    }
  },

  // 保存学习进度
  async saveLearningProgress() {
    try {
      await courseApi.saveProgress({
        courseId: this.data.courseId,
        chapterId: this.data.currentChapterId,
        progress: this.data.progress
      });
    } catch (err) {
      console.log('保存进度失败', err);
    }
  },

  // 切换目录面板
  toggleCatalog() {
    this.setData({ showCatalog: !this.data.showCatalog });
  },

  // 切换工具面板
  toggleTool() {
    this.setData({ showTool: !this.data.showTool });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
});
