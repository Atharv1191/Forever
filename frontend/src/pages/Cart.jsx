import React, { useContext, useEffect, useState } from 'react'
import Title from '../components/Title'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import CartTotal from '../components/CartTotal'
import axios from 'axios'
import { toast } from 'react-toastify'

const Cart = () => {
  const {
    products,
    currency,
    navigate,
    cartItems,
    updateQuantity,
    backendUrl,
    token,
    appliedCoupon,
    setAppliedCoupon,
    couponCode,
    setCouponCode,
    setDiscount,
  } = useContext(ShopContext)

  const [cartData, setCartData] = useState([])
  const [availableCoupons, setAvailableCoupons] = useState([])
  const [showCoupons, setShowCoupons] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch cart data
  useEffect(() => {
    if (products.length > 0) {
      const tempData = []
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            })
          }
        }
      }
      setCartData(tempData)
    }
  }, [cartItems, products])

  // Fetch available coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${backendUrl}/api/coupon/list`, {
        headers: { token },
      })
      if (response.data.success) {
        setAvailableCoupons(response.data.coupons)
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  // Apply coupon using validation endpoint
  const applyCoupon = async (code) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/coupon/validate`,
        { code: code, orderAmount: getCartAmount() },
        {
          headers: {
            token: token,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data.success) {
        setAppliedCoupon(response.data.coupon)
        setDiscount(response.data.discount)
        setCouponCode(code)
        setShowCoupons(false)
        toast.success(`Coupon ${code} applied successfully!`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply coupon')
    }
  }

  // Remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setDiscount(0)
    toast.info('Coupon removed')
  }

  // Get cart amount
  const getCartAmount = () => {
    let totalAmount = 0
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items)
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item]
          }
        } catch (error) {
          console.error('Error calculating cart amount:', error)
        }
      }
    }
    return totalAmount
  }

  // Format discount display
  const formatDiscount = (coupon) => {
    if (
      coupon.discountType === 'percent' ||
      coupon.discountType === 'percentage'
    ) {
      return `${coupon.discountValue}% OFF`
    } else {
      return `${currency}${coupon.discountValue} OFF`
    }
  }

  // Format expiry date
  const formatExpiryDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      {/* Cart Items */}
      <div>
        {cartData.map((item, index) => {
          const productData = products.find(
            (product) => product._id === item._id
          )
          return (
            <div
              key={index}
              className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'
            >
              <div className='flex items-start gap-6'>
                <img
                  className='w-16 sm:w-20'
                  src={productData.image[0]}
                  alt=''
                />
                <div>
                  <p className='text-xs sm:text-lg font-medium'>
                    {productData.name}
                  </p>
                  <div className='flex items-center gap-5 mt-2'>
                    <p>
                      {currency}
                      {productData.price}
                    </p>
                    <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>
                      {item.size}
                    </p>
                  </div>
                </div>
              </div>

              <input
                onChange={(e) =>
                  e.target.value === '' || e.target.value === '0'
                    ? null
                    : updateQuantity(
                        item._id,
                        item.size,
                        Number(e.target.value)
                      )
                }
                className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1'
                type='number'
                min={1}
                defaultValue={item.quantity}
              />

              <img
                onClick={() => updateQuantity(item._id, item.size, 0)}
                className='w-4 mr-4 sm:w-5 cursor-pointer'
                src={assets.bin_icon}
                alt=''
              />
            </div>
          )
        })}
      </div>

      {/* Coupon Section */}
      {cartData.length > 0 && (
        <div className='mt-6 mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-medium text-gray-800'>
              Available Coupons & Offers
            </h3>
            <button
              onClick={() => {
                setShowCoupons(!showCoupons)
                if (!showCoupons && availableCoupons.length === 0) {
                  fetchCoupons()
                }
              }}
              className='bg-black text-white px-4 py-2 text-sm hover:bg-gray-800 transition-colors'
            >
              {showCoupons ? 'HIDE COUPONS' : 'VIEW ALL COUPONS'}
            </button>
          </div>

          {/* Available Coupons Display */}
          {showCoupons && (
            <div className='border-t pt-4'>
              <div className='flex items-center mb-4'>
                <div className='w-2 h-2 bg-green-500 rounded-full mr-2'></div>
                <span className='font-medium text-gray-700'>
                  Available Coupons
                </span>
              </div>

              {loading ? (
                <div className='text-center py-8'>
                  <div className='inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500'></div>
                  <p className='mt-2 text-gray-500 text-sm'>Loading coupons...</p>
                </div>
              ) : availableCoupons.length > 0 ? (
                <div className='grid gap-4 sm:grid-cols-2'>
                  {availableCoupons.map((coupon) => (
                    <div
                      key={coupon._id}
                      className='border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <div className='bg-green-500 text-white px-3 py-1 rounded text-sm font-bold tracking-wide'>
                          {coupon.code}
                        </div>
                        <div className='text-right'>
                          <div className='text-green-600 font-bold text-lg'>
                            {formatDiscount(coupon)}
                          </div>
                          <div className='text-xs text-gray-500 uppercase tracking-wide'>
                            DISCOUNT
                          </div>
                        </div>
                      </div>

                      <div className='text-sm text-gray-600 mb-3 space-y-1'>
                        {coupon.minOrderAmount > 0 && (
                          <div className='flex justify-between'>
                            <span>Min. order:</span>
                            <span className='font-medium'>
                              {currency}
                              {coupon.minOrderAmount}
                            </span>
                          </div>
                        )}
                        {coupon.maxDiscount &&
                          (coupon.discountType === 'percentage' ||
                            coupon.discountType === 'percent') && (
                            <div className='flex justify-between'>
                              <span>Max. discount:</span>
                              <span className='font-medium'>
                                {currency}
                                {coupon.maxDiscount}
                              </span>
                            </div>
                          )}
                        <div className='flex justify-between'>
                          <span>Valid till:</span>
                          <span className='font-medium text-red-500'>
                            {formatExpiryDate(coupon.expiryDate)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => applyCoupon(coupon.code)}
                        disabled={appliedCoupon?.code === coupon.code}
                        className={`w-full py-2 px-4 text-sm font-medium transition-colors ${
                          appliedCoupon?.code === coupon.code
                            ? 'bg-green-100 text-green-700 border border-green-300 cursor-not-allowed'
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                      >
                        {appliedCoupon?.code === coupon.code
                          ? '✓ APPLIED'
                          : 'APPLY NOW'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  <p className='text-lg mb-1'>No coupons available</p>
                  <p className='text-sm'>Check back later for exciting offers!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cart Total and Checkout */}
      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal />
          <div className='w-full text-end'>
            <button
              onClick={() => navigate('/place-order')}
              className='bg-black text-white text-sm my-8 px-8 py-3 hover:bg-gray-800 transition-colors'
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart

