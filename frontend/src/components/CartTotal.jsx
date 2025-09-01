import React, { useContext, useEffect, useState } from 'react'
import Title from './Title'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const CartTotal = () => {
  const {
    currency = '₹',
    backendUrl,
    delivery_fee = 10,
    products = [],
    cartItems = {},
    token,
    discount: contextDiscount = 0,
    setDiscount,
    appliedCoupon,
    setAppliedCoupon,
    couponCode,
    setCouponCode
  } = useContext(ShopContext)

  const [rawSubtotal, setRawSubtotal] = useState(0)        // price * qty (no discount, no shipping)
  const [discountAmount, setDiscountAmount] = useState(0)  // from backend (clamped)
  const [total, setTotal] = useState(0)

  // Helper: compute raw subtotal from different cartItems shapes
  const computeRawSubtotal = (cartItemsObj, productsArr) => {
    let sum = 0

    if (!cartItemsObj) return 0

    // If cartItems is an array of item objects
    if (Array.isArray(cartItemsObj)) {
      cartItemsObj.forEach(item => {
        const qty = Number(item.quantity ?? item.qty ?? 0)
        const price = Number(item.price ?? item.pricePerUnit ?? 0)
        sum += (price * qty)
      })
      return sum
    }

    // If cartItems is an object: either { productId: qty } or { productId: { size: qty } }
    for (const prodId in cartItemsObj) {
      if (!Object.prototype.hasOwnProperty.call(cartItemsObj, prodId)) continue
      const entry = cartItemsObj[prodId]

      // find product price
      const product = productsArr.find(p => String(p._id) === String(prodId))
      const price = Number(product?.price ?? 0)

      // entry is a number => qty directly
      if (typeof entry === 'number') {
        sum += price * entry
        continue
      }

      // entry is an object => iterate sizes
      if (typeof entry === 'object') {
        for (const sizeKey in entry) {
          if (!Object.prototype.hasOwnProperty.call(entry, sizeKey)) continue
          const qty = Number(entry[sizeKey] ?? 0)
          sum += price * qty
        }
      }
    }

    return sum
  }

  // Recompute raw subtotal whenever cart or products change
  useEffect(() => {
    const subtotal = computeRawSubtotal(cartItems, products)
    setRawSubtotal(subtotal)

    // If a coupon is already applied, keep discount from context and re-calc total
    // (We will clamp below)
  }, [cartItems, products])

  // Recompute discount/total when rawSubtotal or contextDiscount / appliedCoupon changes
  useEffect(() => {
    const backendDiscount = Number(contextDiscount ?? 0) || 0
    // never allow discount > subtotal
    const clampedDiscount = Math.min(backendDiscount, rawSubtotal)
    setDiscountAmount(clampedDiscount)

    // Add shipping only if there are items in cart (rawSubtotal > 0)
    const shippingToAdd = rawSubtotal > 0 ? Number(delivery_fee ?? 0) : 0

    // final total: (subtotal - clampedDiscount) + shipping
    const finalTotal = Math.max(rawSubtotal - clampedDiscount, 0) + shippingToAdd
    setTotal(finalTotal)
  }, [rawSubtotal, contextDiscount, appliedCoupon, delivery_fee])

  // Validate coupon with backend (backend calculates discount)
  const applyCoupon = async () => {
    const code = (couponCode || '').trim()
    if (!code) { toast.error('Please enter a coupon code'); return }
    if (rawSubtotal <= 0) { toast.error('Cart is empty'); return }

    try {
      const res = await axios.post(
        `${backendUrl}/api/coupon/validate`,
        { code, orderAmount: rawSubtotal },
        {
          headers: {
            token: token,
            'Content-Type': 'application/json'
          }
        }
      )

      if (res.data?.success) {
        // backend returns discount as a positive number (amount)
        const backendDiscount = Number(res.data.discount ?? 0) || 0
        // clamp on frontend too
        const validDiscount = Math.min(backendDiscount, rawSubtotal)

        setDiscount(validDiscount)                    // store in context
        setAppliedCoupon(res.data.coupon || null)     // store coupon meta in context
        toast.success(`Coupon applied! You saved ${currency} ${validDiscount.toFixed(2)}`)
      } else {
        setDiscount(0)
        setAppliedCoupon(null)
        toast.error(res.data?.message || 'Invalid coupon')
      }
    } catch (err) {
      console.error('Coupon error:', err.response?.data ?? err.message)
      setDiscount(0)
      setAppliedCoupon(null)
      toast.error(err.response?.data?.message || 'Failed to apply coupon')
    }
  }

  const removeCoupon = () => {
    setCouponCode('')
    setDiscount(0)
    setAppliedCoupon(null)
    setDiscountAmount(0)
    toast.info('Coupon removed')
  }

  // Format helpers
  const fmt = (n) => Number(n ?? 0).toFixed(2)

  return (
    <div className='w-full'>
      <div className='text-2xl'>
        <Title text1={'CART'} text2={'TOTALS'} />
      </div>

      <div className='flex gap-2 mt-2'>
        <input
          type='text'
          placeholder='Enter coupon code'
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className='border px-2 py-1 flex-1'
          disabled={!!appliedCoupon}
        />

        {appliedCoupon ? (
  <button
    onClick={removeCoupon}
    className='bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition-all duration-300 shadow-md'
  >
    Remove
  </button>
) : (
  <button
    onClick={applyCoupon}
    className='bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition-all duration-300 shadow-md'
  >
    Apply
  </button>
)}

      </div>

      {appliedCoupon && (
        <div className='mt-2 text-sm text-green-600'>
          Applied: {appliedCoupon.code} {' '}
          ({appliedCoupon.discountType === 'percent'
            ? `${appliedCoupon.discountValue}% off`
            : `${currency}${appliedCoupon.discountValue} off`})
        </div>
      )}

      <div className='flex flex-col gap-2 mt-4 text-sm'>
        <div className='flex justify-between'>
          <p>Subtotal</p>
          <p>{currency} {fmt(rawSubtotal)}</p>
        </div>

        {discountAmount > 0 && (
          <div className='flex justify-between text-green-600'>
            <p>Discount</p>
            <p>- {currency} {fmt(discountAmount)}</p>
          </div>
        )}

        <hr />

        <div className='flex justify-between'>
          <p>Shipping Fee</p>
          <p>{currency} {rawSubtotal > 0 ? fmt(delivery_fee) : fmt(0)}</p>
        </div>

        <hr />

        <div className='flex justify-between'>
          <b>Total</b>
          <b>{currency} {fmt(total)}</b>
        </div>
      </div>
    </div>
  )
}

export default CartTotal



