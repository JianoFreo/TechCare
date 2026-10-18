
import {
  Users,
  UserCheck,
  Stethoscope,
  FlaskConical,
  ClipboardList,
  Activity,
  ShieldCheck,
} from "lucide-react";

import type { User } from "../../../interface/User";

type AdminDashboardProps = {
  users: User[];
};

function AdminDashboard({ users }: AdminDashboardProps) {
  const doctors = users.filter(
    (user) => user.role === "doctor",
  ).length;

  const labStaff = users.filter(
    (user) => user.role === "laboratory-staff",
  ).length;

  const frontDeskStaff = users.filter(
    (user) => user.role === "frontdesk-staff",
  ).length;

  const patients = users.filter(
    (user) => user.role === "patient",
  ).length;

  // Assumes User.active is a boolean.
  const activeUsers = users.filter(
    (user) => user.active === true,
  ).length;

  return (
    <main className="min-w-0">
      <div className="space-y-6 px-6">
        {/* Dashboard summary */}
        <section className="bg-white border border-gray-300 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-300">
            <SummaryItem
              icon={<Users size={20} strokeWidth={1.5} />}
              label="Total Users"
              value={users.length}
              description="Registered accounts"
            />

            <SummaryItem
              icon={<UserCheck size={20} strokeWidth={1.5} />}
              label="Active Users"
              value={activeUsers}
              description="Currently active accounts"
            />

            <SummaryItem
              icon={<Activity size={20} strokeWidth={1.5} />}
              label="Today's Activity"
              value="—"
              description="Activity summary unavailable"
            />

            <SummaryItem
              icon={<ShieldCheck size={20} strokeWidth={1.5} />}
              label="System Status"
              value="Operational"
              description="Status not verified by this page"
              valueClassName="text-xl"
            />
          </div>
        </section>

        {/* Users by role */}
        <section className="bg-white border border-gray-300 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-300">
            <div className="flex items-center gap-3">
              <ClipboardList size={20} strokeWidth={1.5} />

              <div>
                <h2 className="text-lg font-semibold">
                  System Overview
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Overview of registered users by role
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-300">
            <RoleSummary
              icon={<Stethoscope size={22} strokeWidth={1.5} />}
              label="Doctors"
              value={doctors}
              description="Registered doctors"
            />

            <RoleSummary
              icon={<FlaskConical size={22} strokeWidth={1.5} />}
              label="Laboratory Staff"
              value={labStaff}
              description="Registered laboratory staff"
            />

            <RoleSummary
              icon={<ClipboardList size={22} strokeWidth={1.5} />}
              label="Front Desk Staff"
              value={frontDeskStaff}
              description="Registered front desk staff"
            />

            <RoleSummary
              icon={<Users size={22} strokeWidth={1.5} />}
              label="Patients"
              value={patients}
              description="Registered patients"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

type SummaryItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
  valueClassName?: string;
};

function SummaryItem({
  icon,
  label,
  value,
  description,
  valueClassName = "text-3xl",
}: SummaryItemProps) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <p className="text-sm text-gray-500">{label}</p>
      </div>

      <p className={`${valueClassName} font-semibold`}>
        {value}
      </p>

      <p className="text-sm text-gray-400 mt-2">
        {description}
      </p>
    </div>
  );
}

type RoleSummaryProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
};

function RoleSummary({
  icon,
  label,
  value,
  description,
}: RoleSummaryProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-semibold mt-2">
            {value}
          </p>
        </div>

        {icon}
      </div>

      <p className="text-sm text-gray-400 mt-3">
        {description}
      </p>
    </div>
  );
}

export default AdminDashboard;
