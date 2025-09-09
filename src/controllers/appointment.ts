import validateRequiredFields from "@utils/validateRequiredFields";
import { Request, Response } from "express";
import { DateTime } from "luxon";
import { Appointment } from "src/schema";


// const book_an_appointment1 = async (req: Request, res: Response) => {
//   const { start, end, name, email, phone, notes } = req.body || {};

//   const error = validateRequiredFields({
//     start,
//     end,
//     name,
//     email,
//     phone,
//     notes,
//   });

//   if (error) {
//     res.status(400).json({ message: error });
//     return;
//   }

//   const now = new Date();
//   if (new Date(start) < now) {
//     res.status(400).json({ message: "Appointment cannot be placed in the past" });
//     return;
//   }

// console.log(new Date(start), new Date(end));

//   if (new Date(start) >= new Date(end)) {
//     res.status(400).json({ message: "End date must be later than start date" });
//     return;
//   }

//   const existingAppointment = await Appointment.findOne({
//     start: { $lt: end },
//     end: { $gt: start },
//   });
//   const officeHoursStart = new Date(start);
//   const officeHoursEnd = new Date(end);

//   console.log(officeHoursStart.getHours(), officeHoursEnd.getHours());

//   // Assuming office hours are from 9 AM to 5 PM
//   const officeStartHour = 9;
//   const officeEndHour = 17;

//   if (
//     officeHoursStart.getHours() < officeStartHour ||
//     officeHoursEnd.getHours() >= officeEndHour
//   ) {
//     res
//       .status(400)
//       .json({ message: "Appointment time is outside office hours" });
//     return;
//   }

//   if (existingAppointment) {
//     res.status(400).json({
//       message:
//         "The selected time slot is already booked. Please choose a different time.",
//     });
//     return;
//   }

//   try {
//     await Appointment.create({ start, end, name, email, phone, notes });
//     res.json({ message: "Appointment booked successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const BUSINESS_TZ = "America/New_York"; // safer than "Etc/GMT+5" if DST matters

const book_an_appointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end, name, email, phone, notes } = req.body;

    if (!start || !end) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Parse input (frontend sends local string with GMT offset)
    const startDt = DateTime.fromJSDate(new Date(start)); // detect offset from input
    const endDt = DateTime.fromJSDate(new Date(end));

    // Convert to business timezone for office hour check
    const startLocal = startDt.setZone(BUSINESS_TZ);
    const endLocal = endDt.setZone(BUSINESS_TZ);

    console.log("Start local:", startLocal.hour, "End local:", endLocal.hour);

    // check if in the past
    const now = DateTime.now().setZone(BUSINESS_TZ);
    if (startLocal < now) {
      res.status(400).json({ message: "Appointment cannot be placed in the past" });
      return;
    }
    // Check for conflicts
    const conflict = await Appointment.findOne({
      start: { $lt: endDt.toUTC().toJSDate() }, 
      end: { $gt: startDt.toUTC().toJSDate() },
    });
    if (conflict) {
      res.status(400).json({
        message: "The selected time slot is already booked. Please choose a different time.",
      });
      return;
    }

    // Validate business rules
    if (startLocal.hour < 9 || endLocal.hour > 17 || (endLocal.hour === 17 && endLocal.minute > 0)) {
      res.status(400).json({ message: "Appointment time is outside office hours" });
      return;
    }

   

    if (startDt >= endDt) {
      res.status(400).json({ message: "End date must be later than start date" });
      return;
    }

    // Save in UTC
    await Appointment.create({
      start: startDt.toUTC().toJSDate(),
      end: endDt.toUTC().toJSDate(),
      name,
      email,
      phone,
      notes,
    });

    res.json({ message: "Appointment booked successfully" });
  } catch (err) {
    console.error(err);
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
