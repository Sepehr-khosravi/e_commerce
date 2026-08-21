import {
  findUserById,
  findUsers,
  updateUser,
} from "./user.repository";

import type {
  AdminUserListOptions,
  AdminUserUpdateData,
} from "./user.types";

export async function getUsers(
  options: AdminUserListOptions = {}
) {
  const page = Math.max(
    options.page ?? 1,
    1
  );

  const limit = Math.min(
    Math.max(
      options.limit ?? 20,
      1
    ),
    100
  );

  const skip =
    (page - 1) * limit;

  const result =
    await findUsers({
      query: options.query,
      skip,
      limit,
    });

  return {
    users: result.users,

    pagination: {
      page,
      limit,
      total: result.total,

      totalPages: Math.ceil(
        result.total / limit
      ),

      hasNextPage:
        page * limit <
        result.total,

      hasPreviousPage:
        page > 1,
    },
  };
}

export async function getUserDetails(
  id: number
) {
  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Invalid user ID"
    );
  }

  const user =
    await findUserById(id);

  if (!user) {
    throw new Error(
      "User not found"
    );
  }

  return user;
}

export async function editUser(
  id: number,
  data: AdminUserUpdateData
) {
  await getUserDetails(id);

  if (
    data.firstName !== undefined &&
    !data.firstName.trim()
  ) {
    throw new Error(
      "First name cannot be empty"
    );
  }

  if (
    data.lastName !== undefined &&
    !data.lastName.trim()
  ) {
    throw new Error(
      "Last name cannot be empty"
    );
  }

  if (
    data.phone !== undefined &&
    !data.phone.trim()
  ) {
    throw new Error(
      "Phone cannot be empty"
    );
  }

  return updateUser(
    id,
    data
  );
}