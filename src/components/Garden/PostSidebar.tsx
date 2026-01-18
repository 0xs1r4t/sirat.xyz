"use client";

import React, { Fragment, useEffect, useState } from "react";
import PopOutButton from "@/components/PopOutButton";
import PostSidebarContainer from "@/components/Garden/PostSidebarContainer";
import { useSidebar } from "@/contexts/SidebarContext";

interface PostSidebarProps {
  description: string;
  tocHtml: string;
}

const PostSidebar = ({ description, tocHtml }: PostSidebarProps) => {
  const { rightOpen, toggleRight } = useSidebar();

  return (
    <Fragment>
      <PopOutButton
        isOpen={rightOpen}
        onToggle={toggleRight}
        placement="right"
        position="top"
      />
      <PostSidebarContainer
        isOpen={rightOpen}
        description={description}
        tocHtml={tocHtml}
      />
    </Fragment>
  );
};

export default PostSidebar;
