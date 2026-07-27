export default defineAppConfig({
  pages: [
    'pages/today/index',
    'pages/calendar/index',
    'pages/stats/index',
    'pages/manage/index'
  ],
  window: {
    navigationStyle: 'custom',
    backgroundColor: '#f8f4f0',
    backgroundTextStyle: 'light'
  },
  tabBar: {
    custom: false,
    color: '#b8a080',
    selectedColor: '#c8824a',
    backgroundColor: '#fff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/today/index',
        text: '今日',
        iconPath: 'assets/today.png',
        selectedIconPath: 'assets/today-active.png'
      },
      {
        pagePath: 'pages/calendar/index',
        text: '日历',
        iconPath: 'assets/calendar.png',
        selectedIconPath: 'assets/calendar-active.png'
      },
      {
        pagePath: 'pages/stats/index',
        text: '统计',
        iconPath: 'assets/stats.png',
        selectedIconPath: 'assets/stats-active.png'
      },
      {
        pagePath: 'pages/manage/index',
        text: '管理',
        iconPath: 'assets/manage.png',
        selectedIconPath: 'assets/manage-active.png'
      }
    ]
  }
})
 function defineAppConfig(config: Record<string, unknown>) { return config }
