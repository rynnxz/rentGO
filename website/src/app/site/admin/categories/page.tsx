import React from "react";
import { listCategories } from "@/lib/repository";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();
  return <CategoriesManager initialCategories={categories} />;
}
