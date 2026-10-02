import type { Category } from "../generated/prisma/client";

export type CategoryApiResponse<T> = {
  data: T | string;
  message: string;
};

export type CategoryResponse = {
  id: string;
  name: string;
  parent_id: string | null;
  children?: CategoryResponse[];
};

export function toCategoryResponse(
  category: Category & { children?: Category[] },
): CategoryResponse {
  return {
    name: category.name,
    id: category.id,
    parent_id: category.parent_id,
    children: category.children?.map((child) => toCategoryResponse(child)),
  };
}
