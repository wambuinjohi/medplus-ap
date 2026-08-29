# Credit Note Deletion - End-to-End Test Documentation

## Overview
This document outlines the comprehensive end-to-end testing for the credit note deletion feature. The feature involves:
1. UI confirmation modal (DeleteCreditNoteModal)
2. Permission validation
3. Allocation reversal logic
4. Inventory reversal logic
5. Audit logging

## Test Environment Prerequisites
- Authenticated user with `delete_credit_note` permission
- Company with active credit notes
- Test data: invoices with allocations, stock movements (if inventory-enabled)

---

## Test Scenario 1: Basic Deletion Without Allocations

### Setup
1. Create a credit note with:
   - Status: Draft or Sent
   - No allocations to invoices
   - No inventory impact
   - 2-3 line items

### Test Steps
1. Navigate to Credit Notes page
2. Locate the credit note from setup
3. Click the trash icon (delete button)
4. Verify DeleteCreditNoteModal opens with:
   - Title: "Delete Credit Note Entirely" (with alert icon)
   - Description: "This will permanently delete the credit note and reverse all allocations..."
   - Credit note details displayed (number, customer, status, amounts)
   - Impact section shows: "2-3 line items will be deleted"
   - No invoice allocation warnings (since there are none)
   - Confirmation checkbox unchecked
   - Delete button disabled

### User Confirmation Flow
5. Click the confirmation checkbox
6. Verify delete button becomes enabled
7. Uncheck the checkbox
8. Verify delete button becomes disabled again
9. Re-check the confirmation checkbox

### Deletion Execution
10. Click "Delete Credit Note" button
11. Verify modal shows loading state with spinner icon on button
12. Wait for deletion to complete

### Verification of Deletion
13. Verify modal closes
14. Verify credit note list refreshes (loading skeleton appears briefly)
15. Verify the deleted credit note is no longer in the list
16. Search for the credit note number - confirm not found
17. Check database audit logs:
    - Filter by action: DELETE
    - Filter by entity_type: credit_note
    - Verify audit entry exists with:
      - Correct credit note number
      - items_count: 2-3
      - allocations_count: 0
      - inventory_affected: false
      - stock_movements_reversed: 0

---

## Test Scenario 2: Deletion With Single Invoice Allocation

### Setup
1. Create a credit note with:
   - Status: Applied
   - Allocated to 1 invoice: allocation_amount = KES 5,000
   - Credit note total: KES 10,000
   - Balance: KES 5,000 (10,000 - 5,000 applied)
   - No inventory impact

2. Record the invoice details before deletion:
   - invoice_id
   - Original balance_due
   - Original paid_amount
   - Original total_amount

### Test Steps
1. Navigate to Credit Notes page
2. Click delete on the allocated credit note
3. Verify DeleteCreditNoteModal displays:
   - Impact section shows:
     - "1 line item(s) will be deleted"
     - "5000 allocated amount will be reversed from invoices"
     - "1 invoice(s) will be affected"
   - Detailed Allocations section showing:
     - Invoice number
     - Allocated amount: KES 5,000
   - Loading spinner while fetching allocations (should be brief)

### Allocation Reversal Verification
4. Check the confirmation checkbox and delete
5. Wait for completion
6. Verify modal closes and list refreshes
7. Open the invoice that had the allocation:
   - Go to Invoices page
   - Search for the invoice that was allocated
   - Verify balance_due increased by KES 5,000
   - Example: if original balance_due was 15,000, it should now be 20,000
8. Check credit note allocations table:
   - Navigate to Credit Note > Allocations section
   - Verify the allocation record is deleted
   - Confirm no allocations remain for this credit note
9. Verify audit log entry shows:
   - allocations_count: 1
   - affected_invoices: [the invoice id]
   - stock_movements_reversed: 0

---

## Test Scenario 3: Deletion With Multiple Invoice Allocations

### Setup
1. Create a credit note with KES 20,000 total
2. Allocate to 3 different invoices:
   - Invoice A: KES 5,000
   - Invoice B: KES 10,000
   - Invoice C: KES 5,000
3. Credit note status: Applied
4. Record all invoice IDs and their original balance_due values

### Test Steps
1. Navigate to Credit Notes
2. Click delete on the multi-allocated credit note
3. Verify modal shows:
   - Impact section: "3 invoice(s) will be affected"
   - Detailed Allocations section lists all 3 invoices with amounts
4. Confirm and delete
5. Verify modal closes and list refreshes

### Verification
6. Open each invoice and verify balance_due was restored:
   - Invoice A: balance_due += 5,000
   - Invoice B: balance_due += 10,000
   - Invoice C: balance_due += 5,000
7. Verify credit_note_allocations table shows 0 records for this credit note
8. Verify audit log shows:
   - allocations_count: 3
   - affected_invoices: [all 3 invoice ids]

---

## Test Scenario 4: Deletion With Inventory Impact (Stock Movements)

### Setup
1. Create a credit note with:
   - affects_inventory: true
   - 2 line items with products (inventory-tracked)
   - Original stock movements created (direction: IN or OUT)
   - Example: Stock movement IN with 100 units of Product A
   - Status: Sent (not yet applied to invoice)

2. Record stock movement details:
   - movement_id
   - product_id
   - quantity
   - movement_type (IN or OUT)

### Test Steps
1. Navigate to Credit Notes
2. Click delete on the inventory-affecting credit note
3. Verify modal displays:
   - Impact section includes: "Inventory movements will be reversed (stock will be adjusted)"
4. Confirm and delete
5. Wait for completion

### Inventory Reversal Verification
6. Navigate to Stock Movements/Inventory page
7. Filter by reference_type: CREDIT_NOTE_REVERSAL
8. Filter by reference_id: (the deleted credit note id)
9. Verify reversal movements exist:
   - Count = original stock movements count (should be 2)
   - Each reversal has:
     - movement_type: opposite of original (IN ↔ OUT)
     - quantity: same as original
     - reference_type: CREDIT_NOTE_REVERSAL
     - reference_id: the deleted credit note id
     - notes: "Reversal of CREDIT_NOTE [number]: ..."
10. Verify net stock balance is unchanged (original + reversal = 0 change)
11. Check audit log:
    - stock_movements_reversed: 2

---

## Test Scenario 5: Deletion With Both Allocations and Inventory

### Setup
1. Create a credit note with:
   - Affects inventory: true
   - Total: KES 15,000
   - 2 line items with products
   - Allocated to 2 invoices:
     - Invoice A: KES 10,000
     - Invoice B: KES 5,000
   - Status: Applied
   - Original stock movements: 1 IN (50 units), 1 OUT (25 units)

### Test Steps
1. Navigate to Credit Notes
2. Click delete
3. Verify modal shows:
   - Impact: "2 line items will be deleted"
   - Impact: "15000 allocated amount will be reversed from invoices"
   - Impact: "2 invoice(s) will be affected"
   - Impact: "Inventory movements will be reversed"
   - Detailed Allocations: shows both invoices and amounts

### Combined Reversal Verification
4. Confirm and delete
5. Verify invoices:
   - Invoice A: balance_due += 10,000
   - Invoice B: balance_due += 5,000
6. Verify stock movements:
   - 2 reversal movements created (opposite types, same quantities)
7. Verify allocations deleted:
   - No allocations remain for this credit note
8. Verify audit log shows all details:
   - items_count: 2
   - allocations_count: 2
   - affected_invoices: [both ids]
   - inventory_affected: true
   - stock_movements_reversed: 2

---

## Test Scenario 6: Permission-Based Deletion (Negative Test)

### Setup
1. Create a test user with role that does NOT have `delete_credit_note` permission
2. Create a credit note to attempt deletion on

### Test Steps
1. Login as the test user
2. Navigate to Credit Notes
3. Attempt to click delete button on a credit note
4. Observe the delete button behavior:
   - Should be disabled or hidden, OR
   - Opens modal, but shows error on attempt to delete
5. If modal opens, check confirmation and click delete
6. Verify error message appears:
   - "You do not have permission to delete credit notes"
7. Verify credit note is NOT deleted
8. Verify no audit log entry created for this attempt

### Verification
9. Login as admin
10. Verify the credit note still exists in the list

---

## Test Scenario 7: Unauthenticated Deletion Attempt (Negative Test)

### Setup
1. Have an active credit note in the system

### Test Steps
1. Open the browser DevTools console
2. Manually clear the session/auth token (logout)
3. Try to manually trigger the delete mutation by manipulating the page state
4. Observe error handling:
   - Modal may show but delete fails
   - Error: "Not authenticated"
5. Verify deletion does not occur
6. Verify no audit log entry created

---

## Test Scenario 8: Modal Interaction States

### Setup
1. Open a credit note in the delete modal

### Test Steps - Loading State
1. Open delete modal
2. Observe loading state while fetching allocations:
   - Spinner appears in Allocations section
   - Text: "Loading allocations..."
   - Should complete within 2-3 seconds

### Test Steps - Button States
1. Modal open with confirmed = false:
   - "Delete Credit Note" button is DISABLED
   - "Cancel" button is ENABLED
2. Check confirmation checkbox:
   - Delete button becomes ENABLED
   - Cancel button remains ENABLED
3. While deleting (isDeleting = true):
   - Delete button shows DISABLED with spinner
   - Cancel button is DISABLED
   - All checkboxes are DISABLED
4. Delete completes successfully:
   - Modal closes
   - User returns to list view
   - No error messages

### Test Steps - Modal Close Behavior
5. Open modal, check confirmation checkbox
6. Click Cancel button:
   - Modal closes
   - Confirmation checkbox resets to unchecked
   - No deletion occurs
7. Open modal again:
   - Confirmation checkbox is unchecked (state was reset)

---

## Test Scenario 9: Error Handling During Deletion

### Setup
1. Have a credit note ready for deletion
2. Prepare test conditions for errors (may require database manipulation or API mocking)

### Test Steps - Allocation Fetch Error
1. Open delete modal
2. If allocations fail to load:
   - Warning appears: "Failed to load allocations"
   - setAllocatedInvoices defaults to empty array
   - Modal still allows deletion to proceed
3. User can still delete

### Test Steps - Deletion Transaction Error
1. Attempt to delete a credit note
2. Simulate error during any step:
   - Stock movement reversal fails
   - Invoice balance update fails
   - Credit note delete fails
3. Verify error message displayed:
   - "Failed to delete credit note. Please try again."
   - Or specific error message from server
4. Verify credit note is NOT deleted
5. Verify partial changes are rolled back (depends on database transaction handling)
6. Verify audit log is NOT created (or marked as failed)

---

## Test Scenario 10: Concurrent Operations

### Setup
1. Have 2+ credit notes in the system

### Test Steps
1. User A opens delete modal for Credit Note 1
2. User B (different browser/window) deletes Credit Note 1 first
3. User A clicks confirm and delete on Credit Note 1
4. Verify error handling:
   - Error: "Credit note not found" or similar
   - Modal closes gracefully
   - Error message displayed to User A
5. User A's list refreshes and shows Credit Note 1 is gone

---

## Test Scenario 11: Cascade Delete of Line Items

### Setup
1. Create credit note with 5+ line items
2. Note the credit_note_items records in database
3. Record all item IDs

### Test Steps
1. Delete the credit note
2. Verify in database that all credit_note_items are deleted:
   - Query: SELECT * FROM credit_note_items WHERE credit_note_id = 'deleted_id'
   - Should return 0 rows (cascade delete worked)
3. Verify audit log shows correct items_count: 5

---

## Test Scenario 12: Audit Log Completeness

### Setup
1. Delete a credit note with allocations and inventory impact

### Test Steps
1. Navigate to Audit Logs page
2. Find the DELETE entry for the credit note
3. Verify all fields are populated:
   - action: DELETE
   - entity_type: credit_note
   - record_id: [correct id]
   - company_id: [correct company]
   - actor_user_id: [current user id]
   - actor_email: [current user email]
   - details.credit_note_number: [correct number]
   - details.customer_id: [correct customer]
   - details.total_amount: [correct amount]
   - details.applied_amount: [correct amount]
   - details.items_count: [correct count]
   - details.allocations_count: [correct count]
   - details.affected_invoices: [correct array of ids]
   - details.inventory_affected: [boolean]
   - details.stock_movements_reversed: [count]
4. Verify timestamp is recent
5. Verify this provides full audit trail

---

## Test Scenario 13: Query Invalidation and Cache Refresh

### Setup
1. Have credit notes, invoices, and payments displayed on different pages
2. Credit note with allocations ready for deletion

### Test Steps
1. Open Credit Notes page - verify list loads
2. Open Invoices page in new tab - verify list loads
3. Return to Credit Notes tab
4. Delete a credit note with allocations
5. Verify immediate UI updates:
   - Credit note disappears from list
   - List is re-fetched and re-rendered
   - No stale data shown

### Query Cache Verification
6. Navigate to Invoices tab:
   - Verify invoice that had the allocation is showing updated balance_due
   - No manual refresh needed
   - invoices query was invalidated and re-fetched
7. Navigate to Credit Note Allocations:
   - No allocations shown for the deleted credit note
   - creditNoteAllocations query was invalidated
8. Verify these queries were invalidated:
   - creditNotes
   - customerCreditNotes
   - invoices
   - payments
   - creditNoteAllocations

---

## Performance and Edge Cases

### Test Scenario 14: Large Allocation Count
- Credit note allocated to 50+ invoices
- Deletion should handle bulk updates
- Verify all 50+ invoices get balance_due restored
- Verify no timeouts or partial failures

### Test Scenario 15: Small Amounts and Decimal Precision
- Credit note with allocation: KES 0.01
- Verify balance_due restores correctly (no rounding errors)
- Verify all amounts remain consistent

### Test Scenario 16: Zero Amount Allocations
- Edge case: allocation with 0 amount
- Verify deletion handles this gracefully

---

## Browser and Cross-Platform Testing

### Devices to Test
- Desktop (Chrome, Firefox, Safari)
- Tablet (iPad)
- Mobile (iPhone, Android)

### Specific Tests
1. Modal displays correctly on mobile (fullscreen if needed)
2. Scrolling works in large allocations list
3. Delete button tapping works on touch devices
4. Confirmation checkbox is tap-friendly on mobile
5. Currency formatting displays correctly on all devices

---

## Success Criteria

All test scenarios should pass with:
- ✓ Correct UI state at each step
- ✓ Correct data modified in database
- ✓ Correct audit logging
- ✓ Correct cache invalidation
- ✓ Appropriate error handling
- ✓ Proper loading states
- ✓ Accessibility compliance (keyboard navigation, screen readers)

---

## Regression Testing

After deletion feature is verified, test these related features:
1. Credit note creation still works
2. Credit note editing still works (if applicable)
3. Credit note to invoice allocation still works
4. Credit note PDF generation still works
5. Credit note list filtering still works
6. Audit log queries still work
7. Invoice balance calculations still work
8. Inventory stock calculations still work

---

## Known Limitations and Notes

1. No automated test framework currently set up in the project
2. Tests currently must be performed manually
3. Database state must be verified through direct queries or a database UI
4. Some edge cases may require database manipulation or API mocking
5. Audit log testing requires access to the Audit Logs page or database

---

## Future Test Automation

When a test framework is added (Jest, Vitest, etc.), implement:
1. Unit tests for `useDeleteCreditNote` hook
2. Component tests for `DeleteCreditNoteModal`
3. Integration tests for the full deletion flow
4. E2E tests using Playwright or Cypress
5. Mock Supabase client for testing without real database
