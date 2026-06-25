type RoleSelectProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

function RoleSelect({ value, onChange }: RoleSelectProps) {
  return (
    <select value={value} onChange={onChange}>
      <option value="">Select Role</option>
      <option value="doctor">Doctor</option>
      <option value="admin">Admin</option>
      <option value="patient">Patient</option>
    </select>
  );
}

export default RoleSelect;