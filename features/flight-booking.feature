@ui @flight
Feature: Flight Booking

  Background:
    Given I am on the flight booking page

  @flight-booking
  Scenario Outline: Book a flight between airports <fromAirport> and <toAirport>
    When I select "<fromAirport>" as the from airport
    And I select "<toAirport>" as the to airport
    And I select "<tripType>" as the trip type
    When I select "<departureDate>" as the "departure" date
    # Only select arrival date if present
    When I select "<arrivalDate>" as the "arrival" date
    Then the selected flight details should be:
      | key           | value           |
      | fromAirport   | <fromAirport>   |
      | toAirport     | <toAirport>     |
      | tripType      | <tripType>      |
      | departureDate | <departureDate> |
      | arrivalDate   | <arrivalDate>   |

    Examples:
      | fromAirport        | toAirport         | tripType   | departureDate    | arrivalDate      |
      | MAA Chennai, India | ATL Atlanta, GA   | Round Trip | 12 days from now | 15 days from now |
      | DEL Delhi, India   | BOM Mumbai, India | One Way    | 10 days from now |                  |
      | JAI Jaipur, India  | DEL Delhi, India  | Round Trip | today            | tomorrow         |

  @footer-links
  Scenario Outline: Validate footer link <Link Name> navigation for About Delta section
    When I click the "<Link Name>" link in the About Delta footer section
    Then I should be navigated to a page containing "<Navigated Page Header>"

    Examples:
      | Link Name          | Navigated Page Header                    |
      | About Us           | About Delta                              |
      | Careers            | Careers at Delta                         |
      | News Hub           | Sign up for Delta News                   |
      | Investor Relations | Investor Relations                       |
      | Business Travel    | Your Partner in Business Travel          |
      | Travel Agents      | PLEASE SELECT YOUR LOCATION AND LANGUAGE |
      | Mobile App         | Fly Delta App                            |
