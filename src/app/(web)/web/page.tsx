import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const WebPage = () => {
  return (
    <div>
      WebPage
      <Link href="/auth">
        <Button>Sign In</Button>
      </Link>
    </div>
  );
};

export default WebPage;
