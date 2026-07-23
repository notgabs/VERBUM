"use client";

import React from "react";
import { MonasteryBackground } from "@/components/MonasteryBackground";
import { CharacterGame } from "@/components/CharacterGame";

export default function PersonagemPage() {
  return (
    <MonasteryBackground showBackButton={true}>
      <CharacterGame />
    </MonasteryBackground>
  );
}
