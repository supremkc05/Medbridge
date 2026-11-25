"use client";

import { createContext, useContext } from "react";

/**
 * Inside a DataTable (and the overview's row lists) everything is drawn in a single ink colour, so the
 * eye reads labels and numbers rather than a patchwork of tints.
 * Badge and Avatar read this to switch to their monochrome style.
 */
export const MonochromeContext = createContext(false);

export const useMonochrome = () => useContext(MonochromeContext);
