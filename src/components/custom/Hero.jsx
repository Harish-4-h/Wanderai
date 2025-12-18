import React from 'react'
import { Link } from 'react-router-dom'; 

function Hero() {
  return (
    <div className='flex flex-col items-center mx-56 gap-9'>
        <h1 className='flex items-center mx-56 gap-9 mt-16'>
          <span className='font-extrabold text-[60px] text-center'>
            <span className='text-[#04ADBF]'>Wander the world with WanderAI:</span>
            <br />
            <span className='text-[#7EA629]'>Where dreams meet technology to craft your perfect journey</span> 
          </span>
        </h1>
        <p className='text-xl text-[#027373] text-center'>
          Your personal trip planner and travel curator, creating custom itineraries tailored to your interests and budget
        </p>

        <Link to={'/create-trip'}>
        <button>
            Start Your Journey Now, It's Free!
          </button>
        </Link>
    </div>
  )
}

export default Hero;
