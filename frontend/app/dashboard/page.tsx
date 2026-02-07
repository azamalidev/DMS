"use client";  // <-- MUST be first line

import React, { useState } from "react";
import UploadDocument from "../components/UploadDocument";
import DocumentsList from "../components/DocumentsList";

export default function DashboardPage() {
  const [refresh, setRefresh] = useState(false);

  return (
    <div>
      <UploadDocument onUploadSuccess={() => setRefresh(!refresh)} />
      <DocumentsList key={refresh ? 1 : 0} />
    </div>
  );
}
