import { prisma } from "../lib/prisma";
import {
  toCategoryResponse,
  type CategoryResponse,
} from "../types/category.type";

export class CategoryService {
  static async list(): Promise<CategoryResponse[]> {
    const parents = await prisma.category.findMany({
      where: {
        parent_id: null,
      },
      select: {
        name: true,
        id: true,
        parent_id: true,
        children: true,
      },
    });

    for (let parent of parents) {
      parent.children = await prisma.category.findMany({
        where: {
          parent_id: parent.id,
        },
        select: {
          id: true,
          name: true,
          parent_id: true,
        },
      }); //return parent.children = [{"id", "itemA", "parent_id"}, {"id", "itemB", "parent_id"}]
    }
    return parents.map((parent) => toCategoryResponse(parent));
  }
}
