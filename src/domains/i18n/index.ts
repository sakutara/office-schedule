export type LanguageCode = 'vi' | 'en';

export const SUPPORTED_LANGUAGES: LanguageCode[] = ['vi', 'en'];

export interface TranslationDictionary {
  appTitle: string;
  offlineReady: string;
  tabMain: string;
  tabCalendar: string;
  tabSettings: string;
  // Progress / Planning
  progressSummary: string;
  planPriorityBtn: string;
  planStartBtn: string;
  planEndBtn: string;
  pickerYearLabel: string;
  // Main Tab
  todayDateLabel: string;
  btnCheckInNormal: string;
  btnCheckInNormalSub: string;
  btnCheckInPriority: string;
  btnCheckInPrioritySub: string;
  btnCheckInWarning: string;
  btnCheckInWarningSub: string;
  btnCheckInDanger: string;
  btnCheckInDangerSub: string;
  btnMarkLeave: string;
  todayMarkedOffice: string;
  todayMarkedLeave: string;
  todayMarkedWork: string;
  // Calendar Tab
  legendGray: string;
  legendYellow: string;
  legendGreen: string;
  workingDaysCount: string;
  quickAssignLabel: string;
  // Settings Tab
  profileSectionTitle: string;
  selectProfileLabel: string;
  createNewProfileBtn: string;
  fieldProfileName: string;
  fieldCalcMethod: string;
  methodMonthly: string;
  methodWeekly: string;
  fieldMinPercent: string;
  fieldWeeklySchedule: string;
  fieldNote: string;
  saveProfileBtn: string;
  cancelBtn: string;
  weeklyEditorTitle: string;
  remeasureNowBtn: string;
  todayMarkedPlanned: string;
  todayIsOffice: string;
  todayIsLeave: string;
  infoAttended: string;
  infoPlanned: string;
  infoRequired: string;
  infoWorkingDays: string;
  infoUpcomingOff: string;
  upcomingHolidaysTitle: string;
  noUpcomingOff: string;
  dayMon: string;
  dayTue: string;
  dayWed: string;
  dayThu: string;
  dayFri: string;
  daySat: string;
  daySun: string;
}

const VI_DICT: TranslationDictionary = {
  appTitle: 'Quản lý Lên Văn Phòng',
  offlineReady: 'Offline sẵn sàng',
  tabMain: 'Tab chính',
  tabCalendar: 'Xem lịch',
  tabSettings: 'Cài đặt',
  todayDateLabel: 'Hôm nay',
  progressSummary: 'Đã lên {x}/{y} ngày',
  planPriorityBtn: 'Theo ưu tiên',
  planStartBtn: 'Đầu tháng',
  planEndBtn: 'Cuối tháng',
  pickerYearLabel: 'Năm',
  btnCheckInNormal: 'Lên văn phòng',
  btnCheckInNormalSub: 'Chạm để đánh dấu hôm nay có lên văn phòng',
  btnCheckInPriority: 'Lên văn phòng (Ngày ưu tiên!)',
  btnCheckInPrioritySub: 'Hôm nay là ngày ưu tiên lên VP trong lịch tuần của bạn — cố gắng phát huy nhé!',
  btnCheckInWarning: 'Cảnh báo: Phải lên văn phòng!',
  btnCheckInWarningSub: 'Số ngày cần lên VP bằng đúng số ngày làm việc còn lại trong tháng!',
  btnCheckInDanger: 'Báo động: Thiếu ngày lên VP!',
  btnCheckInDangerSub: 'Số ngày làm việc còn lại trong tháng ít hơn số ngày bạn cần lên VP!',
  btnMarkLeave: 'Nghỉ phép',
  todayMarkedOffice: 'Đã đánh dấu: Lên văn phòng',
  todayMarkedLeave: 'Đã đánh dấu: Nghỉ phép',
  todayMarkedWork: 'Trạng thái: Làm việc từ xa',
  legendGray: 'Xám: Nghỉ',
  legendYellow: 'Vàng: Làm ở nhà',
  legendGreen: 'Xanh lá: Lên VP',
  workingDaysCount: '{work} ngày làm việc',
  quickAssignLabel: 'Phân bổ nhanh',
  profileSectionTitle: 'Nhân viên',
  selectProfileLabel: 'Chọn loại nhân viên',
  createNewProfileBtn: 'Tạo hồ sơ mới',
  fieldProfileName: '1. Tên nhu cầu',
  fieldCalcMethod: '2. Phương pháp tính',
  methodMonthly: 'Theo tháng',
  methodWeekly: 'Theo tuần',
  fieldMinPercent: '3. Yêu cầu tối thiểu (%)',
  fieldWeeklySchedule: '4. Cấu hình 7 ngày trong tuần',
  fieldNote: '5. Ghi chú / Mô tả',
  saveProfileBtn: 'Lưu hồ sơ',
  cancelBtn: 'Đóng',
  weeklyEditorTitle: 'Chỉnh ngày trong tuần (Nhấn để đổi màu)',
  remeasureNowBtn: 'Cập nhật nghỉ lễ',
  todayMarkedPlanned: 'Dự kiến: Lên văn phòng',
  todayIsOffice: 'Hôm nay lên văn phòng',
  todayIsLeave: 'Hôm nay nghỉ phép',
  infoAttended: 'Đã lên VP',
  infoPlanned: 'Còn dự kiến lên VP',
  infoRequired: 'Tổng ngày cần lên VP',
  infoWorkingDays: 'Tổng ngày làm việc',
  infoUpcomingOff: 'Lịch nghỉ sắp tới',
  upcomingHolidaysTitle: 'Nghỉ lễ sắp tới',
  noUpcomingOff: 'Thời gian tới không có ngày nghỉ',
  dayMon: 'T2',
  dayTue: 'T3',
  dayWed: 'T4',
  dayThu: 'T5',
  dayFri: 'T6',
  daySat: 'T7',
  daySun: 'CN',
};

const EN_DICT: TranslationDictionary = {
  appTitle: 'Office Attendance Tracker',
  offlineReady: 'Offline Ready',
  tabMain: 'Check-in',
  tabCalendar: 'Calendar',
  tabSettings: 'Settings',
  todayDateLabel: 'Today',
  progressSummary: 'Attended {x}/{y} days',
  planPriorityBtn: 'By priority',
  planStartBtn: 'Start of month',
  planEndBtn: 'End of month',
  pickerYearLabel: 'Year',
  btnCheckInNormal: 'Go to Office',
  btnCheckInNormalSub: 'Tap to mark today as attended at the office',
  btnCheckInPriority: 'Go to Office (Priority Day!)',
  btnCheckInPrioritySub: 'Today is your priority office day — great day to check in!',
  btnCheckInWarning: 'Warning: Must Attend Office!',
  btnCheckInWarningSub: 'Remaining required office days equal remaining working days this month!',
  btnCheckInDanger: 'Alert: Behind Office Target!',
  btnCheckInDangerSub: 'Remaining working days are fewer than your remaining required office days!',
  btnMarkLeave: 'Take Leave',
  todayMarkedOffice: 'Marked: At Office',
  todayMarkedLeave: 'Marked: On Leave',
  todayMarkedWork: 'Status: Remote Work',
  legendGray: 'Gray: Off',
  legendYellow: 'Yellow: Remote',
  legendGreen: 'Green: Office',
  workingDaysCount: '{work} working days',
  quickAssignLabel: 'Quick assign',
  profileSectionTitle: 'Employee',
  selectProfileLabel: 'Select employee profile',
  createNewProfileBtn: 'New Profile',
  fieldProfileName: '1. Requirement Name',
  fieldCalcMethod: '2. Calculation Method',
  methodMonthly: 'Monthly',
  methodWeekly: 'Weekly',
  fieldMinPercent: '3. Minimum Requirement (%)',
  fieldWeeklySchedule: '4. 7-Day Weekly Schedule',
  fieldNote: '5. Profile Note / Rule',
  saveProfileBtn: 'Save Profile',
  cancelBtn: 'Cancel',
  weeklyEditorTitle: '7-Day Schedule Editor (Tap day to cycle color)',
  remeasureNowBtn: 'Sync holiday plan',
  todayMarkedPlanned: 'Planned: Go to Office',
  todayIsOffice: 'In office today',
  todayIsLeave: 'On leave today',
  infoAttended: 'Office days done',
  infoPlanned: 'Planned office days',
  infoRequired: 'Office days required',
  infoWorkingDays: 'Total working days',
  infoUpcomingOff: 'Upcoming days off',
  upcomingHolidaysTitle: 'Upcoming holidays',
  noUpcomingOff: 'No days off coming up',
  dayMon: 'Mon',
  dayTue: 'Tue',
  dayWed: 'Wed',
  dayThu: 'Thu',
  dayFri: 'Fri',
  daySat: 'Sat',
  daySun: 'Sun',
};

const DICTIONARIES: Record<LanguageCode, TranslationDictionary> = {
  vi: VI_DICT,
  en: EN_DICT,
};

export function getTranslations(lang: LanguageCode): TranslationDictionary {
  return DICTIONARIES[lang];
}

export function formatMessage(template: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce(
    (acc, [key, val]) => acc.replaceAll(`{${key}}`, String(val)),
    template
  );
}
