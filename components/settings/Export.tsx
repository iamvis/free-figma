import { exportToPdf, exportToPng } from "@/lib/utils";

import { Button } from "../ui/button";

const Export = ({ fabricCanvas }: { fabricCanvas: fabric.Canvas | null }) => (
  <div className='px-5 py-4'>
    <div className='rounded-2xl border border-primary-grey-100 bg-primary-grey-200/35 p-4'>
    <h3 className='panel-heading mb-3'>Export</h3>
    <div className='grid gap-2'>
      <Button
        variant='outline'
        className='w-full rounded-xl border-primary-grey-100 bg-transparent text-[rgb(var(--app-text))] hover:bg-primary-green hover:text-slate-950'
        onClick={() => exportToPdf(fabricCanvas)}
        disabled={!fabricCanvas}
      >
        Export PDF
      </Button>
      <Button
        variant='outline'
        className='w-full rounded-xl border-primary-grey-100 bg-transparent text-[rgb(var(--app-text))] hover:bg-primary-green hover:text-slate-950'
        onClick={() => exportToPng(fabricCanvas)}
        disabled={!fabricCanvas}
      >
        Export PNG
      </Button>
    </div>
    <p className='mt-3 text-xs leading-5 text-primary-grey-300'>
      SVG export is disabled in this production build while the app stays on Fabric 5.
    </p>
    </div>
  </div>
);

export default Export;
