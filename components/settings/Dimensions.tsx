import { Label } from "../ui/label";
import { Input } from "../ui/input";

const dimensionsOptions = [
  { label: "W", property: "width" },
  { label: "H", property: "height" },
];

type Props = {
  width: string;
  height: string;
  isEditingRef: React.MutableRefObject<boolean>;
  handleInputChange: (property: string, value: string) => void;
};

const Dimensions = ({ width, height, isEditingRef, handleInputChange }: Props) => (
  <section className='panel-section flex flex-col gap-3'>
    <h3 className='panel-heading'>Dimensions</h3>
    <div className='flex flex-col gap-3'>
      {dimensionsOptions.map((item) => (
        <div
          key={item.label}
          className='flex items-center gap-3 rounded-xl border border-primary-grey-100 bg-primary-grey-200/35 px-3 py-2'
        >
          <Label htmlFor={item.property} className='min-w-5 text-[10px] font-bold uppercase tracking-[0.24em] text-primary-grey-300'>
            {item.label}
          </Label>
          <Input
            type='number'
            id={item.property}
            placeholder='100'
            value={item.property === "width" ? width : height}
            className='input-ring border-0 bg-transparent px-0 focus:ring-0'
            min={10}
            onChange={(e) => handleInputChange(item.property, e.target.value)}
            onBlur={(e) => (
              isEditingRef.current = false
      )}
          />
        </div>
      ))}
    </div>
  </section>
);

export default Dimensions;
