'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Loader } from 'lucide-react';

const Injuries = ({ data, isLoading }: { data: any[]; isLoading: boolean }) => {
  return (
    <Card
      className={`rounded-xl bg-white p-2 shadow-sm ${isLoading ? 'animate-pulse' : ''} h-fit`}
      aria-busy={isLoading}
      aria-live="polite"
    >
      <CardHeader className="flex flex-row items-center p-2 md:p-6">
        <CardTitle className="text-2xl font-bold">Injuries</CardTitle>
        {isLoading && (
          <Loader className="animate-spin mx-2" aria-hidden="true" />
        )}
      </CardHeader>

      <CardContent className="p-2 md:p-6 md:pt-0">
        <Table>
          <TableHeader>
            <TableRow
              style={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <TableHead
                style={{
                  flex: 1,
                  textAlign: 'left',
                  alignContent: 'center'
                }}
              >
                Name
              </TableHead>
              <TableHead
                style={{
                  flex: 1,
                  textAlign: 'left',
                  alignContent: 'center'
                }}
              >
                Team
              </TableHead>
              <TableHead
                style={{
                  flex: 1,
                  textAlign: 'left',
                  alignContent: 'center'
                }}
              >
                Probability of playing
              </TableHead>
              <TableHead
                style={{
                  flex: 1,
                  textAlign: 'left',
                  alignContent: 'center'
                }}
              >
                News
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, idx) => (
                <TableRow
                  key={idx}
                  className="border-b border-gray-100 last:border-0 animate-pulse"
                >
                  <TableCell className="flex text-center px-1 py-1 md:p-4 gap-1 justify-center">
                    <div className="mx-auto rounded bg-gray-200 h-5 w-1/2" />
                    <div className="mx-auto rounded bg-gray-200 h-5 w-1/2" />
                  </TableCell>
                </TableRow>
              ))
            ) : Array.isArray(data) && data.length === 0 ? (
              <TableRow>
                <TableCell className="table-cell w-full px-2 text-center">
                  The site is being updated. Please check back later.
                </TableCell>
              </TableRow>
            ) : (
              data.map((injury) => {
                return (
                  <TableRow
                    key={injury.web_name}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <TableCell className="table-cell w-full px-2">
                      <div className="grid grid-cols-12 items-center gap-2">
                        {/* Left section - Home team */}
                        <div className="col-span-5 flex flex-col xl:flex-row items-center gap-2">
                          <span className="flex-1 text-center xl:text-right">
                            {injury.web_name}
                          </span>
                          <span className="flex-1 text-center xl:text-right">
                            {injury.team_name}
                          </span>
                        </div>

                        {/* Center section - Score */}
                        <div className="col-span-2 flex flex-col items-center justify-center">
                          <div
                            className={`min-w-[80px] text-center ${
                              injury.chance_of_playing_next_round
                                ? 'font-bold'
                                : 'font-normal'
                            }`}
                          >
                            {injury.chance_of_playing_next_round}
                          </div>
                        </div>

                        {/* Right section - Away team */}
                        <div className="col-span-5 flex flex-col xl:flex-row items-center gap-2">
                          <span className="flex-1 text-center xl:text-left">
                            {injury.news}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Injuries;
