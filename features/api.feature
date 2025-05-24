@api
Feature: JSONPlaceholder API

  Scenario: Get a list of posts
    When I send a GET request to "https://jsonplaceholder.typicode.com/posts"
    Then the response status should be 200
    And the response should contain a "userId" in every item
    And the response should contain a "title" in every item
    And attach all userIds from the response array

  Scenario: Get a single post
    When I send a GET request to "https://jsonplaceholder.typicode.com/posts/1"
    Then the response status should be 200
    And the response should contain "id" as 1
    And the response should contain "userId" as 1

  Scenario: Get a non-existent post
    When I send a GET request to "https://jsonplaceholder.typicode.com/posts/9999"
    Then the response status should be 404

  Scenario: Validate number of posts
    When I send a GET request to "https://jsonplaceholder.typicode.com/posts"
    Then the response status should be 200
    And the response array length should be 100

  Scenario: Validate keys and values in post at index 10
    When I send a GET request to "https://jsonplaceholder.typicode.com/posts"
    Then the response status should be 200
    And the object at index 10 should have the following:
      | userId |                                                                           2 |
      | id     |                                                                          11 |
      | title  | et e vero quia laudantium                                                   |
      | body   | delectus reiciendis molestiae occaecati non minima eveniet qui voluptatibus |
