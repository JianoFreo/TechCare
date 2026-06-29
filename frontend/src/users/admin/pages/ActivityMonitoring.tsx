
function ActivityMonitoring() {


  return (
    <>
      <div>
        <p>
          Showing 5 of 89 activities from today
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Time stamps</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Action</th>
              <th className="px-4 py-3 text-left">Details</th>

              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t hover:bg-gray-50">
              <td className="px-4 py-3">1</td>
              <td className="px-4 py-3">John Doe</td>
              <td className="px-4 py-3">johndoe</td>
              <td className="px-4 py-3">john@example.com</td>

              <td className="px-4 py-3 text-center">
                Edit | Delete
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ActivityMonitoring;