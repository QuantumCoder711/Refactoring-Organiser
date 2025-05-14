import { BarChartComponent } from '@/components/BarChart';
import GoBack from '@/components/GoBack';
import { HorizontalBarChartComponent } from '@/components/HorizontalBarChart';
import { PieChartComponent } from '@/components/PieChart';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import React from 'react'

const Charts:React.FC = () => {
  return (
    <div className='flex justify-between h-full'>
      <GoBack />
      <div className='max-w-3xl rounded-[10px] min-h-full w-full bg-brand-background p-2'>
        <PieChartComponent />
        <BarChartComponent />
        <Separator className='bg-black'/>
        <HorizontalBarChartComponent />
      </div>
      <Button>Export Charts</Button>
    </div>
  )
}

export default Charts;
