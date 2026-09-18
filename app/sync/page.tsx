import type { Metadata } from "next";
import SyncSettings from "../components/SyncSettings";

export const metadata: Metadata = { title: "সিঙ্ক" };

export default function SyncPage() {
  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="t-title text-2xl sm:text-3xl">সিঙ্ক</h1>
        <p className="t-body measure text-sm">একাধিক ডিভাইসে একই progress দেখতে এই key ব্যবহার করুন।</p>
      </header>
      <SyncSettings />
    </>
  );
}
