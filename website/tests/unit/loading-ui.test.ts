import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  CatalogCardSkeleton,
  LoadingBar,
  LoadingSpinner,
  LoadingStatusBanner,
  TableRowsSkeleton,
} from "@/components/ui/loading";

describe("UI Loading Primitives (Native <progress> & Skeletons)", () => {
  it("renders LoadingSpinner as a semantic indeterminate <progress> element with aria-label", () => {
    const html = renderToStaticMarkup(
      React.createElement(LoadingSpinner, {
        size: "sm",
        tone: "primary",
        label: "Memverifikasi ketersediaan unit",
        testId: "unit-spinner",
      })
    );

    expect(html).toContain("<progress");
    expect(html).toContain('aria-label="Memverifikasi ketersediaan unit"');
    expect(html).toContain('data-testid="unit-spinner"');
    expect(html).toContain("loading-spinner");
    expect(html).not.toContain("value=");
  });

  it("renders LoadingBar as an indeterminate horizontal <progress> element", () => {
    const html = renderToStaticMarkup(
      React.createElement(LoadingBar, {
        label: "Sinkronisasi data server",
        tone: "secondary",
        height: "4px",
        testId: "sync-bar",
      })
    );

    expect(html).toContain("<progress");
    expect(html).toContain('aria-label="Sinkronisasi data server"');
    expect(html).toContain('data-testid="sync-bar"');
    expect(html).toContain("loading-bar");
  });

  it("renders LoadingStatusBanner with live region semantics and contextual copy", () => {
    const html = renderToStaticMarkup(
      React.createElement(LoadingStatusBanner, {
        title: "Mengunci jadwal sewa dan membuat kode QRIS...",
        description: "Memvalidasi ketersediaan anti double-booking di server.",
        tone: "primary",
      })
    );

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("Mengunci jadwal sewa dan membuat kode QRIS...");
    expect(html).toContain(
      "Memvalidasi ketersediaan anti double-booking di server."
    );
  });

  it("renders CatalogCardSkeleton and TableRowsSkeleton with aria-hidden", () => {
    const cardsHtml = renderToStaticMarkup(
      React.createElement(CatalogCardSkeleton, { count: 3 })
    );
    const tableHtml = renderToStaticMarkup(
      React.createElement(TableRowsSkeleton, { rows: 4, columns: 5 })
    );

    expect(cardsHtml).toContain('aria-hidden="true"');
    expect(cardsHtml).toContain('data-testid="catalog-cards-skeleton"');
    expect(tableHtml).toContain('aria-hidden="true"');
  });
});
