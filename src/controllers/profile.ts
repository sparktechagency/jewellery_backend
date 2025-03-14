import { AuthenticatedRequest } from "@middleware/auth";
import { comparePassword, plainPasswordToHash } from "@utils/password";
import { Request, Response } from "express";
import { User } from "src/schema";

const get_profile = async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findById(req.user?.id, {
    __v: 0,
    _id: 0,
    password_hash: 0,
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(user);
};

const edit_profile = async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, phone, street_address, city, state, zip_code } =
    req?.body || {};

  const user = await User.findById(req.user?.id);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  try {
    await user.updateOne({
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      shipping_address: {
        ...(street_address && {
          street_address,
        }),
        ...(city && {
          city,
        }),
        ...(state && {
          state,
        }),
        ...(zip_code && {
          zip_code,
        }),
      },
    });

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const change_password = async (req: AuthenticatedRequest, res: Response) => {
  const { current_password, new_password } = req.body || {};

  const user = await User.findById(req?.user?.id);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const isPasswordCorrect = await comparePassword(
    current_password,
    user.password_hash
  );
  if (!isPasswordCorrect) {
    res.status(400).json({ message: "Invalid password" });
    return;
  }

  const password_hash = await plainPasswordToHash(new_password);

  try {
    await user.updateOne({ password_hash });
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { get_profile, edit_profile, change_password };
