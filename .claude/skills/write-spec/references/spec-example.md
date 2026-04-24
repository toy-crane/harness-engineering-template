## Overview
Allow users to submit their own project to Project Board so other users can discover and upvote it.

## Scope

### Included
- A "Submit" entry point on the home page
- A form capturing project title, URL, and a short tagline
- Newly submitted projects appear at the top of the list

### Excluded
- Editing or deleting an existing submission — out of scope this round; will be revisited after launch
- Image upload — first version is URL-only; reduces moderation surface
- Duplicate-URL detection — handled later via a separate moderation pass

## Scenarios

### 1. Submit a project successfully
**Given** a logged-in user is on the home page
**When** the user clicks "Submit", fills in title and URL, and presses Send
**Then** the new project appears at the top of the list

Success Criteria:
- [ ] title="My App", url="https://example.com" → a card with that title and URL renders at the top of the list
- [ ] After submit, the form clears and the modal closes
- [ ] The submitter's display name appears on the new card

### 2. Reject an invalid submission
**Given** a logged-in user has the submit form open
**When** the user submits with missing or malformed values
**Then** the submission is rejected and the user sees a clear error

Success Criteria:
- [ ] empty title → "Title is required" appears under the title field
- [ ] url not starting with http(s) → "URL must start with http or https" appears under the url field
- [ ] On error, previously entered values are preserved

### 3. Block submission for unauthenticated visitors
**Given** a visitor without a logged-in session
**When** the visitor clicks "Submit" on the home page
**Then** the submit form does not open and the visitor is prompted to log in

Success Criteria:
- [ ] Click "Submit" while logged out → login prompt appears, no form opens
- [ ] After successful login, the visitor lands back on the home page (no auto-submit)

## Invariants
- A user cannot submit a project on behalf of another user. The submitter recorded on a card is always the currently logged-in account, regardless of how the submission was triggered.

## Dependencies
- Authentication (the visitor must be able to log in before submitting)

## Undecided Items
- Whether to allow markdown in the tagline field (deferred until first user feedback)
