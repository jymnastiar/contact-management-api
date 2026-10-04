import { prisma } from "../lib/prisma";
import { redisClient } from "../lib/redis";

export class CategoryService {
  //* redis cache database
  static async list(): Promise<string> {
    const cachedData = await redisClient.get("categories:all");
    if (cachedData !== null) {
      return cachedData;
    } else {
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
      const categoryResponses = JSON.stringify({
        data: parents,
        message: "Success get all category data",
      });
      await redisClient.setex("categories:all", 60 * 60, categoryResponses);
      return categoryResponses;
    }
  }
  //? normal database query
  // static async list(): Promise<CategoryResponse[]> {
  //   const parents = await prisma.category.findMany({
  //     where: {
  //       parent_id: null,
  //     },
  //     select: {
  //       name: true,
  //       id: true,
  //       parent_id: true,
  //       children: true,
  //     },
  //   });
  //   return parents.map((parent) => toCategoryResponse(parent));
  // }
  //! n+1 problem
  // static async list(): Promise<CategoryResponse[]> {
  //   const parents = await prisma.category.findMany({
  //     where: {
  //       parent_id: null,
  //     },
  //     select: {
  //       name: true,
  //       id: true,
  //       parent_id: true,
  //       children: true,
  //     },
  //   });
  //   for (let parent of parents) {
  //     parent.children = await prisma.category.findMany({
  //       where: {
  //         parent_id: parent.id,
  //       },
  //       select: {
  //         id: true,
  //         name: true,
  //         parent_id: true,
  //       },
  //     }); //return parent.children = [{"id", "itemA", "parent_id"}, {"id", "itemB", "parent_id"}]
  //   }
  //   return parents.map((parent) => toCategoryResponse(parent));
  // }
}
