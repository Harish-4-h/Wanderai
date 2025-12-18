// دالة validation للأيام
function validateDuration(duration) {
  // تحقق من أن المدخل رقم
  if (typeof duration !== 'number' && !Number.isInteger(Number(duration))) {
    return { isValid: false, message: 'Duration must be a number' };
  }
  
  const days = Number(duration);
  
  // تحقق من النطاق (1-15 أيام)
  if (days < 1) {
    return { isValid: false, message: 'Duration must be at least 1 day' };
  }
  
  if (days > 15) {
    return { isValid: false, message: 'Duration cannot exceed 15 days' };
  }
  
  return { isValid: true, message: 'Valid duration' };
}

// اختبارات Jest
describe('Trip Duration Validation', () => {
  test('should reject 0 days', () => {
    const result = validateDuration(0);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Duration must be at least 1 day');
  });

  test('should accept 1 day', () => {
    const result = validateDuration(1);
    expect(result.isValid).toBe(true);
  });

  test('should accept 15 days', () => {
    const result = validateDuration(15);
    expect(result.isValid).toBe(true);
  });

  test('should reject 16 days', () => {
    const result = validateDuration(16);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Duration cannot exceed 15 days');
  });

  test('should reject non-numeric input', () => {
    const result = validateDuration('abc');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Duration must be a number');
  });

  test('should reject negative numbers', () => {
    const result = validateDuration(-5);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Duration must be at least 1 day');
  });
});