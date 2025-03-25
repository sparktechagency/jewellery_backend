import { Request, Response } from "express";
import { Notification, Order, Product, User } from "src/schema";

const getIncomeOverview = async (income_year: number) => {
  const startDate = new Date(income_year, 0, 1); // Jan 1st of the year
  const endDate = new Date(income_year + 1, 0, 1); // Jan 1st of next year

  const orders_completed = await Order.find({
    order_status: "Completed",
    createdAt: { $gte: startDate, $lt: endDate },
  }).populate({
    path: "ready_made_details.products.product_id",
    model: "Product",
  });

  const incomeByMonth: Record<number, number> = {};
  for (let i = 0; i < 12; i++) {
    incomeByMonth[i] = 0;
  }

  orders_completed.forEach((order: any) => {
    const month = new Date(order.createdAt).getMonth();
    let orderTotal = 0;

    if (order.order_type === "repair") {
      orderTotal = order.custom_order_price ?? 0;
    } else if (order.order_type === "ready-made" && order.ready_made_details) {
      orderTotal = order.ready_made_details.products.reduce(
        (sum: number, product: any) => {
          if (!product.product_id || !product.quantity) return sum;

          const { discount_price, price } = product.product_id;
          const finalPrice = discount_price ?? price;

          return sum + finalPrice * product.quantity;
        },
        0
      );
    }

    incomeByMonth[month] += orderTotal;
  });

  return {
    year: income_year,
    data: incomeByMonth,
  };
};

const getUserGrowth = async (user_growth_year: number) => {
  const startDate = new Date(user_growth_year, 0, 1); // Jan 1st
  const endDate = new Date(user_growth_year + 1, 0, 1); // Jan 1st next year

  const users = await User.find({
    createdAt: { $gte: startDate, $lt: endDate },
  });

  const userGrowthByMonth: Record<number, number> = {};
  for (let i = 0; i < 12; i++) {
    userGrowthByMonth[i] = 0;
  }

  users.forEach((user: any) => {
    const month = new Date(user.createdAt).getMonth();
    console.log({ month });

    userGrowthByMonth[month]++;
  });

  return {
    year: user_growth_year,
    data: userGrowthByMonth,
  };
};

const dashboard = async (req: Request, res: Response) => {
  const {
    income_year: req_income_year,
    user_growth_year: req_user_growth_year,
  } = req.query || {};

  const currentYear = new Date().getFullYear();
  const income_year = Number(req_income_year) || currentYear;
  const user_growth_year = Number(req_user_growth_year) || currentYear;

  const orders_completed = await Order.find({
    order_status: "Completed",
  }).populate({
    path: "ready_made_details.products.product_id",
    model: "Product",
  });

  const total_users = await User.countDocuments({ role: { $ne: "admin" } });
  const total_income = orders_completed.reduce((total, order) => {
    if (order.order_type === "repair") {
      return total + (order.custom_order_price ?? 0);
    }

    if (order.order_type === "ready-made" && order.ready_made_details) {
      const products = order.ready_made_details.products || [];
      const productsTotal = products.reduce((sum, product: any) => {
        if (!product.product_id || !product.quantity) return sum;

        const { discount_price, price } = product.product_id;
        const finalPrice = discount_price ?? price;

        return sum + finalPrice * product.quantity;
      }, 0);

      return total + productsTotal;
    }

    return total;
  }, 0);

  const total_items = await Product.countDocuments();

  const notification_count = await Notification.countDocuments({
    isRead: false,
  });
  const response = {
    notification_count,
    total_users,
    orders_completed: orders_completed.length,
    total_income,
    total_items,
    income_overview: await getIncomeOverview(income_year),
    user_growth: await getUserGrowth(user_growth_year),
  };
  res.json(response);
};

const notifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find();
    res.json(notifications);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await Notification.updateMany({}, { isRead: true });
  }
};

export { dashboard, notifications };
