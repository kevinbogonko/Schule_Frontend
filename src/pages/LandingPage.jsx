import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiX,
  FiChevronRight,
  FiCheck,
  FiBarChart2,
  FiDollarSign,
  FiCalendar,
  FiUsers,
  FiBookOpen,
  FiTarget,
  FiAward,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
  FiGlobe,
  FiUser,
  FiMessageSquare,
  FiExternalLink,
  FiMessageCircle,
  FiSend,
  FiAlertCircle,
} from "react-icons/fi";
import {
  FaWhatsapp,
  FaLinkedin,
  FaTwitter,
  FaFacebookF,
  FaPhoneAlt,
} from "react-icons/fa";
import { TbBrandTelegram } from "react-icons/tb";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModule, setActiveModule] = useState("analytics");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
  const [activeTab, setActiveTab] = useState("form"); // 'form' or 'direct'

  const contactInfo = {
    email: "support@eschule.com",
    phone: "+1 (555) 123-4567",
    whatsapp: "+15551234567",
    address: "123 Education Street, Nairobi, Kenya",
    businessHours: "Mon - Fri: 8:00 AM - 5:00 PM",
    supportHours: "24/7 Technical Support Available",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      // Replace with actual API call
      console.log("Form submitted:", formData);

      // Simulate success
      setSubmitStatus("success");
      setIsSubmitting(false);

      // Reset form on success
      if (submitStatus === "success") {
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      }

      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 2000);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Hello E-Schule Team,\n\nI would like to get more information about your services.\n\nBest regards,\n${formData.name || "Potential Client"}`,
    );
    window.open(
      `https://wa.me/${contactInfo.whatsapp}?text=${message}`,
      "_blank",
    );
  };

  const makePhoneCall = () => {
    window.location.href = `tel:${contactInfo.phone}`;
  };

  const openEmailClient = () => {
    const subject = encodeURIComponent("Inquiry from E-Schule Website");
    const body = encodeURIComponent(
      `Dear E-Schule Team,\n\n${formData.message || "I would like to get more information about your services."}\n\nName: ${formData.name || "Not provided"}\nEmail: ${formData.email || "Not provided"}\nPhone: ${formData.phone || "Not provided"}`,
    );
    window.location.href = `mailto:${contactInfo.email}?subject=${subject}&body=${body}`;
  };

  const modules = [
    {
      id: "analytics",
      name: "Analytics & Reporting",
      icon: <FiBarChart2 className="text-3xl" />,
      description:
        "Advanced data analytics and comprehensive reporting tools for educational insights",
      features: [
        "Real-time student performance tracking",
        "Predictive analytics for student success",
        "Customizable dashboard with KPIs",
        "Automated report generation",
        "Data visualization tools",
        "Export to multiple formats",
      ],
      color: "from-green-500 to-green-600",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800",
    },
    {
      id: "finance",
      name: "Finance Management",
      icon: <FiDollarSign className="text-3xl" />,
      description:
        "Complete financial management system for schools and educational institutions",
      features: [
        "Fee collection and management",
        "Expense tracking and budgeting",
        "Financial reporting and analytics",
        "Invoice and receipt generation",
        "Payment gateway integration",
        "Scholarship and discount management",
      ],
      color: "from-blue-500 to-blue-600",
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800",
    },
    {
      id: "timetabling",
      name: "Smart Timetabling",
      icon: <FiCalendar className="text-3xl" />,
      description: "Intelligent scheduling and timetable management system",
      features: [
        "Automatic timetable generation",
        "Conflict detection and resolution",
        "Teacher and room allocation",
        "Real-time timetable updates",
        "Mobile timetable access",
        "Customizable scheduling rules",
      ],
      color: "from-purple-500 to-purple-600",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800",
    },
    {
      id: "ai-tutor",
      name: "AI Tutor",
      icon: <FiUser className="text-3xl" />,
      description:
        "Artificial Intelligence powered personalized learning assistant",
      features: [
        "Personalized learning paths",
        "Adaptive assessment engine",
        "24/7 student support",
        "Performance prediction models",
        "Natural language processing",
        "Learning gap identification",
      ],
      color: "from-orange-500 to-orange-600",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800",
    },
  ];

  const stats = [
    { number: "500+", label: "Schools Trust Us", icon: <FiUsers /> },
    { number: "50K+", label: "Students Served", icon: <FiBookOpen /> },
    { number: "98%", label: "Satisfaction Rate", icon: <FiTarget /> },
    { number: "24/7", label: "Support Available", icon: <FiAward /> },
  ];

  const features = [
    { title: "Cloud-Based", desc: "Access from anywhere, anytime" },
    { title: "Secure & Reliable", desc: "Enterprise-grade security" },
    { title: "Easy Integration", desc: "Works with existing systems" },
    { title: "Mobile Friendly", desc: "Full mobile app support" },
  ];

  const testimonials = [
    {
      name: "Dr. Jane Mwangi",
      role: "Principal, Greenview Academy",
      text: "Escuela transformed how we manage our school. The analytics module gave us insights we never had before.",
      school: "Greenview Academy",
    },
    {
      name: "Mr. David Omondi",
      role: "Bursar, Elite School",
      text: "The finance module reduced our administrative work by 70%. Fee collection has never been easier.",
      school: "Elite School",
    },
    {
      name: "Ms. Sarah Kimani",
      role: "Academic Dean, Pinnacle High",
      text: "Smart timetabling saved us countless hours. The AI Tutor has significantly improved student performance.",
      school: "Pinnacle High",
    },
  ];

  const navigation = [
    { name: "Home", href: "#home" },
    { name: "Modules", href: "#modules" },
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" },
  ];

  //   const contactInfo = {
  //     phone: "+254 700 000 000",
  //     email: "info@escuela.co.ke",
  //     address: "Westlands, Nairobi, Kenya",
  //     whatsapp: "+254700000000",
  //   };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Escuela
                  </h1>
                  <p className="text-xs text-gray-500">.co.ke</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-300"
                >
                  {item.name}
                </a>
              ))}
              <button className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-sm hover:shadow-md">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="py-3 text-gray-700 hover:text-green-600 font-medium border-b border-gray-100 last:border-0"
                  >
                    {item.name}
                  </a>
                ))}
                <button className="mt-4 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300">
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="mx-4 lg:mx-8"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Transform Your School with{" "}
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Smart Education
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                All-in-one school management platform with Analytics, Finance,
                Timetabling, and AI Tutor modules designed for modern
                educational institutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center group">
                  Start Free Trial
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300">
                  Schedule Demo
                </button>
              </div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80"
                  alt="Students using Escuela platform on various devices"
                  className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl max-w-xs">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center">
                      <FiUsers className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">50K+</p>
                      <p className="text-sm text-gray-600">Active Students</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Join hundreds of schools already using Escuela
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center">
                    <div className="text-green-600 text-2xl">{stat.icon}</div>
                  </div>
                </div>
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {stat.number}
                </p>
                <p className="text-gray-600 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16 mx-4 lg:mx-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Powerful Modules
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four integrated modules designed to streamline every aspect of
              school management
            </p>
          </div>

          {/* Module Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-12 mx-4 lg:mx-8">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeModule === module.id
                    ? `bg-gradient-to-r ${module.color} text-white shadow-lg shadow-${module.color.split(" ")[1].replace("to-", "")}/20`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {module.name}
              </button>
            ))}
          </div>

          {/* Module Details */}
          {modules.map(
            (module) =>
              activeModule === module.id && (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mx-4 lg:mx-8"
                >
                  {/* Left Content */}
                  <div>
                    <div
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${module.color} flex items-center justify-center mb-6 shadow-lg`}
                    >
                      <div className="text-white">{module.icon}</div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      {module.name}
                    </h3>
                    <p className="text-lg text-gray-600 mb-8">
                      {module.description}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {module.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <FiCheck className="text-green-600 text-sm" />
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg">
                      Learn More
                    </button>
                  </div>

                  {/* Right Content - Image */}
                  <div className="relative">
                    <img
                      src={module.image}
                      alt={module.name}
                      className="rounded-2xl shadow-xl w-full h-96 object-cover"
                    />
                    <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full bg-gradient-to-r ${module.color}`}
                        ></div>
                        <span className="font-semibold text-gray-800">
                          Live Demo Available
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ),
          )}
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 mx-4 lg:mx-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Escuela?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with schools in mind, designed for excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mx-4 lg:mx-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-100 group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <div className="text-green-600 text-xl">
                    {index === 0 && <FiGlobe />}
                    {index === 1 && <FiCheck />}
                    {index === 2 && <FiArrowRight />}
                    {index === 3 && <FiGlobe />}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16 mx-4 lg:mx-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Schools Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trusted by educational institutions across Kenya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-4 lg:mx-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 group"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-green-600 font-bold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-green-600">
                      {testimonial.school}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <FiAward key={i} className="text-yellow-400 ml-1" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of schools using Escuela to streamline their
            operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-green-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">
              Start Free 14-Day Trial
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300">
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          {/* <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions? We're here to help
            </p>
          </div> */}

          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Get in Touch
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
                  We're here to help! Whether you have questions about our
                  platform, need technical support, or want to provide feedback,
                  our team is ready to assist you.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Contact Methods */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="lg:col-span-1"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                      <FiMessageSquare className="mr-3 text-blue-500" />
                      Contact Options
                    </h2>

                    {/* Tab Navigation */}
                    <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      <button
                        onClick={() => setActiveTab("form")}
                        className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${
                          activeTab === "form"
                            ? "bg-white dark:bg-gray-600 shadow-sm"
                            : "hover:bg-gray-50 dark:hover:bg-gray-600"
                        }`}
                      >
                        <span
                          className={`font-medium ${activeTab === "form" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}
                        >
                          Send Message
                        </span>
                      </button>
                      <button
                        onClick={() => setActiveTab("direct")}
                        className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${
                          activeTab === "direct"
                            ? "bg-white dark:bg-gray-600 shadow-sm"
                            : "hover:bg-gray-50 dark:hover:bg-gray-600"
                        }`}
                      >
                        <span
                          className={`font-medium ${activeTab === "direct" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}
                        >
                          Direct Contact
                        </span>
                      </button>
                    </div>

                    {/* Contact Cards */}
                    <div className="space-y-4">
                      {/* Email Card */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700 cursor-pointer group"
                        onClick={openEmailClient}
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                            <FiMail className="text-blue-600 dark:text-blue-400 text-xl" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 dark:text-white">
                              Email Us
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {contactInfo.email}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center">
                              Click to compose email
                              <FiExternalLink className="ml-1" />
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Phone Card */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-700 cursor-pointer group"
                        onClick={makePhoneCall}
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-4 group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors">
                            <FaPhoneAlt className="text-green-600 dark:text-green-400 text-xl" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 dark:text-white">
                              Call Us
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {contactInfo.phone}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center">
                              Click to call now
                              <FiExternalLink className="ml-1" />
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* WhatsApp Card */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-700 cursor-pointer group"
                        onClick={openWhatsApp}
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-4 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/40 transition-colors">
                            <FaWhatsapp className="text-emerald-600 dark:text-emerald-400 text-2xl" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 dark:text-white">
                              WhatsApp
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              Chat with us instantly
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center">
                              Click to start chat
                              <FiExternalLink className="ml-1" />
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Address Card */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start">
                          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800/30 flex items-center justify-center mr-4">
                            <FiMapPin className="text-gray-600 dark:text-gray-400 text-xl" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 dark:text-white">
                              Our Location
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {contactInfo.address}
                            </p>
                            <div className="mt-3 space-y-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                📅 {contactInfo.businessHours}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ⚡ {contactInfo.supportHours}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                        Follow us on social media
                      </h3>
                      <div className="flex space-x-3">
                        {[
                          {
                            icon: <FaTwitter />,
                            color: "text-blue-400",
                            label: "Twitter",
                          },
                          {
                            icon: <FaLinkedin />,
                            color: "text-blue-600",
                            label: "LinkedIn",
                          },
                          {
                            icon: <TbBrandTelegram />,
                            color: "text-blue-500",
                            label: "Telegram",
                          },
                          {
                            icon: <FiMessageCircle />,
                            color: "text-green-500",
                            label: "Messenger",
                          },
                        ].map((social, index) => (
                          <motion.a
                            key={index}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            href="#"
                            className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${social.color} hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
                            aria-label={social.label}
                          >
                            {social.icon}
                          </motion.a>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Right Column - Form */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="lg:col-span-2"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
                    {/* Success/Error Messages */}
                    <AnimatePresence>
                      {submitStatus && (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`mb-6 p-4 rounded-lg ${
                            submitStatus === "success"
                              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                          }`}
                        >
                          <div className="flex items-center">
                            {submitStatus === "success" ? (
                              <>
                                <FiCheckCircle className="text-green-500 dark:text-green-400 text-xl mr-3" />
                                <div>
                                  <p className="font-medium text-green-800 dark:text-green-200">
                                    Message Sent Successfully!
                                  </p>
                                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                                    Thank you for contacting us. We'll get back
                                    to you within 24 hours.
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <FiAlertCircle className="text-red-500 dark:text-red-400 text-xl mr-3" />
                                <div>
                                  <p className="font-medium text-red-800 dark:text-red-200">
                                    Something went wrong
                                  </p>
                                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                    Please try again or contact us directly via
                                    phone/email.
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                      Send us a message
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">
                      Fill out the form below and we'll respond as soon as
                      possible.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Input */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center">
                              <FiUser className="mr-2 text-gray-400" />
                              Full Name *
                            </div>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="Enter your full name"
                          />
                        </div>

                        {/* Email Input */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center">
                              <FiMail className="mr-2 text-gray-400" />
                              Email Address *
                            </div>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Phone Input */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center">
                              <FiPhone className="mr-2 text-gray-400" />
                              Phone Number
                            </div>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="Enter your phone number"
                          />
                        </div>

                        {/* Subject Input */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Subject
                          </label>
                          <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                          >
                            <option value="">Select a subject</option>
                            <option value="general">General Inquiry</option>
                            <option value="support">Technical Support</option>
                            <option value="feedback">
                              Feedback & Suggestions
                            </option>
                            <option value="billing">Billing & Payments</option>
                            <option value="feature">Feature Request</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Message Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Your Message *
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors resize-none"
                          placeholder="Please describe your inquiry in detail..."
                        />
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Please be as detailed as possible
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formData.message.length}/2000 characters
                          </span>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-4">
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isSubmitting}
                          className={`w-full py-3.5 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center ${
                            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Sending Message...
                            </>
                          ) : (
                            <>
                              <FiSend className="mr-3" />
                              Send Message
                            </>
                          )}
                        </motion.button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                          By submitting this form, you agree to our{" "}
                          <a
                            href="#"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Privacy Policy
                          </a>
                        </p>
                      </div>
                    </form>

                    {/* Quick Response Info */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="mb-4 md:mb-0">
                          <h4 className="font-semibold text-gray-800 dark:text-white flex items-center">
                            <FiAlertCircle className="mr-2 text-yellow-500" />
                            Expected Response Time
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            We typically respond within 24 hours during business
                            days.
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Support Team Online
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* FAQ Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-12"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Frequently Asked Questions
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        q: "What's the best way to get quick support?",
                        a: "For immediate assistance, use WhatsApp or call our support line. Email responses typically take 2-4 hours.",
                      },
                      {
                        q: "Do you offer phone support?",
                        a: "Yes! You can call us at the number above during business hours for direct assistance.",
                      },
                      {
                        q: "Can I schedule a demo?",
                        a: "Absolutely! Mention 'Demo Request' in your message and we'll schedule a personalized walkthrough.",
                      },
                      {
                        q: "What information should I include?",
                        a: "Include your name, school/organization, and specific details about your inquiry for faster resolution.",
                      },
                    ].map((faq, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                          {faq.q}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-white to-gray-50 py-16 border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Logo and Description */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">E</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Escuela</h3>
                  <p className="text-xs text-gray-500">.co.ke</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Transformative school management platform for modern educational
                institutions in Kenya.
              </p>
              <div className="flex space-x-4">
                {[FaFacebookF, FaTwitter, FaLinkedin, FaWhatsapp].map(
                  (Icon, index) => (
                    <a
                      key={index}
                      href="#"
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 flex items-center justify-center text-gray-600 hover:text-green-600 transition-all duration-300"
                    >
                      <Icon />
                    </a>
                  ),
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-6">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-gray-600 hover:text-green-600 transition-colors duration-300 flex items-center group"
                    >
                      <FiChevronRight className="mr-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modules */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-6">
                Our Modules
              </h4>
              <ul className="space-y-3">
                {modules.map((module) => (
                  <li key={module.id}>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-green-600 transition-colors duration-300 flex items-center group"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-3 bg-gradient-to-r ${module.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                      />
                      {module.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-6">
                Contact Us
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FiPhone className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">{contactInfo.phone}</span>
                </li>
                <li className="flex items-start">
                  <FiMail className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">{contactInfo.email}</span>
                </li>
                <li className="flex items-start">
                  <FiMapPin className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">{contactInfo.address}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-12 pt-8 text-center">
            <p className="text-gray-600">
              © {new Date().getFullYear()} Escuela.co.ke. All rights reserved.
            </p>
            {/* <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <a href="#" className="hover:text-green-600 transition-colors">
                Privacy Policy
              </a>
              <span>•</span>
              <a href="#" className="hover:text-green-600 transition-colors">
                Terms of Service
              </a>
              <span>•</span>
              <a href="#" className="hover:text-green-600 transition-colors">
                Cookie Policy
              </a>
              <span>•</span>
              <a href="#" className="hover:text-green-600 transition-colors">
                Sitemap
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Designed for Kenyan schools, built for excellence.
            </p> */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
