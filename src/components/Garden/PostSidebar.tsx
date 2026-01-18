"use client";

import React, { Fragment, useState } from "react";
import PopOutButton from "@/components/PopOutButton";
import PostSidebarContainer from "@/components/Garden/PostSidebarContainer";

interface PostSidebarProps {
  description: string;
  tocHtml: string;
}

const PostSidebar = ({ description, tocHtml }: PostSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Fragment>
      <PopOutButton
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        placement="right"
        position="top"
      />
      <PostSidebarContainer
        isOpen={isOpen}
        description={description}
        tocHtml={tocHtml}
      />
    </Fragment>
  );
};

export default PostSidebar;
