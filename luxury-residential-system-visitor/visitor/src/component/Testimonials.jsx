import React from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const testimonials = [
  {
    name: "Dhrumil Senjaliya",
    image:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200",
    text: `MY-Building app has made it so much easier to keep our building in top shape.
    The maintenance requests are handled swiftly, and the gate security feature gives us peace of mind`,
  },
  {
    name: "Sankent Ranpariya",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    text: `With MY-Building, our maintenance issues are resolved faster than ever.
    The app is user-friendly and the gate security function is a great addition.
    A must-have for any building!`,
  },
  {
    name: "Sahil Sutariya",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
    text: `I am thoroughly impressed with MY-Building. The maintenance tracking is seamless,
    and the gate security adds an extra layer of protection. Excellent service overall!`,
  }, {
    name: "Sahil Sutariya",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
    text: `I am thoroughly impressed with MY-Building. The maintenance tracking is seamless,
    and the gate security adds an extra layer of protection. Excellent service overall!`,
  },{
    name: "Sahil Sutariya",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
    text: `I am thoroughly impressed with MY-Building. The maintenance tracking is seamless,
    and the gate security adds an extra layer of protection. Excellent service overall!`,
  }
];

const Testimonials = () => {
  return (
    <section className="py-15 bg-white overflow-hidden">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <h2 className="text-4xl font-bold text-blue-700">
          Testimonials
        </h2>
        <p className="text-gray-600 mt-2 text-lg">
          What Our client Says?
        </p>
      </motion.div>

      {/* Carousel */}
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        spaceBetween={30}
        slidesPerView={1}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="max-w-7xl mx-auto px-6"
      >
        {testimonials.map((item, index) => (
          <SwiperSlide key={index}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="bg-blue-50 rounded-2xl p-8 h-full
                         shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="text-blue-600 fill-blue-600"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-700 text-base leading-relaxed mb-6 text-center">
                {item.text}
              </p>

              {/* User */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <motion.img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                  whileHover={{ scale: 1.1 }}
                />
                <h4 className="font-semibold text-lg text-blue-800">
                  {item.name}
                </h4>
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Testimonials;
