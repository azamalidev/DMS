"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Socket } from "socket.io-client";
import Notifications from "../components/Notifications";
import { connectSocket, socket } from "../../lib/socket";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [socketConnected, setSocketConnected] = useState<Socket | null>(null);

  useEffect(() => {
    const token: any = localStorage.getItem("token");
    const userId: any = localStorage.getItem("userId");
    if (!token) {
      router.push("/login");
      return;
    }

    connectSocket(token, userId);
    
    // Small delay to ensure socket is initialized
    const timer = setTimeout(() => {
      setSocketConnected(socket);
    }, 100);

    return () => {
      clearTimeout(timer);
      socket?.disconnect();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-green-500 text-white p-4 flex justify-between items-center">
        <h1 className="font-bold text-xl">Dashboard</h1>
        <div>
          <Notifications socket={socketConnected} />
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="ml-4 bg-white text-green-500 px-3 py-1 rounded hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
