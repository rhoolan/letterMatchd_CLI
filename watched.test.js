// Import the function you want to test
// const { default: test } = require("node:test");
const { convertStarRating, convertCorrelationIntoLabel } = require("./watched");

// convertCorrelationIntoLabel.test.js

describe("convertCorrelationIntoLabel", () => {
  it('returns "Soulmates" when correlation is 1', () => {
    expect(convertCorrelationIntoLabel(1)).toBe(
      "Soulmates: Your movie tastes are identical.",
    );
  });

  it('returns Peas in a Pod: Almost identical tastes." when correlation is 0.9"', () => {
    expect(convertCorrelationIntoLabel(0.9)).toBe(
      "Peas in a Pod: Almost identical tastes.",
    );
  });

  it('returns "Peas in a Pod: Almost identical tastes." when correlation is higher than 0.9 but less than 1"', () => {
    expect(convertCorrelationIntoLabel(0.95)).toBe(
      "Peas in a Pod: Almost identical tastes.",
    );
  });

  it('returns "Great Match: You enjoy many of the same movies." when correlation is 0.8"', () => {
    expect(convertCorrelationIntoLabel(0.8)).toBe(
      "Great Match: You enjoy many of the same movies.",
    );
  });

  it('returns "Great Match: You enjoy many of the same movies." when correlation is higher than 0.8 but less than 0.9"', () => {
    expect(convertCorrelationIntoLabel(0.85)).toBe(
      "Great Match: You enjoy many of the same movies.",
    );
  });

  it('returns "Good Match: You often agree on movie choices." when correlation is 0.7', () => {
    expect(convertCorrelationIntoLabel(0.7)).toBe(
      "Good Match: You often agree on movie choices.",
    );
  });

  it('returns "Good Match: You often agree on movie choices." when correlation is higher than 0.7 but less than 0.8', () => {
    expect(convertCorrelationIntoLabel(0.75)).toBe(
      "Good Match: You often agree on movie choices.",
    );
  });

  it('returns "Fairly Similar: Your tastes align on several genres." when correlation is 0.6', () => {
    expect(convertCorrelationIntoLabel(0.6)).toBe(
      "Fairly Similar: Your tastes align on several genres.",
    );
  });

  it('returns "Fairly Similar: Your tastes align on several genres." when correlation is higher than 0.6 but less than 0.7', () => {
    expect(convertCorrelationIntoLabel(0.65)).toBe(
      "Fairly Similar: Your tastes align on several genres.",
    );
  });

  it('returns "Decent Match: You share some movie interests." when correlation is 0.5', () => {
    expect(convertCorrelationIntoLabel(0.5)).toBe(
      "Decent Match: You share some movie interests.",
    );
  });

  it('returns "Decent Match: You share some movie interests." when correlation is higher than 0.5 but less than 0.6', () => {
    expect(convertCorrelationIntoLabel(0.55)).toBe(
      "Decent Match: You share some movie interests.",
    );
  });

  it('returns "Some Agreement: You like a few similar films." when correlation is 0.4', () => {
    expect(convertCorrelationIntoLabel(0.4)).toBe(
      "Some Agreement: You like a few similar films.",
    );
  });

  it('returns "Some Agreement: You like a few similar films." when correlation is higher than 0.4 but less than 0.5', () => {
    expect(convertCorrelationIntoLabel(0.45)).toBe(
      "Some Agreement: You like a few similar films.",
    );
  });

  it('returns "A Little Overlap: Some movies catch both your interests." when correlation is 0.3', () => {
    expect(convertCorrelationIntoLabel(0.3)).toBe(
      "A Little Overlap: Some movies catch both your interests.",
    );
  });

  it('returns "A Little Overlap: Some movies catch both your interests." when correlation is higher than 0.3 but less than 0.4', () => {
    expect(convertCorrelationIntoLabel(0.35)).toBe(
      "A Little Overlap: Some movies catch both your interests.",
    );
  });

  it('returns "Mild Overlap: Limited common ground in preferences." when correlation is 0.2', () => {
    expect(convertCorrelationIntoLabel(0.2)).toBe(
      "Mild Overlap: Limited common ground in preferences.",
    );
  });

  it('returns "Mild Overlap: Limited common ground in preferences." when correlation is higher than 0.2 but less than 0.3', () => {
    expect(convertCorrelationIntoLabel(0.25)).toBe(
      "Mild Overlap: Limited common ground in preferences.",
    );
  });

  it('returns "Hardly Alike: Minimal shared interests." when correlation is 0.1', () => {
    expect(convertCorrelationIntoLabel(0.1)).toBe(
      "Hardly Alike: Minimal shared interests.",
    );
  });

  it('returns "Hardly Alike: Minimal shared interests." when correlation is higher than 0.1 but less than 0.2', () => {
    expect(convertCorrelationIntoLabel(0.15)).toBe(
      "Hardly Alike: Minimal shared interests.",
    );
  });

  //
  it('returns "Worlds Apart: Almost no alignment in tastes." when correlation is 0.0', () => {
    expect(convertCorrelationIntoLabel(0.0)).toBe(
      "Worlds Apart: Almost no alignment in tastes.",
    );
  });

  it('returns "Worlds Apart: Almost no alignment in tastes." when correlation is higher than -0.1 but less than 0.0', () => {
    expect(convertCorrelationIntoLabel(-0.05)).toBe(
      "Worlds Apart: Almost no alignment in tastes.",
    );
  });
  //
  it('returns "Slightly Different: Just a little bit off." when correlation is -0.1', () => {
    expect(convertCorrelationIntoLabel(-0.1)).toBe(
      "Slightly Different: Just a little bit off.",
    );
  });

  it('returns "Slightly Different: Just a little bit off." when correlation is higher than -0.1 but less than 0.2', () => {
    expect(convertCorrelationIntoLabel(-0.15)).toBe(
      "Slightly Different: Just a little bit off.",
    );
  });
  //
  it('returns "Noticeable Differences: You often have different tastes." when correlation is -0.2', () => {
    expect(convertCorrelationIntoLabel(-0.2)).toBe(
      "Noticeable Differences: You often have different tastes.",
    );
  });

  it('returns "Noticeable Differences: You often have different tastes." when correlation is higher than -0.2 but less than 0.3', () => {
    expect(convertCorrelationIntoLabel(-0.25)).toBe(
      "Noticeable Differences: You often have different tastes.",
    );
  });
  //
  it('returns "Diverging Paths: Tastes are starting to differ." when correlation is -0.3', () => {
    expect(convertCorrelationIntoLabel(-0.3)).toBe(
      "Diverging Paths: Tastes are starting to differ.",
    );
  });

  it('returns "Diverging Paths: Tastes are starting to differ." when correlation is higher than -0.3 but less than 0.4', () => {
    expect(convertCorrelationIntoLabel(-0.35)).toBe(
      "Diverging Paths: Tastes are starting to differ.",
    );
  });
  //
  it('returns "Different Tastes: Your preferences are not aligned." when correlation is -0.4', () => {
    expect(convertCorrelationIntoLabel(-0.4)).toBe(
      "Different Tastes: Your preferences are not aligned.",
    );
  });

  it('returns "Different Tastes: Your preferences are not aligned." when correlation is higher than -0.4 but less than 0.5', () => {
    expect(convertCorrelationIntoLabel(-0.45)).toBe(
      "Different Tastes: Your preferences are not aligned.",
    );
  });
  //
  it('returns "Distinctly Different: Noticeably opposing tastes." when correlation is -0.4', () => {
    expect(convertCorrelationIntoLabel(-0.5)).toBe(
      "Distinctly Different: Noticeably opposing tastes.",
    );
  });

  it('returns "Distinctly Different: Noticeably opposing tastes." when correlation is higher than -0.5 but less than 0.6', () => {
    expect(convertCorrelationIntoLabel(-0.55)).toBe(
      "Distinctly Different: Noticeably opposing tastes.",
    );
  });
  //
  it('returns "Very Different: Movies you like are often not mutual." when correlation is -0.6', () => {
    expect(convertCorrelationIntoLabel(-0.6)).toBe(
      "Very Different: Movies you like are often not mutual.",
    );
  });

  it('returns "Very Different: Movies you like are often not mutual." when correlation is higher than -0.6 but less than 0.7', () => {
    expect(convertCorrelationIntoLabel(-0.65)).toBe(
      "Very Different: Movies you like are often not mutual.",
    );
  });
  //
  it('returns "Opposite Ends: Your choices frequently clash." when correlation is -0.7', () => {
    expect(convertCorrelationIntoLabel(-0.7)).toBe(
      "Opposite Ends: Your choices frequently clash.",
    );
  });

  it('returns "Opposite Ends: Your choices frequently clash." when correlation is higher than -0.7 but less than 0.8', () => {
    expect(convertCorrelationIntoLabel(-0.75)).toBe(
      "Opposite Ends: Your choices frequently clash.",
    );
  });
  //
  it('returns "Polar Opposites: Generally opposing tastes." when correlation is -0.8', () => {
    expect(convertCorrelationIntoLabel(-0.8)).toBe(
      "Polar Opposites: Generally opposing tastes.",
    );
  });

  it('returns "Polar Opposites: Generally opposing tastes." when correlation is higher than -0.8 but less than 0.9', () => {
    expect(convertCorrelationIntoLabel(-0.85)).toBe(
      "Polar Opposites: Generally opposing tastes.",
    );
  });
  //
  it('returns "Almost Completely Opposite: Highly different tastes." when correlation is -0.9', () => {
    expect(convertCorrelationIntoLabel(-0.9)).toBe(
      "Almost Completely Opposite: Highly different tastes.",
    );
  });

  it('returns "Almost Completely Opposite: Highly different tastes." when correlation is -0.9  but less than -1.0', () => {
    expect(convertCorrelationIntoLabel(-0.95)).toBe(
      "Almost Completely Opposite: Highly different tastes.",
    );
  });

  it('returns "Total Opposites: Complete disagreement in movie tastes." when correlation is -1.0', () => {
    expect(convertCorrelationIntoLabel(-1.0)).toBe(
      "Total Opposites: Complete disagreement in movie tastes.",
    );
  });

  //

  it('returns "Error: Invalid correlation value." when correlation is not within the range -1.0 to 1.0', () => {
    expect(convertCorrelationIntoLabel(1.1)).toBe(
      "Error: Invalid correlation value.",
    );
    expect(convertCorrelationIntoLabel(-1.1)).toBe(
      "Error: Invalid correlation value.",
    );
  });
});

// Describe the test suite
describe("convertStarRating", () => {
  // Test case for recognized ratings
  it("should convert star ratings to numbers", () => {
    // Test expectations
    expect(convertStarRating("½")).toBe(0.5);
    expect(convertStarRating("★")).toBe(1);
    expect(convertStarRating("★½")).toBe(1.5);
    expect(convertStarRating("★★")).toBe(2);
    expect(convertStarRating("★★½")).toBe(2.5);
    expect(convertStarRating("★★★")).toBe(3);
    expect(convertStarRating("★★★½")).toBe(3.5);
    expect(convertStarRating("★★★★")).toBe(4);
    expect(convertStarRating("★★★★½")).toBe(4.5);
    expect(convertStarRating("★★★★★")).toBe(5);
  });

  // Test case for unrecognized ratings
  it("should return null for unrecognized ratings", () => {
    // Test expectations
    expect(convertStarRating("Unknown")).toBe(null);
    expect(convertStarRating("")).toBe(null); // Test for empty string
    expect(convertStarRating("★★★★★★")).toBe(null); // Test for unrecognized pattern
  });
});
