import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsLatterbox from '../components/NewsLatterbox'

const Home  = () => {
  return (
    <div>
    <Hero/>
    <LatestCollection/>
    <BestSeller/>
    <OurPolicy/>
    <NewsLatterbox/>
    </div>
  )
}

export default Home