export function calculateAge(
  birthDate: Date,
  admissionDate: Date
): { years: number; months: number; days: number } {
  if (birthDate && admissionDate) {
    let years = admissionDate.getFullYear() - birthDate.getFullYear();
    let months = admissionDate.getMonth() - birthDate.getMonth();
    let days = admissionDate.getDate() - birthDate.getDate();

    // 如果天数为负，说明当前月的天数不够，需要从上个月借天数，月数减1
    if (days < 0) {
      // 获取上一个月的天数
      const previousMonth = new Date(
        admissionDate.getFullYear(),
        admissionDate.getMonth(),
        0
      );
      days += previousMonth.getDate(); // 借天数
      months--;
    }

    // 如果月份为负，说明还没到生日，年数减1，月数调整为正数
    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  } else {
    return { years: 0, months: 0, days: 0 };
  }
}

export function calculateAgeString(
  birthDate: Date,
  admissionDate: Date
): string {
  const { years, months, days } = calculateAge(birthDate, admissionDate);
  if (years === 0 && months === 0 && days !== 0) {
    return `${days}天`;
  } else if (years === 0 && (months !== 0 || days !== 0)) {
    return `${months}月${days}天`;
  } else if (years) {
    return `${years}岁`;
  } else {
    return "未知";
  }
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function formatDateTime(date: Date): string {
  const dateString = formatDate(date);
  const timeString = formatTime(date);
  return `${dateString} ${timeString}`;
}

export function toDate(date: string): Date {
  if (!date) return undefined;
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}
