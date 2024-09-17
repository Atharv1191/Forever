import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'

import OurPolicy from '../components/OurPolicy'
import NewsLatterbox from '../components/NewsLatterbox'

const Home  = () => {
  return (
    <div>
    <Hero/>
    <LatestCollection/>
  
    <OurPolicy/>
    <NewsLatterbox/>
    </div>
  )
}

export default Home