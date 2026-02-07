"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { protectedApi } from "@/lib/api";

/* ===================== TYPES ===================== */

interface UploadDocumentProps {
  onUploadSuccess: () => void;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

/* ===================== COMPONENT ===================== */

export default function UploadDocument({ onUploadSuccess }: UploadDocumentProps) {
  const [isAdmin, setIsAdmin] = useState(false);  
    // Active users for admin
    const [activeUsers, setActiveUsers] = useState<string[]>([]);
    useEffect(() => {
      if (!isAdmin) return;
      // Listen for socket event
      const socket = require("@/lib/socket").getSocket();
      if (socket) {
        socket.on("activeUsers", (users: string[]) => {
          setActiveUsers(users);
        });
      }
      return () => {
        if (socket) socket.off("activeUsers");
      };
    }, [isAdmin]);
  /* ---------- Document Upload ---------- */
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ---------- Admin ---------- */

  const [adminTab, setAdminTab] = useState<"users" | "categories" | "dashboard">("users");

  /* ---------- Users ---------- */
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  /* ---------- Categories ---------- */
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#000000");
  const [creatingCategory, setCreatingCategory] = useState(false);

  /* ===================== AUTH CHECK ===================== */

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdmin(localStorage.getItem("role") === "admin");
    }
  }, []);

  /* ===================== APIs ===================== */

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await protectedApi.get("/users");
      setUsers(res.data.users || []);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await protectedApi.get("/categories");
      setCategories(res.data.categories || res.data || []);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const createCategory = async () => {
    if (!newCategoryName) return toast.error("Category name required");

    setCreatingCategory(true);
    try {
      await protectedApi.post("/categories", {
        name: newCategoryName,
        color: newCategoryColor,
      });
      toast.success("Category created");
      setNewCategoryName("");
      fetchCategories();
    } catch {
      toast.error("Failed to create category");
    } finally {
      setCreatingCategory(false);
    }
  };

  /* ===================== EFFECTS ===================== */

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isAdmin && adminTab === "users") fetchUsers();
    if (isAdmin && adminTab === "categories") fetchCategories();
  }, [adminTab, isAdmin]);

  /* ===================== UPLOAD ===================== */

  const handleUpload = async () => {
    if (!file || !name) return toast.error("Name & file required");

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / (e.total || 1));
            setUploadProgress(percent);
          },
        }
      );

      toast.success("Document uploaded");
      setFile(null);
      setName("");
      setDescription("");
      setCategory("");
      setUploadProgress(0);
      onUploadSuccess();
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold text-black mb-4">Upload Document</h2>

      {/* ========== ADMIN TABS ========== */}
      {isAdmin ? (
        <>
          <div className="flex gap-2 mb-3">
            {["users", "categories", "dashboard"].map((tab) => (
              <button
                key={tab}
                onClick={() => setAdminTab(tab as any)}
                className={`px-3 py-1 rounded ${adminTab === tab ? "bg-blue-600 text-[white]" : "bg-gray-200 text-[black]"
                  }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="border rounded p-3 mb-4 bg-gray-50">
            {/* USERS TAB */}
            {adminTab === "users" && (
              <>
                {usersLoading ? (
                  <p>Loading users...</p>
                ) : users.length === 0 ? (
                  <p>No users found</p>
                ) : (
                  users.map((u) => (
                    <div
                      key={u.id}
                      className="flex justify-between bg-white p-2 rounded border mb-2"
                    >
                      <div>
                        <p className="font-medium text-[black]">{u.name}</p>
                        <p className="text-sm text-[black]">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[black] px-2 py-1 rounded">
                          {u.role}
                        </span>
                        {activeUsers.includes(u.id) && (
                          <span title="Active" className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* CATEGORIES TAB */}
            {adminTab === "categories" && (
              <>
                <div className="mb-3">
                  <input
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="border p-2 w-full mb-2 text-[black]"
                  />
                  <input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                  />
                  <button
                    onClick={createCategory}
                    disabled={creatingCategory}
                    className="ml-2 bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Create
                  </button>
                </div>

                {categories.map((c) => (
                  <div key={c.id} className="flex gap-2 items-center mb-1">
                    <span
                      className="w-3 h-3 rounded-full text-[black]"
                      style={{ background: c.color }}
                    />
                    <p className="text-[black]">{c.name}</p>
                  </div>
                ))}
              </>
            )}

            {/* DASHBOARD */}
            {adminTab === "dashboard" && (
              <p className="text-[black]">Admin dashboard coming soon…</p>
            )}
          </div>
        </>
      ) : <>  {/* ========== DOCUMENT FORM ========== */}
        <input
          className="border p-2 w-full mb-2 text-[black]"
          placeholder="Document name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-2 text-[black]"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 w-full mb-2 text-[black]"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-3 text-[black]"
        />

        {uploadProgress > 0 && (
          <div className="mb-2 text-sm">{uploadProgress}%</div>
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Upload
        </button></>}


    </div>
  );
}
