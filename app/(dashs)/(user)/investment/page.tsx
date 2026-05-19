import { Investment } from "@/lib/types/investment.types";

// Import the interface we made earlier
// import { Investment } from '@/types';

interface Props {
  investments: Investment[];
  totalInvested: number;
  totalExpectedReturns: number;
}

export default function Portfolio({
  investments,
  totalInvested,
  totalExpectedReturns,
}: Props) {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-indigo-500">
            <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
              Total Invested
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              ₦
              {totalInvested?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-emerald-500">
            <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
              Expected Returns
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              ₦
              {totalExpectedReturns?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-blue-500">
            <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
              Active Plans
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {investments.filter((i) => i.status === "active").length}
            </div>
          </div>
        </div>

        {/* Investments List */}
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6 text-gray-900 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Investment History
            </h3>

            {investments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                You haven't made any investments yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Plan
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount Invested
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ROI
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Start Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {investments.map((investment) => (
                      <tr
                        key={investment.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {investment.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {/* Assuming amount comes from pivot if it's user specific */}
                            ₦
                            {(
                              investment.pivot?.amount_invested ||
                              investment.amount
                            ).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-emerald-600 font-semibold">
                            {investment.roi_percentage}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${investment.status === "active" ? "bg-green-100 text-green-800" : ""}
                                                            ${investment.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                                                            ${investment.status === "completed" ? "bg-blue-100 text-blue-800" : ""}
                                                        `}
                          >
                            {investment.status.charAt(0).toUpperCase() +
                              investment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            investment.start_date || investment.created_at,
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
