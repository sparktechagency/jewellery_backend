import { Request, Response } from "express";

const dashboard = async (req: Request, res: Response) => {
  const {
    income_year: req_income_year,
    user_growth_year: req_user_growth_year,
  } = req.query || {};

  const currentYear = new Date().getFullYear();
  const income_year = req_income_year || currentYear;
  const user_growth_year = req_user_growth_year || currentYear;

  const income_overview = {
    year: income_year,
    data: {
      0: 80,
      1: 80,
      2: 80,
      3: 80,
      4: 80,
      5: 80,
      6: 80,
      7: 80,
      8: 80,
      9: 80,
      10: 80,
      11: 80,
    },
  };
  const user_growth = {
    year: user_growth_year,
    data: {
      0: 80,
      1: 80,
      2: 80,
      3: 80,
      4: 80,
      5: 80,
      6: 80,
      7: 80,
      8: 80,
      9: 80,
      10: 80,
      11: 80,
    },
  };

  const response = {
    notification_count: 0,
    total_users: "",
    orders_completed: "",
    total_income: "",
    total_items: "",
    income_overview,
    user_growth,
  };
  res.json(response);
};

const notifications = async (req: Request, res: Response) => {
  res.json({ message: "Hello" });
};

export { dashboard, notifications };
