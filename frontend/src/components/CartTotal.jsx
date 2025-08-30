import React, { useContext, useState } from 'react'
import Title from './Title'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const CartTotal = () => {
  const { currency, backendUrl, delivery_fee, getCartAmount, token, discount, setDiscount, appliedCoupon, setAppliedCoupon,couponCode,setCouponCode } = useContext(ShopContext)

  
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    const cartAmount = getCartAmount()
    
    if (cartAmount <= 0) {
      toast.error('Cart is empty')
      return
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/coupon/validate`,
        { 
          code: couponCode,
          orderAmount: cartAmount
        },
        {
          headers: {
            token: token, // Send token directly instead of Authorization: Bearer
            'Content-Type': 'application/json'
          },
        }
      )

      if (res.data.success) {
        setDiscount(res.data.discount)
        setAppliedCoupon(res.data.coupon)
        toast.success(`Coupon applied! You saved ${currency} ${res.data.discount.toFixed(2)}`)
      } else {
        setDiscount(0)
        setAppliedCoupon(null)
        toast.error(res.data.message || 'Invalid coupon')
      }
    } catch (error) {
      console.log('Coupon error:', error.response?.data || error.message)
      setDiscount(0)
      setAppliedCoupon(null)
      toast.error(error.response?.data?.message || 'Failed to apply coupon')
    }
  }

  const removeCoupon = () => {
    setCouponCode('')
    setDiscount(0)
    setAppliedCoupon(null)
    toast.info('Coupon removed')
  }

  const total = Math.max(getCartAmount() + delivery_fee - discount, 0)

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
          disabled={appliedCoupon !== null}
        />
        {appliedCoupon ? (
          <button
            onClick={removeCoupon}
            className='bg-red-500 text-white px-3 py-1 rounded'
          >
            Remove
          </button>
        ) : (
          <button
            onClick={applyCoupon}
            className='bg-blue-500 text-white px-3 py-1 rounded'
          >
            Apply
          </button>
        )}
      </div>

      {appliedCoupon && (
        <div className='mt-2 text-sm text-green-600'>
          Applied: {appliedCoupon.code} 
          ({appliedCoupon.discountType === 'percent' 
            ? `${appliedCoupon.discountValue}% off` 
            : `${currency}${appliedCoupon.discountValue} off`})
        </div>
      )}

      <div className='flex flex-col gap-2 mt-4 text-sm'>
        <div className='flex justify-between'>
          <p>Subtotal</p>
          <p>{currency} {getCartAmount().toFixed(2)}</p>
        </div>
        {discount > 0 && (
          <div className='flex justify-between text-green-600'>
            <p>Discount</p>
            <p>- {currency} {discount.toFixed(2)}</p>
        </div>
        )}
        <hr />
        <div className='flex justify-between'>
          <p>Shipping Fee</p>
          <p>{currency} {delivery_fee}</p>
        </div>
        <hr />
        <div className='flex justify-between'>
          <b>Total</b>
          <b>{currency} {total.toFixed(2)}</b>
        </div>
      </div>
    </div>
  )
}

export default CartTotal