"use client";

import Image from "next/image";
import {
  FaHome,
  FaEnvelope,
  FaCog,
  FaFacebook,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* COVER IMAGE */}
      <div className="relative h-52 w-full">
        <Image
          src="/cover.jpg"
          alt="cover"
          fill
          priority
          className="object-cover"
        />
        <span className="absolute top-4 left-6 text-white text-xs">
          17.05.2021 4:34PM
        </span>
      </div>

      {/* PROFILE HEADER */}
      <div className="bg-white px-8 py-4 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Image
            src="/user.jpg"
            alt="user"
            width={60}
            height={60}
            className="rounded-full"
          />
          <div>
            <h2 className="font-semibold text-lg">Kamal Kishore Soni</h2>
            <p className="text-sm text-gray-500">CEO / Co-Founder</p>
          </div>
        </div>

        <div className="flex gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2 cursor-pointer">
            <FaHome /> App
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <FaEnvelope /> Messages
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <FaCog /> Settings
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-8 py-10">
        {/* LEFT */}
        <div>
          <h3 className="font-semibold mb-4">Platform Settings</h3>

          <div className="text-sm text-gray-700 space-y-6">
            <div>
              <p className="font-semibold mb-3">ACCOUNT</p>
              <Toggle label="Admin Login" />
              <Toggle label="Mobile Message sender" />
              <Toggle label="Protection Security checker" active />
            </div>

            <div>
              <p className="font-semibold mb-3">APPLICATION</p>
              <Toggle label="Maintenance Mode" />
              <Toggle label="Alerts Notification" active />
              <Toggle label="Subscribe to newsletter" />
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Profile Information</h3>
            <span className="text-pink-500 cursor-pointer">✏️</span>
          </div>

          <p className="text-sm text-gray-500 mb-5">
            Hi, I am Kamal Kishore Soni
          </p>

          <div className="text-sm space-y-3">
            <p>
              <b>Full Name:</b> Alex M. Thompson
            </p>
            <p>
              <b>Mobile:</b> +91 9414586170
            </p>
            <p>
              <b>Email:</b> sonikamal30@gmail.com
            </p>
            <p>
              <b>Location:</b> INDIA
            </p>

            <div className="flex gap-4 mt-4 text-lg">
              <FaFacebook className="text-blue-600 cursor-pointer" />
              <FaTwitter className="text-sky-500 cursor-pointer" />
              <FaInstagram className="text-pink-600 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <h3 className="font-semibold mb-4">Conversations</h3>

          <Conversation
            img="/u1.jpg"
            name="Sophie B."
            msg="Hi! I need more information.."
          />
          <Conversation
            img="/u2.jpg"
            name="Anne Marie"
            msg="Awesome work, can you.."
          />
          <Conversation
            img="/u3.jpg"
            name="Ivanna"
            msg="About files I can.."
          />
          <Conversation
            img="/u4.jpg"
            name="Peterson"
            msg="Have a great afternoon.."
          />
          <Conversation
            img="/u5.jpg"
            name="Nick Daniel"
            msg="Hi! I need more information.."
          />
        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */

function Toggle({ label, active }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span>{label}</span>
      <input
        type="checkbox"
        defaultChecked={active}
        className="accent-pink-500"
      />
    </div>
  );
}

function Conversation({ img, name, msg }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <Image
          src={img}
          alt={name}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <p className="font-medium text-sm">{name}</p>
          <p className="text-xs text-gray-500">{msg}</p>
        </div>
      </div>

      <span className="text-pink-600 text-xs font-semibold cursor-pointer">
        REPLY
      </span>
    </div>
  );
}
