# Feature Specification: BoxSort Core MVP

**Feature Branch**: `001-core-mvp`  
**Created**: 2025-12-08  
**Status**: Draft  
**Input**: User description: "Build the spec for the UIs and backend - Box sorting app with CRUD for boxes/items, QR codes, funky names, search, and multi-user household access"

## Clarifications

### Session 2025-12-08

- Q: Should users be able to enter custom box names? → A: No. Users MUST NOT enter custom names to prevent duplicates. Only auto-generated random names are allowed. A cyclic arrow (↻) icon button allows regenerating the name if user doesn't like it. The box name is printed below the QR code.
- Q: Can any household member delete any box/item, or only the creator? → A: Any member can delete any box/item (fully collaborative, no ownership model).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Search for an Item (Priority: P1)

A household member needs to find where a specific item is stored. They open the app, type the item name in the search bar, and immediately see which box contains that item along with the box's funky name (e.g., "apple-cow-green").

**Why this priority**: This is the primary value proposition of the app. Without effective search, users cannot find their belongings, making the app worthless. This is why people use the app in the first place.

**Independent Test**: Can be fully tested by adding a few boxes with items, then searching for an item and verifying the correct box is displayed. Delivers immediate value by helping users locate items.

**Acceptance Scenarios**:

1. **Given** a box "purple-moon-fish" containing "winter jacket", **When** user searches "jacket", **Then** search results show "winter jacket" in box "purple-moon-fish"
2. **Given** multiple boxes with similar items, **When** user searches "charger", **Then** all boxes containing items matching "charger" are displayed
3. **Given** no items match the search term, **When** user searches "unicorn", **Then** a friendly "No items found" message is displayed
4. **Given** a partial search term, **When** user types "char", **Then** results update in real-time showing items containing "char" (e.g., "phone charger", "charcoal")

---

### User Story 2 - Add a New Box (Priority: P2)

A household member gets a new IKEA box and wants to add it to the inventory. They tap "Add Box", the system automatically generates a unique funky name (like "green-tiger-cloud"), and a QR code is generated that they can print and stick on the physical box.

**Why this priority**: Users must be able to create boxes before they can add items or search. This is foundational but secondary to search because existing users with data need search most.

**Independent Test**: Can be fully tested by creating a new box and verifying it appears in the box list with a generated name and QR code. Delivers value by starting the inventory system.

**Acceptance Scenarios**:

1. **Given** user is on the home screen, **When** they tap "Add Box", **Then** a new box is created with an auto-generated 3-word funky name
2. **Given** a new box is created, **When** viewing box details, **Then** a printable QR code is displayed with the box name printed below it
3. **Given** user doesn't like the generated name, **When** they tap the cyclic arrow (↻) regenerate button, **Then** a new random funky name is generated (custom names are NOT allowed)
4. **Given** a box is created, **When** another household member opens the app, **Then** they see the new box immediately (real-time sync)

---

### User Story 3 - Add Items to a Box (Priority: P2)

A household member is organizing a box and wants to catalog its contents. They select the box, tap "Add Item", enter item names one by one (or in quick succession), and the items are saved to that box.

**Why this priority**: Tied with Story 2 - items are what users search for. Without items, search returns nothing. Equal priority to box creation.

**Independent Test**: Can be fully tested by selecting a box and adding multiple items, then verifying they appear in the box's item list.

**Acceptance Scenarios**:

1. **Given** user is viewing a box, **When** they tap "Add Item" and enter "Christmas lights", **Then** the item is added to the box
2. **Given** user is adding items quickly, **When** they add "Ornaments" then immediately "Gift wrap", **Then** both items are saved without delay
3. **Given** an item is added, **When** another household member views the box, **Then** they see the new item immediately
4. **Given** user adds a duplicate item name, **When** saving, **Then** the system allows it (users may have multiple of the same item)

---

### User Story 4 - Scan QR Code to View Box Contents (Priority: P3)

A household member is standing in front of a physical box with a QR code sticker. They scan the QR code with their phone camera, and the app opens directly to that box showing all its contents.

**Why this priority**: Provides convenience for physical interaction but users can still find boxes via search or browsing. Enhances UX but not critical for core functionality.

**Independent Test**: Can be fully tested by generating a QR code, scanning it with a device camera, and verifying the correct box details page opens.

**Acceptance Scenarios**:

1. **Given** a box with a printed QR code, **When** user scans it with their phone camera, **Then** the app opens to that box's detail page
2. **Given** the app is not installed, **When** scanning the QR code, **Then** the user is directed to the box detail page via a web URL
3. **Given** a QR code for a deleted box, **When** scanned, **Then** a friendly "Box not found" message is displayed

---

### User Story 5 - Delete Box or Items (Priority: P3)

A household member wants to remove a box they no longer have, or remove items that were taken out of a box. They can delete individual items or entire boxes (with confirmation for boxes).

**Why this priority**: Maintenance feature - important for data hygiene but not critical for initial use of the app.

**Independent Test**: Can be fully tested by deleting an item and verifying it's removed, then deleting a box and verifying all its items are also removed.

**Acceptance Scenarios**:

1. **Given** a box with items, **When** user deletes an item, **Then** the item is removed and other items remain
2. **Given** a box with items, **When** user deletes the box, **Then** a confirmation dialog appears warning about item deletion
3. **Given** user confirms box deletion, **When** completed, **Then** box and all its items are removed from the system
4. **Given** a deletion occurs, **When** another household member views the app, **Then** the deleted item/box is no longer visible

---

### User Story 6 - Print QR Codes (Priority: P3)

A household member wants to print QR code labels for their boxes. They can print a single box's QR code or select multiple boxes to print a sheet of QR codes. Each printed label shows the QR code with the box's funky name printed below it.

**Why this priority**: Important for physical organization but users can use the app digitally without printing.

**Independent Test**: Can be fully tested by triggering print for a QR code and verifying the print preview shows the QR code with the box name below it.

**Acceptance Scenarios**:

1. **Given** user is viewing a box, **When** they tap "Print QR", **Then** a print dialog opens with the QR code and box name displayed below the QR code
2. **Given** user selects multiple boxes, **When** they tap "Print Selected", **Then** a print-optimized page with multiple QR codes is generated, each with its box name below
3. **Given** the printed QR code, **When** scanned, **Then** it links to the correct box in the app

---

### User Story 7 - Household Access (Priority: P2)

Multiple household members need to access the same box inventory. One person sets up the household, and others can join using a share link or code. All members see the same data in real-time.

**Why this priority**: Multi-user access is a core constitution requirement. The app is designed for household use, not single-user.

**Independent Test**: Can be fully tested by creating a household, having a second user join, and verifying both see the same boxes and items with real-time updates.

**Acceptance Scenarios**:

1. **Given** first user creates an account, **When** they complete setup, **Then** a household is automatically created for them
2. **Given** a household exists, **When** owner generates a share link, **Then** a unique invite link/code is created
3. **Given** another user has the invite link, **When** they sign up/sign in, **Then** they join the household and see all existing boxes
4. **Given** two users are in the same household, **When** one adds a box, **Then** the other sees it appear within seconds

---

### Edge Cases

- How does the system handle very long item names? → Names are truncated for display but full name stored and searchable
- What if a user loses network connection while editing? → Changes are queued and synced when connection returns, with visual indicator of pending sync
- How does search handle special characters? → Search normalizes input and handles accents, punctuation gracefully
- What if two users edit the same item simultaneously? → Last-write-wins with timestamp, both users see the final state
- What if a user keeps regenerating names? → No limit on regeneration; the random name pool is large enough to prevent practical collisions within a household
- What if a household member accidentally deletes another member's box? → Deletion is permanent; the collaborative model assumes trust within households. Confirmation dialogs help prevent accidents

## Requirements _(mandatory)_

### Functional Requirements

**Box Management**:

- **FR-001**: System MUST allow users to create new boxes with auto-generated funky names
- **FR-002**: System MUST generate unique 3-word names in format "adjective-animal-noun" (e.g., "purple-tiger-cloud")
- **FR-003**: System MUST provide a cyclic arrow (↻) regenerate button to generate a new random name; custom names are NOT allowed
- **FR-004**: System MUST allow any household member to delete any box with confirmation (no ownership restrictions)
- **FR-005**: System MUST display all boxes in a browsable list/grid view

**Item Management**:

- **FR-006**: System MUST allow users to add items to any box
- **FR-007**: System MUST allow users to edit item names
- **FR-008**: System MUST allow any household member to delete any item from boxes (no ownership restrictions)
- **FR-009**: System MUST allow users to move items between boxes
- **FR-010**: System MUST display all items within a selected box

**QR Code Features**:

- **FR-011**: System MUST generate a unique QR code for each box
- **FR-012**: QR codes MUST encode a URL that opens the box detail page
- **FR-013**: System MUST provide print functionality for individual QR codes
- **FR-014**: System MUST provide batch print functionality for multiple QR codes
- **FR-015**: Printed QR codes MUST display the box's funky name as a label positioned below the QR code

**Search**:

- **FR-016**: System MUST provide a global search bar accessible from all screens
- **FR-017**: Search MUST return results as the user types (real-time/typeahead)
- **FR-018**: Search results MUST display the item name and containing box name
- **FR-019**: Search MUST be case-insensitive
- **FR-020**: Search MUST match partial words (e.g., "char" matches "charger")

**Multi-User & Household**:

- **FR-021**: System MUST require user authentication to access data
- **FR-022**: System MUST create a household automatically for new users
- **FR-023**: System MUST allow household owners to generate invite links
- **FR-024**: System MUST allow users to join existing households via invite link
- **FR-025**: All household members MUST see the same boxes and items
- **FR-026**: Changes MUST sync to all connected household members in real-time

**Data Persistence**:

- **FR-027**: All data MUST be persisted to a shared database
- **FR-028**: Data MUST survive app restarts and device changes
- **FR-029**: System MUST handle concurrent edits gracefully

### Key Entities

- **Household**: A group of users sharing the same box inventory. Has a unique identifier, name, and owner.
- **User**: An authenticated person belonging to one household. Has email, display name, and household membership.
- **Box**: A physical storage container. Has a unique ID, auto-generated funky name (no custom names allowed), QR code data, creation date, and belongs to a household.
- **Item**: Something stored in a box. Has a unique ID, name, optional description, belongs to exactly one box.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can find any item in their inventory within 10 seconds using search
- **SC-002**: Users can add a new box and its first item in under 30 seconds
- **SC-003**: QR code scan to box view takes less than 3 seconds
- **SC-004**: Real-time sync delivers updates to other household members within 2 seconds
- **SC-005**: Search results appear as user types with less than 500ms delay
- **SC-006**: System supports households with up to 100 boxes and 1000 items without performance degradation
- **SC-007**: 95% of users can complete core tasks (add box, add item, search) without help on first use
- **SC-008**: Print output produces scannable QR codes at standard label sizes (2"x2" minimum) with box name clearly visible below

## Assumptions

- Users have modern smartphones or computers with camera access for QR scanning
- Users have internet connectivity (app requires network for sync)
- Households are small groups (2-10 people) - not designed for enterprise scale
- QR codes will be printed on standard home/office printers
- Authentication via email/password is sufficient (social login is nice-to-have)
- The adjective-animal-noun name pool is large enough (~1000+ combinations per word) that duplicates within a household are statistically improbable
