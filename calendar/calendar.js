// components/calendar/calendar.js

Component({
  /**
   * 组件的属性列表
   * data [Date] 当前现实的月份
   * selected [Array] 所有被选择的天
   */
  properties: {
    date: {
      type: null,
      value: new Date()
    },
    selected: {
      type: Array,
      value: [],
      observer(newVal, oldVal) {
        this.getWeek(new Date())
      }
    },
    timeStr:{
      type: String,
      value: '',
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    selectDay: '', // 当前选择日期
    isOpen:false,//是否是展开状态
    canlender: {
      "weeks": []
    },
    titleArray:['日','一','二','三','四','五','六'],
    nowYear : new Date().getFullYear(), //年
    nowMonth : new Date().getMonth()+1, //月
    nowDate : new Date().getDate(), //日
    todayWeekIndex:0,//今天在第几周显示    
  },
  ready() {
    this.getWeek(new Date())
  },
  /**
   * 组件的方法列表
   */
  methods: {
    selectDay(e) {

      let index = e.currentTarget.dataset.index;
      let week = e.currentTarget.dataset.week;
      let ischeck = e.currentTarget.dataset.ischeck;
      let canlender = this.data.canlender;
      if (!ischeck) return false;
      let month = canlender.weeks[week][index].month < 10 ? "0" + canlender.weeks[week][index].month : canlender.weeks[week][index].month
      let date = canlender.weeks[week][index].date < 10 ? "0" + canlender.weeks[week][index].date : canlender.weeks[week][index].date
      this.getWeek(canlender.year + "-" + month + "-" + date);
    },
    packup() {
      var that = this;
      that.setData({
        isOpen:!that.data.isOpen
      });


    },
    // 返回今天
    backtoday() {
      this.getWeek(new Date());
    },
    // 前一天|| 后一天
    dataBefor(e) {
      let num = 0;
      let types = e.currentTarget.dataset.type;

      if (e.currentTarget.dataset.id === "0") {
        num = -1;
      } else {
        num = 1
      }
      let year = this.data.canlender.year + "-" + this.data.canlender.month + "-" + this.data.canlender.date
      let _date = this.getDate(year, num, types === 'month' ? "month" : "day");
      this.getWeek(_date);
    },
    // 获取日历内容
    getWeek(dateData) {
      var that = this;
      let selected = that.data.selected
      let a = new Date()
      // console.log("im date ", a, typeof a === 'object')
      // 判断当前是 安卓还是ios ，传入不容的日期格式
      if (typeof dateData !== 'object') {
        dateData = dateData.replace(/-/g, "/")
      }
      let _date = new Date(dateData);
      let year = _date.getFullYear(); //年
      let month = _date.getMonth() + 1; //月
      let date = _date.getDate(); //日
      let day = _date.getDay(); // 星期几
      let canlender = [];
      let nowYear = that.data.nowYear;
      let nowMonth = that.data.nowMonth;
      let nowDate = that.data.nowDate;

      let dates = {
        firstDay: new Date(year, month - 1, 1).getDay(),
        lastMonthDays: [], // 上个月末尾几天
        currentMonthDys: [], // 本月天数
        nextMonthDays: [], // 下个月开始几天
        endDay: new Date(year, month, 0).getDay(),
        weeks: []
      }

      // 循环上个月末尾几天添加到数组
      for (let i = dates.firstDay; i > 0; i--) {
        dates.lastMonthDays.push({
          'date': new Date(year, month, -i).getDate() + '',
          'month': month - 1
        })
      }
      // 循环本月天数添加到数组
      for (let i = 1; i <= new Date(year, month, 0).getDate(); i++) {
        let have = false;
        for (let j = 0; j < selected.length; j++) {
          let selDate = selected[j].date.split('-');

          if (Number(year) === Number(selDate[0]) && Number(month) === Number(selDate[1]) && Number(i) === Number(selDate[2])) {
            have = true;
          }
        }
        let today = false;
        if (Number(nowYear) === Number(year) && Number(nowMonth) === Number(month) && Number(nowDate) === Number(i)) {
          today = true;
        }

        dates.currentMonthDys.push({
          'date': i + "",
          'month': month,
          'today': today,
          'have': have
        })
      }
      // 循环下个月开始几天 添加到数组
      for (let i = 1; i < 7 - dates.endDay; i++) {
        dates.nextMonthDays.push({
          'date': i + '',
          'month': month + 1
        })
      }

      canlender = canlender.concat(dates.lastMonthDays, dates.currentMonthDys, dates.nextMonthDays)
      // 拼接数组  上个月开始几天 + 本月天数+ 下个月开始几天
      for (let i = 0; i < canlender.length; i++) {
        if (i % 7 == 0) {
          dates.weeks[parseInt(i / 7)] = new Array(7);
        }
        dates.weeks[parseInt(i / 7)][i % 7] = canlender[i]
      }
      // 渲染数据
      this.setData({
        selectDay: month + "月" + date + "日",
        "canlender.weeks": dates.weeks,
        'canlender.month': month,
        'canlender.date': date,
        "canlender.day": day,
        'canlender.year': year,
      },function(){
      
          var todayWeekIndex =this.findWeek(dates);
          that.setData({
            todayWeekIndex:todayWeekIndex
          },function(){
         
          }) 
      

      });
     
    
      month = month < 10 ? "0" + month : month
      date = date < 10 ? "0" + date : date
      this.triggerEvent('getdate', {
        year,
        month,
        date
      })
    },
    /**
     * 寻找在第几周
     */
    findWeek(dates){
      for (let index = 0; index < dates.weeks.length; index++) {
        var week =  dates.weeks[index];
        for (let i = 0; i < week.length; i++) {
          var day = week[i];
          if(day.today)
          {
            return index;
          }
        }

        
      }
    },



    /**
     * 时间计算
     */
    getDate(date, AddDayCount, str = 'day') {
      if (typeof date !== 'object') {
        date = date.replace(/-/g, "/")
      }
      let dd = new Date(date)
      switch (str) {
        case 'day':
          dd.setDate(dd.getDate() + AddDayCount) // 获取AddDayCount天后的日期
          break;
        case 'month':
          dd.setMonth(dd.getMonth() + AddDayCount) // 获取AddDayCount天后的日期
          break;
        case 'year':
          dd.setFullYear(dd.getFullYear() + AddDayCount) // 获取AddDayCount天后的日期
          break;
      }
      let y = dd.getFullYear()
      let m = (dd.getMonth() + 1) < 10 ? '0' + (dd.getMonth() + 1) : (dd.getMonth() + 1) // 获取当前月份的日期，不足10补0
      let d = dd.getDate() < 10 ? '0' + dd.getDate() : dd.getDate() // 获取当前几号，不足10补0
      return y + '-' + m + '-' + d
    }
  }
})