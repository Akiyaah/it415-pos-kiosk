# Slurp Noodle House Kiosk

A touchscreen Point of Sale (POS) kiosk for a small noodle shop, built for the IT415 Practical Examination. A customer taps dishes, reviews the order, pays by Cash, QR or Card, and gets a digital receipt. QR and card payments are **simulated**. No real payment processing exists.

## Deployment

The project is deployed on Vercel and connected to the GitHub repository. Production deployments are created from the `main` branch.

Live Demo: https://it415-pos-kiosk.vercel.app

## Required software

- A modern web browser (Chrome, Edge, Firefox, Safari). A tablet or touchscreen laptop is best, but a mouse works too.
- Internet is optional. It is only used to load the Poppins and JetBrains Mono fonts. Offline, the kiosk falls back to system fonts and works the same.
- Nothing to install: no Node.js, no database, no build step.

## How to run

1. Clone the repository:
   ```
   [git clone https://github.com/Akiyaah/it415-pos-kiosk.git
   cd it415-pos-kiosk](https://github.com/Akiyaah/it415-pos-kiosk.git)
   ```
2. Open `index.html` in the browser (double-click it, or right-click → Open with → your browser).
3. Optional: serve it locally, which is closer to a real kiosk:
   ```
   python -m http.server 8000
   ```
   Then open `http://localhost:8000`.

For kiosk-style full screen, press **F11** in the browser.

## Language, framework and storage (and why)

| Choice | Why |
|---|---|
| **HTML + CSS + plain JavaScript** (no framework) | Easy for the team to read and explain. No dependencies, nothing to install, runs on any tablet browser. |
| **Hard-coded product data** (`js/products.js`) | The menu is small and fixed. A database would add complexity without a benefit. |
| **In-memory state** for the cart, payment and receipt | The order only matters during one transaction, and "New Transaction" must clear it anyway. |
| **Local Storage** for one value only: the next transaction number | Keeps transaction references unique even after the page is reloaded. |
| **Simulated QR and card payments** | The exam does not require real payment processing. The screens say "Simulated payment". |

## Features

- **Order:** 9 dishes with names, prices (₱) and illustrations. Filter chips: All, Noodles, Sides, Drinks. Tap a card to add it. Plus and minus buttons, a trash button, subtotals and a live total. Quantity is never below 1 or above 99, and a toast says "Product added" or "Invalid quantity".
- **Review:** a table of product, quantity, unit price and subtotal, with the total. Back keeps the cart.
- **Payment method:** Cash, QR Payment, Credit / Debit Card, with the amount due.
- **Cash:** on-screen keypad, quick amounts (Exact, ₱200, ₱500, ₱1,000), automatic change. Blank, invalid, negative and insufficient amounts are rejected with a red alert, the customer stays on the screen, and no transaction is created. Exact payment gives ₱0.00 change.
- **QR:** QR placeholder, reference number, scan instructions, Confirm Payment. Amount paid equals the total and change is ₱0.00.
- **Card:** tap/insert/swipe instruction, "Processing payment…" animation, Process Payment. Amount paid equals the total and change is ₱0.00.
- **Payment Successful:** transaction number, method, amount, amount paid, change, View Receipt.
- **Receipt:** store name, transaction number, real date and time, items with quantity × price, total, method, amount paid, change, status. Print Receipt is optional.
- **New Transaction:** clears the cart, payment and receipt and returns to an empty Order screen.
- **Transaction numbers:** `TXN-<year>-<5 digits>`, increasing by 1 for every completed transaction, so two transactions never share a number.

## Project structure

```
index.html          page shell, loads the scripts below in order
css/styles.css      all styling (Slurp Noodle House theme)
js/products.js      menu data
js/state.js         state object, constants, transaction numbers
js/helpers.js       peso(), cart math, date format, toast messages
js/icons.js         line icons
js/art.js           dish illustrations (inline SVG)
js/cart.js          add / change quantity / remove
js/cash.js          cash keypad and quick amounts
js/payment.js       cash validation, QR/card/cash payment, navigation
js/views.js         one function per screen (returns HTML)
js/app.js           render() and the click handler (ACTIONS table)
```

Script order in `index.html` matters, because each file can use the ones above it.

## Testing

The application was tested in the browser using the required transaction flow and the instructor's acceptance criteria. The tests covered product selection, cart and quantity behavior, navigation, payment validation, simulated QR and card payments, receipts, transaction reset, and unique transaction references.

The tests use the project's actual products and prices: Tonkotsu Ramen ₱180, Pancit Canton ₱85, and Iced Tea ₱35.

| # | Test | Expected | Result |
|---|---|---|---|
| 1 | Open the app and select dishes | Application runs correctly, displays 9 products with names and prices, and does not require typing | PASS |
| 2 | Add Tonkotsu ×2, Pancit ×1, Iced Tea ×1 | Tonkotsu subtotal ₱360, Pancit subtotal ₱85, Iced Tea subtotal ₱35, total ₱480 | PASS |
| 3 | Increase then decrease Tonkotsu quantity | Subtotal and total update correctly; quantity cannot go below 1 | PASS |
| 4 | Remove Iced Tea using the trash button | Iced Tea is removed and total becomes ₱445 | PASS |
| 5 | Proceed to Review / Payment | Review screen shows the same items, quantities, and total as the Order screen | PASS |
| 6 | Go Back from Review | Previous items and quantities remain in the cart | PASS |
| 7 | Continue to Payment | Cash, QR Payment, and Credit/Debit Card are displayed as payment options | PASS |
| 8 | Cash: enter ₱100 for a ₱445 order | Red "Insufficient payment." alert appears; payment is rejected and no receipt is created | PASS |
| 9 | Cash: enter ₱500 and use Exact | ₱500 payment gives ₱55.00 change; Exact payment gives ₱0.00 change | PASS |
| 10 | Complete a successful payment | Payment Successful screen displays the amount, payment method, transaction number, and View Receipt option | PASS |
| 11 | View Receipt | Receipt details match the completed transaction, including items, quantities, total, payment method, amount paid, change, and transaction reference | PASS |
| 12 | Complete QR Payment | QR placeholder and Confirm Payment are displayed; payment method is QR Payment, amount paid equals the total, and change is ₱0.00 | PASS |
| 13 | Complete Card Payment | Card instructions and processing state are displayed; payment method is Credit/Debit Card and the simulated payment completes successfully | PASS |
| 14 | Start New Transaction | Cart becomes empty, total returns to ₱0.00, payment information is cleared, and the previous receipt is removed | PASS |
| 15 | Complete two separate transactions | Each completed transaction receives a different transaction reference number | PASS |

### Testing Summary

All required transaction stages were checked from product selection through receipt generation and starting a new transaction. The tests also covered invalid cash payment, quantity restrictions, cart persistence when navigating back, simulated QR/Card payments, receipt consistency, transaction reset, and unique transaction references.

The application uses simulated QR and card payments only; no real payment gateway or card processing is connected.

## Group Contributions

| Member                       | GitHub Username         | Branch                       | Contribution                                                                       | PR                                                                                               | Reviewer           | Merge Status |
| ---------------------------- | ----------------------- | ---------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------ | ------------ |
| **Vince Francis Quita**      | `Akiyaah`               | `feature/order-screen`       | Stage 2 kiosk interface and screen layouts                                         | [PR #1 – Stage 2: Build kiosk interface](https://github.com/Akiyaah/it415-pos-kiosk/pull/1)      | No review recorded | Merged       |
| **Vince Francis Quita**      | `Akiyaah`               | `feature/cash-validation`    | Stage 4 strict cash validation                                                     | [PR #4 – Stage 4: Add strict cash validation](https://github.com/Akiyaah/it415-pos-kiosk/pull/4) | No review recorded | Merged       |
| **Vince Francis Quita**      | `Akiyaah`               | `bugfix/cash-quick-amounts`  | Stage 5 cash quick-amount/keypad bug fix                                           | [PR #5 – stage 5 bugfix/cash-quick-amounts](https://github.com/Akiyaah/it415-pos-kiosk/pull/5)   | No review recorded | Merged       |
| **Vince Francis Quita**      | `Akiyaah`               | `refactor/split-app-modules` | Stage 6 refactoring: split `app.js` into modules and remove duplicated code        | [PR #6 – Stage 6 refactor](https://github.com/Akiyaah/it415-pos-kiosk/pull/6)                    | No review recorded | Merged       |
| **Deniele Therese Lodovice** | `deniele1103`           | `stage-3-core-functionality` | Stage 3 core functionality including cart, payment, transaction, and receipt logic | [PR #2 – Stage 3 core functionality](https://github.com/Akiyaah/it415-pos-kiosk/pull/2)          | No review recorded | Merged       |
| **Deniele Therese Lodovice** | `deniele1103`           | `Re-designed-UI`             | Visual redesign of the Slurp Noodle House kiosk interface                          | [PR #3 – Re designed UI](https://github.com/Akiyaah/it415-pos-kiosk/pull/3)                      | No review recorded | Merged       |
| **Jamalee Qym Talento** | `talentojamaleeqym-eng` | `optimization` | Optimization work on the project | No PR recorded | N/A | Active branch / Not merged |

## Development Stages

The project was developed incrementally through separate stages. Each stage was
implemented, tested, reviewed, and merged through GitHub pull requests.

| Stage | What was done | Pull Request / Status |
|---|---|---|
| | 1. Setup | Created the initial project using an AI prompt based on the IT415 examination requirements, then enhanced and refined the generated implementation. Because free-tier AI tools have usage limits, multiple available AI accounts/tools were prepared to maintain access during development. I also established the GitHub repository for version control and continued development. | Initial project setup |
| 2. Interface | Built the initial touchscreen kiosk interface based on the required visual design. Added Google Fonts (Plus Jakarta Sans and JetBrains Mono) in `index.html`, created the complete screen styling and layouts in `css/styles.css`, and added one drawing function per screen in `js/app.js` for Order, Review, Payment Method, Cash, QR, Card, Success, and Receipt. The header and step pills were also implemented, while `js/products.js` was updated with product tile and icon colors. | PR #1 – Stage 2: Build kiosk interface |
| | 3. Core Functionality | Implemented the main POS functionality in `js/app.js`. Replaced the sample order with a real cart that starts empty and supports adding items, increasing/decreasing quantities, and removing items. Added quantity limits from 1–99, cart updates, item counts, badges, and toast feedback. Implemented navigation rules so the cart is preserved when going back and empty carts cannot proceed to Review or Payment. Added the Cash payment keypad, quick amounts, Clear, backspace, live change calculation, and payment handling; implemented simulated QR and Card payments with confirmation/progress behavior. Added transaction creation only after successful payment, unique transaction references saved in Local Storage, payment-time date/time, receipt generation, and the New Transaction reset. In `css/styles.css`, added toast animations, the error-toast icon, card payment progress animation, and disabled button styling. | PR #2 – Stage 3 core functionality |
| Visual Redesign | Redesigned the interface into the approved Slurp Noodle House theme while maintaining the required POS flow and functionality. | PR #3 – Re designed UI |

| Visual Redesign | Redesigned the kiosk interface into a noodle-shop theme with a warm cream background, dark brown header, orange accents, and Poppins font. Updated the interface with 9 hand-drawn food illustrations and redesigned category tabs, product cards, and order controls based on the target visual design. Added responsive tablet layouts for landscape and portrait orientations, including a side order panel in landscape and a bottom order bar in portrait. Payment options were redesigned as large horizontal cards, with touchscreen controls sized at least 44px. Pinch-to-zoom was disabled for the kiosk experience. The existing cart, validation, payment, and receipt logic was kept unchanged; the only `app.js` adjustment was repositioning the card in the reader illustration. Also updated Print Receipt so that only the receipt paper is printed. | PR #3 – Re designed UI |

| 4. Validation | Added strict cash payment validation for blank, invalid, negative, and insufficient payment amounts. | PR #4 – Stage 4: Add strict cash validation |
| | 5. Bug Fix | Fixed a cash input bug where typing a keypad number after selecting a quick amount (e.g., ₱200 + 5) incorrectly produced ₱2005. The fix makes the next keypad input start a fresh amount, so ₱200 + 5 becomes ₱5. | PR #5 – stage 5 bugfix/cash-quick-amounts |bugfix/cash-quick-amounts |
| 6. Refactoring | Split `app.js` into separate modules, introduced an actions table, and removed duplicated code while preserving the existing design and behavior. | PR #6 – Stage 6 refactor |
| 7. Documentation | Documented the project setup, features, technology choices, testing, development stages, contributions, and AI-assisted development process. | README |

## AI-Assisted Development

AI tools were used as development assistance throughout the project. The team provided the IT415 practical examination instructions, acceptance checklist, sample kiosk reference, and project constraints to guide the AI output. AI-generated work was then tested and evaluated against the required functionality before being used in the project.

| Stage | AI Tool | Prompt / Request Used | AI Response / Output Relied On | Evaluation | Team Changes / Adaptation |
|---|---|---|---|---|---|
| **1. Setup** | ChatGPT, Claude | Provided the IT415 practical exam instructions, the sample Touchscreen POS Kiosk, and the instructor's acceptance criteria. Asked ChatGPT to create a clear development prompt specifying the technology, required features, constraints, transaction flow, deliverables, and testing requirements. The generated prompt was then provided to Claude. | ChatGPT produced a detailed master prompt covering the touchscreen POS requirements, item selection, order summary, payment methods, cash validation, simulated QR/card payments, transaction references, receipts, reset behavior, implementation constraints, deliverables, and instructor testing requirements. Claude used this prompt as the basis for the initial project. | The generated prompt was checked against the exam instructions and acceptance checklist to make sure the required features and constraints were included. | The initial AI-generated project was used as the starting point and then enhanced throughout the later development stages. The GitHub repository was also established for version control. |
| **2. Interface** | Claude | Reused the master development prompt describing the required touchscreen interface, transaction screens, visual requirements, and project constraints. | Claude generated the initial kiosk interface, including the screen structure, header, step indicators, product interface, payment screens, and related styling. | The generated interface was checked against the required kiosk flow, screen structure, touchscreen requirements, and provided design reference. | No direct changes were made to the AI-generated implementation during this stage. Later visual changes were handled as a separate Visual Redesign stage. |
| **3. Core Functionality** | Claude | Reused the master development prompt containing the complete POS transaction flow and required functionality. | Claude implemented the main POS behavior, including the cart, quantity controls, navigation, payment methods, transaction handling, receipt generation, and new transaction reset. | The functionality was tested through the required transaction flow and checked against the acceptance requirements. | No direct changes were made to the AI-generated implementation during this stage. Issues discovered through later testing were handled in the validation and bug-fix stages. |
| **4. Validation** | Claude | Reused the master prompt with an additional request focused on the validation requirements, particularly cash payment validation. | Claude provided the implementation for strict cash validation, including handling blank, invalid, negative, and insufficient payment amounts and displaying clear error feedback. | The validation behavior was checked by testing different cash input conditions and comparing the results with the instructor's requirements. | No major changes were made to the generated validation implementation during this stage. The resulting validation behavior was retained for testing. |
| **5. Bug Fix** | Claude | Reused the development prompt and requested assistance with the issue discovered during testing of the cash quick-amount and keypad behavior. | Claude provided a fix for the cash input behavior so that keypad input after selecting a quick amount would start a new amount instead of appending incorrectly. | The fix was tested in the browser using the actual cash keypad. For example, selecting ₱200 and then pressing `5` was checked to ensure the result became ₱5 instead of ₱2005. | The fix was applied and verified through browser testing. This stage addressed an actual problem discovered during testing rather than an invented bug. |
| **6. Refactoring** | AI assistance | Requested help with the completed/debugged project and prepared it for refactoring. | AI assistance was used to split the large `app.js` file into separate modules, organize actions through the `ACTIONS` table, and remove duplicated code. | The refactored project was checked using a simulated Node test and browser click-through to verify that the existing behavior remained unchanged. | The team adapted the refactoring to preserve the existing design and functionality while organizing the code into 9 modules. |
| **7. Documentation** | ChatGPT | Provided the existing project README, development history, GitHub information, testing information, and AI-use details and requested help documenting the actual development process. | ChatGPT helped organize the README sections, development stages, GitHub contributions, AI-assisted development history, testing, and project limitations. | The documentation was compared with the actual project files, GitHub history, and development process to avoid inventing contributions or development evidence. | The team supplied and corrected the actual project-specific information, including GitHub PRs, branches, development changes, and AI-use history. |

## Limitations

- QR and card payments are simulations only. The QR code is a placeholder, and no card reader or payment gateway is connected.
- The transaction number counter is stored in the browser's Local Storage, so it is separate for each browser and device, and clearing the browser data resets it.
- There is no transaction history, inventory or login. These were not required.
