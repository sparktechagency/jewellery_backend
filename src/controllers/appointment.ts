import validateRequiredFields from "@utils/validateRequiredFields";
import { Request, Response } from "express";
import { Appointment } from "src/schema";

const book_an_appointment = async (req: Request, res: Response) => {
  const { start, end, name, email, phone, notes } = req.body || {};

  const error = validateRequiredFields({
    start,
    end,
    name,
    email,
    phone,
    notes,
  });

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  if (new Date(start) >= new Date(end)) {
    res.status(400).json({ message: "End date must be later than start date" });
    return;
  }

  const existingAppointment = await Appointment.findOne({
    start: { $lt: end },
    end: { $gt: start },
  });
  const officeHoursStart = new Date(start);
  const officeHoursEnd = new Date(end);

  // Assuming office hours are from 9 AM to 5 PM
  const officeStartHour = 9;
  const officeEndHour = 17;

  if (
    officeHoursStart.getHours() < officeStartHour ||
    officeHoursEnd.getHours() >= officeEndHour
  ) {
    res
      .status(400)
      .json({ message: "Appointment time is outside office hours" });
    return;
  }

  if (existingAppointment) {
    res.status(400).json({
      message:
        "The selected time slot is already booked. Please choose a different time.",
    });
    return;
  }

  try {
    await Appointment.create({ start, end, name, email, phone, notes });
    res.json({ message: "Appointment booked successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const get_unavailable_times = async (req: Request, res: Response) => {
  const { year, month }: { year?: string; month?: string } = req.query;
  if (!year || !month) {
    res.status(400).json({ message: "Year and month are required" });
    return;
  }

  const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
  const endOfMonth = new Date(parseInt(year), parseInt(month), 0);

  try {
    const appointments = await Appointment.find({
      start: { $gte: startOfMonth, $lt: endOfMonth },
    }).select("start end -_id");

    res.json({ availableTimes: appointments });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const get_appointments = async (req: Request, res: Response) => {
  const { page, limit } = req.query || {};
  try {
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const appointments = await Appointment.find({}, { _id: 0, __v: 0 })
      .skip(skip)
      .limit(pageSize);

    const totalAppointments = await Appointment.countDocuments();
    const totalPages = Math.ceil(totalAppointments / pageSize);

    const pagination = {
      page: pageNumber,
      limit: pageSize,
      totalPages,
      totalAppointments,
    };

    res.json({ appointments, pagination });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { book_an_appointment, get_unavailable_times, get_appointments };
