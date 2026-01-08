'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Clock } from 'lucide-react';

const VotePage = () => {
  return (
      <div>
        {/* Main Card */}
        <Card className='shadow-lg'>
          <CardHeader className='grid grid-cols-2 gap-4 border-b pb-4'>
            <CardTitle>Case Info</CardTitle>
            <CardTitle className='border-l pl-4'>Taxpayer Details</CardTitle>
          </CardHeader>
          <CardContent className='pt-6 grid grid-cols-2 gap-4'>
            {/* Case Info Section */}
            <div className='space-y-4 pr-4'>
              <div className='grid grid-cols-2'>
                <div className='text-sm text-gray-500'>Case ID</div>
                <div className='text-sm font-medium'>Cuid - 2023-12343</div>
              </div>
              <div className='grid grid-cols-2'>
                <div className='text-sm text-gray-500'>Tax Type</div>
                <div className='text-sm font-medium'>EBM Fines</div>
              </div>
              <div className='grid grid-cols-2'>
                <div className='text-sm text-gray-500'>Tax to be paid</div>
                <div className='text-sm font-semibold text-red-500'>300,000 frw</div>
              </div>
            </div>

            {/* Taxpayer Details Section */}
            <div className='space-y-4 border-l pl-4'>
              <div className='grid grid-cols-2'>
                <div className='text-sm text-gray-500'>Taxpayer Name</div>
                <div className='text-sm font-medium'>Tonie Justin</div>
              </div>
              <div className='grid grid-cols-2'>
                <div className='text-sm text-gray-500'>Taxpayer TIN</div>
                <div className='text-sm font-medium'>TIN-123456790</div>
              </div>
              <div className='grid grid-cols-2'>
                <div className='text-sm text-gray-500'>Tel</div>
                <div className='text-sm font-medium'>+(250) 567 567 789</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className='flex justify-center space-x-4 pt-4'>
          <Button variant='outline' className='flex items-center space-x-2 bg-gray-400 text-[#255069]'>
            <Clock className='h-4 w-4 text-gray-500' />
            <span>Abstain</span>
          </Button>
          <Button variant='destructive' className='flex items-center space-x-2'>
            <X className='h-4 w-4' />
            <span>Unjustify</span>
          </Button>
          <Button className='bg-green-600 hover:bg-green-700 flex items-center space-x-2'>
            <Check className='h-4 w-4' />
            <span>Justify</span>
          </Button>
        </div>
      </div>
  );
};

export default VotePage;