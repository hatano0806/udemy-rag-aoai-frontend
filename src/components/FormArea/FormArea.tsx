"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { inputMessageToReduxStore } from "@/features/messageSlice";
import { useAppDispatch } from "@/hooks/useRTK";

const FromInput = () => {
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  const sendMessage = async () => {
    setIsLoading(true);
    dispatch(
      inputMessageToReduxStore({
        pathname,
        message,
        isMan: true,
      }),
    );

    const url = "/api/onyourdata";
    const response = await fetch(`${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const { aiMessage } = await response.json();

    dispatch(
      inputMessageToReduxStore({
        pathname,
        message: aiMessage,
        isMan: false,
      }),
    );

    setMessage("");
    setIsLoading(false);
  };

  return (

  )
};

export default Forminpu