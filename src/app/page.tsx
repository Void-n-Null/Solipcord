"use client";
import { useState } from "react";
import { TopBar } from "../components/TopBar";
import { SideBar } from "../components/SideBar";
import { ContentArea } from "../components/ContentArea";


export default function Home() {
  const [selectedServer, setSelectedServer] = useState<number>(0);
  
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <TopBar />
      <div className="flex flex-1">
        <SideBar 
          selectedServer={selectedServer} 
          onServerSelect={setSelectedServer} 
        />
        <ContentArea />
      </div>
    </div>
  );
}
