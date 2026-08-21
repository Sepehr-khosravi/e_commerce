import { prisma } from "../prisma";

export async function findUsers(
  options: {
    query?: string;
    skip: number;
    limit: number;
  }
) {
  const {
    query,
    skip,
    limit,
  } = options;

  const where = query
    ? {
        OR: [
          {
            firstName: {
              contains: query,
              mode: "insensitive" as const,
            },
          },
          {
            lastName: {
              contains: query,
              mode: "insensitive" as const,
            },
          },
          {
            phone: {
              contains: query,
            },
          },
        ],
      }
    : {};

  const [
    users,
    total,
  ] = await Promise.all([
    prisma.user.findMany({
      where,

      skip,
      take: limit,

      orderBy: {
        id: "desc",
      },

      select: {
        id: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        address: true,
        role: true,
        createdAt: true,

        _count: {
          select: {
            orders: true,
            favorites: true,
          },
        },
      },
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    users,
    total,
  };
}

export async function findUserById(
  id: number
) {
  return prisma.user.findUnique({
    where: {
      id,
    },

    select: {
      id: true,
      phoneNumber: true,
      firstName: true,
      lastName: true,
      address: true,
      role: true,
      createdAt: true,
      updatedAt: true,

      orders: {
        orderBy: {
          createdAt: "desc",
        },

        take: 20,

        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                },
              },
            },
          },
        },
      },

      favorites: {
        include: {
          product: true,
        },
      },

      cart: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },

      _count: {
        select: {
          orders: true,
          favorites: true,
        },
      },
    },
  });
}

export async function updateUser(
  id: number,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string | null;
    role?: "CUSTOMER" | "ADMIN";
  }
) {
  return prisma.user.update({
    where: {
      id,
    },

    data,
  });
}