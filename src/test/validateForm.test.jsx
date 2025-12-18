const validateForm = require('./validateForm');

describe('validateForm()', (formData) => {
  it('returns all errors when the form is empty', () => {
    const errors = validateForm({});
    expect(errors).toContain('Please select a destination');
    expect(errors).toContain('Please specify trip duration');
    expect(errors).toContain('Please select your budget');
    expect(errors).toContain('Please select who you\'re traveling with');
  });

  it('returns an error if the number of days is out of range', () => {
    const errors = validateForm({
      location: 'Dubai',
      noOfDays: 20,
      budget: 2000,
      traveler: 'Alone'
    });
    expect(errors).toContain('Trip duration must be between 1 and 15 days');
  });

  it('returns no errors if the form is valid', () => {
    const errors = validateForm({
      location: 'Tokyo',
      noOfDays: 5,
      budget: 3000,
      traveler: 'Friends'
    });
    expect(errors).toEqual([]);
  });
});
