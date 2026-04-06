import { motion } from "framer-motion";
import {
  UserCheck,
  Car,
  Truck,
  Languages,
} from "lucide-react";

export default function SocietyGuardFeatures() {
  const features = [
    {
      title: "Visitor In/Out Tracking",
      desc: "Alerts for emergencies, staff in/out using QR codes, and instant guest arrival",
      icon: UserCheck,
    },
    {
      title: "Parking Management",
      desc: "Parking allotment, instant alert for wrong parking, find owner with vehicle number",
      icon: Car,
    },
    {
      title: "Pickup / Courier Arrival Status",
      desc: "Alert/Buzz on arrival of taxi pickup, courier service, and servant",
      icon: Truck,
    },
    {
      title: "Support Multiple Language",
      desc: "Visitor management software can be used in multiple languages",
      icon: Languages,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-blue-600"
        >
          Society Guard
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-4 text-gray-600"
        >
          Convert manual entrance & exit to digital & smart tracking
        </motion.p>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-10">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className="bg-gray-100 rounded-2xl p-10 text-center shadow-sm hover:shadow-lg transition"
              >
                <Icon className="mx-auto h-14 w-14 text-blue-600" />

                <h3 className="mt-6 text-xl font-semibold text-blue-600">
                  {item.title}
                </h3>

                <p className="mt-3 text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
