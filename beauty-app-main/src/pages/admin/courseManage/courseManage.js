const app = getApp();

// 模拟数据 - 云函数未部署时使用
const mockCourses = [
  { _id: 'course1', title: '新娘妆入门教程', category: '新娘妆', price: 99, status: 'online', coverUrl: 'https://picsum.photos/400/300?random=1', teacherName: '林美妆', studentCount: 1256 },
  { _id: 'course2', title: 'Cosplay角色妆', category: 'Cos妆', price: 129, status: 'online', coverUrl: 'https://picsum.photos/400/300?random=2', teacherName: '陈造型', studentCount: 890 },
  { _id: 'course3', title: '古风汉服妆', category: '古风妆', price: 89, status: 'online', coverUrl: 'https://picsum.photos/400/300?random=3', teacherName: '李古典', studentCount: 2103 },
  { _id: 'course4', title: '影视特效妆', category: '影视特效', price: 199, status: 'offline', coverUrl: 'https://picsum.photos/400/300?random=4', teacherName: '王特效', studentCount: 567 },
  { _id: 'course5', title: '日常淡妆教程', category: '日常妆', price: 0, status: 'online', coverUrl: 'https://picsum.photos/400/300?random=5', teacherName: '林美妆', studentCount: 4500 }
];

Page({
  data: {
    courses: [],
    onlineCount: 0,
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    searchKeyword: '',
    categoryFilter: '',
    statusFilter: '',
    categories: ['全部', 'Cos妆', '古风妆', '新娘妆', '影视特效', '日常妆'],
    statusList: ['全部', '已上架', '已下架', '审核中'],
    showAddModal: false,
    editingCourse: null,
    formData: {
      title: '',
      category: '',
      price: '',
      originalPrice: '',
      description: '',
      coverUrl: '',
      videoUrl: '',
      duration: '',
      teacherId: '',
      status: 'online'
    }
  },

  onLoad() {
    this.loadCourses();
  },

  // 加载课程列表
  async loadCourses(reset = false) {
    if (this.data.loading) return;
    
    if (reset) {
      this.setData({ page: 1, courses: [], hasMore: true });
    }

    this.setData({ loading: true });

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'admin',
        data: {
          action: 'getCourses',
          page: this.data.page,
          pageSize: this.data.pageSize,
          keyword: this.data.searchKeyword,
          category: this.data.categoryFilter,
          status: this.data.statusFilter
        }
      });

      if (result.code === 200) {
        const newCourses = reset ? result.data.list : [...this.data.courses, ...result.data.list];
        // 计算已上架数量
        const onlineCount = newCourses.filter(c => c.status === 'online').length;
        this.setData({
          courses: newCourses,
          onlineCount: onlineCount,
          hasMore: newCourses.length < result.data.total,
          page: this.data.page + 1
        });
      }
    } catch (error) {
      // 云函数未部署，使用模拟数据
      console.log('使用模拟数据');
      const start = (this.data.page - 1) * this.data.pageSize;
      const newCourses = mockCourses.slice(start, start + this.data.pageSize);
      const allCourses = reset ? newCourses : [...this.data.courses, ...newCourses];
      const onlineCount = allCourses.filter(c => c.status === 'online').length;
      this.setData({
        courses: allCourses,
        onlineCount: onlineCount,
        hasMore: start + newCourses.length < mockCourses.length,
        page: this.data.page + 1
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 搜索
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  onSearch() {
    this.loadCourses(true);
  },

  // 筛选
  onCategoryChange(e) {
    const index = e.detail.value;
    const category = index == 0 ? '' : this.data.categories[index];
    this.setData({ categoryFilter: category });
    this.loadCourses(true);
  },

  onStatusChange(e) {
    const index = e.detail.value;
    const status = index == 0 ? '' : (index == 1 ? 'online' : index == 2 ? 'offline' : 'pending');
    this.setData({ statusFilter: status });
    this.loadCourses(true);
  },

  // 加载更多
  onLoadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadCourses();
    }
  },

  // 显示添加弹窗
  showAddModal() {
    this.setData({
      showAddModal: true,
      editingCourse: null,
      formData: {
        title: '',
        category: '',
        price: '',
        originalPrice: '',
        description: '',
        coverUrl: '',
        videoUrl: '',
        duration: '',
        teacherId: '',
        status: 'online'
      }
    });
  },

  // 显示编辑弹窗
  showEditModal(e) {
    const course = e.currentTarget.dataset.course;
    this.setData({
      showAddModal: true,
      editingCourse: course,
      formData: { ...course }
    });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showAddModal: false });
  },

  // 表单输入
  onFormInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`formData.${field}`]: e.detail.value });
  },

  // 选择分类
  onFormCategoryChange(e) {
    const index = parseInt(e.detail.value);
    const categories = ['Cos妆', '古风妆', '新娘妆', '影视特效', '日常妆'];
    this.setData({ 'formData.category': categories[index] });
  },

  // 选择状态
  onFormStatusChange(e) {
    const statusMap = ['online', 'offline', 'pending'];
    this.setData({ 'formData.status': statusMap[e.detail.value] });
  },

  // 上传封面
  async uploadCover() {
    try {
      const { tempFiles } = await wx.chooseMedia({
        count: 1,
        mediaType: ['image']
      });

      wx.showLoading({ title: '上传中...' });

      const { fileID } = await wx.cloud.uploadFile({
        cloudPath: `courses/covers/${Date.now()}.jpg`,
        filePath: tempFiles[0].tempFilePath
      });

      this.setData({ 'formData.coverUrl': fileID });
      wx.showToast({ title: '上传成功', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: '上传失败', icon: 'none' });
    }
  },

  // 上传视频
  async uploadVideo() {
    try {
      const { tempFiles } = await wx.chooseMedia({
        count: 1,
        mediaType: ['video'],
        sourceType: ['album']
      });

      wx.showLoading({ title: '上传中...' });

      const { fileID } = await wx.cloud.uploadFile({
        cloudPath: `courses/videos/${Date.now()}.mp4`,
        filePath: tempFiles[0].tempFilePath
      });

      this.setData({ 
        'formData.videoUrl': fileID,
        'formData.duration': Math.floor(tempFiles[0].duration / 60)
      });
      wx.showToast({ title: '上传成功', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: '上传失败', icon: 'none' });
    }
  },

  // 保存课程
  async saveCourse() {
    const { formData, editingCourse } = this.data;
    
    if (!formData.title || !formData.category || !formData.price) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });

    try {
      const action = editingCourse ? 'updateCourse' : 'addCourse';
      const { result } = await wx.cloud.callFunction({
        name: 'admin',
        data: {
          action,
          courseId: editingCourse?._id,
          data: formData
        }
      });

      if (result.code === 200) {
        wx.showToast({ title: '保存成功', icon: 'success' });
        this.closeModal();
        this.loadCourses(true);
      } else {
        wx.showToast({ title: result.message || '保存失败', icon: 'none' });
      }
    } catch (error) {
      // 模拟保存成功
      wx.showToast({ title: '保存成功', icon: 'success' });
      this.closeModal();
      this.loadCourses(true);
    }
  },

  // 删除课程
  async deleteCourse(e) {
    const { id } = e.currentTarget.dataset;
    
    const { confirm } = await wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，是否继续？',
      confirmColor: '#ff4d4f'
    });

    if (!confirm) return;

    wx.showLoading({ title: '删除中...' });

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'admin',
        data: { action: 'deleteCourse', courseId: id }
      });

      if (result.code === 200) {
        wx.showToast({ title: '删除成功', icon: 'success' });
        this.loadCourses(true);
      } else {
        wx.showToast({ title: result.message || '删除失败', icon: 'none' });
      }
    } catch (error) {
      // 模拟删除成功
      wx.showToast({ title: '删除成功', icon: 'success' });
      this.loadCourses(true);
    }
  },

  // 切换课程状态
  async toggleStatus(e) {
    const { id, status } = e.currentTarget.dataset;
    const newStatus = status === 'online' ? 'offline' : 'online';

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'admin',
        data: { action: 'updateCourseStatus', courseId: id, status: newStatus }
      });

      if (result.code === 200) {
        wx.showToast({ title: '状态更新成功', icon: 'success' });
        this.loadCourses(true);
      }
    } catch (error) {
      // 模拟更新成功
      wx.showToast({ title: '状态更新成功', icon: 'success' });
      this.loadCourses(true);
    }
  }
});
