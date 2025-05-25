@example @ui
Feature: Example Domain

  Scenario: Display the correct title
    Given I am on the "https://example.com" page
    Then the page title should be "Example Domai"

  Scenario: Heading is visible
    Given I am on the "https://example.com" page
    Then I should see a visible "h1" element
