import React from 'react'
import Features from '../component/Features'
import VisitorManagement from '../component/VisitorManagement'
import SocietyGuardFeatures from '../component/SocietyGuardFeatures'

import Footer from '../component/Footer'

const FeaturesPage = () => {
  return (
    <div className="mt-15">
    <Features/>
    <VisitorManagement/>
    <SocietyGuardFeatures/>
    
    <Footer/>
    </div>
  )
}

export default FeaturesPage
