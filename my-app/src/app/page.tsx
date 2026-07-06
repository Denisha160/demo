"use client";

import { useState } from "react";
import { useGetUsers } from "../hooks";

export default function Home() {
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const skip = (page - 1) * limit;

  const { data, isLoading } = useGetUsers(limit, skip, search);

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto mt-10">

      <h1 className="text-3xl font-bold mb-6">
        User List
      </h1>

      {/* Search & Limit */}
      <div className="flex justify-between items-center mb-5">

        <input
          className="border rounded px-3 py-2 w-72"
          placeholder="Search user..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <div className="flex items-center gap-2">
          <span>Show</span>

          <select
            className="border rounded px-2 py-2"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 20, 30, 40, 50].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <span>Entries</span>
        </div>
      </div>

      {/* Table */}

      <table className="w-full border border-collapse">

        <thead className="bg-blue-500 text-white">

          <tr>
            <th className="border p-3">ID</th>
            <th className="border p-3">Name</th>
            <th className="border p-3">Email</th>
            <th className="border p-3">Phone</th>
          </tr>

        </thead>

        <tbody>

          {isLoading ? (
            <tr>
              <td
                colSpan={4}
                className="text-center p-5"
              >
                Loading...
              </td>
            </tr>
          ) : (
            data?.data.map((user: any) => (
              <tr
                key={user.id}
                className="hover:bg-gray-100"
              >
                <td className="border p-3">
                  {user.id}
                </td>

                <td className="border p-3">
                  {user.firstName}
                </td>

                <td className="border p-3">
                  {user.email}
                </td>

                <td className="border p-3">
                  {user.phone}
                </td>
              </tr>
            ))
          )}

        </tbody>

      </table>

      {/* Footer */}

      <div className="flex justify-between items-center mt-5">

        <div>

          Showing{" "}
          {total === 0
            ? 0
            : skip + 1}
          {" "}to{" "}
          {Math.min(skip + limit, total)}
          {" "}of{" "}
          {total} entries

        </div>

        <div className="flex gap-2">

          <button
            className="border rounded px-4 py-2 disabled:opacity-50"
            disabled={page === 1}
            onClick={() =>
              setPage((p) => p - 1)
            }
          >
            Previous
          </button>

          <span className="px-4 py-2">
            {page} / {totalPages || 1}
          </span>

          <button
            className="border rounded px-4 py-2 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() =>
              setPage((p) => p + 1)
            }
          >
            Next
          </button>

        </div>

      </div>

    </div>
  );
}