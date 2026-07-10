# Quick Start - Credit Note Deletion Testing

## 5-Minute Smoke Test

1. **Open Credit Notes page**
   - Navigate to `/credit-notes`
   - See list of credit notes

2. **Click Delete Button**
   - Find any credit note
   - Click the trash icon
   - Modal should open with warning

3. **Verify Modal Elements**
   - ✓ Warning icon visible
   - ✓ Credit note number shown
   - ✓ Customer name shown
   - ✓ Amounts displayed
   - ✓ Impact section visible
   - ✓ Confirmation checkbox shown
   - ✓ Delete button is DISABLED

4. **Test Confirmation Checkbox**
   - Click checkbox → Delete button should ENABLE
   - Unclick checkbox → Delete button should DISABLE
   - Click checkbox again

5. **Delete the Credit Note**
   - Click "Delete Credit Note" button
   - Watch for loading state
   - Modal should close within 5 seconds
   - Credit note should disappear from list

6. **Verify Success**
   - ✓ Green success toast appears
   - ✓ No errors in console (F12)
   - ✓ Credit note gone from list
   - ✓ Can't find it by searching

**Time:** ~5 minutes
**Result:** ✅ PASS = Feature works!

---

## 10-Minute Verification Test

Do the smoke test above, then:

7. **Check the Affected Invoice**
   - Go to Invoices page
   - Find invoice that had the allocation
   - Verify balance_due increased
   - Example: Was 15,000 → Should be 20,000 (if 5,000 allocated)

8. **Check Audit Log**
   - Go to Audit Logs
   - Filter by DELETE action
   - Find the credit note entry
   - Verify details are populated:
     - credit_note_number ✓
     - allocations_count ✓
     - affected_invoices ✓

**Time:** ~10 minutes
**Result:** ✅ PASS = Reversal works!

---

## Test Scenarios Quick Reference

### Scenario 1: Simple Deletion
- Create credit note with no allocations
- Delete it
- Should disappear

### Scenario 2: With Allocations
- Find credit note allocated to 1+ invoices
- Note invoice balance_due
- Delete credit note
- Check invoice balance increased

### Scenario 3: With Inventory
- Find credit note with affects_inventory=true
- Delete it
- Check stock_movements table for CREDIT_NOTE_REVERSAL entries

### Scenario 4: Permission Check
- Switch to user without delete permission
- Try to delete
- Should get error message

---

## Common Issues & Solutions

**Issue:** Delete button stays disabled
- **Fix:** Make sure to click the confirmation checkbox

**Issue:** Modal doesn't close after clicking delete
- **Fix:** Wait a few more seconds, it might still be loading
- Check console (F12) for errors

**Issue:** Credit note still appears after delete
- **Fix:** Refresh the page (F5)
- The list might not have refreshed

**Issue:** Error message appears
- **Fix:** Check the error message
- Common: "Not authenticated" → Login again
- Common: "Permission denied" → Use admin account

**Issue:** Invoice balance didn't change
- **Fix:** Make sure the invoice actually had an allocation
- Refresh invoice page
- Check audit log for what happened

---

## How to Report Issues

If something doesn't work:

1. **Take a screenshot** of the issue
2. **Check the console** (F12 → Console tab)
3. **Note the steps** that caused it
4. **Report with:**
   - What you did
   - What you expected
   - What actually happened
   - Console error (if any)

---

## Files Included

1. **QUICK_TEST_GUIDE.md** (this file)
   - Quick smoke test (5 min)
   - 10-minute verification
   - Common issues

2. **CREDIT_NOTE_DELETION_TEST_CHECKLIST.md**
   - Detailed checklist format
   - All test scenarios
   - Browser compatibility
   - Accessibility testing
   - Sign-off fields

3. **docs/CREDIT_NOTE_DELETION_E2E_TEST.md**
   - 16 detailed test scenarios
   - Step-by-step procedures
   - Data verification instructions
   - Edge cases and performance tests

4. **IMPLEMENTATION_VERIFICATION.md**
   - Technical implementation details
   - Code review results
   - Security considerations
   - Deployment readiness

5. **CREDIT_NOTE_DELETION_COMPLETION_SUMMARY.md**
   - Executive summary
   - Feature overview
   - What's been done
   - Next steps

---

## Quick Links

- **Credit Notes Page:** `/credit-notes`
- **Invoices Page:** `/invoices`
- **Audit Logs Page:** `/audit-logs`
- **Settings/Roles:** For permission testing

---

## Success Indicators

✅ **Everything works if:**
- Modal opens on delete click
- Confirmation required before delete
- Credit note disappears after delete
- No console errors
- Success toast appears
- Invoice balance restored (if allocated)
- Audit log entry created

❌ **Something's wrong if:**
- Delete button doesn't disable/enable
- Modal doesn't close
- Credit note still shows after refresh
- Error message appears
- Console shows red errors

---

**Start with the 5-minute smoke test above. If it passes, the feature is working! Then move to detailed tests as needed.**
