import React from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section
      className="w-full bg-cover bg-center"
      style={{
        backgroundImage: "url('/Images/BG1.jpg')",
      }}
    >
      {/* overlay to keep text readable */}
      <div className="bg-white/10 backdrop-blur-sm">
        <div className="flex flex-col items-center mx-56 gap-9 py-20">
          
          <h1 className="mt-16 text-center">
            <span className="font-extrabold text-[40px]">
              <span className="text-[#FFFAFA]">
                Wander the world with WanderAI: Made By Harish!💗🧸
              </span>
              <hr></hr>
              <hr></hr>
              <br />
              <span className="text-[#00000]">
                Where Dreams Meet Technology to Craft your Perfect Journey🚂🧳
              </span>
            </span>
          </h1>

          <p className="text-xl text-[#FFEA00] text-center max-w-3xl">
            Your Personal Trip Planner and Travel Curator, Creating Custom
            Itineraries Tailored to your Interests and Budget!💸💰
          </p>

          <Link to="/create-trip">
            <button className="px-8 py-3 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition">
              Start Your Journey Now, It's Free!
            </button>
            <br></br>
         
          </Link>
          <p className="text-xl text-[#FFFFFF] text-center max-w-3xl">
            The Most Advanced AI Travel Planner on the Web!🌐🤖
          </p>

        </div>
      </div>
    </section>
  );
}

export default Hero;
