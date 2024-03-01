import React from "react";
import Link from "next/link";

const Home = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-3xl text-center">0XS1R4T</h1>
      <Link aria-label="garden" href="/garden">
        🌵🌸🌻🪻🎋
      </Link>
    </main>
  );
};

export default Home;
