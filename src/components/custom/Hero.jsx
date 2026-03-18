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
        <div className="flex flex-col items-center px-4 md:px-20 lg:px-40 gap-6 md:gap-9 py-16 md:py-20">

          <h1 className="mt-10 md:mt-16 text-center">
            <span className="font-extrabold text-2xl md:text-4xl lg:text-[40px]">
              <span className="text-[#FFFAFA]">
                Wander the world with Navoria!🐉: Made By Harish!💗🧸
              </span>

              <div className="my-2 md:my-4">
                <hr />
                <hr />
              </div>

              <span className="text-black">
                Where Dreams Meet Technology to Craft your Perfect Journey🚂🧳
              </span>
            </span>
          </h1>

          <p className="text-sm md:text-xl text-[#FFEA00] text-center max-w-xl md:max-w-3xl">
            Your Personal Trip Planner and Travel Curator, Creating Custom
            Itineraries Tailored to your Interests and Budget!💸💰
          </p>

          <Link to="/create-trip">
            <button className="px-6 md:px-8 py-2 md:py-3 rounded-full bg-blue-500 text-white text-sm md:text-base font-semibold hover:bg-blue-600 transition">
              Start Your Journey Now, It's Free!
            </button>
          </Link>

          <p className="text-sm md:text-xl text-[#FFFFFF] text-center max-w-xl md:max-w-3xl">
            The Most Advanced AI Travel Planner on the Web!🌐🤖
          </p>

        </div>
      </div>
    </section>
  );
}

export default Hero;