# Tamtom Project Development TODO
## Approved Plan Steps (Preserving all existing functions/design)

## Phase 1: Database Schema Updates
- [x] 1. Add coupons table to shared/schema.ts
- [x] 2. Add coupon_code/discount_amount/adminPhone to orders schema
- [x] 3. Run migrations (drizzle-kit push:pg) ✓

## Phase 2: Server Routes & Services
- [ ] 5. Enhance server/routes/admin.ts: coupons CRUD + detailed reports (products/drivers/admins)

## Phase 2: Server Routes & Services
- [ ] 5. Enhance server/routes/admin.ts: coupons CRUD + detailed reports (products/drivers/admins)
- [ ] 6. server/routes/customer.ts: POST /orders/:id/apply-coupon
- [ ] 7. server/routes/orders.ts: handle coupons in createOrder, enhance customer filters
- [ ] 8. server/routes/driver.ts: GET /reviews
- [ ] 9. Add server/routes/coupons.ts (or in admin)
- [ ] 10. Update socket.ts: coupon/rating/ui events

## Phase 3: Client Components
- [ ] 11. Cart.tsx: Add coupon input/validation/discount
- [ ] 12. RatingDialog.tsx: Separate driver ratings to /driver_reviews
- [ ] 13. AdminFinancialReports.tsx: Add products/drivers/admins tabs/charts
- [ ] 14. Rename/move AdminOffers to AdminCoupons with full CRUD
- [ ] 15. UiSettingsContext.tsx: Add WS real-time refresh for dynamic UI

## Phase 4: Integration & Testing
- [ ] 16. Update OrdersPage: ongoing/active filters, admin phone
- [ ] 17. Test full flow: coupon->order->assign->accept->deliver->rate->report
- [ ] 18. Verify real-time: popups/notifs/track/ratings/reports
- [ ] 19. Test UI controls: hide/show from admin applies to client/driver
- [ ] 20. Final verification: all existing features intact, SAR currency ✓

**Next: Phase 1 Step 1 - Update shared/schema.ts**

