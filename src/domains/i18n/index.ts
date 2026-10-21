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
  todayIsRemote: string;
  infoAttended: string;
  infoPlanned: string;
  infoRequired: string;
  infoWorkingDays: string;
  infoUpcomingOff: string;
  upcomingHolidaysTitle: string;
  vpReminderTitle: string;
  vpReminderDesc: string;
  vpReminderOn: string;
  vpReminderOff: string;
  vpReminderBlocked: string;
  vpReminderUnsupported: string;
  vpReminderNotifTitle: string;
  vpReminderBodyAtRisk: string;
  vpReminderBodyPlanned: string;
  vpReminderBodyPriority: string;
  noUpcomingOff: string;
  lockdownTitle: string;
  lockdownAddBtn: string;
  lockdownRemoveBtn: string;
  lockdownDayLabel: string;
  lockdownEmpty: string;
  lockdownConfirmBtn: string;
  lockdownPrevMonth: string;
  lockdownNextMonth: string;
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
  todayIsRemote: 'Hôm nay làm việc tại nhà',
  infoAttended: 'Đã lên VP',
  infoPlanned: 'Còn dự kiến lên VP',
  infoRequired: 'Tổng ngày cần lên VP',
  infoWorkingDays: 'Tổng ngày làm việc',
  infoUpcomingOff: 'Lịch nghỉ sắp tới',
  upcomingHolidaysTitle: 'Nghỉ lễ sắp tới',
  vpReminderTitle: 'Thông báo',
  vpReminderDesc: 'Nhắc lên văn phòng lúc 7:00 mỗi ngày.',
  vpReminderOn: 'Đang bật',
  vpReminderOff: 'Bật nhắc lên VP',
  vpReminderBlocked: 'Đã chặn thông báo trong cài đặt trình duyệt',
  vpReminderUnsupported: 'Thiết bị/trình duyệt không hỗ trợ thông báo',
  vpReminderNotifTitle: 'Office Tracker',
  vpReminderBodyAtRisk: 'Nếu không lên VP liên tục từ hôm nay đến cuối tháng, bạn sẽ thiếu chỉ tiêu.',
  vpReminderBodyPlanned: 'Hôm nay là ngày dự kiến lên văn phòng.',
  vpReminderBodyPriority: 'Hôm nay là ngày ưu tiên lên văn phòng và bạn chưa đủ số ngày.',
  noUpcomingOff: 'Thời gian tới không có ngày nghỉ',
  lockdownTitle: 'Office lockdown',
  lockdownAddBtn: 'Thêm ngày lockdown',
  lockdownRemoveBtn: 'Xoá ngày lockdown',
  lockdownDayLabel: 'Ngày',
  lockdownEmpty: 'Chưa có ngày lockdown nào',
  lockdownConfirmBtn: 'Thêm',
  lockdownPrevMonth: 'Tháng trước',
  lockdownNextMonth: 'Tháng sau',
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
  todayIsRemote: 'Working from home today',
  infoAttended: 'Office days done',
  infoPlanned: 'Planned office days',
  infoRequired: 'Office days required',
  infoWorkingDays: 'Total working days',
  infoUpcomingOff: 'Upcoming days off',
  upcomingHolidaysTitle: 'Upcoming holidays',
  vpReminderTitle: 'Notifications',
  vpReminderDesc: 'Office reminder at 7:00 every day.',
  vpReminderOn: 'Enabled',
  vpReminderOff: 'Enable reminder',
  vpReminderBlocked: 'Notifications are blocked in browser settings',
  vpReminderUnsupported: 'This device/browser does not support notifications',
  vpReminderNotifTitle: 'Office Tracker',
  vpReminderBodyAtRisk: 'If you do not go to the office every day from today to month end, you will miss your target.',
  vpReminderBodyPlanned: 'Today is a planned office day.',
  vpReminderBodyPriority: 'Today is a priority office day and your target is not yet met.',
  noUpcomingOff: 'No days off coming up',
  lockdownTitle: 'Office lockdown',
  lockdownAddBtn: 'Add lockdown days',
  lockdownRemoveBtn: 'Remove lockdown day',
  lockdownDayLabel: 'Day',
  lockdownEmpty: 'No lockdown days yet',
  lockdownConfirmBtn: 'Add',
  lockdownPrevMonth: 'Previous month',
  lockdownNextMonth: 'Next month',
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
