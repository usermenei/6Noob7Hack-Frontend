"use client"
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

export default function DateReserve({
    onDateChange
}: {
    onDateChange: (value: Dayjs | null) => void
}) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                className="bg-white"
                onChange={(value: Dayjs | null) => onDateChange(value)}
            />
        </LocalizationProvider>
    );
}