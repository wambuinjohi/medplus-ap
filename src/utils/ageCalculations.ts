export function getAgingNarrative(dueDate: string, statementDate: string = new Date().toISOString().split('T')[0]): string {
  const due = new Date(dueDate);
  const statement = new Date(statementDate);
  
  const daysOverdue = Math.floor((statement.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  const formattedDueDate = due.toISOString().split('T')[0];
  
  if (daysOverdue <= 0) {
    return `Current - due ${formattedDueDate}`;
  } else {
    return `Overdue by ${daysOverdue} days - due ${formattedDueDate}`;
  }
}

export function getDaysOverdue(dueDate: string, statementDate: string = new Date().toISOString().split('T')[0]): number {
  const due = new Date(dueDate);
  const statement = new Date(statementDate);

  return Math.floor((statement.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

export function getAgingCategory(daysOverdue: number): string {
  if (daysOverdue <= 0) {
    return 'Current';
  } else if (daysOverdue <= 30) {
    return '1-30 Days Overdue';
  } else if (daysOverdue <= 60) {
    return '31-60 Days Overdue';
  } else if (daysOverdue <= 90) {
    return '61-90 Days Overdue';
  } else {
    return 'Over 90 Days Overdue';
  }
}
