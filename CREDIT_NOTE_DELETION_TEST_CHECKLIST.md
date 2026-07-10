# Credit Note Deletion - Manual Test Checklist

Use this checklist to verify the end-to-end credit note deletion flow is working correctly.

## Quick Smoke Test (5 minutes)

- [ ] Navigate to Credit Notes page
- [ ] Click delete button on any credit note
- [ ] Modal opens with warning message
- [ ] Cannot click delete without confirmation checkbox
- [ ] Check confirmation checkbox
- [ ] Delete button becomes enabled
- [ ] Click delete
- [ ] Modal closes and list refreshes
- [ ] Credit note is gone from the list
- [ ] No errors in browser console

## Detailed Test Scenarios

### Test 1: Basic Deletion (No Allocations)
**Duration:** ~5 minutes

- [ ] Create a new credit note with 2-3 items
- [ ] Do NOT allocate it to any invoices
- [ ] Click delete button
- [ ] Verify modal shows impact: "X line items will be deleted"
- [ ] Verify modal does NOT mention allocations or invoices
- [ ] Confirm and delete
- [ ] Verify credit note no longer appears in list
- [ ] Search for credit note number - not found
- [ ] Open browser Dev Tools > Console - no errors

### Test 2: Deletion with Invoice Allocations
**Duration:** ~10 minutes

- [ ] Find or create credit note allocated to at least 1 invoice
- [ ] Record the invoice number and its current balance_due
- [ ] Click delete button
- [ ] Verify modal shows:
  - [ ] Allocated invoice in the list with amount
  - [ ] "X invoice(s) will be affected"
  - [ ] "Allocated amount will be reversed"
- [ ] Confirm and delete
- [ ] Navigate to Invoices page
- [ ] Find the invoice that had the allocation
- [ ] Verify balance_due increased (allocation amount added back)
- [ ] Return to Credit Notes - deleted note is gone
- [ ] Check audit logs for DELETE entry with allocation details

### Test 3: Deletion with Inventory Impact
**Duration:** ~10 minutes

- [ ] Find or create credit note with `affects_inventory = true`
- [ ] Click delete button
- [ ] Verify modal shows: "Inventory movements will be reversed"
- [ ] Confirm and delete
- [ ] Navigate to Inventory/Stock Movements page
- [ ] Filter by reference_type: CREDIT_NOTE_REVERSAL
- [ ] Verify reversal movements exist (should match original count)
- [ ] Verify each reversal has opposite movement_type (IN ↔ OUT)
- [ ] Check audit log shows stock_movements_reversed > 0

### Test 4: Multiple Allocations
**Duration:** ~10 minutes

- [ ] Find or create credit note allocated to 3+ invoices
- [ ] Record the invoice numbers and amounts
- [ ] Click delete button
- [ ] Verify modal shows all invoices in allocations list
- [ ] Verify count matches: "X invoice(s) will be affected"
- [ ] Confirm and delete
- [ ] Check each invoice's balance_due increased correctly
- [ ] Verify no allocations remain for this credit note
- [ ] Check audit log affected_invoices array contains all IDs

### Test 5: Permission Denial
**Duration:** ~5 minutes

- [ ] Switch to a user WITHOUT delete_credit_note permission
- [ ] Try to delete a credit note
- [ ] Verify error message appears
- [ ] Verify credit note still exists (not deleted)
- [ ] Switch back to admin user
- [ ] Verify credit note still exists

### Test 6: Modal Interaction
**Duration:** ~5 minutes

- [ ] Open delete modal
- [ ] Verify delete button is disabled initially
- [ ] Check confirmation checkbox - button enabled
- [ ] Uncheck confirmation checkbox - button disabled
- [ ] Click Cancel button - modal closes
- [ ] Reopen modal - confirmation unchecked
- [ ] Open another credit note's delete modal - first closes

### Test 7: Loading States
**Duration:** ~3 minutes

- [ ] Open delete modal
- [ ] Watch for loading spinner in allocations section
- [ ] Should disappear within 2-3 seconds
- [ ] While deleting, watch button show spinner
- [ ] Should complete within 5 seconds

### Test 8: Error Handling
**Duration:** ~5 minutes

- [ ] Manually clear auth token (logout while modal open)
- [ ] Try to confirm delete
- [ ] Verify error message appears
- [ ] Verify credit note still exists
- [ ] Re-authenticate and verify deletion works normally

## Data Verification Checklist

After each test, verify in the database:

### Credit Notes Table
- [ ] Credit note record is deleted
- [ ] No orphaned records reference the deleted note

### Credit Note Items Table
- [ ] All items for the credit note are deleted (cascade)

### Credit Note Allocations Table
- [ ] All allocations for the credit note are deleted

### Invoices Table
- [ ] balance_due values restored (increased by allocation amount)
- [ ] paid_amount unchanged
- [ ] total_amount unchanged

### Stock Movements Table
- [ ] Reversal movements created for inventory-affecting notes
- [ ] Reversal type is opposite of original
- [ ] Quantities match original

### Audit Logs Table
- [ ] DELETE entry created
- [ ] Details include all impact information
- [ ] Timestamp is current
- [ ] Actor user ID is correct

## Browser Compatibility Checklist

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iPad)
- [ ] Chrome (Android)

## Accessibility Checklist

- [ ] Tab navigation works in modal
- [ ] Confirmation checkbox is keyboard accessible
- [ ] Buttons are keyboard clickable (Enter/Space)
- [ ] Focus indicators are visible
- [ ] Screen reader announces dialog title
- [ ] Screen reader announces all form elements
- [ ] Color not only indicator (alert icon present, text explains)

## Performance Checklist

- [ ] Deletion completes in < 5 seconds
- [ ] Modal opens in < 1 second
- [ ] Allocations load in < 2 seconds
- [ ] List refreshes smoothly after deletion
- [ ] No memory leaks (check DevTools performance)
- [ ] Smooth animations (no janky transitions)

## Concurrent Access Checklist

- [ ] Open two browser windows logged in as same user
- [ ] Start deletion in window 1
- [ ] While deleting, attempt action in window 2
- [ ] Verify proper synchronization
- [ ] Refresh window 2 - sees correct state

## Regression Checklist

After deletion is verified, test these don't break:

- [ ] Credit note creation still works
- [ ] Credit note editing still works
- [ ] Applying credit note to invoice still works
- [ ] Unapplying credit note allocation still works
- [ ] Credit note list filtering/search still works
- [ ] Credit note PDF generation still works
- [ ] Invoice balance calculations correct
- [ ] Stock counts correct
- [ ] Audit logs still queryable
- [ ] Role permissions still enforced

## Sign-Off

- [ ] All smoke tests passed
- [ ] At least 3 detailed scenarios completed
- [ ] Data verification passed
- [ ] No console errors
- [ ] No UI anomalies
- [ ] Tested on desktop browser
- [ ] Ready for production

**Date Tested:** ___________
**Tested By:** ___________
**Notes:** 

