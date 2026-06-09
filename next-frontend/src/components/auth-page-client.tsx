"use client";

import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ComponentType } from "react";

export function AuthPageClient({
  Page,
  path,
}: {
  Page: ComponentType;
  path: string;
}) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={path} element={<Page />} />
      </Routes>
    </MemoryRouter>
  );
}
