import type { SelectOption } from '../../../shared/types/selectOption'

export const bookFormatOptions: SelectOption[] = [
  { value: 'Hardcover', label: 'Hardcover' },
  { value: 'Paperback', label: 'Paperback' },
  { value: 'E-book', label: 'E-book' },
  { value: 'Audiobook', label: 'Audiobook' },
  { value: 'Other', label: 'Other' },
]

export const bookPurchaseChannelOptions: SelectOption[] = [
  { value: 'Online', label: 'Online Purchase' },
  { value: 'In-Store', label: 'In-Store Purchase' },
  { value: 'Gift', label: 'Gift' },
  { value: 'Other', label: 'Other' },
]

export const bookPaymentMethodOptions: SelectOption[] = [
  { value: 'Credit Card', label: 'Credit Card' },
  { value: 'Debit Card', label: 'Debit Card' },
  { value: 'Cash', label: 'Cash' },
  { value: 'PayPal', label: 'PayPal' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Cryptocurrency', label: 'Cryptocurrency' },
  { value: 'Other', label: 'Other' },
]

export const bookPaymentPlatformOptions: SelectOption[] = [
  { value: 'Amazon', label: 'Amazon' },
  { value: 'eBay', label: 'eBay' },
  { value: 'Barnes & Noble', label: 'Barnes & Noble' },
  { value: 'Book Depository', label: 'Book Depository' },
  { value: 'Audible', label: 'Audible' },
  { value: 'Google Play', label: 'Google Play' },
  { value: 'Apple Books', label: 'Apple Books' },
  { value: 'Kobo', label: 'Kobo' },
  { value: 'Other', label: 'Other' },
]

export const bookConditionOptions: SelectOption[] = [
  { value: 'New', label: 'New' },
  { value: 'Like New', label: 'Like New' },
  { value: 'Very Good', label: 'Very Good' },
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Poor', label: 'Poor' },
  { value: 'Damaged', label: 'Damaged' },
]

export const bookOwnershipStatusOptions: SelectOption[] = [
  { value: 'Owned', label: 'Owned' },
  { value: 'Wishlist', label: 'Wishlist' },
  { value: 'Sold', label: 'Sold' },
  { value: 'Gifted', label: 'Gifted' },
  { value: 'Lost', label: 'Lost' },
]
