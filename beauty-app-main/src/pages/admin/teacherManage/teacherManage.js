const app = getApp();

Page({
  data: {
    teachers: [],
    loading: false,
    showAddModal: false,
    isEdit: false,
    editId: null,
    form: {
      name: '',
      avatar: '',
      title: '',
      intro: '',
      experience: '',
      specialty: [],
      coursePrice: '',
      status: 1
    },
    specialtyOptions: ['新娘妆', 'Cosplay妆', '古风妆', '影视特效', '日常妆', '晚宴妆'],
    statusOptions: [
      { label: '在职', value: 1 },
      { label: '休息', value: 0 }
    ]
  },

  onLoad() {
    this.loadTeachers();
  },

  // 加载老师列表
  loadTeachers() {
    this.setData({ loading: true });
    
    // 模拟数据
    setTimeout(() => {
      const mockTeachers = [
        {
          id: 1,
          name: '林小美',
          avatar: 'https://picsum.photos/100/100?random=1',
          title: '高级化妆师',
          intro: '10年新娘妆经验，服务过500+新娘',
          experience: '10年',
          specialty: ['新娘妆', '晚宴妆'],
          coursePrice: 299,
          status: 1,
          studentCount: 1280,
          courseCount: 12
        },
        {
          id: 2,
          name: '王艺涵',
          avatar: 'https://picsum.photos/100/100?random=2',
          title: 'Cosplay造型师',
          intro: '知名漫展特邀化妆师，擅长二次元妆容',
          experience: '6年',
          specialty: ['Cosplay妆', '古风妆'],
          coursePrice: 199,
          status: 1,
          studentCount: 856,
          courseCount: 8
        },
        {
          id: 3,
          name: '张雅琪',
          avatar: 'https://picsum.photos/100/100?random=3',
          title: '影视特效化妆师',
          intro: '参与多部影视剧特效化妆，技术精湛',
          experience: '8年',
          specialty: ['影视特效', '古风妆'],
          coursePrice: 399,
          status: 0,
          studentCount: 423,
          courseCount: 5
        }
      ];
      
      this.setData({
        teachers: mockTeachers,
        loading: false
      });
    }, 500);
  },

  // 显示添加弹窗
  showAddModal() {
    this.setData({
      showAddModal: true,
      isEdit: false,
      editId: null,
      form: {
        name: '',
        avatar: '',
        title: '',
        intro: '',
        experience: '',
        specialty: [],
        coursePrice: '',
        status: 1
      }
    });
  },

  // 显示编辑弹窗
  showEditModal(e) {
    const id = e.currentTarget.dataset.id;
    const teacher = this.data.teachers.find(t => t.id === id);
    
    this.setData({
      showAddModal: true,
      isEdit: true,
      editId: id,
      form: {
        name: teacher.name,
        avatar: teacher.avatar,
        title: teacher.title,
        intro: teacher.intro,
        experience: teacher.experience,
        specialty: teacher.specialty,
        coursePrice: String(teacher.coursePrice),
        status: teacher.status
      }
    });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showAddModal: false });
  },

  // 输入框变化
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({
      [`form.${field}`]: value
    });
  },

  // 选择专长
  onSpecialtyChange(e) {
    const { value } = e.detail;
    this.setData({ 'form.specialty': value });
  },

  // 选择头像
  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          'form.avatar': res.tempFilePaths[0]
        });
      }
    });
  },

  // 切换状态
  onStatusChange(e) {
    const { value } = e.detail;
    this.setData({ 'form.status': parseInt(value) });
  },

  // 保存老师
  saveTeacher() {
    const { form, isEdit, editId } = this.data;
    
    if (!form.name.trim()) {
      wx.showToast({ title: '请输入老师姓名', icon: 'none' });
      return;
    }
    if (!form.title.trim()) {
      wx.showToast({ title: '请输入职称', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中' });

    setTimeout(() => {
      let teachers = this.data.teachers;
      
      if (isEdit) {
        const index = teachers.findIndex(t => t.id === editId);
        teachers[index] = { ...teachers[index], ...form, coursePrice: parseFloat(form.coursePrice) };
      } else {
        const newTeacher = {
          id: Date.now(),
          ...form,
          coursePrice: parseFloat(form.coursePrice) || 0,
          studentCount: 0,
          courseCount: 0
        };
        teachers.unshift(newTeacher);
      }

      this.setData({
        teachers,
        showAddModal: false
      });

      wx.hideLoading();
      wx.showToast({
        title: isEdit ? '修改成功' : '添加成功',
        icon: 'success'
      });
    }, 500);
  },

  // 删除老师
  deleteTeacher(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，是否继续？',
      success: (res) => {
        if (res.confirm) {
          const teachers = this.data.teachers.filter(t => t.id !== id);
          this.setData({ teachers });
          wx.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  },

  // 切换老师状态
  toggleStatus(e) {
    const id = e.currentTarget.dataset.id;
    const teachers = this.data.teachers.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 1 ? 0 : 1 };
      }
      return t;
    });
    
    this.setData({ teachers });
    wx.showToast({ title: '状态已更新', icon: 'success' });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadTeachers();
    wx.stopPullDownRefresh();
  }
});