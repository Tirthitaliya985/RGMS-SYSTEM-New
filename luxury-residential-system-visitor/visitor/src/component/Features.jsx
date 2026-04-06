import {
  DocumentTextIcon,
  UserGroupIcon,
  TruckIcon,
  ExclamationCircleIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

import { motion } from "framer-motion";

const features = [
  {
    title: "Billing",
    description:
      "Automated & instant maintenance bill generation with Payment gateway",
    icon: DocumentTextIcon,
  },
  {
    title: "Gatekeeper",
    description:
      "Gatekeepers can use the app to verify visitor identities, manage entry and exit logs in real-time",
    icon: UserGroupIcon,
  },
  {
    title: "Vehicle Tracking",
    description:
      "real-time monitoring and logging of vehicle entries and exits, authorized vehicles access the premises,",
    icon: TruckIcon,
  },
  {
    title: "Complaints",
    description:
      "Raise complaints or service requests, track status and action taken on the complaint.",
    icon: ExclamationCircleIcon,
  },
  {
    title: "Payment Transaction",
    description:
      "Track overdue, payments, download or email invoice and receipt.",
    icon: CreditCardIcon,
  },
  {
    title: "Notice Board",
    description:
      "important announcements, community events, and notices from the management",
    icon: ClipboardDocumentListIcon,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

export default function Features() {
  return (
    <div id="features">
    <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          {/* Heading animation */}
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-blue-600"
        >
          MAKE SOCIETY DIGITAL & PAPERLESS
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-3 text-gray-600"
        >
          Customize on members roles & Responsibilities
        </motion.p>

        {/* Feature Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={index}
              className="bg-[#eeeeee] rounded-2xl p-8 text-center hover:shadow-xl transition"
            >
              <item.icon className="h-10 w-10 mx-auto text-blue-600" />

              <h3 className="mt-4 text-lg font-semibold text-blue-600">
                {item.title}
              </h3>

              <p className="mt-3 text-gray-700 text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    </div>
  );
}
