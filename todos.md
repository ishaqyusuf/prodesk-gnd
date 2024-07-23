- JUN 10:
  - Delete section items
  - custom section input
TODO: JUN 19
    -  Jobs edit
    -  Role edit flicker
    -  Delivery & Pickup

TODO: 
    <!-- - Payment Modal in Invoice Edit -->
    <!-- - Add view button to production list -->
    <!-- - Production navigation highlights products -->
    <!-- - Payment Due Date Filter -->
    <!-- - Add due date to production -->
    <!-- - Customer Signature and Employee signature on Packing Slip -->
    <!-- - Production Due today not showing. -->
    <!-- - List Submissions in prod assignment, allow delete submission, edit assignment -->
    - .
    - 
    - edit size in package tool
    - on section open: scroll to screen
    - Public Dealer site to create cart and generate quotation
    - set price unit for each component each: /unit
    - move items/sort components in specific order, delete for section make all components section based.
    - fix image cutting at the top (moulding as an example)
    - make footer floated by the right.
    <!-- - add total paid in printing footer. -->
    - select size: show selectable size table with lh, rh etc, price updated form.
    - estimate hover to show breakdown.
    - moulding unit: pcs, lf.
    <!-- - print order + pack & slip. -->
    - Price tags on components.
      - In dyke settings: create a componentCosting to store how item cost will be calculated by componentCosting, for example: {Door: [{multiplier: 2, where: {Door_Configuration: ['Exterior Door Unit - Double']}},{multiplier: 1.25, where: {Height: '7-0'}}],Jamb_Size: [{multiplier: 3, where: {Door_Configuration: ['Exterior Door Unit - Double']}}]}
      - Component settings: {hidePublic: false}
      - Section Settings: {allowCustomInPublic: false}
      - Production Past Due: check if past due and not my productions are submitted so as not to show if it's others' production pending.
    - Multi component step ability to traverse back to final stage when rechecked changed. (eg: doors)
    <!-- - Job edit not showing unit and task list -->
    - NEW REQUEST: Order delivery date, set date and manage delivery date.
    - Production status on orders page.
    <!-- - roles form upgrade -->
    <!-- - NEW REQUEST: Custom sales report: print statement button in customer overview either passed due, or paid, by date. -->
    - Sales settings; profile select
    - Production auto-complete
    - Assign to production (NaN 24-0603-1668)
    <!-- - Job addon on no unit. -->
    - Unable to edit submmited job
    - Delete old submit job modal
    - Price tag to section items. Add calculated price column, and additional price column to house-package tool and others.
    - 
    - Create history lane for dyke, implement community template history for ability to go back in time.
    - Custom Input for Jamb Size. (Settings Panel for dyke)
    - Door configuration: Exterior and Interior should have respective prefix.
    - When attachment not able to be generated, include print link for customer.
    - Note color.
    - Add color to timeline tag
    - Production Assignment notifcation: email and in-notification
    - Update footer on item delete, item check changed, etc.
    - Create delete queue for formValues, items: on formValueChange: add formIds,housePackageIds etc to delete queue.
    <!-- - Add username to note (by pablo) -->
    - Show door fully in selection (some door cuts off).
    - Embed door images to invoice pdf at last page, display doors and mouldings in grid format.
    - 
    - Make production like old, add due today section
    - Sales Overview: display all item information in preview.
    - Production Assignment (Mark and and assign all feature.)
    - Add payment, production to old invoice
    - Delete/Update Timeline
    - Notification for Assignments, Started, and Submission.
    - Delivery: TODO
    - Order pdf not downloading on mobile
    - Shelf Items: Product Title not display
    - Door Image In print and in invoice form
    - Production Status in Orders List and Order Overview
    - Production Auto Complete by Admin
    - Product List Re-arrange (arrange based on most picked)
    - Mobile responsive for invoice edit
    <!-- - Price history. -->






    # TODO:
    -SET ORDER STATUS (PENDING,COMPLETED,DELIVERED,PICKED UP...)
    IF COMPLETED: PROMPT TO MARK UNCOMPLETED PRODUCTION AS COMPLETED!
    -AUTOCOMPLE SALES ITEM BUG
    -MAKE DYKE SHELF TYPABLE
    -EXPORT PDF IN ESTIMATE 

TODO: House Package Tool Estimate.
TODO: Door Image not replacing
TODO: Bifold and Interior: ability to setup up multiple doors with different sizes and qty.
TODO: Moulding set price (include price input in edit)
TODO: Calculate
 Amount glitch, sometimes does not work.
TODO: Price history.
TODO: Bifold doors as in unit template.
TODO: Primed Lover are LL sizes (including 2/0)
TODO: When door is selected, pop up window to show required sizes
TODO: No more edit on dyke when production is started
OLD EDIT: SUPPLY AUTO DATE TODAY
WORK ON TIMELINE
ADD TIME LINE TO SALES EDIT
Show Selected Door/Moulding
<!-- AUTO-COMPLETE PRODUCTION WITH NO SWING -->
<!-- CUSTOM SERVICES -->


Shelf item search
Shelf item auto pick when created
shelf item delete