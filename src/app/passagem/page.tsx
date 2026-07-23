"use client";

import React from "react";
import { MonasteryBackground } from "@/components/MonasteryBackground";
import { PassageGame } from "@/components/PassageGame";

export default function PassagemPage() {
  return (
    <MonasteryBackground showBackButton={true}>
      <PassageGame />
    </MonasteryBackground>
  );
}
