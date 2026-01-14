# Quick Verification - Dynamic Terms in PDFs (5 Minutes)

## Step 1: Set Test Terms (1 minute)

1. Open your app and go to **Settings → Terms & Conditions**
2. Look for the blue panel labeled **"Dynamic Terms Verification"**
3. Click **"Show"** to expand the panel
4. Click the button **"Set Unique Test Terms"**
   - This creates distinctive test terms you can easily spot in PDFs

## Step 2: Download Test PDFs (3 minutes)

Download a PDF from each document type and check if it contains the test terms:

| Document Type | How to Create | Expected Result |
|---|---|---|
| 📄 **Quotation** | Sales → Quotations → Create | ✓ Shows test terms |
| 📄 **Invoice** | Sales → Invoices → Create | ✓ Shows test terms |
| 📄 **Proforma** | Sales → Quotations → Convert to Proforma | ✓ Shows test terms |
| 📦 **Delivery Note** | Inventory → Delivery Notes → Create | ✓ Shows test terms |
| 📋 **LPO** | Procurement → LPOs → Create | ✓ Shows test terms |
| 💰 **Remittance** | Payments → Remittance → Create | ✓ Shows test terms |
| 📊 **Statement** | Reports → Customer Statements → Download | ✓ Shows test terms |
| 🧾 **Receipt** | Payments → Record Payment → Download Receipt | ✓ Shows test terms |

## Step 3: Verify Results (1 minute)

- ✅ **Success**: All or most PDFs show the test terms
  - This means dynamic terms are working!
  
- ⚠️ **Partial**: Only some PDFs show test terms
  - Some document types may need updates
  
- ❌ **Fail**: No PDFs show test terms
  - There may be an issue with the implementation

## Step 4: Reset Terms

1. Click the **"Refresh Current Terms"** button to see what's stored
2. Click **"Reset to Default Terms"** to restore original terms
3. Verify the original terms are back in the Settings page

## That's It! ✅

If all PDFs showed the test terms, then **dynamic terms are working perfectly**.

---

## Detailed Results Table (Fill Out Your Test)

| Document Type | Shows Test Terms? | Notes |
|---|---|---|
| Quotation | ☐ Yes ☐ No | |
| Invoice | ☐ Yes ☐ No | |
| Proforma | ☐ Yes ☐ No | |
| Delivery Note | ☐ Yes ☐ No | |
| LPO | ☐ Yes ☐ No | |
| Remittance | ☐ Yes ☐ No | |
| Statement | ☐ Yes ☐ No | |
| Receipt | ☐ Yes ☐ No | |

**Result**: ___/8 document types passing

---

## Troubleshooting

**Q: I don't see the Verification panel**
- A: Make sure you're in Settings → Terms & Conditions, then scroll down

**Q: The panel says "Ready" but I don't see the test terms button**
- A: Click "Show" to expand the panel

**Q: I set test terms but PDFs still show old terms**
- A: Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R) and try again

**Q: One document type isn't showing test terms**
- A: That's the one that may need updating. Note which one and report it.

---

## Success! 🎉

If all 8 document types show your test terms in their PDFs, then **dynamic terms and conditions are fully implemented and working**.

You can now:
- ✅ Update terms in Settings and they apply to all new PDFs
- ✅ Set different terms for specific documents (they override defaults)
- ✅ Reset to default terms anytime with one click

Next: Go to Settings → Terms & Conditions and customize the terms as needed!
