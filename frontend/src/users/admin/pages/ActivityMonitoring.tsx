    
function ActivityMonitoring() {


  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Full Name</th>
            <th className="px-4 py-3 text-left">Username</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Contact Number</th>
            <th className="px-4 py-3 text-left">Role</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-t hover:bg-gray-50">
            <td className="px-4 py-3">1</td>
            <td className="px-4 py-3">John Doe</td>
            <td className="px-4 py-3">johndoe</td>
            <td className="px-4 py-3">john@example.com</td>
            <td className="px-4 py-3">09123456789</td>
            <td className="px-4 py-3">Admin</td>
            <td className="px-4 py-3 text-center">
              Edit | Delete
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ActivityMonitoring;