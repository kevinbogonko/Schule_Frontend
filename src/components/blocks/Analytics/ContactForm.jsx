import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiMessageSquare,
  FiSend,
  FiUser,
  FiPhone,
  FiCheckCircle,
  FiAlertCircle,
  FiExternalLink,
  FiMessageCircle,
  FiMapPin,
} from "react-icons/fi";
import { FaWhatsapp, FaPhoneAlt, FaLinkedin, FaTwitter } from "react-icons/fa";
import { TbBrandTelegram } from "react-icons/tb";

const ContactForm = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
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
            We're here to help! Whether you have questions about our platform,
            need technical support, or want to provide feedback, our team is
            ready to assist you.
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
                              Thank you for contacting us. We'll get back to you
                              within 24 hours.
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
                Fill out the form below and we'll respond as soon as possible.
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
                      <option value="feedback">Feedback & Suggestions</option>
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
                      We typically respond within 24 hours during business days.
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
  );
};

export default ContactForm;
