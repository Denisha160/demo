"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useGetUsers } from "../hooks"

interface User {
  id: number;
  firstName: string;
  email: string;
  phone: string;
}

export default function Home() {

  const { data: userResponse } = useGetUsers();

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-6">User List</h1>

      <table className="border border-black border-collapse w-full max-w-5xl">
        <thead>
          <tr className="bg-blue-500 text-white">
            <th className="border border-black px-4 py-2">ID</th>
            <th className="border border-black px-4 py-2">Name</th>
            <th className="border border-black px-4 py-2">Email</th>
            <th className="border border-black px-4 py-2">Phone</th>
          </tr>
        </thead>

        <tbody>
          {userResponse?.data?.map((user) => (
            <tr key={user.id} className="hover:bg-gray-200">
              <td className="border border-black px-4 py-2">
                {user.id}
              </td>
              <td className="border border-black px-4 py-2">
                {user.firstName}
              </td>
              <td className="border border-black px-4 py-2">
                {user.email}
              </td>
              <td className="border border-black px-4 py-2">
                {user.phone}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}