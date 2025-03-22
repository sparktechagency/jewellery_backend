import { Request, Response } from "express";
import { User } from "src/schema";

const get_users = async (req: Request, res: Response) => {
  const { page, limit } = req.query || {};
  const pageNumber = parseInt(page as string) || 1;
  const pageSize = parseInt(limit as string) || 10;

  const users = await User.find(
    { role: { $ne: "admin" } },
    { password_hash: 0 }
  )
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize);

  const totalUsers = await User.countDocuments();
  const totalPages = Math.ceil(totalUsers / pageSize);
  const pagination = {
    totalUsers,
    totalPages,
    currentPage: pageNumber,
    pageSize,
  };

  res.json({ users, pagination });
};

const ban_user = async (req: Request, res: Response) => {
  const { id } = req.params || {};

  const user = await User.findById(id);

  if (!id || !user) {
    res.status(400).json({ message: "Invalid user id" });
    return;
  }

  user.account_status = user?.account_status === "Active" ? "Banned" : "Active";

  await user.save();

  res.json({
    message: `${user.name}'s account has been ${
      user?.account_status === "Active" ? "activated" : "banned"
    }`,
  });
};

export { get_users, ban_user };
