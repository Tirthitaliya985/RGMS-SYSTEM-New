import WingLayout from "@/components/Layout/WingLayout";
import Attendance from "@/pages/SocietyAdmin/StaffManagement/Attendance";

export default function WingStaffAttendance() {
  return (
    <WingLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <Attendance />
      </div>
    </WingLayout>
  );
}
