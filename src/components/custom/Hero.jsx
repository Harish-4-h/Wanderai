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
            <span className="font-extrabold text-[60px]">
              <span className="text-[#FFFAFA]">
                Wander the world with WanderAI:
              </span>
              <br />
              <span className="text-[#000080]">
                Where dreams meet technology to craft your perfect journey
              </span>
            </span>
          </h1>

          <p className="text-xl text-[#FFEA00] text-center max-w-3xl">
            Your personal trip planner and travel curator, creating custom
            itineraries tailored to your interests and budget
          </p>

          <Link to="/create-trip">
            <button className="px-8 py-3 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition">
              Start Your Journey Now, It's Free!
            </button>
          </Link>

        </div>
      </div>
    </section>
  );
}

export default Hero;
