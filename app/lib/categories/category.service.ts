import {
  createCategory,
  deleteCategory,
  findCategories,
  findCategoryById,
  findCategoryBySlug,
  findCategoryProducts,
  updateCategory,
} from "./category.repository";

import type {
  CategorySearchOptions,
  CreateCategoryData,
  UpdateCategoryData,
} from "./category.types";

// Import prisma for checking duplicates
import { prisma } from "@/app/lib/prisma"; // Adjust this import path to match your project

export async function getCategoryById(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid category ID");
  }

  const category = await findCategoryById(id);

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
}

export async function getCategoryBySlug(
  slug: string
) {
  if (!slug || !slug.trim()) {
    throw new Error("Category slug is required");
  }

  const category = await findCategoryBySlug(
    slug.trim()
  );

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
}

export async function getCategories(
  options: CategorySearchOptions = {}
) {
  const limit = Math.min(
    Math.max(options.limit ?? 20, 1),
    100
  );

  return findCategories({
    ...options,
    limit,
  });
}

export async function getCategoryProducts(
  categoryId: number,
  cursor?: number,
  limit = 20
) {
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("Invalid category ID");
  }

  await getCategoryById(categoryId);

  const safeLimit = Math.min(
    Math.max(limit, 1),
    100
  );

  return findCategoryProducts(
    categoryId,
    cursor,
    safeLimit
  );
}

export async function createNewCategory(
  data: CreateCategoryData
) {
  const name = data.name.trim();
  const slug = data.slug.trim();
  const description = data?.description?.trim();

  if (!name) {
    throw new Error("Category name is required");
  }

  if (!slug) {
    throw new Error("Category slug is required");
  }

  // Check if category with same name or slug already exists
  const existingCategory = await prisma.category.findFirst({
    where: {
      OR: [
        { name: name },
        { slug: slug }
      ]
    }
  });

  if (existingCategory) {
    if (existingCategory.name === name) {
      throw new Error(`Category with name "${name}" already exists`);
    }
    if (existingCategory.slug === slug) {
      throw new Error(`Category with slug "${slug}" already exists`);
    }
  }

  return createCategory({
    name,
    slug,
    description : description ? description : ""
  });
}

export async function editCategory(
  id: number,
  data: UpdateCategoryData
) {
  await getCategoryById(id);

  if (
    data.name !== undefined &&
    !data.name.trim()
  ) {
    throw new Error("Category name cannot be empty");
  }

  if (
    data.slug !== undefined &&
    !data.slug.trim()
  ) {
    throw new Error("Category slug cannot be empty");
  }

  return updateCategory(id, {
    ...(data.name !== undefined
      ? { name: data.name.trim() }
      : {}),

    ...(data.slug !== undefined
      ? { slug: data.slug.trim() }
      : {}),
  });
}

export async function removeCategory(id: number) {
  const category = await getCategoryById(id);

  if (category._count.products > 0) {
    throw new Error(
      "Cannot delete a category that contains products"
    );
  }

  return deleteCategory(id);
}