"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { protectedApi } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";
import { suppress, isSuppressed } from "@/lib/notificationSuppress";

interface Document {
  id: string;
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  s3_url: string;
  created_at: string;
}

interface SingleDocument {
  id: string;
  name: string;
  description: string;
  file_size: number;
  file_type: string;
  created_at: string;
  signed_url: string;
}

interface DocumentsListProps {
  socket?: any;
}

export default function DocumentsList({ socket: socketProp }: DocumentsListProps) {
    const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
      if (typeof window !== "undefined") {
        const role = localStorage.getItem("role");
        setIsAdmin(role === "admin");
      }
    }, []);
  // Use the passed socket prop if available, otherwise use the socket from lib
  const socketToUse: Socket | undefined = socketProp || getSocket();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // View Modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<SingleDocument | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<SingleDocument | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState<SingleDocument | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch all documents
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await protectedApi.get("/documents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(res.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  // View document
  const fetchDocument = async (id: string) => {
    setViewLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await protectedApi.get(`/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedDoc(res.data);
      setViewModalOpen(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch document");
    } finally {
      setViewLoading(false);
    }
  };

  // Open Edit modal
  const openEditModal = (doc: SingleDocument) => {
    setEditDoc(doc);
    setEditName(doc.name);
    setEditDescription(doc.description);
    setEditModalOpen(true);
  };

  // Update document
  const handleEditSubmit = async () => {
    if (!editDoc) return;
    setEditLoading(true);
    try {
      const token = localStorage.getItem("token");
      await protectedApi.put(`/documents/${editDoc.id}`, {
        name: editName,
        description: editDescription,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Document updated successfully");
      // suppress the socket notification for this document briefly
      suppress("update", editDoc.id, 5000);
      setEditModalOpen(false);
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  // Delete document
  const handleDelete = async () => {
    if (!deleteDoc) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      await protectedApi.delete(`/documents/${deleteDoc.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Document deleted successfully");
      // suppress the socket notification for this document briefly
      suppress("delete", deleteDoc.id, 5000);
      setDeleteModalOpen(false);
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Listen to socket events for real-time updates
  useEffect(() => {
    if (!socketToUse) return;

    // Handle document deletion
    socketToUse.on("document:deleted", (data: { id: string }) => {
      console.log("Document deleted via socket:", data.id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== data.id));
      if (!isSuppressed("delete", data.id)) {
        toast.success("Document deleted");
      }
    });

    // Handle document update
    socketToUse.on("document:updated", (updatedDoc: Document) => {
      console.log("Document updated via socket:", updatedDoc.id);
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === updatedDoc.id ? updatedDoc : doc))
      );
      setEditModalOpen(false);
      if (!isSuppressed("update", updatedDoc.id)) {
        toast.success("Document updated");
      }
    });

    return () => {
      socketToUse.off("document:deleted");
      socketToUse.off("document:updated");
    };
  }, [socketToUse]);

  return (
    !isAdmin && (
      <div className="bg-white shadow p-4 rounded">
        <h2 className="font-bold mb-3 text-gray-800 text-xl">Documents</h2>

        {loading ? (
          <p>Loading...</p>
        ) : documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left text-gray-700 font-semibold">Name</th>
                  <th className="py-2 px-4 text-left text-gray-700 font-semibold">Description</th>
                  <th className="py-2 px-4 text-left text-gray-700 font-semibold">Category</th>
                  <th className="py-2 px-4 text-center text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-2 px-4 text-[black]">{doc.name}</td>
                    <td className="py-2 px-4 text-[black]">{doc.description}</td>
                    <td className="py-2 px-4 text-[black] font-medium" style={{ color: doc.category?.color || "black" }}>
                      {doc.category?.name}
                    </td>
                    <td className="py-2 px-4 text-center flex justify-center gap-2">
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() => fetchDocument(doc.id)}
                      >
                        View
                      </button>
                      <button
                        className="text-yellow-500 hover:underline"
                        onClick={() => openEditModal({
                          ...doc,
                          file_size: 0,
                          file_type: "unknown",
                          signed_url: doc.s3_url,
                          created_at: doc.created_at
                        })}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500 hover:underline"
                        onClick={() => {
                          setDeleteDoc({
                            ...doc,
                            file_size: 0,
                            file_type: "unknown",
                            signed_url: doc.s3_url,
                            created_at: doc.created_at
                          });
                          setDeleteModalOpen(true);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        )}

        {/* View Modal */}
        {viewModalOpen && selectedDoc && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded p-6 w-full max-w-lg relative overflow-auto max-h-[90vh]">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setViewModalOpen(false)}
              >
                ✕
              </button>

              {viewLoading ? (
                <p>Loading...</p>
              ) : (
                <>
                  <h3 className="font-bold text-xl mb-2 text-[black]">{selectedDoc.name}</h3>
                  <p className="mb-1 text-[black]">{selectedDoc.description}</p>
                  <p className="text-sm text-[black]">
                    Type: {selectedDoc.file_type} | Size: {selectedDoc.file_size} bytes
                  </p>
                  <p className="text-sm text-[black]">
                    Uploaded: {new Date(selectedDoc.created_at).toLocaleString()}
                  </p>

                  {selectedDoc.file_type.startsWith("image/") ? (
                    <img
                      src={selectedDoc.signed_url}
                      alt={selectedDoc.name}
                      className="mt-3 max-w-full max-h-96 object-contain border rounded"
                    />
                  ) : selectedDoc.file_type === "application/pdf" ? (
                    <iframe
                      src={selectedDoc.signed_url}
                      className="mt-3 w-full h-96 border rounded"
                    />
                  ) : (
                    <a
                      href={selectedDoc.signed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline mt-3 inline-block"
                    >
                      Open Document
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModalOpen && editDoc && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded p-6 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setEditModalOpen(false)}
              >
                ✕
              </button>

              <h3 className="font-bold text-xl mb-4">Edit Document</h3>
              <input
                className="w-full p-2 mb-2 border rounded text-[black]"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Document Name"
              />
              <textarea
                className="w-full p-2 mb-2 border rounded text-[black]"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description"
              />
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={handleEditSubmit}
                disabled={editLoading}
              >
                {editLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModalOpen && deleteDoc && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded p-6 w-full max-w-sm relative text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Are you sure you want to delete this document?
              </h3>
              <p className="text-gray-600 mb-6">{deleteDoc.name}</p>
              <div className="flex justify-center gap-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    )
  );
}
