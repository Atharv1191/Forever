import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsLatterbox from '../components/NewsLatterbox'

const Contact = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1={'CONTACT'} text2={'US'}/>
      </div>
      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
        <img className='w-full md:max-w-[480px]' src={assets.contact_img}/>
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-600'>Our Store</p>
          <p className='text-gray-500'>54709 wilas Station<br/> Suite 350, Washington, USA</p>
          <p className='text-gary-500'>Tel: (415) 555-0132<br/> Email:admin@Forever.com</p>
          <p className='font-semibold text-xl text-gray-600'>Carears at Forever</p>
          <p className='text-gray-500'>54709 wilas Station<br/> Learn more about our teams and Job opnings</p>
          <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>Explore Jobs</button>

        </div>

      </div>
      <NewsLatterbox/>
    </div>
  )
}

export default Contact